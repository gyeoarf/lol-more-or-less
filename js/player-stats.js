// player-stats.js
// Configuration
const version = '15.8.1'; // Current LoL patch
const region = 'na';      // Change to euw, kr, etc.
let championStats = {};   // Stores { "Aatrox": { winRate: 51.2, pickRate: 8.7, ... } }
let currentStat = '';
let streak = 0;

// DOM Elements
const statDisplay = document.getElementById('stat-display');
const streakDisplay = document.getElementById('streak');
const statTypes = ['winRate', 'pickRate', 'banRate', 'kda']; // Stats to compare

// Initialize Game
document.addEventListener('DOMContentLoaded', async () => {
    const success = await fetchBlitzData();
    if (success) {
        setupEventListeners();
        newRound();
    } else {
        alert("Failed to load live stats. Using backup data...");
        loadBackupData().then(newRound);
    }
});

// Fetch Data from Blitz.gg
async function fetchBlitzData() {
    try {
        // Step 1: Get champion stats from Blitz
        const statsResponse = await fetch(`https://league-champion-aggregate.iesdev.com/api/champion/${region}`);
        const statsData = await statsResponse.json();

        // Step 2: Get champion name mapping
        const namesResponse = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json');
        const namesData = await namesResponse.json();

        // Combine data
        Object.entries(statsData.data).forEach(([id, stats]) => {
            const champ = namesData.find(c => c.id === parseInt(id));
            if (champ) {
                championStats[champ.name] = {
                    winRate: stats.winRate,
                    pickRate: stats.pickRate,
                    banRate: stats.banRate,
                    kda: stats.kda
                };
            }
        });

        console.log("Loaded stats for", Object.keys(championStats).length, "champions");
        return true;
    } catch (error) {
        console.error("Blitz.gg fetch failed:", error);
        return false;
    }
}

// Fallback Data
async function loadBackupData() {
    try {
        const response = await fetch('backup-stats.json'); // Create this file with your own data
        championStats = await response.json();
    } catch (error) {
        console.error("Backup failed - using hardcoded fallback");
        championStats = {
            "Aatrox": { winRate: 50.1, pickRate: 8.2, banRate: 12.3, kda: 2.1 },
            "Ahri": { winRate: 51.7, pickRate: 15.3, banRate: 5.4, kda: 2.8 }
            // Add more champions as needed
        };
    }
}

// Game Logic
function newRound() {
    // Pick random stat
    currentStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    updateStatDisplay();

    // Filter champions with valid stats
    const validChamps = Object.keys(championStats).filter(name =>
        championStats[name][currentStat] !== undefined
    );

    // Select two unique champions
    let champ1 = validChamps[Math.floor(Math.random() * validChamps.length)];
    let champ2 = validChamps[Math.floor(Math.random() * validChamps.length)];
    while (champ2 === champ1 && validChamps.length > 1) {
        champ2 = validChamps[Math.floor(Math.random() * validChamps.length)];
    }

    // Update UI
    updateChampionUI('champ1', champ1);
    updateChampionUI('champ2', champ2);
}

function updateStatDisplay() {
    const displayText = {
        winRate: "Win Rate",
        pickRate: "Pick Rate",
        banRate: "Ban Rate",
        kda: "KDA"
    };
    statDisplay.textContent = displayText[currentStat];
    statDisplay.className = currentStat; // For stat-specific styling
}

function updateChampionUI(prefix, champName) {
    const container = document.getElementById(`${prefix}-container`);
    container.classList.remove('correct', 'wrong', 'show-stat');

    document.getElementById(`${prefix}-name`).textContent = champName;
    document.getElementById(`${prefix}-img`).src =
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champName.replace(/\s+/g, '')}.png`;

    const statValue = championStats[champName][currentStat];
    document.getElementById(`${prefix}-value`).textContent =
        currentStat === 'kda' ? statValue.toFixed(1) : `${statValue.toFixed(1)}%`;
}

// User Interaction
function setupEventListeners() {
    document.getElementById('champ1-container').addEventListener('click', () =>
        checkAnswer(document.getElementById('champ1-name').textContent)
    );
    document.getElementById('champ2-container').addEventListener('click', () =>
        checkAnswer(document.getElementById('champ2-name').textContent)
    );
}

function checkAnswer(selectedChamp) {
    const champ1 = document.getElementById('champ1-name').textContent;
    const champ2 = document.getElementById('champ2-name').textContent;
    const champ1Value = championStats[champ1][currentStat];
    const champ2Value = championStats[champ2][currentStat];

    // Show stats
    document.getElementById('champ1-container').classList.add('show-stat');
    document.getElementById('champ2-container').classList.add('show-stat');

    // Determine correct answer (equal = any choice is correct)
    const isEqual = Math.abs(champ1Value - champ2Value) < 0.1; // Account for floating point
    const correctChamp = isEqual ? selectedChamp :
        (champ1Value > champ2Value ? champ1 : champ2);

    // Handle outcome
    const isCorrect = selectedChamp === correctChamp || isEqual;
    const clickedElement = document.getElementById(
        selectedChamp === champ1 ? 'champ1-container' : 'champ2-container'
    );

    if (isCorrect) {
        streak++;
        clickedElement.classList.add('correct');
    } else {
        streak = 0;
        clickedElement.classList.add('wrong');
    }

    streakDisplay.textContent = streak;

    // Next round after delay
    setTimeout(() => {
        document.querySelectorAll('.champion').forEach(el =>
            el.classList.remove('correct', 'wrong', 'show-stat')
        );
        newRound();
    }, 2000);
}