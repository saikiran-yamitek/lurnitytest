import { getLatestLandingPage } from "../../models/LandingPage.js";

export const handler = async () => {
  try {
    const page = await getLatestLandingPage();
    return {
      statusCode: 200,
      body: JSON.stringify(page || {}),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};