const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async () => {
    try {
        const response = await fetch('https://www.op.gg/champions');
        const html = await response.text();
        const $ = cheerio.load(html);

        const stats = [];
        $('tbody tr').each((i, row) => {
            stats.push({
                name: $(row).find('.css-1ki6o6m').text().trim(),
                winRate: parseFloat($(row).find('td:nth-child(3)').text().trim().replace('%', '')),
                pickRate: parseFloat($(row).find('td:nth-child(4)').text().trim().replace('%', '')),
                banRate: parseFloat($(row).find('td:nth-child(5)').text().trim().replace('%', '')),
                kda: parseFloat($(row).find('td:nth-child(6)').text().trim())
            });
        });

        return {
            statusCode: 200,
            body: JSON.stringify(stats)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Scraping failed" })
        };
    }
};