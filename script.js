let champions = {}; // Will store fetched data
let currentStat = 'hp';
let streak = 0;

// Fetch champion data from Riot API
async function fetchChampionData() {
    try {
        const version = '14.8.1'; // Update to latest patch
        const response = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
        const data = await response.json();

        // Extract base stats for each champion
        for (const champKey in data.data) {
            const champ = data.data[champKey];
            champions[champ.name] = {
                hp: champ.stats.hp,
                ad: champ.stats.attackdamage,
                ms: champ.stats.movespeed
            };
        }

        console.log("Data loaded!", champions);
        newRound(); // Start game after data loads
    } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Error loading champion data. Try refreshing!");
    }
}

// Rest of your existing code (getRandomChampion, newRound, checkAnswer)...
fetchChampionData(); // Initialize data fetch