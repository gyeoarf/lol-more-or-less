const { scrapeChampionStats } = require('../../opgg-scraper');

exports.handler = async function(event, context) {
    const { champion } = event.queryStringParameters;

    if (!champion) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Champion name is required' })
        };
    }

    try {
        const stats = await scrapeChampionStats(champion);
        return {
            statusCode: 200,
            body: JSON.stringify(stats)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching stats' })
        };
    }
};
