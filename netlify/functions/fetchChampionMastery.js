import fetch from 'node-fetch';

export async function handler(event) {
  const { summonerId, region = 'na1' } = event.queryStringParameters;

  if (!summonerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing summonerId parameter' })
    };
  }

  try {
    const response = await fetch(
        `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`,
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
    console.error('Error fetching champion mastery:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}