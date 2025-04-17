let champions = {};
let currentStat = 'hp';
let streak = 0;
let version = '14.10.1'; // Update to latest patch

// DOM Elements
const statDisplay = document.getElementById('stat-display');
const champ1Img = document.getElementById('champ1-img');
const champ1Name = document.getElementById('champ1-name');
const champ2Img = document.getElementById('champ2-img');
const champ2Name = document.getElementById('champ2-name');
const streakDisplay = document.getElementById('streak');

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    fetchChampionData();
    document.getElementById('champ1-container').addEventListener('click', () => checkAnswer(champ1Name.textContent));
    document.getElementById('champ2-container').addEventListener('click', () => checkAnswer(champ2Name.textContent));
});

// Fetch champion data
async function fetchChampionData() {
    try {
        const response = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
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

// Game logic
function getRandomChampion() {
    const keys = Object.keys(champions);
    return keys[Math.floor(Math.random() * keys.length)];
}

function newRound() {
    let champ1 = getRandomChampion();
    let champ2 = getRandomChampion();
    while (champ2 === champ1) champ2 = getRandomChampion();

    // Update UI
    champ1Name.textContent = champ1;
    champ2Name.textContent = champ2;
    champ1Img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ1.replace(/\s+/g, '')}.png`;
    champ2Img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ2.replace(/\s+/g, '')}.png`;

    // Reset animations
    document.getElementById('champ1-container').classList.remove('correct');
    document.getElementById('champ2-container').classList.remove('correct');
}

function setStat(stat) {
    currentStat = stat;
    statDisplay.textContent = `Base ${stat.toUpperCase()}`;
    newRound();
}

function checkAnswer(selectedChamp) {
    const champ1 = champ1Name.textContent;
    const champ2 = champ2Name.textContent;
    const correctChamp = champions[champ1][currentStat] > champions[champ2][currentStat] ? champ1 : champ2;

    if (selectedChamp === correctChamp) {
        streak++;
        streakDisplay.textContent = streak;
        document.getElementById(selectedChamp === champ1 ? 'champ1-container' : 'champ2-container').classList.add('correct');
        setTimeout(newRound, 1000);
    } else {
        alert(`Game Over! Streak: ${streak}`);
        streak = 0;
        streakDisplay.textContent = streak;
        newRound();
    }
}