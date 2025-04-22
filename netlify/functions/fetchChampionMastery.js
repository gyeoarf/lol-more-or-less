import fetch from 'node-fetch';

                export async function handler(event) {
                  const { summonerId } = event.queryStringParameters;

                  try {
                    const response = await fetch(`https://example-api.com/champion-mastery/${summonerId}`, {
                      headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
                    });
                    const data = await response.json();

                    return {
                      statusCode: 200,
                      body: JSON.stringify(data),
                    };
                  } catch (error) {
                    return {
                      statusCode: 500,
                      body: JSON.stringify({ error: error.message }),
                    };
                  }
                }