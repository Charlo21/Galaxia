// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galaxia', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// User Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gameProgress: {
        level: { type: Number, default: 1 },
        score: { type: Number, default: 0 },
        rewards: { type: Number, default: 0 }
    },
    walletAddress: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({
            username,
            password, // Note: In production, hash this password
            email
        });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || user.password !== password) { // In production, use proper password comparison
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json({ 
            message: 'Login successful',
            user: {
                username: user.username,
                gameProgress: user.gameProgress
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/save-progress', async (req, res) => {
    try {
        const { username, level, score, rewards } = req.body;
        const user = await User.findOneAndUpdate(
            { username },
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
        
        res.json({ message: 'Progress saved successfully', gameProgress: user.gameProgress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/reward-balance/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ rewards: user.gameProgress.rewards });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));
app.use('/api/wallet', require('./routes/wallet'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});