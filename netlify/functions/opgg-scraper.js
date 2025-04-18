const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Function to scrape data from League of Graphs
async function scrapeChampionStats(champion) {
    const url = `https://www.leagueofgraphs.com/champions/builds/${champion}`;

    try {
        // Fetch the champion page
        const response = await fetch(url);
        const body = await response.text();

        // Initialize cheerio with the HTML body
        const $ = cheerio.load(body);

        // Get the popularity, winrate, and banrate from the page
        const popularity = parseFloat($('#graphDD1').text().trim().replace('%', ''));
        const winrate = parseFloat($('#graphDD2').text().trim().replace('%', ''));
        const banrate = parseFloat($('#graphDD3').text().trim().replace('%', ''));

        // Return the stats
        return {
            popularity,
            winrate,
            banrate
        };
    } catch (error) {
        console.error(`Error scraping champion stats for ${champion}: `, error);
        throw error;
    }
}

module.exports = { scrapeChampionStats };
