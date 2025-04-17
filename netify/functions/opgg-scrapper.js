const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async () => {
    try {
        // 1. Fetch OP.GG champion stats page
        const response = await fetch('https://www.op.gg/champions');
        const html = await response.text();

        // 2. Parse HTML
        const $ = cheerio.load(html);
        const stats = [];

        // 3. Extract data from each champion row
        $('tbody tr').each((i, row) => {
            const cols = $(row).find('td');
            stats.push({
                name: $(row).find('.css-1ki6o6m').text().trim(),
                winRate: parseFloat(cols.eq(2).text().trim().replace('%', '')),
                pickRate: parseFloat(cols.eq(3).text().trim().replace('%', '')),
                banRate: parseFloat(cols.eq(4).text().trim().replace('%', '')),
                kda: parseFloat(cols.eq(5).text().trim())
            });
        });

        // 4. Return clean data
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' }, // Fix CORS
            body: JSON.stringify(stats)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Scraping failed. OP.GG may have updated their layout." })
        };
    }
};