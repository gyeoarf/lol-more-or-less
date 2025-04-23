let champions = {};
let currentStat = '';
let streak = 0;
let version = '15.8.1';
let currentChampion = null; // Stores the ongoing "winner"

// Stats to compare
const possibleStats = ['hp', 'ad', 'ms', 'range'];

const statDisplay = document.getElementById('stat-display');
const champ1Img = document.getElementById('champ1-img');
const champ1Name = document.getElementById('champ1-name');
const champ2Img = document.getElementById('champ2-img');
const champ2Name = document.getElementById('champ2-name');
const streakDisplay = document.getElementById('streak');

document.addEventListener('DOMContentLoaded', () => {
    fetchChampionData();
    document.getElementById('champ1-container').addEventListener('click', () => checkAnswer(champ1Name.textContent));
    document.getElementById('champ2-container').addEventListener('click', () => checkAnswer(champ2Name.textContent));
});

async function fetchChampionData() {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
        const data = await response.json();

        for (const champId in data.data) {
            const champ = data.data[champId];
            champions[champ.name] = {
                hp: champ.stats.hp,
                ad: champ.stats.attackdamage,
                ms: champ.stats.movespeed,
                range: champ.stats.attackrange
            };
        }

        console.log("Champions loaded:", Object.keys(champions).length);
        startGame();
    } catch (err) {
        console.error("Error loading data", err);
        alert("Could not load champion data.");
    }
}

function getRandomChampion(exclude = null) {
    const names = Object.keys(champions).filter(name => name !== exclude);
    return names[Math.floor(Math.random() * names.length)];
}

function startGame() {
    // Set initial 2 champions
    currentChampion = getRandomChampion();
    const opponent = getRandomChampion(currentChampion);
    newRound(currentChampion, opponent);
}

async function newRound(champ1, champ2) {
    currentStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

    const displayNames = {
        hp: 'Health',
        ad: 'Attack Damage',
        ms: 'Move Speed',
        range: 'Attack Range'
    };
    statDisplay.textContent = displayNames[currentStat];

    champ1Name.textContent = champ1;
    champ2Name.textContent = champ2;

    // Load images using our new image loader
    await imageLoader.loadImage(champ1, champ1Img);
    await imageLoader.loadImage(champ2, champ2Img);

    // Reset styles
    ['champ1-container', 'champ2-container'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('correct', 'wrong');
        el.style.pointerEvents = 'auto';
    });
}

function checkAnswer(selectedChamp) {
    const champ1 = champ1Name.textContent;
    const champ2 = champ2Name.textContent;

    const val1 = champions[champ1][currentStat];
    const val2 = champions[champ2][currentStat];

    const isEqual = val1 === val2;
    let correctChamp;

    if (isEqual) {
        correctChamp = selectedChamp; // Player's pick stays
    } else {
        correctChamp = val1 > val2 ? champ1 : champ2;
    }

    const selectedContainer = selectedChamp === champ1 ? 'champ1-container' : 'champ2-container';
    const otherContainer = selectedChamp === champ1 ? 'champ2-container' : 'champ1-container';

    // Update names to show stat values
    champ1Name.textContent = `${champ1} (${val1})`;
    champ2Name.textContent = `${champ2} (${val2})`;

    if (selectedChamp === correctChamp || isEqual) {
        streak++;
        streakDisplay.textContent = streak;
        document.getElementById(selectedContainer).classList.add('correct');
        currentChampion = correctChamp;
    } else {
        streak = 0;
        streakDisplay.textContent = streak;
        document.getElementById(selectedContainer).classList.add('wrong');
        document.getElementById(otherContainer).classList.add('correct');
        currentChampion = correctChamp;
    }

    // Disable further clicks during the reveal period
    document.getElementById('champ1-container').style.pointerEvents = 'none';
    document.getElementById('champ2-container').style.pointerEvents = 'none';

    setTimeout(() => {
        // Restore original names without values
        champ1Name.textContent = champ1;
        champ2Name.textContent = champ2;

        // Re-enable clicks
        document.getElementById('champ1-container').style.pointerEvents = 'auto';
        document.getElementById('champ2-container').style.pointerEvents = 'auto';

        // Move to next round
        const nextChallenger = getRandomChampion(currentChampion);
        newRound(currentChampion, nextChallenger);
    }, 2000);
}

// Add this near the top of your full-random.js (with other constants)
const imageLoader = {
    cache: {},

    async loadImage(championName, imgElement) {
        const formattedName = championName.replace(/\s+/g, '');
        const cacheKey = `${version}_${formattedName}`;

        // 1. Check cache first
        if (this.cache[cacheKey]?.status === 'loaded') {
            imgElement.src = this.cache[cacheKey].url;
            imgElement.classList.remove('loading', 'error-state');
            return;
        }

        // 2. Set loading state
        imgElement.classList.add('loading');
        imgElement.src = '';

        try {
            // 3. Try to load from CDN
            const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${formattedName}.png`;

            // Test load using Image object
            const loaded = await new Promise((resolve) => {
                const testImg = new Image();
                testImg.onload = () => resolve(true);
                testImg.onerror = () => resolve(false);
                testImg.src = url;
            });

            if (loaded) {
                // 4. Success - update DOM and cache
                imgElement.src = url;
                imgElement.classList.remove('loading', 'error-state');
                this.cache[cacheKey] = { status: 'loaded', url };
            } else {
                // 5. CDN failed
                throw new Error('Image failed to load');
            }
        } catch (error) {
            // 6. Handle errors
            console.warn(`Image load failed for ${championName}:`, error);
            imgElement.src = '';
            imgElement.classList.remove('loading');
            imgElement.classList.add('error-state');
            this.cache[cacheKey] = { status: 'failed' };
        }
    }
};