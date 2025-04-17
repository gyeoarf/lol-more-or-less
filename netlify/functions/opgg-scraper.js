const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async () => {
    try {
        // 1. Fetch with mobile user agent to avoid blocking
        const response = await fetch('https://www.op.gg/champions', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
            }
        });
        const html = await response.text();

        // 2. Parse with updated selectors (June 2024 layout)
        const $ = cheerio.load(html);
        const stats = [];

        // 3. Target the correct table and rows
        $('div.css-1gbjc6n table tbody tr').each((i, row) => {
            const $row = $(row);

            // Extract data from columns
            const name = $row.find('td:nth-child(1) a').text().trim();
            const winRate = parseFloat($row.find('td:nth-child(3)').text().trim().replace('%', '')) || 0;
            const pickRate = parseFloat($row.find('td:nth-child(4)').text().trim().replace('%', '')) || 0;
            const banRate = parseFloat($row.find('td:nth-child(5)').text().trim().replace('%', '')) || 0;
            const kdaText = $row.find('td:nth-child(6)').text().trim();
            const kda = parseFloat(kdaText.split(':')[0]) || 0; // Extract first KDA number

            if (name) {
                stats.push({
                    name,
                    winRate,
                    pickRate,
                    banRate,
                    kda
                });
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(stats.filter(champ => champ.winRate > 0))
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Scraping failed",
                solution: "OP.GG updated their layout. Please check selectors.",
                details: error.message
            })
        };
    }
};