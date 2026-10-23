const fallbackWords = ["LYCEE", "HIRONDELLE", "VEGAN", "TABLETTE", "JAVASCRIPT", "GOUVERNEMENT", "ASSISTANCE", "TOLERANCE", "MINISTRE", "VITESSE", "OMNIVORE", "MAGASIN", "CHEVAL", "TABLEIKEA", "POISSON", "GIRAFE", "INDECOLLABLES", "PRIORITE", "EMBALLER", "RADIOPHONIE", "ACOLYTE", "PERLE", "DALMATIEN", "ENCRE", "ALLURE", "ALIGNEMENTS", "CHAT", "EFFECTIF", "UNIFORME", "CAVALIER", "REVISION", "SURVEUR", "TRANSPORTER", "INSOMNIAQUE", "BIENVEILLANT", "SALADIER", "DEMENAGER", "MUSIQUE", "TENDRAIT", "ARRANGEMENT", "AIMANT", "INTERVALLE", "PARCHEMIN", "INDUSTRIEL", "PAUMER", "GRAND", "FABRIQUE", "LITTERATURE", "TERRITOIRE", "PETIT", "CHEVEUX", "CHARGEUR", "SERVICE", "FORCE", "MOYENNE", "VITESSE", "SON", "SIMPLIFIER", "ACCUMULER", "RATATOUILLE", "CARTEL", "COSMETIQUE", "TELEPHONE", "ENERGISANTE", "PROPOSITION" , "ANTICONSTITUTIONNELLEMENT", "TECHNIQUE", "BATTERIE", "CLAIVER", "ECRAN", "MULTIPRISE", "SOURIS", "BAPTEME", "EXPRIMABLE", "REFLEXION", "INCENDIE", "RONRONNER", "DRAGIBUS", "POULET", "EQUIPE", "STABILITE", "SERVITEUR", "ELECTRICITE", "CANICULE", "RANDONNEUR", "POURBOIRE", "NOVICE", "MENTION", "CONDUITE", "CHANCE", "CONTREFACTEUR", "INTERGOUVERNEMENTALISATION", "THERAPIE", "FABRICATION", "ARMURERIE", "MURAILLE", "SIMULATION", "MEXIQUE", "PUISSANCE", "AVION", "VIANDE", "FRITES", "UTILISATION", "PARENT", "INTERNATIONAL", ];
const MIN_LENGTH = 2;  
const MAX_LENGTH = 30; 
const maxAttempts = 8;
const SITE_URL = "https://tomgammeur.github.io/pendugame/";
const DAILY_KEY = "pendu_daily";
const THEME_KEY = "pendu_theme";
let words = fallbackWords;
let selectedWord = "";
let displayedWord = [];
let guessedLetters = [];
let guessHistory = []; 
let attempts = 0;
let gameOver = true;
let won = false;
let mode = "random";     
let dailyDate = "";

const correctSound = document.getElementById("correctSound");
const incorrectSound = document.getElementById("incorrectSound");

function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignoré */ }
}
function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}
function playSound(audio) {
    try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && p.catch) p.catch(() => {});
    } catch (e) { /* ignoré */ }
}

function loadDictionary() {
    if (typeof DICO_TEXT === "undefined") {
        console.warn("dico.js introuvable, liste de secours utilisée.");
        return;
    }
    const filtered = DICO_TEXT.split(" ").filter(
        (word) => word.length >= MIN_LENGTH && word.length <= MAX_LENGTH
    );
    if (filtered.length > 0) {
        words = filtered;
        console.log("Dictionnaire chargé : " + words.length + " mots");
    }
}


const dailyPool = Array.from(new Set(fallbackWords))
    .filter((w) => w.length >= 5 && w.length <= 12)
    .sort();

function parisDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function dailyWord(dateString) {
    const [y, m, d] = dateString.split("-").map(Number);
    const seed = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
    let t = (seed + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const random = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return dailyPool[Math.floor(random * dailyPool.length)];
}

function dateFr(dateString) {
    const [y, m, d] = dateString.split("-");
    return d + "/" + m + "/" + y;
}


const keyboardEl = document.querySelector(".keyboard");
const keyButtons = {};
keyboardEl.querySelectorAll(".key").forEach((b) => {
    keyButtons[b.textContent.trim()] = b;
});

function makeChip(text, onClick, extraClass) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (extraClass ? " " + extraClass : "");
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
}

