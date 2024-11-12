import 'server-only';
import { fetchAccessToken } from "hume";

export const getHumeAccessToken = async () => {
  console.log('Checking Hume credentials:', {
    hasApiKey: !!process.env.HUME_API_KEY,
    hasSecretKey: !!process.env.HUME_SECRET_KEY
  });

  if (!process.env.HUME_API_KEY || !process.env.HUME_SECRET_KEY) {
    console.error('Missing required environment variables:', {
      HUME_API_KEY: !!process.env.HUME_API_KEY,
      HUME_SECRET_KEY: !!process.env.HUME_SECRET_KEY
    });
    return null;
  }

  try {
    console.log('Attempting to fetch access token...');

    const accessToken = await fetchAccessToken({
      apiKey: String(process.env.HUME_API_KEY),
      secretKey: String(process.env.HUME_SECRET_KEY),
    });

    console.log('Access token fetched:', !!accessToken);

    if (!accessToken) {
      console.error('Received null access token from fetchAccessToken');
    }

    return accessToken ?? null;
  } catch (error) {
    console.error('Error fetching access token:', {
      error,
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error.response || error
    });
    return null;
  }
};
