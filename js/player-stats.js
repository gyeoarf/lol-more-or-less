async function fetchChampionData() {
    try {
        const response = await fetch('/.netlify/functions/fetchChampionMastery?summonerId=exampleSummonerId');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();

        // Parse data
        for (const champId in data.data) {
            const champ = data.data[champId];
            champions[champ.name] = {
                hp: champ.stats.hp,
                ad: champ.stats.attackdamage,
                ms: champ.stats.movespeed
            };
        }

        console.log("Data loaded:", champions);
        newRound();
    } catch (error) {
        console.error("Error:", error);
        alert("Error loading data. Check console for details.");
    }
}