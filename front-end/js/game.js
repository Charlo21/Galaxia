// Import character definitions and 3D renderer
import { characters } from './characters.js';
import { CharacterRenderer } from './renderer3d.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initializing...');

    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game state variables
    let currentCharacter = "tibetanMastiff";
    let score = 0;
    let playerCoins = parseInt(localStorage.getItem('playerCoins')) || 0;
    let isGameOver = false;
    let enemies = [];

    // Initialize 3D renderer
    console.log('Initializing renderer...');
    const renderer = new CharacterRenderer(canvas);

    // Load 3D models
    console.log('Loading models...');
    async function loadModels() {
        try {
            await Promise.all([
                renderer.loadModel('tibetanMastiff', '../assets/models/tibetan_mastiff.glb'),
                renderer.loadModel('sumatranTiger', '../assets/models/sumatran_tiger.glb'),
                renderer.loadModel('galaxyShip', '../assets/models/spaceship.glb')
            ]);
            
            console.log('Models loaded successfully');
            // Show initial character
            renderer.showCharacter(currentCharacter);
            
            // Check for daily reward after models are loaded
            setTimeout(() => checkDailyReward(), 1000);
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    // Start loading models
    loadModels();

    // Player object
    const player = {
        async attack() {
            console.log('Attack initiated');
            const char = characters[currentCharacter];
            if (char) {
                // Play attack animation
                renderer.playAnimation(currentCharacter, 'attack');
                
                // Attack enemies
                attackEnemies();
                
                // Add score
                updateScore(10);
            }
        },
        
        async specialAttack() {
            console.log('Special attack initiated');
            const char = characters[currentCharacter];
            if (char) {
                // Play special attack animation
                renderer.playAnimation(currentCharacter, 'special');
                
                // Special attack has more power
                for (let i = 0; i < 3; i++) {
                    attackEnemies();
                }
                
                // Add more score
                updateScore(30);
            }
        }
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderer.resize();
    });

    // Add double click for special attacks
    canvas.addEventListener("dblclick", () => {
        console.log('Double click detected');
        player.specialAttack();
    });

    // Add single click for normal attacks
    canvas.addEventListener("click", () => {
        console.log('Click detected');
        player.attack();
    });

    // Enemy configuration
    const ENEMY_SPEED = 2; // Slower speed
    const ENEMY_SIZE = 40;
    const ENEMY_SPAWN_INTERVAL = 2000; // Spawn every 2 seconds
    const ENEMY_ATTACK_RANGE = canvas.height * 0.75; // Only attack when close to bottom

    function createEnemy() {
        const x = Math.random() * (canvas.width - ENEMY_SIZE);
        const enemy = {
            x: x,
            y: -ENEMY_SIZE, // Start above canvas
            width: ENEMY_SIZE,
            height: ENEMY_SIZE,
            color: "#ff0000",
            health: 100,
            isAlive: true
        };
        enemies.push(enemy);
    }

    function attackEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) { // Iterate backwards to safely remove
            const enemy = enemies[i];
            if (enemy.y > ENEMY_ATTACK_RANGE) {
                // Only attack when enemy is close enough
                enemy.health -= 10; // Simple damage
                if (enemy.health <= 0) {
                    enemies.splice(i, 1); // Remove defeated enemy
                    score += 10;
                    updateScore(score);
                }
            }
        }
    }

    // Game loop
    function gameLoop() {
        if (isGameOver) return;
        
        // Clear canvas
        renderer.clear();
        
        // Update and Draw Enemies
        for (let i = enemies.length - 1; i >= 0; i--) { // Iterate backwards
            const enemy = enemies[i];
            if (enemy.isAlive) {
                enemy.y += ENEMY_SPEED; // Move enemies down
                renderer.drawEnemy(enemy);
            }
            
            // Check if an enemy reaches the player
            if (enemy.y + enemy.height > canvas.height) {
                enemy.isAlive = false; // Mark as dead
                enemies.splice(i, 1); // Remove from array
                
                // Only show game over if we actually lost
                if (enemies.length === 0 && score > 0) {
                    showGameOver();
                }
            }
        }

        // Spawn enemies randomly
        if (Math.random() < 0.01 && enemies.length < 5) {
            createEnemy();
        }

        // Continue game loop
        requestAnimationFrame(gameLoop);
    }

    // Function to show game over screen
    function showGameOver() {
        isGameOver = true;
        
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            padding: 30px;
            border-radius: 15px;
            color: white;
            text-align: center;
            z-index: 1000;
            border: 2px solid #FF4444;
            backdrop-filter: blur(10px);
        `;
        
        modal.innerHTML = `
            <h2 style="color: #FF4444;">Game Over!</h2>
            <p>Final Score: ${score}</p>
            <button onclick="location.reload()" style="
                background: #4169E1;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">Play Again</button>
        `;
        
        document.body.appendChild(modal);
    }

    // Check for Daily Reward
    function checkDailyReward() {
        let lastLogin = localStorage.getItem('lastLogin');
        let currentDate = new Date().getTime();

        // 24 hours in milliseconds
        let timeLimit = 24 * 60 * 60 * 1000;

        if (!lastLogin || (currentDate - parseInt(lastLogin)) > timeLimit) {
            giveDailyReward();
            localStorage.setItem('lastLogin', currentDate.toString());
        }
    }

    function giveDailyReward() {
        // Add rarity tiers to rewards
        const rarityRoll = Math.random();
        let reward = {
            coins: 100,
            rarity: 'common',
            tokens: 1
        };
        
        if (rarityRoll > 0.95) {
            reward = { coins: 500, rarity: 'legendary', tokens: 10 };
        } else if (rarityRoll > 0.85) {
            reward = { coins: 250, rarity: 'rare', tokens: 5 };
        }
        
        const rewardMessage = `${reward.rarity.toUpperCase()} Daily Reward:\n${reward.coins} coins\n${reward.tokens} GLXIA tokens`;
        
        // Create custom modal for reward
        const modal = document.createElement('div');
        modal.className = 'reward-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
            z-index: 1000;
            border: 2px solid #4169E1;
        `;
        
        modal.innerHTML = `
            <h2 style="color: #4169E1;">Daily Reward!</h2>
            <p>${rewardMessage}</p>
            <button onclick="this.parentElement.remove()" style="
                background: #4169E1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Claim</button>
        `;
        
        document.body.appendChild(modal);
        
        playerCoins += reward.coins;
        localStorage.setItem('playerCoins', playerCoins.toString());
        updatePlayerCoins();
    }

    // Function to update player's coin count in the UI
    function updatePlayerCoins() {
        const coinDisplay = document.getElementById('coin-count');
        if (coinDisplay) {
            coinDisplay.innerText = playerCoins;
        }
    }

    // Function to update score
    function updateScore(points) {
        score = points;
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }

    // Initialize game
    function initGame() {
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.game-over-modal, .reward-modal');
        existingModals.forEach(modal => modal.remove());
        
        // Reset game state
        isGameOver = false;
        score = 0;
        enemies = [];
        
        // Start game loop
        gameLoop();
    }

    // Start the game
    initGame();
});
