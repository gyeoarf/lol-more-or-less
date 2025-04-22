const fetch = require('node-fetch');

exports.handler = async (event) => {
    const summonerId = event.queryStringParameters.summonerId;
    const API_KEY = process.env.RIOT_API_KEY;

    try {
        const response = await fetch(`https://<region>.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to fetch data' })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};