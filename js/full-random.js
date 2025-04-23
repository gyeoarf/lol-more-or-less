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

function newRound(champ1, champ2) {
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

    const f1 = champ1.replace(/\s+/g, '');
    const f2 = champ2.replace(/\s+/g, '');
    champ1Img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${f1}.png`;
    champ2Img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${f2}.png`;

    // Reset styles
    ['champ1-container', 'champ2-container'].forEach(id => {
        document.getElementById(id).classList.remove('correct', 'wrong');
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
    const wrongContainer = selectedChamp !== correctChamp ? selectedContainer : null;

    if (selectedChamp === correctChamp || isEqual) {
        streak++;
        streakDisplay.textContent = streak;
        document.getElementById(selectedContainer).classList.add('correct');
        currentChampion = correctChamp;
    } else {
        streak = 0;
        streakDisplay.textContent = streak;
        document.getElementById(selectedContainer).classList.add('wrong');
        currentChampion = correctChamp; // Still advance
    }

    setTimeout(() => {
        const nextChallenger = getRandomChampion(currentChampion);
        newRound(currentChampion, nextChallenger);
    }, 2000);
}