const btnRandom = makeChip("Partie aléatoire", () => newGame());
const btnDaily = makeChip("Mot du jour", () => startDaily());
const modeInfo = document.createElement("div");
modeInfo.id = "modeInfo";
const toolbar = document.createElement("div");
toolbar.className = "toolbar";
toolbar.append(btnRandom, btnDaily);
keyboardEl.before(toolbar, modeInfo);

function setModeUI() {
    btnRandom.classList.toggle("active", mode === "random");
    btnDaily.classList.toggle("active", mode === "daily");
    modeInfo.textContent = mode === "daily" ? "Mot du jour du " + dateFr(dailyDate) : "";
}
const themes = [
    { id: "colors", icon: "🎨", label: "Couleurs" },
    { id: "light", icon: "☀️", label: "Clair" },
    { id: "dark", icon: "🌙", label: "Sombre" },
];
const themeSwitch = document.createElement("div");
themeSwitch.className = "theme-switch";
themes.forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "theme-btn";
    b.dataset.theme = t.id;
    b.title = "Thème : " + t.label;
    b.setAttribute("aria-label", "Thème " + t.label);
    b.textContent = t.icon;
    b.addEventListener("click", () => applyTheme(t.id));
    themeSwitch.appendChild(b);
});
document.body.appendChild(themeSwitch);

function applyTheme(id) {
    if (!themes.some((t) => t.id === id)) id = "colors";
    document.documentElement.setAttribute("data-theme", id);
    storageSet(THEME_KEY, id);
    themeSwitch.querySelectorAll(".theme-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.theme === id);
    });
}


function resetKeyboard() {
    Object.values(keyButtons).forEach((b) => {
        b.className = "key";
        b.disabled = false;
    });
}
function markKey(letter, isCorrect) {
    const b = keyButtons[letter];
    if (!b) return;
    b.classList.add(isCorrect ? "correct" : "wrong");
    b.disabled = true;
}
function lockKeyboard() {
    Object.values(keyButtons).forEach((b) => { b.disabled = true; });
}

function updateDisplay() {
    document.getElementById("word").textContent = displayedWord.join(" ");
    document.getElementById("letters").textContent = "Lettres devinées: " + guessedLetters.join(", ");
    document.getElementById("hangman").textContent = "Erreurs: " + attempts + " / " + maxAttempts;
}

function startRound(word) {
    closeModal();
    selectedWord = word;
    displayedWord = new Array(word.length).fill("_");
    guessedLetters = [];
    guessHistory = [];
    attempts = 0;
    gameOver = false;
    won = false;
    resetKeyboard();
    updateDisplay();
}

function newGame() {
    mode = "random";
    setModeUI();
    startRound(words[Math.floor(Math.random() * words.length)]);
}

function startDaily() {
    mode = "daily";
    dailyDate = parisDate();
    setModeUI();
    startRound(dailyWord(dailyDate));

    let saved = null;
    try { saved = JSON.parse(storageGet(DAILY_KEY)); } catch (e) { saved = null; }
    if (saved && saved.date === dailyDate && Array.isArray(saved.letters)) {
        saved.letters.forEach((l) => { if (!gameOver) applyGuess(l, true); });
    }
    if (gameOver) showResult(); 
}

function guessLetter(letter) {
    if (!selectedWord || gameOver) return;
    letter = String(letter).toUpperCase();
    if (guessedLetters.includes(letter)) return;
    applyGuess(letter, false);
}

function applyGuess(letter, silent) {
    guessedLetters.push(letter);
    const isCorrect = selectedWord.includes(letter);

    if (isCorrect) {
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) displayedWord[i] = letter;
        }
        if (!silent) playSound(correctSound);
    } else {
        attempts++;
        if (!silent) playSound(incorrectSound);
    }
    guessHistory.push(isCorrect);
    markKey(letter, isCorrect);
    updateDisplay();

    if (mode === "daily" && !silent) {
        storageSet(DAILY_KEY, JSON.stringify({ date: dailyDate, letters: guessedLetters }));
    }

    if (displayedWord.join("") === selectedWord) {
        finish(true, silent);
    } else if (attempts >= maxAttempts) {
        finish(false, silent);
    }
}

function finish(isWin, silent) {
    gameOver = true;
    won = isWin;
    lockKeyboard();
    if (!silent) {
        setTimeout(() => { if (gameOver) showResult(); }, 600);
    }
}

