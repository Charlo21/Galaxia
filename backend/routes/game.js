// routes/game.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = mongoose.model('User');

// Constants for game mechanics
const TAP_COOLDOWN = 1000; // 1 second cooldown between taps
const BASE_REWARD = 1; // Base reward per tap
const LEVEL_MULTIPLIER = 1.5; // Reward multiplier per level

// Helper function to calculate rewards
const calculateReward = (level) => {
    return Math.floor(BASE_REWARD * Math.pow(LEVEL_MULTIPLIER, level - 1));
};

// Protected routes - require authentication
router.use(auth);

// Record a tap and update rewards
router.post('/tap', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const lastTap = user.gameProgress.lastTapTime;

        // Check tap cooldown
        if (lastTap && (now - lastTap) < TAP_COOLDOWN) {
            return res.status(429).json({ 
                error: 'Tapping too fast',
                remainingCooldown: TAP_COOLDOWN - (now - lastTap)
            });
        }

        // Calculate reward based on level
        const reward = calculateReward(user.gameProgress.level);

        // Update user progress
        user.gameProgress.lastTapTime = now;
        user.gameProgress.totalTaps += 1;
        user.gameProgress.rewards += reward;
        user.gameProgress.score += reward;

        // Level up logic (every 100 taps)
        if (user.gameProgress.totalTaps % 100 === 0) {
            user.gameProgress.level += 1;
        }

        await user.save();

        res.json({
            message: 'Tap recorded',
            reward,
            gameProgress: user.gameProgress
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/save-progress', async (req, res) => {
    try {
        const { level, score, rewards } = req.body;
        const user = await User.findOneAndUpdate(
            { username: req.user.username },
            { 
                'gameProgress.level': level,
                'gameProgress.score': score,
                'gameProgress.rewards': rewards
            },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ 
            message: 'Progress saved successfully', 
            gameProgress: user.gameProgress 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/reward-balance', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ 
            rewards: user.gameProgress.rewards,
            gameProgress: user.gameProgress
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user stats and leaderboard position
router.get('/stats', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's rank
        const rank = await User.countDocuments({
            'gameProgress.score': { $gt: user.gameProgress.score }
        }) + 1;

        // Get top 10 players
        const leaderboard = await User.find({})
            .sort({ 'gameProgress.score': -1 })
            .limit(10)
            .select('username gameProgress.score gameProgress.level -_id');

        res.json({
            stats: {
                rank,
                totalTaps: user.gameProgress.totalTaps,
                level: user.gameProgress.level,
                score: user.gameProgress.score,
                rewards: user.gameProgress.rewards
            },
            leaderboard
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;