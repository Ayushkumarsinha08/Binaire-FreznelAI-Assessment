const { onRequest } = require('firebase-functions/v2/https');

const MODEL_API_URL = 'https://binaire.app/hf-models-api.json';

exports.modelsProxy = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request, response) => {
    if (request.method !== 'GET') {
      response.status(405).set('Allow', 'GET').send('Method Not Allowed');
      return;
    }

    try {
      const upstreamResponse = await fetch(MODEL_API_URL, {
        headers: { Accept: 'application/json' },
      });
      const body = await upstreamResponse.text();

      response
        .status(upstreamResponse.status)
        .set('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json')
        .set('Cache-Control', 'public, max-age=300')
        .send(body);
    } catch (error) {
      console.error('Model API proxy failed:', error);
      response.status(502).json({ error: 'Unable to reach the model API.' });
    }
  }
);
