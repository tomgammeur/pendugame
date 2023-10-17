window.addEventListener("load", function() {
    // Une fois que tout le contenu est chargé, masquez l'écran de chargement.
    const loaderWrapper = document.querySelector(".loader-wrapper");
    loaderWrapper.style.display = "none";
});

const words = ["LYCEE", "HIRONDELLE", "TABLETTE", "JAVASCRIPT", "GOUVERNEMENT", "OMNIVORE", "MAGASIN", "CHEVAL", "TABLEIKEA", "POISSON", "GIRAFE", "INDECOLLABLES", "PRIORITE", "EMBALLER", "RADIOPHONIE", "ACOLYTE", "PERLE", "DALMATIEN", "ENCRE", "ALLURE", "ALIGNEMENTS", "CHAT", "EFFECTIF", "UNIFORME", "CAVALIER", "REVISION", "SURVEUR", "TRANSPORTER", "INSOMNIAQUE", "BIENVEILLANT", "SALADIER", "DEMENAGER", "MUSIQUE", "TENDRAIT", "ARRANGEMENT", "AIMANT", "INTERVALLE", "PARCHEMIN", "INDUSTRIEL", "PAUMER", "GRAND", "FABRIQUE", "LITTERATURE", "TERRITOIRE", "PETIT", "CHEVEUX", "CHARGEUR", "SERVICE", "FORCE", "MOYENNE", "VITESSE", "SON", "SIMPLIFIER", "ACCUMULER", "RATATOUILLE", "CARTEL", "COSMETIQUE", "TELEPHONE", "ANTICONSTITUTIONNELLEMENT", "TECHNIQUE", "BATTERIE", "CLAIVER", "ECRAN", "MULTIPRISE", "SOURIS", "BAPTEME", "EXPRIMABLE",];

const maxAttempts = 8;

let selectedWord = "";
let displayedWord = [];
let guessedLetters = [];
let attempts = 0;

const correctSound = document.getElementById("correctSound");
const incorrectSound = document.getElementById("incorrectSound");

function newGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    displayedWord = new Array(selectedWord.length).fill("_");
    guessedLetters = [];
    attempts = 0;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById("word").textContent = displayedWord.join(" ");
    document.getElementById("letters").textContent = "Lettres devinées: " + guessedLetters.join(", ");
    document.getElementById("hangman").textContent = "Erreurs: " + attempts + " / " + maxAttempts;
}

function guessLetter(letter) {
    if (guessedLetters.includes(letter)) {
        return; // Ne fait rien si la lettre a déjà été devinée.
    }
    guessedLetters.push(letter);

    if (selectedWord.includes(letter)) {
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) {
                displayedWord[i] = letter;
            }
        }
        correctSound.play();
    } else {
        attempts++;
        incorrectSound.play();
    }

    updateDisplay();

    if (displayedWord.join("") === selectedWord) {
        alert("Bravo, vous avez gagné ! Le mot était bien : " + selectedWord);
        newGame();
    } else if (attempts >= maxAttempts) {
        alert("Désolé, vous avez perdu. Le mot était : " + selectedWord);
        newGame();
    }
}

newGame();

document.addEventListener("keydown", (event) => {
    if (event.keyCode >= 65 && event.keyCode <= 90) {
        guessLetter(event.key.toUpperCase());
    }
});
