import 'server-only';
import { fetchAccessToken } from "hume";

export const getHumeAccessToken = async () => {
  if (!process.env.HUME_EVI_API_KEY || !process.env.HUME_SECRET_KEY) {
    console.error('Missing required environment variables: HUME_EVI_API_KEY and/or HUME_SECRET_KEY');
    return null;
  }

  try {
    const accessToken = await fetchAccessToken({
      apiKey: String(process.env.HUME_EVI_API_KEY),
      secretKey: String(process.env.HUME_SECRET_KEY),
    });

    if (!accessToken) {
      console.error('Received null access token from fetchAccessToken');
    }

    return accessToken ?? null;
  } catch (error) {
    console.error('Error fetching access token:', error);
    return null;
  }
};
