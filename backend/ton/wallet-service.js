const { tonClient } = require('./config');
const { WalletContractV4 } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('@ton/crypto');

class WalletService {
    constructor() {
        this.client = tonClient;
    }

    // Generate a new wallet
    async createWallet() {
        try {
            // Generate new key pair
            const mnemonicWords = await this.client.generateMnemonic();
            const keyPair = await mnemonicToPrivateKey(mnemonicWords);
            
            // Create wallet contract
            const workchain = 0; // default workchain
            const wallet = WalletContractV4.create({ 
                workchain, 
                publicKey: keyPair.publicKey 
            });

            // Get wallet address
            const address = await wallet.getAddress();

            return {
                address: address.toString(),
                mnemonic: mnemonicWords,
                publicKey: keyPair.publicKey.toString('hex'),
            };
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    // Get wallet balance
    async getBalance(address) {
        try {
            const balance = await this.client.getBalance(address);
            return balance.toString();
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    // Send TON tokens
    async sendTokens(fromWallet, toAddress, amount, secretKey) {
        try {
            const seqno = await fromWallet.getSeqno();
            const transfer = await fromWallet.createTransfer({
                secretKey,
                toAddress,
                amount,
                seqno,
            });

            // Send the transfer to the network
            await this.client.sendTransaction(transfer);
            
            return {
                success: true,
                message: 'Transfer completed successfully'
            };
        } catch (error) {
            console.error('Error sending tokens:', error);
            throw error;
        }
    }

    // Convert game rewards to TON tokens
    async convertRewardsToTokens(rewards) {
        // Define conversion rate (example: 100 rewards = 1 TON)
        const CONVERSION_RATE = 100;
        return rewards / CONVERSION_RATE;
    }
}

module.exports = new WalletService();
