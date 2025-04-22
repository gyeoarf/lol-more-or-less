import fetch from 'node-fetch';

      export async function handler(event) {
        const { region = 'na1' } = event.queryStringParameters;

        try {
          const response = await fetch(
            `https://${region}.api.riotgames.com/lol/status/v4/platform-data`,
            {
              headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Riot API error: ${response.status}`);
          }

          const data = await response.json();

          return {
            statusCode: 200,
            body: JSON.stringify(data),
          };
        } catch (error) {
          console.error('Error fetching status:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
          };
        }
      }