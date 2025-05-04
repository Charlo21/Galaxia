const { TonClient } = require('@ton/ton');

// TON Network configuration (testnet for development)
const TON_ENDPOINT = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const TON_API_KEY = process.env.TON_API_KEY || 'your_api_key_here'; // You'll need to get this from https://toncenter.com/

// Initialize TON Client
const tonClient = new TonClient({
    endpoint: TON_ENDPOINT,
    apiKey: TON_API_KEY,
});

module.exports = {
    tonClient,
    TON_ENDPOINT,
};
