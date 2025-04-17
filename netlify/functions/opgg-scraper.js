const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async () => {
    try {
        // 1. First get champion list from Riot's API
        const riotResponse = await fetch(
            'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion.json'
        );
        const riotData = await riotResponse.json();
        const championNames = Object.keys(riotData.data);

        // 2. Scrape OP.GG for top 20 champions (for performance)
        const stats = [];
        for (const name of championNames.slice(0, 20)) {
            const opggUrl = `https://www.op.gg/champions/${name.toLowerCase()}/build`;
            try {
                const response = await fetch(opggUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const html = await response.text();
                const $ = cheerio.load(html);

                // Extract from individual champion page
                stats.push({
                    name,
                    winRate: parseFloat($('.css-1w8m5qh').first().text().replace('%', '')) || 0,
                    pickRate: parseFloat($('.css-1w8m5qh').eq(1).text().replace('%', '')) || 0,
                    banRate: parseFloat($('.css-1w8m5qh').eq(2).text().replace('%', '')) || 0,
                    kda: parseFloat($('.css-1w8m5qh').eq(3).text().split(':')[0]) || 0
                });

                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to scrape ${name}:`, error);
            }
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(stats.filter(c => c.winRate > 0))
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