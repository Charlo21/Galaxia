require('dotenv').config();

const config = {
    development: {
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/galaxia_dev'
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: '24h'
        },
        ton: {
            apiKey: process.env.TON_API_KEY,
            endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC'
        }
    },
    production: {
        mongodb: {
            uri: process.env.MONGODB_URI
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: '24h'
        },
        ton: {
            apiKey: process.env.TON_API_KEY,
            endpoint: process.env.TON_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC'
        }
    }
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];

if (!currentConfig.jwt.secret) {
    throw new Error('JWT_SECRET is required in environment variables');
}

module.exports = currentConfig;
