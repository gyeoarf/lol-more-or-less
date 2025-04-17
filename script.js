// Sample data (replace with real stats later)
const champions = {
    "Garen": { hp: 620, ad: 66, ms: 340 },
    "Jhin": { hp: 585, ad: 59, ms: 330 },
    "Braum": { hp: 540, ad: 55, ms: 335 },
    "Fiora": { hp: 550, ad: 68, ms: 340 },
};

let currentStat = 'hp';
let streak = 0;

function getRandomChampion() {
    const keys = Object.keys(champions);
    return keys[Math.floor(Math.random() * keys.length)];
}

function newRound() {
    let champ1 = getRandomChampion();
    let champ2 = getRandomChampion();
    while (champ2 === champ1) champ2 = getRandomChampion(); // No duplicates

    document.getElementById('champ1').textContent = champ1;
    document.getElementById('champ2').textContent = champ2;
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

// Initialize
document.getElementById('champ1').addEventListener('click', () => checkAnswer(document.getElementById('champ1').textContent));
document.getElementById('champ2').addEventListener('click', () => checkAnswer(document.getElementById('champ2').textContent));
newRound();