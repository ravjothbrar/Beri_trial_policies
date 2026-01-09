import { pipeline } from '@xenova/transformers';

let generator = null;

export async function initLLM(onProgress) {
  if (generator) {
    return generator;
  }

  console.log('Loading text generation model (CPU-based, no GPU required)...');

  try {
    generator = await pipeline(
      'text-generation',
      'Xenova/distilgpt2',
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
    const prompt = systemPrompt + '\n\nContext:\n' + context + '\n\nQuestion: ' + query + '\n\nAnswer:';

    const output = await generator(prompt, {
      max_new_tokens: 250,
      temperature: 0.7,
      do_sample: true,
      top_k: 50,
      top_p: 0.95,
    });

    const generatedText = output[0].generated_text;
    const answerIndex = generatedText.indexOf('Answer:');
    const answer = answerIndex !== -1
      ? generatedText.slice(answerIndex + 7).trim()
      : generatedText.slice(prompt.length).trim();

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
