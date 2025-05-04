// Import character definitions and 3D renderer
import { characters } from './characters.js';
import { CharacterRenderer } from './renderer3d.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initializing...');

    // Initialize Web3
    let web3;
    let userAccount;
    
    // Make connectWallet available globally
    window.connectWallet = async function() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                web3 = new Web3(window.ethereum);
                
                // Update UI to show connected wallet
                const walletStatus = document.getElementById('wallet-status');
                const connectButton = document.getElementById('connect-wallet');
                
                if (walletStatus && connectButton) {
                    walletStatus.textContent = `Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
                    walletStatus.style.color = '#4CAF50';
                    connectButton.style.display = 'none';
                }
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', function (accounts) {
                    userAccount = accounts[0];
                    if (walletStatus) {
                        walletStatus.textContent = `Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
                    }
                });
                
                return true;
            } catch (error) {
                console.error('User denied account access');
                return false;
            }
        } else {
            alert('Please install MetaMask to use crypto features!');
            window.open('https://metamask.io/download.html', '_blank');
            return false;
        }
    };

    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let currentCharacter = "tibetanMastiff";
    let score = 0;
    let playerCoins = parseInt(localStorage.getItem('playerCoins')) || 0;
    let isGameOver = false;

    // Initialize 3D renderer
    console.log('Initializing renderer...');
    const renderer = new CharacterRenderer(canvas);

    // Load 3D models
    console.log('Loading models...');
    async function loadModels() {
        try {
            await Promise.all([
                renderer.loadModel('tibetanMastiff', 'assets/models/tibetan_mastiff.glb'),
                renderer.loadModel('sumatranTiger', 'assets/models/sumatran_tiger.glb'),
                renderer.loadModel('galaxyShip', 'assets/models/spaceship.glb')
            ]);
            
            console.log('Models loaded successfully');
            // Show initial character
            renderer.showCharacter(currentCharacter);
            
            // Check for daily reward only after models are loaded
            setTimeout(() => checkDailyReward(), 1000);
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    // Start loading models
    loadModels();

    const player = {
        async attack() {
            console.log('Attack initiated');
            const char = characters[currentCharacter];
            
            // Play sound effect
            const attackSound = new Audio(char.soundEffect);
            attackSound.play().catch(e => console.error('Error playing sound:', e));
            
            // Show attack text
            const text = document.createElement('div');
            text.textContent = `${char.name} ${char.specialAbility}!`;
            text.style.position = 'absolute';
            text.style.left = '50%';
            text.style.top = '70%';
            text.style.transform = 'translate(-50%, -50%)';
            text.style.color = char.color;
            text.style.fontSize = '24px';
            text.style.fontWeight = 'bold';
            text.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
            document.body.appendChild(text);
            
            try {
                // Perform attack animation
                await renderer.attack();
            } catch (error) {
                console.error('Attack animation error:', error);
            }
            
            // Remove text after animation
            setTimeout(() => {
                document.body.removeChild(text);
            }, 1000);
        },
        
        async specialAttack() {
            console.log('Special attack initiated');
            const char = characters[currentCharacter];
            
            // Play sound effect
            const attackSound = new Audio(char.soundEffect);
            attackSound.play().catch(e => console.error('Error playing sound:', e));
            
            // Show special attack text
            const text = document.createElement('div');
            text.textContent = `${char.name} ${char.specialAbility}!`;
            text.style.position = 'absolute';
            text.style.left = '50%';
            text.style.top = '70%';
            text.style.transform = 'translate(-50%, -50%)';
            text.style.color = char.color;
            text.style.fontSize = '32px';
            text.style.fontWeight = 'bold';
            text.style.textShadow = `0 0 10px ${char.color}, 0 0 20px ${char.color}`;
            document.body.appendChild(text);
            
            try {
                // Perform special attack animation
                await renderer.specialAttack();
            } catch (error) {
                console.error('Special attack animation error:', error);
            }
            
            // Remove text after animation
            setTimeout(() => {
                document.body.removeChild(text);
            }, 1500);
        }
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderer.resize();
    });

    // Switch Character
    const mastiffButton = document.getElementById("mastiffButton");
    const tigerButton = document.getElementById("tigerButton");
    const shipButton = document.getElementById("shipButton");

    if (mastiffButton && tigerButton && shipButton) {
        console.log('Character buttons found');
        
        mastiffButton.addEventListener("click", () => {
            console.log('Switching to Tibetan Mastiff');
            currentCharacter = "tibetanMastiff";
            renderer.showCharacter(currentCharacter);
        });

        tigerButton.addEventListener("click", () => {
            console.log('Switching to Sumatran Tiger');
            currentCharacter = "sumatranTiger";
            renderer.showCharacter(currentCharacter);
        });

        shipButton.addEventListener("click", () => {
            console.log('Switching to Galaxy Ship');
            currentCharacter = "galaxyShip";
            renderer.showCharacter(currentCharacter);
        });
    } else {
        console.error('Some character buttons not found!');
    }

    // Add double-click for special attacks
    canvas.addEventListener("dblclick", () => {
        console.log('Double-click detected');
        player.specialAttack();
    });

    // Add single click for normal attacks
    canvas.addEventListener("click", () => {
        console.log('Click detected');
        player.attack();
    });

    const enemies = [];
    function createEnemy() {
        let x = Math.random() * (canvas.width - 40);
        enemies.push({ x: x, y: 0, width: 40, height: 40, color: "#ff0000" });
    }

    function attackEnemies() {
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].y + enemies[i].height > canvas.height / 2) {
                // Check if enemy is within attack range
                enemies.splice(i, 1); // Remove enemy
                score += 10; // Increase score
                document.getElementById("score").textContent = score;
            }
        }
    }

    // Game loop
    function gameLoop() {
        if (isGameOver) return;
        
        // Clear canvas
        renderer.clear();
        
        // Update and Draw Enemies
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].y += 5; // Move enemies down
            renderer.drawEnemy(enemies[i]);
            
            // Check if an enemy reaches the player
            if (enemies[i].y + enemies[i].height > canvas.height) {
                gameOver();
            }
        }

        // Request next frame
        requestAnimationFrame(gameLoop);
    }

    // Start game loop
    gameLoop();

    // Start Game
    setInterval(createEnemy, 1000); // Create an enemy every second

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
        
        // If wallet is connected, send tokens
        if (userAccount && web3) {
            sendTokens(reward.tokens);
        }
    }

    async function sendTokens(amount) {
        if (!userAccount || !web3) return;
        
        // Contract address and ABI would go here
        const contractAddress = '0x...'; // Your token contract address
        const contract = new web3.eth.Contract(tokenABI, contractAddress);
        
        try {
            await contract.methods.transfer(userAccount, web3.utils.toWei(amount.toString(), 'ether'))
                .send({ from: userAccount });
            console.log(`${amount} tokens sent to ${userAccount}`);
        } catch (error) {
            console.error('Error sending tokens:', error);
        }
    }

    // Function to update player's coin count in the UI
    function updatePlayerCoins() {
        const coinDisplay = document.getElementById('coin-count');
        if (coinDisplay) {
            coinDisplay.innerText = playerCoins;
        }
    }

    // Variables for character attack power
    let dogAttackPower = 10;
    let catAttackPower = 15;
    let starfighterAttackPower = 20;

    function upgradeCharacter(character) {
        if (playerCoins >= 200) { // Cost of upgrade
            playerCoins -= 200;

            if (character === 'dog') {
                dogAttackPower += 5;
                alert('Dog attack power increased to ' + dogAttackPower);
            } else if (character === 'cat') {
                catAttackPower += 5;
                alert('Cat attack power increased to ' + catAttackPower);
            } else if (character === 'starfighter') {
                starfighterAttackPower += 10;
                alert('Starfighter attack power increased to ' + starfighterAttackPower);
            }

            updatePlayerCoins();
        } else {
            alert('Not enough coins to upgrade!');
        }
    }

    // Add buttons to trigger upgrades in the HTML

    // Store player scores in local storage
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    function updateLeaderboard(playerName, score) {
        leaderboard.push({ name: playerName, score: score });
        leaderboard.sort((a, b) => b.score - a.score); // Sort by highest score
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        displayLeaderboard();
    }

    function displayLeaderboard() {
        let leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML = '';
        leaderboard.forEach((player, index) => {
            leaderboardDiv.innerHTML += `<p>${index + 1}. ${player.name}: ${player.score}</p>`;
        });
    }

    // Time-limited challenge variables
    let challengeActive = false;
    let challengeTaps = 0;
    let challengeTarget = 100; // Number of taps required
    let challengeTimeLimit = 30 * 1000; // 30 seconds
    let challengeReward = 200; // Reward in coins

    function startChallenge() {
        if (!challengeActive) {
            challengeActive = true;
            challengeTaps = 0;
            alert("Challenge started! Tap 100 times in 30 seconds to win 200 coins.");
            
            setTimeout(() => {
                if (challengeTaps >= challengeTarget) {
                    alert("Congratulations! You've completed the challenge and won 200 coins!");
                    playerCoins += challengeReward;
                } else {
                    alert("Challenge failed! Better luck next time.");
                }
                challengeActive = false;
                updatePlayerCoins();
            }, challengeTimeLimit);
        }
    }

    // Call this function each time the player taps
    function onTap() {
        if (challengeActive) {
            challengeTaps++;
        }
        // Other tap-related mechanics...
    }

    // Marketplace items
    const marketplaceItems = [
        { name: 'Power Boost', cost: 300, effect: 'Increase attack power by 20%' },
        { name: 'Shield', cost: 500, effect: 'Reduce damage by 50%' },
        { name: 'New Skin', cost: 800, effect: 'Cosmetic change' }
    ];

    function buyItem(itemName) {
        const item = marketplaceItems.find(i => i.name === itemName);
        if (playerCoins >= item.cost) {
            playerCoins -= item.cost;
            alert(`You bought ${item.name} for ${item.cost} coins. Effect: ${item.effect}`);
            updatePlayerCoins();
            // Apply the effect to the game (e.g., increase power, change skin, etc.)
        } else {
            alert('Not enough coins to buy this item!');
        }
    }

    // Function to handle character taps and switching to the attack animation
    function attack(character) {
        let characterImg = document.getElementById(character);

        // Change the image source to the attack version (if available)
        characterImg.src = `assets/images/${character}-attack.png`;

        // Return to idle image after a short delay
        setTimeout(() => {
            characterImg.src = `assets/images/${character}.png`;
        }, 300); // Adjust the time for how long the attack animation lasts

        // Trigger the attack function for game mechanics
        if (character === 'dog') {
            // Handle dog attack
            // Add game mechanics here (damage, etc.)
        } else if (character === 'cat') {
            // Handle cat attack
        } else if (character === 'starfighter') {
            // Handle starfighter attack
        }
    }

    const dogImg = "assets/images/dog.png";  // Reference for the dog image

    // Select characters by their IDs
    const cat = document.getElementById('cat');
    const dog = document.getElementById('dog');
    const starfighter = document.getElementById('starfighter');

    // Function to handle attack
    function attack(character) {
        let sound;
        switch(character) {
            case 'cat':
                sound = new Audio('assets/sounds/cat-attack.mp3');
                break;
            case 'dog':
                sound = new Audio('assets/sounds/dog-attack.mp3');
                break;
            case 'starfighter':
                sound = new Audio('assets/sounds/starfighter-fire.mp3');
                break;
        }
        sound.play();

        // Change the image to an attack animation, then revert after a delay
        let characterImg = document.getElementById(character);
        characterImg.src = `assets/images/${character}-attack.png`;
        setTimeout(() => {
            characterImg.src = `assets/images/${character}.png`;
        }, 500); // Revert image after 500ms
    }

    // Event listeners for each character tap
    cat.addEventListener('click', () => attack('cat'));
    dog.addEventListener('click', () => attack('dog'));
    starfighter.addEventListener('click', () => attack('starfighter'));

    // Health values for each character
    let health = {
        cat: 100,
        dog: 100,
        starfighter: 100
    };

    // Update health bar function
    function updateHealth(character) {
        const healthBar = document.getElementById(`${character}-health`);
        health[character] -= 10; // Decrease health by 10 points per attack
        healthBar.style.width = health[character] + '%'; // Update health bar width

        if (health[character] <= 0) {
            characterDefeated(character);
        }
    }

    // Handle character defeat
    function characterDefeated(character) {
        alert(`${character.toUpperCase()} has been defeated!`);
        document.getElementById(character).style.display = 'none'; // Hide character
    }

    let attackDifficulty = 10; // Starts at 10 health points per attack

    // Increase difficulty every 30 seconds
    setInterval(() => {
        attackDifficulty += 5;
        console.log(`Difficulty increased! Attacks now deal ${attackDifficulty} damage.`);
    }, 30000); // Increase every 30 seconds

    // Modify the attack function to use difficulty scaling
    function attack(character) {
        let sound;
        // (sound logic remains the same)
        
        // Update health based on difficulty scaling
        health[character] -= attackDifficulty;
        updateHealth(character);
    }

    function attack(character) {
        const characterElement = document.getElementById(character);
        characterElement.classList.add('character-attacked');
        
        setTimeout(() => {
            characterElement.classList.remove('character-attacked');
        }, 300); // Animation duration
        
        // Continue with attack logic...
    }

    // Score is already declared at the top level
    function updateScore(points) {
        score += points;
        document.getElementById('score').innerText = `Score: ${score}`;
        
        if (score >= 1000) {
            unlockReward('Space Medal'); // Example reward
        }
    }

    function unlockReward(reward) {
        alert(`You unlocked: ${reward}!`);
    }

    function randomMoveStarfighter() {
        const starfighter = document.getElementById('starfighter');
        const randomX = Math.floor(Math.random() * 500) + 'px'; // Random x-axis position
        const randomY = Math.floor(Math.random() * 300) + 'px'; // Random y-axis position
        starfighter.style.transform = `translate(${randomX}, ${randomY})`;

        // Repeat movement after a delay
        setTimeout(randomMoveStarfighter, 2000); // Move every 2 seconds
    }

    // Start dynamic movement for starfighter
    randomMoveStarfighter();

    const attackSound = new Audio('assets/sounds/attack.mp3');
    const victorySound = new Audio('assets/sounds/victory.mp3');

    function playAttackSound() {
        attackSound.play();
    }

    function playVictorySound() {
        victorySound.play();
    }

    function attack(character) {
        playAttackSound(); // Play sound on attack
        
        // Continue attack logic...
    }

    function characterDefeated(character) {
        playVictorySound(); // Play sound on defeat
        
        alert(`${character.toUpperCase()} has been defeated!`);
        document.getElementById(character).style.display = 'none';
    }

    let powerUpActive = false;

    function activatePowerUp() {
        powerUpActive = true;
        attackDifficulty = 5; // Reduce attack damage temporarily
        setTimeout(() => {
            powerUpActive = false;
            attackDifficulty = 10; // Reset after power-up ends
        }, 10000); // Power-up lasts 10 seconds
    }

    setInterval(() => {
        if (score < 500) {
            attackDifficulty += 2; // Slower scaling at lower scores
        } else if (score < 1000) {
            attackDifficulty += 3; // Moderate scaling
        } else {
            attackDifficulty += 5; // Faster scaling at higher scores
        }
        console.log(`Difficulty increased to ${attackDifficulty}`);
    }, 30000); // Scale every 30 seconds

    const achievements = {
        firstVictory: { name: 'First Victory', reward: 100, unlocked: false },
        tenKills: { name: 'Monster Hunter', reward: 250, unlocked: false },
        survivalMaster: { name: 'Survival Master', reward: 500, unlocked: false }
    };

    function checkAchievements(score, kills) {
        if (!achievements.firstVictory.unlocked && score > 0) {
            unlockAchievement('firstVictory');
        }
        if (!achievements.tenKills.unlocked && kills >= 10) {
            unlockAchievement('tenKills');
        }
        // ... etc
    }

    // Add character progression
    const characterProgression = {
        dog: { level: 1, exp: 0, nextLevel: 100 },
        cat: { level: 1, exp: 0, nextLevel: 100 },
        starfighter: { level: 1, exp: 0, nextLevel: 100 }
    };

    function gainExperience(character, amount) {
        const char = characterProgression[character];
        char.exp += amount;
        
        if (char.exp >= char.nextLevel) {
            char.level++;
            char.exp -= char.nextLevel;
            char.nextLevel *= 1.5;
            // Reward for leveling up
            playerCoins += char.level * 50;
            alert(`${character} reached level ${char.level}!`);
        }
    }

    function gameOver() {
        if (isGameOver) return; // Prevent multiple calls
        
        isGameOver = true;
        
        const modal = document.createElement('div');
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
            border: 2px solid #FF4444;
        `;
        
        modal.innerHTML = `
            <h2 style="color: #FF4444;">Game Over!</h2>
            <p>Final Score: ${score}</p>
            <button onclick="location.reload()" style="
                background: #4169E1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Play Again</button>
        `;
        
        document.body.appendChild(modal);
    }
});
