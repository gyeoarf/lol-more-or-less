const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        // 1. Get champion list from Riot API
        const riotResponse = await fetch(
            'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion.json'
        );
        const riotData = await riotResponse.json();
        const allChampions = Object.values(riotData.data).map(c => c.name);

        // 2. Select 2 random champions (or use provided names)
        const requestedChamps = event.queryStringParameters?.champs?.split(',') || [
            allChampions[Math.floor(Math.random() * allChampions.length)],
            allChampions[Math.floor(Math.random() * allChampions.length)]
        ];

        // 3. Scrape OP.GG for the selected champions
        const stats = [];
        for (const name of requestedChamps) {
            try {
                const opggUrl = `https://www.op.gg/champions/${name.toLowerCase()}/build`;
                const response = await fetch(opggUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const html = await response.text();
                const $ = cheerio.load(html);

                stats.push({
                    name,
                    winRate: parseFloat($('.css-1w8m5qh').first().text().replace('%', '')) || 0,
                    pickRate: parseFloat($('.css-1w8m5qh').eq(1).text().replace('%', '')) || 0,
                    banRate: parseFloat($('.css-1w8m5qh').eq(2).text().replace('%', '')) || 0,
                    kda: parseFloat($('.css-1w8m5qh').eq(3).text().split(':')[0]) || 0
                });
            } catch (error) {
                console.error(`Failed to scrape ${name}:`, error);
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(stats)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Scraping failed",
                details: error.message
            })
        };
    }
};