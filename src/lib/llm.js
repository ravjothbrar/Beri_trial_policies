import { pipeline } from '@xenova/transformers';

let generator = null;

export async function initLLM(onProgress) {
  if (generator) {
    return generator;
  }

  console.log('Loading text generation model (CPU-based, no GPU required)...');

  try {
    generator = await pipeline(
      'text2text-generation',
      'Xenova/flan-t5-base',
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
    // Flan-T5 works best with clear, structured prompts
    const prompt = `You are a helpful assistant answering questions about school policies.

Context:
${context}

Based on the context above, answer this question: ${query}

Provide a comprehensive answer that:
1. Directly quotes relevant passages from the context
2. Explains the policy clearly
3. Uses specific details from the documents
4. Mentions which document the information comes from

Answer:`;

    console.log('Generating response with context length:', context.length);
    console.log('Context being used:', context.substring(0, 500) + '...');

    const output = await generator(prompt, {
      max_new_tokens: 800,
      temperature: 0.7,
      do_sample: true,
      top_k: 50,
      top_p: 0.95,
      repetition_penalty: 1.3,
    });

    // Flan-T5 returns the answer directly (text2text-generation)
    const answer = output && output[0] && output[0].generated_text
      ? output[0].generated_text.trim()
      : '';

    console.log('Generated answer:', answer);

    // Only stream if we have a valid answer
    if (answer && answer.length > 0) {
      // Stream tokens word by word for better UX
      const words = answer.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = i === 0 ? words[i] : ' ' + words[i];
        onToken(word);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } else {
      console.warn('Model generated empty response');
    }

    return answer;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function resetLLM() {
  generator = null;
}
