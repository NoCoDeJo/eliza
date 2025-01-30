import { config } from 'dotenv';
import path from 'path';
import { Connection, PublicKey } from '@solana/web3.js';

declare global {
    namespace NodeJS {
        interface Global {
            TEST_CONSTANTS: typeof TEST_CONSTANTS;
        }
    }
}

// Load test environment variables
config({ path: path.join(__dirname, '../../.env.test') });

// Mock WebSocket to prevent actual connections in tests
jest.mock('ws', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
    }));
});

// Mock API clients
jest.mock('@jup-ag/core', () => ({
    Jupiter: {
        load: jest.fn().mockResolvedValue({
            exchange: jest.fn().mockResolvedValue({
                routePlan: [],
                executionPrice: 1.0,
            }),
            quote: jest.fn().mockResolvedValue({
                bestRoute: {
                    inAmount: 1000000000,
                    outAmount: 1000000000,
                    priceImpactPct: 0.1,
                },
            }),
        }),
    },
}));

// Set up global test constants
const TEST_CONSTANTS = {
    SOLANA_RPC_URL: 'https://api.devnet.solana.com',
    TEST_WALLET: {
        publicKey: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
        privateKey: '2853485dcd9d81029c2f03c6a6c17bd2a9489db2bae6b4ce889774ad1e37ad34'
    },
    TEST_TOKENS: {
        SOL: {
            address: 'So11111111111111111111111111111111111111112',
            decimals: 9
        },
        USDC: {
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            decimals: 6
        }
    }
};

(global as any).TEST_CONSTANTS = TEST_CONSTANTS;
