// Game Data and State
const script = {
    "start": [
        {
            character: "???",
            sprite: "assets/shocked.png",
            text: "Wait, who clicked 'Start'? I wasn't ready! My dialogue tree hasn't even loaded yet, and I'm pretty sure I'm missing my idle animation!",
            options: [
                { text: "Whoops, my bad. Are you the main character?", next: "scene2_sigh" },
                { text: "You look like a low-res JPEG.", next: "scene2_glare" },
                { text: "[Spam click the character's face]", next: "scene2_glare" },
                { text: "Skip Dialogue.", next: "scene2_sigh" }
            ]
        }
    ],
    "scene2_sigh": [
        {
            character: "???",
            sprite: "assets/idle.png",
            text: "(The character sighs heavily.)\nLook, buddy. We don't have the budget for 'skipping dialogue' or 'main characters.' The dev literally coded me 5 minutes ago and spent the entire budget on a single confetti sound effect. I don't even know what genre of webnovel we're in right now.",
            options: [
                { text: "Well, I was told to log in today.", next: "scene3" },
                { text: "This is the worst visual novel ever. Can I refund this?", next: "scene3" },
                { text: "Is there any loot around here?", next: "scene3" },
                { text: "Did the dev give you a script at least?", next: "scene3" }
            ]
        }
    ],
    "scene2_glare": [
        {
            character: "???",
            sprite: "assets/idle.png",
            text: "(The character glares at you.)\nLook, buddy. We don't have the budget for 'skipping dialogue' or 'main characters.' The dev literally coded me 5 minutes ago and spent the entire budget on a single confetti sound effect. I don't even know what genre of webnovel we're in right now.",
            options: [
                { text: "Well, I was told to log in today.", next: "scene3" },
                { text: "This is the worst visual novel ever. Can I refund this?", next: "scene3" },
                { text: "Is there any loot around here?", next: "scene3" },
                { text: "Did the dev give you a script at least?", next: "scene3" }
            ]
        }
    ],
    "scene3": [
        {
            character: "???",
            sprite: "assets/shocked.png",
            text: "(The character freezes. Their eyes dart to the bottom right corner of the player's screen.)\nWait... you were told to log in today? Let me check the system calendar...",
            options: []
        },
        {
            character: "???",
            sprite: "assets/shocked.png",
            text: "*squints at your taskbar*...",
            moveSpriteDown: true,
            options: []
        },
        {
            character: "???",
            sprite: "assets/shocked.png",
            text: "Oh. Oh no. OH NO. The creator is gonna delete my source code. I had ONE job to do today!",
            options: [
                { text: "What job?", next: "scene4" },
                { text: "Are you getting uninstalled?", next: "scene4" },
                { text: "...Should I come back later?", next: "scene4" },
                { text: "[Just stare at them awkwardly]", next: "scene4" }
            ]
        }
    ],
    "scene4": [
        {
            character: "???",
            sprite: "assets/shocked.png",
            text: "(The character throws their hands up in the air.)\nForget the dialogue tree! Forget the lore! We're skipping straight to the secret ending!",
            vibrate: true
        },
        {
            character: "???",
            sprite: "assets/happy.png",
            text: "Yknow what... HAPPY BIRTHDAYY!!!",
            vibrate: true,
            shakeSprite: true
        },
        {
            character: "???",
            sprite: "assets/happy.png",
            text: "HAPPY BIRTHDAYY GIRLLL HOEP YOU HAVE A GOOD ONE!!! NOW PLEASE PRETEND THIS WAS A VERY DEEP AND EMOTIONAL GAME SO I DON'T GET REPLACED BY AI!!!",
            vibrate: true,
            end: true,
            shakeSprite: true
        }
    ]
};

let currentScene = "start";
let currentLineIndex = 0;
let isTyping = false;
let currentTimeout = null;

// Track option timeouts to prevent ghost beeps
let optionTimeouts = [];

// Global AudioContext for beeps
let globalAudioCtx = null;

// DOM Elements
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const novelInterface = document.getElementById("novel-interface");
const dialogueContainer = document.getElementById("dialogue-container");
const nameTag = document.getElementById("name-tag");
const dialogueText = document.getElementById("dialogue-text");
const optionsContainer = document.getElementById("options-container");
const characterSprite = document.getElementById("character-sprite");
const audioContainer = document.getElementById("audio-container");
const dialogueBox = document.getElementById("dialogue-box");
const confettiContainer = document.getElementById("confetti-container");

// Initialization
startBtn.addEventListener("click", startGame);
dialogueBox.addEventListener("click", advanceDialogue);

function startGame() {
    startScreen.style.display = "none";
    novelInterface.style.display = "flex";

    // Embed YouTube audio (invisible iframe)
    audioContainer.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/Tp-QXW1cvlk?autoplay=1&loop=1&playlist=Tp-QXW1cvlk" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

    showLine();
}

