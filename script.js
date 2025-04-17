let champions = {};
let currentStat = '';
let streak = 0;
let version = '15.8.1'; // Update to latest patch

// Stats to randomize
const possibleStats = ['hp', 'ad', 'ms']; // Health, Attack Damage, Move Speed

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
    // 1. Pick a random stat (HP, AD, or MS)
    currentStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

    // 2. Map stat to display name
    const statDisplayNames = {
        hp: 'Health',
        ad: 'Attack Damage',
        ms: 'Move Speed'
    };
    document.getElementById('stat-display').textContent = statDisplayNames[currentStat];

    // 3. Pick two unique random champions
    let champ1 = getRandomChampion();
    let champ2 = getRandomChampion();
    while (champ2 === champ1) {
        champ2 = getRandomChampion(); // Ensure different champions
    }

    // 4. Update UI
    document.getElementById('champ1-name').textContent = champ1;
    document.getElementById('champ2-name').textContent = champ2;

    // 5. Load champion images (handle names with spaces like "Dr. Mundo")
    const formattedChamp1 = champ1.replace(/\s+/g, ''); // Remove spaces
    const formattedChamp2 = champ2.replace(/\s+/g, '');
    document.getElementById('champ1-img').src =
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${formattedChamp1}.png`;
    document.getElementById('champ2-img').src =
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${formattedChamp2}.png`;

    // 6. Reset visual feedback
    document.getElementById('champ1-container').classList.remove('correct', 'wrong');
    document.getElementById('champ2-container').classList.remove('correct', 'wrong');
}
function checkAnswer(selectedChamp) {
    const champ1 = champ1Name.textContent;
    const champ2 = champ2Name.textContent;
    const correctChamp = champions[champ1][currentStat] > champions[champ2][currentStat] ? champ1 : champ2;

    if (selectedChamp === correctChamp) {
        streak++;
        streakDisplay.textContent = streak;
        document.getElementById(selectedChamp === champ1 ? 'champ1-container' : 'champ2-container').classList.add('correct');
        setTimeout(newRound, 1000); // Auto-advance after 1 second
    } else {
        alert(`Game Over! Streak: ${streak}\nCorrect answer: ${correctChamp} (${statDisplay.textContent}: ${champions[correctChamp][currentStat]})`);
        streak = 0;
        streakDisplay.textContent = streak;
        newRound();
    }
}