const WIN_TITLES = ["Bravo !", "GG, champion !", "Sauvé !", "Le pendu te dit merci !", "Quel talent !"];
const LOSE_TITLES = ["Perdu…", "Le pendu n'a pas survécu", "RIP le pendu", "Aïe, aïe, aïe…", "Oups."];
const LOSE_TEXTS = [
    "Paix à son âme.",
    "Même le dico est déçu.",
    "On dira que le mot était vraiment trop dur.",
    "Le pendu repassera.",
    "Tu feras mieux la prochaine fois !",
];

function closeModal(animated = true) {
    const old = document.getElementById("resultModal");
    if (!old) return;
    old.removeAttribute("id"); 
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animated || reduced) {
        old.remove();
        return;
    }
    old.classList.add("closing");
    setTimeout(() => old.remove(), 450);
}

function showResult() {
    closeModal(false); 

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "resultModal";

    const card = document.createElement("div");
    card.className = "modal-card " + (won ? "win" : "lose");

    const title = won ? pick(WIN_TITLES) : pick(LOSE_TITLES);
    const text = won
        ? "Trouvé avec " + attempts + " erreur" + (attempts > 1 ? "s" : "") + " sur " + maxAttempts + "."
        : pick(LOSE_TEXTS);

    card.innerHTML =
        '<button type="button" class="modal-close" aria-label="Fermer">✕</button>' +
        '<div class="modal-emoji">' + (won ? "🎉" : "💀") + "</div>" +
        '<div class="modal-title">' + title + "</div>" +
        '<div class="modal-text">' + text + "</div>" +
        '<div class="modal-text">Le mot était :</div>' +
        '<div class="modal-word">' + selectedWord + "</div>" +
        '<div class="modal-actions"></div>';

    const actions = card.querySelector(".modal-actions");
    if (mode === "daily") {
        const btnShare = makeChip("Partager mon résultat", () => shareResult(btnShare));
        actions.append(btnShare, makeChip("Partie aléatoire", () => newGame()));
    } else {
        actions.append(makeChip("▶ Rejouer", () => newGame()));
    }

    card.querySelector(".modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const firstBtn = actions.querySelector("button");
    if (firstBtn) firstBtn.focus();

    if (won) launchConfetti();
}

function launchConfetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const colors = ["#ff4d6d", "#ffd166", "#06d6a0", "#4cc9f0", "#a78bfa", "#ffffff"];
    const pieces = Array.from({ length: 160 }, () => ({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.5,
        size: 5 + Math.random() * 7,
        color: pick(colors),
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
    }));

    const DURATION = 4500;
    const start = performance.now();

    function frame(now) {
        const t = now - start;
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = t > DURATION - 1000 ? Math.max(0, (DURATION - t) / 1000) : 1;
        for (const p of pieces) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        }
        if (t < DURATION) {
            requestAnimationFrame(frame);
        } else {
            canvas.remove();
        }
    }
    requestAnimationFrame(frame);
}

function buildShareText() {
    const rows = [];
    for (let i = 0; i < guessHistory.length; i += 10) {
        rows.push(guessHistory.slice(i, i + 10).map((ok) => (ok ? "🟩" : "🟥")).join(""));
    }
    const result = won
        ? "Trouvé avec " + attempts + " erreur" + (attempts > 1 ? "s" : "") + " sur " + maxAttempts
        : "Perdu (" + maxAttempts + " erreurs sur " + maxAttempts + ")";
    return (
        "Jeu du Pendu - mot du jour " + dateFr(dailyDate) + "\n" +
        result + "\n" +
        rows.join("\n") + "\n" +
        SITE_URL
    );
}

async function shareResult(button) {
    const text = buildShareText();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        try {
            await navigator.share({ text: text });
            return;
        } catch (e) {
            if (e && e.name === "AbortError") return;
        }
    }
    try {
        await navigator.clipboard.writeText(text);
        const old = button.textContent;
        button.textContent = "Copié ! ✅";
        setTimeout(() => { button.textContent = old; }, 2000);
    } catch (e) {
        window.prompt("Copie ton résultat :", text);
    }
}

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape") {
        closeModal();
        return;
    }
    if (/^[a-zA-Z]$/.test(event.key)) {
        guessLetter(event.key);
    }
});

applyTheme(storageGet(THEME_KEY) || "colors");
loadDictionary();
newGame();

window.addEventListener("load", function () {
    const loaderWrapper = document.querySelector(".loader-wrapper");
    if (loaderWrapper) loaderWrapper.style.display = "none";
});
