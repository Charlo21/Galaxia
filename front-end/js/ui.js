let score = 0;
const scoreDisplay = document.getElementById('score');

// Update score when attack is performed
function updateScore() {
    score += 10; // Add 10 points per attack
    scoreDisplay.innerText = `Score: ${score}`;
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
    alert('Game Over! Your final score is: ' + score);
    location.reload(); // Reload the game (or handle restart)
}

