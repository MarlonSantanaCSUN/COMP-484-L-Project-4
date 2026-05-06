const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElement = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
// Additional elements for displaying WPM, errors, and scores:
const wpmDisplay = document.querySelector("#wpm");
const errorDisplay = document.querySelector("#errors");
const scoreList = document.querySelector("#scores");

// Sample paragraphs for the typing test:
const paragraphs = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing speed improves with consistent practice every day.",
    "JavaScript allows you to build interactive web applications.",
    "Accuracy matters more than speed when learning to type.",
    "Front end development combines logic with creativity."
];

let originText = originTextElement.innerHTML; // Initialize with the first paragraph

let timer = [0, 0, 0]; // [minutes, seconds, hundredths]
let interval;
let timerRunning = false;

let errors = 0; // For tracking errors in real-time
let lastInput = "";

// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time) {
    return time <= 9 ? "0" + time : time;
}

// Run a standard minute/second/hundredths timer:
function runTimer() {
    timer[2]++;

    if (timer[2] === 100) {
        timer[2] = 0;
        timer[1]++;
    }

    if (timer[1] === 60) {
        timer[1] = 0;
        timer[0]++;
    }

    theTimer.innerHTML =
        leadingZero(timer[0]) + ":" +
        leadingZero(timer[1]) + ":" +
        leadingZero(timer[2]);

    updateWPM(); // Update WPM every time the timer runs
}

function getTotalSeconds() { // Helper function to calculate total seconds for WPM calculation
    return timer[0] * 60 + timer[1] + timer[2] / 100;
}

// Match the text entered with the provided text on the page:
function spellCheck() {
    let textEntered = testArea.value;
    let originTextMatch = originText.substring(0, textEntered.length);

    // Check for errors in real-time and update the error count:
    if (textEntered !== originTextMatch && textEntered !== lastInput) {
        errors++;
        errorDisplay.textContent = errors;
    }

    lastInput = textEntered;
    // Check if the user has completed the test:
    if (textEntered === originText) {
        clearInterval(interval);
        testWrapper.style.borderColor = "green";
        saveScore();
    } else if (textEntered === originTextMatch) {
        testWrapper.style.borderColor = "blue";
    } else {
        testWrapper.style.borderColor = "red";
    }
}

// Start the timer:
function start() {
    if (testArea.value.length === 0 && !timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
    }
}

// Reset everything:
function reset() {
    clearInterval(interval);
    interval = null;

    timer = [0, 0, 0];
    timerRunning = false;
    errors = 0;
    lastInput = "";

    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";

    wpmDisplay.textContent = "0";
    errorDisplay.textContent = "0";

    // Randomly select a new paragraph for the next test:
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    originText = paragraphs[randomIndex];
    originTextElement.textContent = originText;
}

// Event listeners for keyboard input and the reset button:
testArea.addEventListener("keypress", start);
testArea.addEventListener("keyup", spellCheck);
resetButton.addEventListener("click", reset);

function updateWPM() { // Calculate and update WPM in real-time
    let chars = testArea.value.length;
    let seconds = getTotalSeconds();

    if (seconds > 0) {
        let wpm = Math.round((chars / 5) / (seconds / 60));
        wpmDisplay.textContent = wpm;
    }
}

// Function to save score to localStorage:
function saveScore() {
    let time = getTotalSeconds();

    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];

    scores.push(time);
    scores.sort((a, b) => a - b); // fastest first
    scores = scores.slice(0, 3); // keep top 3

    localStorage.setItem("typingScores", JSON.stringify(scores));
    displayScores();
}

// Function to display scores from localStorage:
function displayScores() {
    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];
    scoreList.innerHTML = "";

    scores.forEach(score => {
        let li = document.createElement("li");
        li.textContent = score.toFixed(2) + " sec";
        scoreList.appendChild(li);
    });
}

displayScores(); // Display scores on page load