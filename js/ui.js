let score = 0;
const scoreDisplay = document.getElementById('score');

// Update score when attack is performed
function updateScore() {
    score += 10; // Add 10 points per attack
    updateScoreDisplay(score);
}

function updateScoreDisplay(score) {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Hook the score update to the attack function
cat.addEventListener('click', updateScore);
dog.addEventListener('click', updateScore);
starfighter.addEventListener('click', updateScore);

let timeLeft = 60; // 60 seconds for the game
const timerDisplay = document.getElementById('timer');

// Function to update the timer
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerDisplay.innerText = `Time Left: ${timeLeft}s`;
    } else {
        endGame();
    }
}

// Start the timer countdown
setInterval(updateTimer, 1000); // Call every 1 second

// Function to end the game when time is up
function endGame() {
    showMessage(`Game Over! Your final score is: ${score}`, 3000);
    location.reload(); // Reload the game (or handle restart)
}

function showMessage(message, duration = 2000) {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        z-index: 1000;
    `;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, duration);
}
