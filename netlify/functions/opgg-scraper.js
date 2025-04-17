const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async () => {
    try {
        // 1. Fetch OP.GG with headers to avoid blocking
        const response = await fetch('https://www.op.gg/champions', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const html = await response.text();

        // 2. Load HTML and prepare data
        const $ = cheerio.load(html);
        const stats = [];

        // 3. Updated selectors (as of June 2024)
        $('table tbody tr').each((i, row) => {
            const $row = $(row);

            // Champion name (updated selector)
            const name = $row.find('td:nth-child(1) a').first().text().trim();

            // Stats (skip if name is empty)
            if (name) {
                stats.push({
                    name,
                    winRate: parseFloat($row.find('td:nth-child(3)').text().trim().replace('%', '')) || 0,
                    pickRate: parseFloat($row.find('td:nth-child(4)').text().trim().replace('%', '')) || 0,
                    banRate: parseFloat($row.find('td:nth-child(5)').text().trim().replace('%', '')) || 0,
                    kda: parseFloat($row.find('td:nth-child(6)').text().trim()) || 0
                });
            }
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(stats.slice(0, 50)) // Return top 50 champs
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Scraping failed",
                details: error.message,
                tip: "OP.GG may have updated their HTML structure"
            })
        };
    }
};