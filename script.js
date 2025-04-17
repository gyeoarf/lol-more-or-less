let champions = {};
let currentStat = 'hp';
let streak = 0;

// 1. Define all functions FIRST
function getRandomChampion() {
    const keys = Object.keys(champions);
    return keys[Math.floor(Math.random() * keys.length)];
}

function newRound() {
    let champ1 = getRandomChampion();
    let champ2 = getRandomChampion();
    while (champ2 === champ1) champ2 = getRandomChampion(); // Avoid duplicates

    document.getElementById('champ1').textContent = champ1;
    document.getElementById('champ2').textContent = champ2;
    document.getElementById('stat').textContent = `Base ${currentStat.toUpperCase()}`;
}

function checkAnswer(selectedChamp) {
    const champ1 = document.getElementById('champ1').textContent;
    const champ2 = document.getElementById('champ2').textContent;
    const correctChamp = champions[champ1][currentStat] > champions[champ2][currentStat] ? champ1 : champ2;

    if (selectedChamp === correctChamp) {
        streak++;
        document.getElementById('streak').textContent = streak;
        newRound();
    } else {
        alert(`Game Over! Streak: ${streak}`);
        streak = 0;
    }
}

// 2. Fetch data AFTER functions are defined
async function fetchChampionData() {
    try {
        const version = '14.10.1'; // Update to latest patch
        const response = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
        const data = await response.json();

        // Parse Riot's data format
        for (const champId in data.data) {
            const champ = data.data[champId];
            champions[champ.name] = {
                hp: champ.stats.hp,
                ad: champ.stats.attackdamage,
                ms: champ.stats.movespeed
            };
        }

        console.log("Data loaded:", champions);
        newRound(); // Now safe to call
    } catch (error) {
        console.error("Error details:", error);
        alert("Error loading champion data. Check console for details!");
    }
}

// 3. Initialize event listeners AFTER DOM loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('champ1').addEventListener('click', () =>
        checkAnswer(document.getElementById('champ1').textContent)
    );
    document.getElementById('champ2').addEventListener('click', () =>
        checkAnswer(document.getElementById('champ2').textContent)
    );
    fetchChampionData(); // Start the game
});