// player-stats.js - Complete Replacement
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing Player Stats mode...");

    // Configuration
    const version = '15.8.1'; // Current LoL patch
    let championStats = {};
    let currentStat = '';
    let streak = 0;
    const statTypes = ['winRate', 'pickRate', 'banRate', 'kda'];

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
        }
    };

    // Initialize Game
    try {
        await loadChampionData();
        setupEventListeners();
        newRound();
    } catch (error) {
        console.error("Initialization failed:", error);
        alert("Game initialization failed. Please refresh.");
    }

    // Data Loading
    async function loadChampionData() {
        try {
            // Try Blitz.gg API first
            const response = await fetch('https://league-champion-aggregate.iesdev.com/api/champion/na');
            if (!response.ok) throw new Error("Blitz API failed");

            const statsData = await response.json();
            const namesResponse = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json');
            const namesData = await namesResponse.json();

            // Transform data
            Object.entries(statsData.data).forEach(([id, stats]) => {
                const champ = namesData.find(c => c.id === parseInt(id));
                if (champ) championStats[champ.name] = {
                    winRate: stats.winRate,
                    pickRate: stats.pickRate,
                    banRate: stats.banRate,
                    kda: stats.kda
                };
            });

            console.log("Loaded stats for", Object.keys(championStats).length, "champions");
        } catch (error) {
            console.warn("Using fallback data:", error);
            championStats = {
                "Aatrox": { winRate: 50.1, pickRate: 8.2, banRate: 12.3, kda: 2.1 },
                "Ahri": { winRate: 51.7, pickRate: 15.3, banRate: 5.4, kda: 2.8 },
                "Zed": { winRate: 49.5, pickRate: 18.7, banRate: 25.1, kda: 2.5 }
                // Add more champions as needed
            };
        }
    }

    // Game Logic
    function newRound() {
        resetUI();

        // Select random stat
        currentStat = statTypes[Math.floor(Math.random() * statTypes.length)];
        updateStatDisplay();

        // Get valid champions
        const validChamps = Object.keys(championStats).filter(name =>
            championStats[name][currentStat] !== undefined
        );

        if (validChamps.length < 2) {
            console.error("Not enough champions with stats");
            return;
        }

        // Select two unique champions
        let champ1, champ2;
        do {
            champ1 = validChamps[Math.floor(Math.random() * validChamps.length)];
            champ2 = validChamps[Math.floor(Math.random() * validChamps.length)];
        } while (champ2 === champ1 && validChamps.length > 1);

        updateChampionUI('champ1', champ1);
        updateChampionUI('champ2', champ2);
    }

    function resetUI() {
        elements.champ1.container.classList.remove('correct', 'wrong', 'show-stat');
        elements.champ2.container.classList.remove('correct', 'wrong', 'show-stat');
    }

    function updateStatDisplay() {
        const displayText = {
            winRate: "Win Rate",
            pickRate: "Pick Rate",
            banRate: "Ban Rate",
            kda: "KDA"
        };
        elements.statDisplay.textContent = displayText[currentStat];
        elements.statDisplay.className = currentStat;
    }

    function updateChampionUI(prefix, champName) {
        const champ = elements[prefix];
        champ.name.textContent = champName;
        champ.img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champName.replace(/\s+/g, '')}.png`;
        champ.img.alt = champName;

        const statValue = championStats[champName][currentStat];
        champ.value.textContent = currentStat === 'kda' ?
            statValue.toFixed(1) :
            `${statValue.toFixed(1)}%`;
    }

    // Event Handlers
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

        // Determine result
        const isEqual = Math.abs(champ1Value - champ2Value) < 0.1;
        const correctChamp = isEqual ? selectedChamp :
            (champ1Value > champ2Value ? champ1 : champ2);
        const isCorrect = selectedChamp === correctChamp || isEqual;

        // Update UI
        const clickedElement = selectedChamp === champ1 ?
            elements.champ1.container :
            elements.champ2.container;

        clickedElement.classList.add(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            streak++;
            elements.streakDisplay.textContent = streak;
        } else {
            streak = 0;
            elements.streakDisplay.textContent = streak;
        }

        // Next round
        setTimeout(newRound, 2000);
    }
});