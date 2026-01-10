import { pipeline } from '@huggingface/transformers';

let generator = null;

export async function initLLM(onProgress) {
  if (generator) {
    return generator;
  }

  console.log('Loading Qwen2.5-0.5B-Instruct model (CPU-based, no GPU required)...');

  try {
    generator = await pipeline(
      'text-generation',
      'onnx-community/Qwen2.5-0.5B-Instruct',
      {
        progress_callback: (progress) => {
          if (progress.status === 'progress' && onProgress) {
            const percent = (progress.loaded / progress.total) * 100;
            const sizeMB = (progress.total / (1024 * 1024)).toFixed(1);
            onProgress({
              stage: `Downloading ${progress.file}: ${Math.round(percent)}% of ${sizeMB}MB`,
              progress: percent
            });
          } else if (progress.status === 'done' && onProgress) {
            onProgress({
              stage: `Loaded ${progress.file}`,
              progress: 100
            });
          }
        }
      }
    );

    if (onProgress) {
      onProgress({
        stage: 'Model ready!',
        progress: 100
      });
    }

    return generator;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
}

export async function generateResponse(systemPrompt, context, query, onToken) {
  if (!generator) {
    await initLLM();
  }

  try {
    // Qwen2.5 uses chat format for better instruction following
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant answering questions about school policies. Always quote exact phrases from the provided context to support your answers."
      },
      {
        role: "user",
        content: `Context from policy documents:\n\n${context}\n\nQuestion: ${query}\n\nPlease provide a comprehensive answer that quotes relevant passages from the context above.`
      }
    ];

    console.log('Generating response with context length:', context.length);
    console.log('Context being used:', context.substring(0, 500) + '...');

    const output = await generator(messages, {
      max_new_tokens: 800,
      temperature: 0.7,
      do_sample: true,
      top_k: 50,
      top_p: 0.95,
      repetition_penalty: 1.3,
    });

    // Extract the generated text from output
    let answer = '';
    if (output && output.length > 0 && output[0].generated_text) {
      // For chat format, the response is in the last message
      const generated = output[0].generated_text;
      if (Array.isArray(generated)) {
        // If it's an array of messages, get the last assistant message
        const lastMessage = generated[generated.length - 1];
        answer = typeof lastMessage === 'string' ? lastMessage : (lastMessage.content || '');
      } else if (typeof generated === 'string') {
        answer = generated;
      }
      answer = answer.trim();
    }

    console.log('Generated answer:', answer);

    // Only stream if we have a valid answer that's a string
    if (answer && typeof answer === 'string' && answer.length > 0) {
      // Stream tokens word by word for better UX
      const words = answer.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = i === 0 ? words[i] : ' ' + words[i];
        onToken(word);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } else {
      console.warn('Model generated empty or invalid response:', typeof answer, answer);
    }

    return answer || '';
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function resetLLM() {
  generator = null;
}
