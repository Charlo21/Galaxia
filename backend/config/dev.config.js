const devConfig = {
  // Server Configuration
  port: process.env.PORT || 3000,
  env: 'development',

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/galaxia_dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: '1d',
  },

  // TON Network Configuration
  ton: {
    endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TON_API_KEY,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Security
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },

  // Logging
  logging: {
    level: 'debug',
    format: 'dev',
  },
};

module.exports = devConfig;
