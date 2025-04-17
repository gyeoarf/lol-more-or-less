const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async () => {
    try {
        const response = await fetch('https://www.op.gg/champions');
        const html = await response.text();
        const $ = cheerio.load(html);
        const stats = [];

        // Updated selector to match OP.GG's current layout
        $('table tbody tr').each((i, row) => {
            const $row = $(row);
            const name = $row.find('td:nth-child(1) .css-1ki6o6m').text().trim();
            const winRate = parseFloat($row.find('td:nth-child(3)').text().trim().replace('%', '')) || null;
            const pickRate = parseFloat($row.find('td:nth-child(4)').text().trim().replace('%', '')) || null;
            const banRate = parseFloat($row.find('td:nth-child(5)').text().trim().replace('%', '')) || null;
            const kda = parseFloat($row.find('td:nth-child(6)').text().trim()) || null;

            // Only include champions with valid names and at least one stat
            if (name && (winRate || pickRate || banRate || kda)) {
                stats.push({ name, winRate, pickRate, banRate, kda });
            }
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(stats)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Scraping failed",
                message: error.message
            })
        };
    }
};