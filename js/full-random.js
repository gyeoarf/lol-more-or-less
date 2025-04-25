// full-random.js - Final Working Version

// ===== CONSTANTS =====
const VERSION = '15.8.1';
const CACHE_KEY = `lol-champs-${VERSION}`;
const possibleStats = ['hp', 'attackdamage', 'movespeed', 'attackrange', 'attackspeed'];

const statDisplayNames = {
    hp: 'Health',
    attackdamage: 'Attack Damage',
    movespeed: 'Move Speed',
    attackrange: 'Attack Range',
    attackspeed: 'Attack Speed'
};

// ===== GAME STATE =====
let champions = {};
let currentStat = '';
let streak = 0;
let currentChampion = null;

// ===== DOM ELEMENTS =====
const statDisplay = document.getElementById('stat-display');
const champ1Img = document.getElementById('champ1-img');
const champ1Name = document.getElementById('champ1-name');
const champ2Img = document.getElementById('champ2-img');
const champ2Name = document.getElementById('champ2-name');
const streakDisplay = document.getElementById('streak');

// ===== DATA MANAGEMENT =====
async function fetchChampionData() {
    // Try cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        console.log("Using cached champion data");
        return JSON.parse(cached);
    }

    try {
        console.log("Fetching fresh champion data");
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/en_US/champion.json`);
        const { data } = await response.json();

        // Transform to { "ChampionName": stats } format
        const championsData = {};
        for (const champKey in data) {
            championsData[data[champKey].name] = data[champKey].stats;
        }

        // Cache the data
        localStorage.setItem(CACHE_KEY, JSON.stringify(championsData));
        return championsData;

    } catch (error) {
        console.error("Fetch failed:", error);
        throw error;
    }
}

// ===== GAME LOGIC =====
function getRandomChampion(exclude = null) {
    const names = Object.keys(champions).filter(name => name !== exclude);
    return names[Math.floor(Math.random() * names.length)];
}

function startGame() {
    currentChampion = getRandomChampion();
    const opponent = getRandomChampion(currentChampion);
    newRound(currentChampion, opponent);
}

async function newRound(champ1, champ2) {
    currentStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

    const statIconMap = {
        hp: 'hp.png',
        attackdamage: 'ad.png',
        movespeed: 'ms.png',
        attackrange: 'range.png',
        attackspeed: 'as.png'
    };

    const statColorMap = {
        hp: '#2ecc71',           // Green
        attackdamage: '#e67e22', // Orange
        movespeed: '#ecf0f1',    // White (default)
        attackrange: '#ffffff',  // White
        attackspeed: '#ffa500'   // Orangish
    };

    const iconFile = statIconMap[currentStat];
    const color = statColorMap[currentStat];
    const label = statDisplayNames[currentStat];

    statDisplay.innerHTML = `<img src="data/${iconFile}" alt="${currentStat}" style="width: 20px; vertical-align: middle; margin-right: 6px;"> <span style="color:${color}">${label}</span>`;

    champ1Name.textContent = champ1;
    champ2Name.textContent = champ2;

    champ1Img.src = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champ1.replace(/\s+/g, '')}.png`;
    champ2Img.src = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champ2.replace(/\s+/g, '')}.png`;

    ['champ1-container', 'champ2-container'].forEach(id => {
        document.getElementById(id).classList.remove('correct', 'wrong');
    });
}



function checkAnswer(selectedChamp) {
    const champ1 = champ1Name.textContent;
    const champ2 = champ2Name.textContent;

    // DEBUG: Log the actual stats being accessed
    console.log("Champion 1 stats:", champions[champ1]);
    console.log("Champion 2 stats:", champions[champ2]);

    const val1 = champions[champ1][currentStat];
    const val2 = champions[champ2][currentStat];

    const isEqual = val1 === val2;
    const correctChamp = isEqual ? selectedChamp : (val1 > val2 ? champ1 : champ2);

    // Update UI with values
    champ1Name.textContent = `${champ1} (${val1})`;
    champ2Name.textContent = `${champ2} (${val2})`;

    // Visual feedback
    const selectedContainer = selectedChamp === champ1 ? 'champ1-container' : 'champ2-container';
    document.getElementById(selectedContainer).classList.add(
        selectedChamp === correctChamp ? 'correct' : 'wrong'
    );

    if (!isEqual) {
        const correctContainer = correctChamp === champ1 ? 'champ1-container' : 'champ2-container';
        document.getElementById(correctContainer).classList.add('correct');
    }

    // Update streak
    streak = selectedChamp === correctChamp ? streak + 1 : 0;
    streakDisplay.textContent = streak;

    // Next round
    setTimeout(() => {
        currentChampion = correctChamp;
        const nextChallenger = getRandomChampion(currentChampion);
        newRound(currentChampion, nextChallenger);
    }, 800);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        champions = await fetchChampionData();
        console.log("Successfully loaded champions:", Object.keys(champions).length);

        // Debug: Show first champion's stats
        const firstChamp = Object.keys(champions)[0];
        console.log(`Sample stats for ${firstChamp}:`, champions[firstChamp]);

        startGame();

        document.getElementById('champ1-container').addEventListener('click',
            () => checkAnswer(champ1Name.textContent));
        document.getElementById('champ2-container').addEventListener('click',
            () => checkAnswer(champ2Name.textContent));

    } catch (err) {
        console.error("Initialization failed:", err);
        alert("Failed to load game data. Please check console for details.");
    }
});