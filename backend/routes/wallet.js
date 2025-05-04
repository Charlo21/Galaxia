const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const walletService = require('../ton/wallet-service');
const User = require('mongoose').model('User');

// Protect all wallet routes
router.use(auth);

// Create a new wallet for user
router.post('/create', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.walletAddress) {
            return res.status(400).json({ error: 'User already has a wallet' });
        }

        const wallet = await walletService.createWallet();
        
        // Save wallet address to user profile
        user.walletAddress = wallet.address;
        await user.save();

        res.json({
            message: 'Wallet created successfully',
            address: wallet.address,
            // Note: In production, handle mnemonic securely
            mnemonic: wallet.mnemonic 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get wallet balance
router.get('/balance', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        
        if (!user || !user.walletAddress) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const balance = await walletService.getBalance(user.walletAddress);
        
        res.json({
            address: user.walletAddress,
            balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Convert rewards to TON tokens
router.post('/convert-rewards', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.walletAddress) {
            return res.status(400).json({ error: 'User has no wallet' });
        }

        const { amount } = req.body;
        
        if (amount > user.gameProgress.rewards) {
            return res.status(400).json({ error: 'Insufficient rewards' });
        }

        // Convert rewards to tokens
        const tokenAmount = await walletService.convertRewardsToTokens(amount);

        // Deduct rewards from user's balance
        user.gameProgress.rewards -= amount;
        await user.save();

        // In a production environment, you would initiate the actual token transfer here
        // For now, we'll just return the conversion result
        res.json({
            message: 'Rewards converted successfully',
            convertedAmount: tokenAmount,
            remainingRewards: user.gameProgress.rewards
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
