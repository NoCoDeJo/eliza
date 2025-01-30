import { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

export interface WhaleMovement {
    type: 'accumulation' | 'distribution';
    token: string;
    amount: number;
    address: string;
    timestamp: number;
}

export interface WhaleAnalysis {
    movements: WhaleMovement[];
}

export class WhaleTrackingProvider implements Provider {
    private connection: Connection;

    constructor(rpcUrl: string) {
        this.connection = new Connection(rpcUrl);
    }

    async get(runtime: IAgentRuntime, message: Memory, state?: State): Promise<WhaleAnalysis> {
        // Extract token from message content or use default
        const token = message.content?.text?.match(/\b(SOL|USDC|BTC)\b/)?.[0] || 'SOL';
        return this.trackWhales(token);
    }

    async trackWhales(token: string): Promise<WhaleAnalysis> {
        try {
            // Use Helius API for enhanced transaction data
            const response = await axios.get(
                `https://api.helius.xyz/v0/token/${token}/transfers?api-key=${process.env.HELIUS_API_KEY}&type=TRANSFER&limit=100`
            );

            const movements: WhaleMovement[] = [];

            for (const transfer of response.data) {
                // Consider transfers > $10k as whale movements
                const amount = transfer.amount * (transfer.price || 0);
                if (amount > 10000) {
                    movements.push({
                        type: transfer.sourceWallet ? 'distribution' : 'accumulation',
                        token,
                        amount: transfer.amount,
                        address: transfer.sourceWallet || transfer.destinationWallet,
                        timestamp: transfer.timestamp
                    });
                }
            }

            return { movements };
        } catch (error) {
            console.error('Error tracking whales:', error);
            throw error;
        }
    }

    async validateAddress(address: string): Promise<boolean> {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }
}
