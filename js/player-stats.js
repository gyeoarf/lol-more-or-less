// Configuration
const VERSION = '15.8.1'; // Current LoL patch
let championStats = {};
let currentStat = '';
let streak = 0;
const STAT_TYPES = ['winRate', 'pickRate', 'banRate', 'kda'];

// DOM Elements
const elements = {
    statDisplay: document.getElementById('stat-display'),
    streakDisplay: document.getElementById('streak'),
    champ1: {
        container: document.getElementById('champ1-container'),
        img: document.getElementById('champ1-img'),
        name: document.getElementById('champ1-name'),
        value: document.getElementById('champ1-value')
    },
    champ2: {
        container: document.getElementById('champ2-container'),
        img: document.getElementById('champ2-img'),
        name: document.getElementById('champ2-name'),
        value: document.getElementById('champ2-value')
    },
    errorDisplay: document.getElementById('error-display')
};

// Initialize Game
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadOPGGData();
        setupEventListeners();
        newRound();
    } catch (error) {
        showError("Failed to load live stats. Try refreshing.");
        console.error("Initialization error:", error);
    }
});

// Load real data from Netlify function
async function loadOPGGData() {
    try {
        const response = await fetch('https://lolmoreless.netlify.app/.netlify/functions/opgg-scraper');        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid data");

        // Transform into usable format
        data.forEach(champ => {
            championStats[champ.name] = {
                winRate: champ.winRate,
                pickRate: champ.pickRate,
                banRate: champ.banRate,
                kda: champ.kda
            };
        });
    } catch (error) {
        console.error("Data load failed:", error);
        throw error;
    }
}

// Game logic
function newRound() {
    resetUI();

    // Pick random stat to compare
    currentStat = STAT_TYPES[Math.floor(Math.random() * STAT_TYPES.length)];
    updateStatDisplay();

    // Get two champions with valid stats
    const validChamps = Object.keys(championStats).filter(name =>
        !isNaN(championStats[name][currentStat])
    );

    if (validChamps.length < 2) throw new Error("Not enough data");

    let champ1, champ2;
    do {
        champ1 = validChamps[Math.floor(Math.random() * validChamps.length)];
        champ2 = validChamps[Math.floor(Math.random() * validChamps.length)];
    } while (champ2 === champ1);

    updateChampionUI('champ1', champ1);
    updateChampionUI('champ2', champ2);
}

// UI Updates
function updateStatDisplay() {
    const DISPLAY_TEXTS = {
        winRate: "Win Rate",
        pickRate: "Pick Rate",
        banRate: "Ban Rate",
        kda: "KDA"
    };
    elements.statDisplay.textContent = DISPLAY_TEXTS[currentStat];
}

function updateChampionUI(prefix, champName) {
    const el = elements[prefix];
    el.name.textContent = champName;
    el.img.src = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${champName.replace(/\s+/g, '')}.png`;

    const value = championStats[champName][currentStat];
    el.value.textContent = currentStat === 'kda' ?
        value.toFixed(1) :
        `${value.toFixed(1)}%`;
}

// Event handling
function setupEventListeners() {
    elements.champ1.container.addEventListener('click', () => handleGuess(elements.champ1.name.textContent));
    elements.champ2.container.addEventListener('click', () => handleGuess(elements.champ2.name.textContent));
}

function handleGuess(selectedChamp) {
    const champ1 = elements.champ1.name.textContent;
    const champ2 = elements.champ2.name.textContent;
    const champ1Value = championStats[champ1][currentStat];
    const champ2Value = championStats[champ2][currentStat];

    // Show stats
    elements.champ1.container.classList.add('show-stat');
    elements.champ2.container.classList.add('show-stat');

    // Check answer
    const isEqual = Math.abs(champ1Value - champ2Value) < 0.1;
    const correctChamp = isEqual ? selectedChamp :
        (champ1Value > champ2Value ? champ1 : champ2);

    // Update UI
    const clickedEl = selectedChamp === champ1 ?
        elements.champ1.container :
        elements.champ2.container;

    clickedEl.classList.add(isEqual || selectedChamp === correctChamp ? 'correct' : 'wrong');

    // Update streak
    streak = (isEqual || selectedChamp === correctChamp) ? streak + 1 : 0;
    elements.streakDisplay.textContent = streak;

    // Next round
    setTimeout(newRound, 2000);
}

// Helpers
function resetUI() {
    elements.champ1.container.classList.remove('correct', 'wrong', 'show-stat');
    elements.champ2.container.classList.remove('correct', 'wrong', 'show-stat');
}

function showError(message) {
    if (elements.errorDisplay) {
        elements.errorDisplay.textContent = message;
        elements.errorDisplay.style.display = 'block';
    }
}