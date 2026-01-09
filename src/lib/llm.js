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
    // Flan-T5 works best with clear, concise prompts
    const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer based on the context above:`;

    const output = await generator(prompt, {
      max_new_tokens: 200,
      temperature: 0.7,
      do_sample: true,
      top_k: 50,
      top_p: 0.95,
    });

    // Flan-T5 returns the answer directly (text2text-generation)
    const answer = output[0].generated_text.trim();

    // Stream tokens word by word for better UX
    const words = answer.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = i === 0 ? words[i] : ' ' + words[i];
      onToken(word);
      await new Promise(resolve => setTimeout(resolve, 50));
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
