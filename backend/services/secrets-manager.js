const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SecretsManager {
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY;
        this.algorithm = 'aes-256-gcm';
        this.secretsCache = new Map();
        this.cacheTimeout = 1000 * 60 * 60; // 1 hour
    }

    // Generate a secure encryption key
    static generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Encrypt a value
    async encrypt(value) {
        const iv = crypto.randomBytes(16);
        const salt = crypto.randomBytes(64);
        const key = crypto.pbkdf2Sync(this.encryptionKey, salt, 100000, 32, 'sha512');
        
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            salt: salt.toString('hex')
        };
    }

    // Decrypt a value
    async decrypt(encryptedData) {
        const { encrypted, iv, authTag, salt } = encryptedData;
        
        const key = crypto.pbkdf2Sync(
            this.encryptionKey,
            Buffer.from(salt, 'hex'),
            100000,
            32,
            'sha512'
        );
        
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            key,
            Buffer.from(iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    // Store a secret
    async setSecret(key, value) {
        const encrypted = await this.encrypt(value);
        this.secretsCache.set(key, {
            value: encrypted,
            timestamp: Date.now()
        });
        return encrypted;
    }

    // Retrieve a secret
    async getSecret(key) {
        const cached = this.secretsCache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return await this.decrypt(cached.value);
        }
        
        // If not in cache or expired, return null
        return null;
    }

    // Clear expired cache entries
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.secretsCache.entries()) {
            if (now - value.timestamp >= this.cacheTimeout) {
                this.secretsCache.delete(key);
            }
        }
    }

    // Rotate encryption key
    async rotateEncryptionKey(newKey) {
        const oldKey = this.encryptionKey;
        this.encryptionKey = newKey;
        
        // Re-encrypt all cached secrets with new key
        for (const [key, value] of this.secretsCache.entries()) {
            const decrypted = await this.decrypt(value.value);
            await this.setSecret(key, decrypted);
        }
        
        return true;
    }
}

module.exports = new SecretsManager();
