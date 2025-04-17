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
        if (Object.keys(championStats).length === 0) {
            throw new Error("No data loaded");
        }
        setupEventListeners();
        newRound();
    } catch (error) {
        showError("Live stats unavailable. Using sample data...");
        loadFallbackData(); // Fallback to sample data
    }
});

// Load real data from Netlify function
async function loadOPGGData(champ1, champ2) {
    try {
        const response = await fetch(
            `https://lolmoreless.netlify.app/.netlify/functions/opgg-scraper?champs=${champ1},${champ2}`
        );
        return await response.json();
    } catch (error) {
        console.error("Using fallback data:", error);
        return [
            { name: champ1, winRate: 50 + Math.random() * 5, pickRate: 5 + Math.random() * 15, kda: 2 + Math.random() * 3 },
            { name: champ2, winRate: 50 + Math.random() * 5, pickRate: 5 + Math.random() * 15, kda: 2 + Math.random() * 3 }
        ];
    }
}

// Fallback data
function loadFallbackData() {
    championStats = {
        "Aatrox": { winRate: 50.1, pickRate: 8.2, banRate: 12.3, kda: 2.1 },
        "Ahri": { winRate: 51.7, pickRate: 15.3, banRate: 5.4, kda: 2.8 },
        "Zed": { winRate: 49.5, pickRate: 18.7, banRate: 25.1, kda: 2.5 }
    };
    setupEventListeners();
    newRound();
}

// Game logic
async function newRound() {
    try {
        // Reset UI state
        resetUI();

        // 1. Get two random champions
        const allChampions = Object.keys(championStats).length > 0 ?
            Object.keys(championStats) :
            await getChampionListFromRiot();

        let champ1, champ2;
        do {
            champ1 = allChampions[Math.floor(Math.random() * allChampions.length)];
            champ2 = allChampions[Math.floor(Math.random() * allChampions.length)];
        } while (champ2 === champ1 && allChampions.length > 1);

        // 2. Load stats for these specific champions
        const stats = await loadOPGGData(champ1, champ2);

        // Update championStats with fresh data
        stats.forEach(stat => {
            championStats[stat.name] = {
                winRate: stat.winRate,
                pickRate: stat.pickRate,
                banRate: stat.banRate,
                kda: stat.kda
            };
        });

        // 3. Select random stat to compare
        currentStat = STAT_TYPES[Math.floor(Math.random() * STAT_TYPES.length)];
        updateStatDisplay();

        // 4. Update UI
        updateChampionUI('champ1', champ1);
        updateChampionUI('champ2', champ2);

    } catch (error) {
        console.error("Round initialization failed:", error);
        showError("Failed to load champion data. Trying again...");
        setTimeout(newRound, 2000); // Retry after delay
    }
}

// Helper function to get champion list
async function getChampionListFromRiot() {
    try {
        const response = await fetch(
            'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion.json'
        );
        const data = await response.json();
        return Object.keys(data.data);
    } catch (error) {
        console.error("Failed to get champion list:", error);
        return ["Aatrox", "Ahri", "Zed"]; // Fallback
    }
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