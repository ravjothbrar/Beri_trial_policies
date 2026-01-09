import * as webllm from '@mlc-ai/web-llm';

let engine = null;

export async function initLLM(onProgress) {
  if (engine) {
    return engine;
  }

  console.log('Initialising WebLLM engine...');

  try {
    engine = new webllm.MLCEngine();

    await engine.reload('Qwen2.5-0.5B-Instruct', {
      initProgressCallback: (progress) => {
        if (onProgress) {
          onProgress(progress.progress);
        }
        console.log('LLM loading:', progress);
      }
    });

    console.log('WebLLM engine loaded successfully');
    return engine;
  } catch (error) {
    console.error('Error loading WebLLM engine:', error);
    throw error;
  }
}

export async function generateResponse(systemPrompt, context, userQuery, onToken) {
  if (!engine) {
    throw new Error('LLM engine not initialized. Call initLLM() first.');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Context:\n${context}\n\nQuestion: ${userQuery}`
    }
  ];

  try {
    const chunks = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 512
    });

    let fullResponse = '';

    for await (const chunk of chunks) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullResponse += token;
        if (onToken) {
          onToken(token);
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function resetLLM() {
  if (engine) {
    await engine.unload();
    engine = null;
  }
}