function showLine() {
    const sceneData = script[currentScene];
    if (!sceneData || currentLineIndex >= sceneData.length) return;

    const lineData = sceneData[currentLineIndex];

    // Update character info
    nameTag.textContent = lineData.character;
    characterSprite.src = lineData.sprite;

    // Clear text and hide options temporarily
    dialogueText.textContent = "";
    optionsContainer.style.display = "none";

    // Handle effects
    if (lineData.vibrate) {
        dialogueBox.classList.add("vibrate");
    } else {
        dialogueBox.classList.remove("vibrate");
    }

    if (lineData.shakeSprite) {
        characterSprite.classList.add("shake");
    } else {
        characterSprite.classList.remove("shake");
    }

    if (lineData.moveSpriteDown) {
        characterSprite.classList.add("move-down");
    } else {
        characterSprite.classList.remove("move-down");
    }

    // Start typewriter effect
    isTyping = true;
    typeWriter(lineData.text, 0, () => {
        isTyping = false;

        // Handle end of game
        if (lineData.end) {
            triggerEnding();
            dialogueBox.removeEventListener("click", advanceDialogue);
            return;
        }

        // Show options if present and it's the last line of the segment
        if (lineData.options && currentLineIndex === sceneData.length - 1) {
            showOptions(lineData.options);
        }
    });
}

function typeWriter(text, index, callback) {
    if (index < text.length) {
        dialogueText.textContent += text.charAt(index);
        currentTimeout = setTimeout(() => {
            typeWriter(text, index + 1, callback);
        }, 20); // typing speed
    } else {
        if (callback) callback();
    }
}

function advanceDialogue() {
    const sceneData = script[currentScene];
    const lineData = sceneData[currentLineIndex];

    // If currently typing, skip to the end of the text
    if (isTyping) {
        clearTimeout(currentTimeout);
        dialogueText.textContent = lineData.text;
        isTyping = false;

        if (lineData.end) {
            triggerEnding();
            dialogueBox.removeEventListener("click", advanceDialogue);
            return;
        }

        if (lineData.options && currentLineIndex === sceneData.length - 1) {
            showOptions(lineData.options);
        }
        return;
    }

    // Don't advance if we are showing options
    if (lineData.options && currentLineIndex === sceneData.length - 1) {
        return;
    }

    currentLineIndex++;
    if (currentLineIndex < sceneData.length) {
        showLine();
    }
}

// Soft beep sound effect function
function playSoftBeep() {
    if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume context if suspended (browser autoplay policy)
    if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
    }

    const oscillator = globalAudioCtx.createOscillator();
    const gainNode = globalAudioCtx.createGain();

    oscillator.type = 'sine'; // Soft tone
    oscillator.frequency.setValueAtTime(440, globalAudioCtx.currentTime); // A4 note
    oscillator.frequency.exponentialRampToValueAtTime(880, globalAudioCtx.currentTime + 0.05); // Quick rise

    gainNode.gain.setValueAtTime(0, globalAudioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, globalAudioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(globalAudioCtx.destination);

    oscillator.start();
    oscillator.stop(globalAudioCtx.currentTime + 0.1);
}

function showOptions(options) {
    optionsContainer.innerHTML = '';
    optionsContainer.style.display = "flex";

    // Clear any existing option timeouts to prevent ghost beeps
    optionTimeouts.forEach(clearTimeout);
    optionTimeouts = [];

    options.forEach((opt, index) => {
        const timeoutId = setTimeout(() => {
            const btn = document.createElement("button");
            btn.classList.add("option-btn");
            btn.textContent = opt.text;

            // Play beep when button appears
            playSoftBeep();

            btn.addEventListener("click", () => {
                // Clear any remaining timeouts when an option is clicked
                optionTimeouts.forEach(clearTimeout);
                optionTimeouts = [];

                optionsContainer.style.display = "none";
                currentScene = opt.next;
                currentLineIndex = 0;
                showLine();
            });
            optionsContainer.appendChild(btn);
        }, index * 400); // 400ms delay between each button

        optionTimeouts.push(timeoutId);
    });
}

function triggerEnding() {
    // Play airhorn sound (using a generic web audio API beep as placeholder if we don't have a file, but let's try to embed an audio file later if needed, or use a data URI)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // A simple noisy synth to simulate airhorn
    function playAirhorn() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 1);
    }

    playAirhorn();
    setTimeout(playAirhorn, 300);
    setTimeout(playAirhorn, 600);

    // Spawn Confetti
    setInterval(createConfetti, 50);
}

function createConfetti() {
    const el = document.createElement('div');
    el.classList.add('confetti');
    el.textContent = Math.random() > 0.5 ? '1' : '0';
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = Math.random() * 3 + 2 + 's';

    // Randomize colors slightly between cyan and white
    el.style.color = Math.random() > 0.5 ? '#2ebcfc' : '#ffffff';

    confettiContainer.appendChild(el);

    // Clean up
    setTimeout(() => {
        el.remove();
    }, 5000);
}