import { Provider, IAgentRuntime, Memory } from '@elizaos/core';
import axios from 'axios';
import { Connection } from '@solana/web3.js';
import {
    TradeConfig,
    SwapResult,
    TradeOpportunity,
    TradeResult
} from '../types';

export class TradingProvider implements Provider {
    private connection: Connection;
    private marketData: any;
    private minProfitThreshold: number;
    private minConfidence: number;
    private tradingEnabled: boolean;
    private accountBalance: number;

    constructor(runtime: IAgentRuntime, marketData: any) {
        // Validate environment variables first
        const requiredEnvVars = {
            SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
            BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY,
            HELIUS_API_KEY: process.env.HELIUS_API_KEY,
            JUPITER_API_URL: process.env.JUPITER_API_URL
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        // Log environment status
        console.log('Environment validation:', {
            SOLANA_RPC_URL: `${process.env.SOLANA_RPC_URL?.substring(0, 10)}...`,
            BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY ? '✓ Present' : '✗ Missing',
            HELIUS_API_KEY: process.env.HELIUS_API_KEY ? '✓ Present' : '✗ Missing',
            JUPITER_API_URL: process.env.JUPITER_API_URL ? '✓ Present' : '✗ Missing'
        });

        // Initialize connection only after validation
        if (!process.env.SOLANA_RPC_URL) {
            throw new Error('SOLANA_RPC_URL is required');
        }
        this.connection = new Connection(process.env.SOLANA_RPC_URL);
        this.marketData = marketData;
        this.minProfitThreshold = 0.001;
        this.minConfidence = 0.7;
        this.tradingEnabled = true;
        this.accountBalance = 1000;
    }

    async get(runtime: IAgentRuntime, message: Memory): Promise<any> {
        try {
            const opportunities = await this.scanOpportunities();
            return {
                tradingEnabled: this.tradingEnabled,
                accountBalance: this.accountBalance,
                opportunities,
                status: 'ready',
                lastUpdate: Date.now()
            };
        } catch (error) {
            console.error('Error in TradingProvider get:', error);
            return null;
        }
    }

    async isTradingEnabled(): Promise<boolean> {
        return this.tradingEnabled;
    }

    async getAccountBalance(): Promise<number> {
        return this.accountBalance;
    }

    async scanOpportunities(): Promise<TradeOpportunity[]> {
        try {
            const opportunities: TradeOpportunity[] = [];
            const prices = await this.marketData.getPriceData();
            const liquidity = await this.marketData.getLiquidityData();
            const signals = await this.marketData.getMarketSignals('*');

            // Mock opportunity generation
            for (const [tokenA, priceA] of Object.entries(prices)) {
                for (const [tokenB, priceB] of Object.entries(prices)) {
                    if (tokenA === tokenB) continue;

                    const expectedProfit = Math.random() * 0.05; // 0-5%
                    const confidence = Math.random();

                    if (expectedProfit >= this.minProfitThreshold && confidence >= this.minConfidence) {
                        opportunities.push({
                            token: tokenA, // Use tokenA as the primary token
                            type: 'buy', // Add type field
                            expectedProfit,
                            confidence,
                            timestamp: Date.now() // Add timestamp field
                        });
                    }
                }
            }

            return opportunities;

        } catch (error) {
            console.error('Error scanning opportunities:', error);
            return [];
        }
    }

    private calculateRiskLevel(profit: number, confidence: number): 'low' | 'medium' | 'high' {
        if (confidence > 0.9 && profit < 0.02) return 'low';
        if (confidence > 0.8 && profit < 0.04) return 'medium';
        return 'high';
    }

    async executeTrade(opportunity: TradeOpportunity): Promise<TradeResult> {
        try {
            // Mock trade execution
            const success = Math.random() > 0.2; // 80% success rate

            if (!success) {
                return {
                    success: false,
                    error: 'Trade execution failed',
                    pair: '',
                    type: '',
                    amount: 0,
                    price: 0,
                    profit: 0,
                    txHash: ''
                };
            }

            const amount = Math.random() * 100;
            const price = Math.random() * 1000;
            const actualProfit = opportunity.expectedProfit * (0.8 + Math.random() * 0.4); // 80-120% of expected

            return {
                success: true,
                pair: `${opportunity.token}/${opportunity.token}`,
                type: 'MARKET',
                amount,
                price,
                profit: actualProfit,
                txHash: `0x${Math.random().toString(16).substr(2)}`
            };

        } catch (err) {
            const error = err as Error;
            return {
                success: false,
                error: error.message,
                pair: '',
                type: '',
                amount: 0,
                price: 0,
                profit: 0,
                txHash: ''
            };
        }
    }

    async executeSwap(params: TradeConfig): Promise<SwapResult> {
        try {
            const quoteResponse = await axios.get(
                `${process.env.JUPITER_API_URL}/quote`, {
                    params: {
                        inputMint: params.inputToken,
                        outputMint: params.outputToken,
                        amount: params.amount,
                        slippageBps: params.slippage || 50
                    }
                }
            );

            // Execute swap using Jupiter API
            const swapResult = await axios.post(
                `${process.env.JUPITER_API_URL}/swap`,
                quoteResponse.data
            );

            return {
                success: true,
                inputAmount: params.amount,
                outputAmount: swapResult.data.outAmount,
                priceImpact: quoteResponse.data.priceImpactPct,
                txHash: swapResult.data.txid,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error executing swap:', error);
            throw error;
        }
    }

    private async fetchWithRetry<T>(
        fn: () => Promise<T>,
        retries = 3,
        delay = 1000
    ): Promise<T> {
        let lastError: any;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;
                const errorDetails = {
                    attempt: i + 1,
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    stack: error.stack?.split('\n').slice(0, 3),
                    config: error.config && {
                        url: error.config.url,
                        method: error.config.method,
                        timeout: error.config.timeout
                    }
                };

                console.error(`Retry attempt ${i + 1}/${retries} failed:`,
                    JSON.stringify(errorDetails, null, 2)
                );

                if (i === retries - 1) {
                    console.error('All retry attempts failed:', errorDetails);
                    throw new Error(`All ${retries} retry attempts failed: ${error.message}`);
                }

                const nextDelay = delay * Math.pow(2, i);
                console.log(`Waiting ${nextDelay}ms before next retry...`);
                await new Promise(resolve => setTimeout(resolve, nextDelay));
            }
        }
        throw lastError;
    }

    async fetchPrices(token: string): Promise<any> {
        return this.fetchWithRetry(() => this._fetchPrices(token));
    }

    async getPortfolio(address: string): Promise<any> {
        return this.fetchWithRetry(() => this._getPortfolio(address));
    }

    private async _fetchPrices(token: string): Promise<any> {
        if (!token) {
            const error = new Error('Token address is required');
            console.error('Token validation failed:', error);
            throw error;
        }

        if (!process.env.BIRDEYE_API_KEY) {
            const error = new Error('BIRDEYE_API_KEY not configured');
            console.error('Environment validation failed:', error);
            throw error;
        }

        try {
            console.log('Fetching price for token:', {
                token,
                apiKeyPresent: !!process.env.BIRDEYE_API_KEY,
                apiKeyPrefix: process.env.BIRDEYE_API_KEY?.substring(0, 5)
            });

            const url = `https://public-api.birdeye.so/public/price?address=${token}`;
            console.log('Making request to:', url);

            const response = await axios.get(url, {
                headers: {
                    'x-api-key': process.env.BIRDEYE_API_KEY,
                    'x-chain': 'solana'
                },
                timeout: 10000,
                validateStatus: (status) => status === 200 // Only treat 200 as success
            });

            if (!response.data) {
                throw new Error('Empty response from Birdeye API');
            }

            console.log('Birdeye API response:', {
                status: response.status,
                hasData: !!response.data,
                dataPreview: JSON.stringify(response.data).substring(0, 100)
            });

            return response.data;
        } catch (error: any) {
            // Enhanced error details
            const errorDetails = {
                name: error.name,
                message: error.message,
                token,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                stack: error.stack?.split('\n').slice(0, 3), // First 3 lines of stack
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: {
                        ...error.config?.headers,
                        'x-api-key': '[REDACTED]' // Don't log the actual key
                    },
                    timeout: error.config?.timeout
                }
            };

            console.error('Detailed error fetching prices from Birdeye:',
                JSON.stringify(errorDetails, null, 2)
            );

            // Throw a more informative error
            const enhancedError = new Error(
                `Failed to fetch price for token ${token}: ${error.message}`
            );
            (enhancedError as any).details = errorDetails;
            throw enhancedError;
        }
    }

    private async _getPortfolio(address: string): Promise<any> {
        try {
            if (!process.env.HELIUS_API_KEY) {
                throw new Error('HELIUS_API_KEY not configured');
            }

            const response = await axios.get(
                `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${process.env.HELIUS_API_KEY}`,
                { timeout: 10000 }
            );

            if (!response.data?.tokens) {
                throw new Error('Invalid response from Helius API');
            }

            const tokens = response.data.tokens;
            const enrichedTokens = await Promise.all(
                tokens.map(async (token: any) => {
                    try {
                        const priceData = await this.fetchPrices(token.mint);
                        return {
                            ...token,
                            priceUsd: priceData.data?.value || 0
                        };
                    } catch (err) {
                        console.error(`Error fetching price for token ${token.mint}:`, err);
                        return {
                            ...token,
                            priceUsd: 0
                        };
                    }
                })
            );

            return {
                nativeBalance: response.data.nativeBalance,
                tokens: enrichedTokens,
                totalValueUsd: enrichedTokens.reduce((acc: number, token: any) =>
                    acc + (token.priceUsd * token.amount), 0)
            };
        } catch (error: any) {
            console.error('Error fetching portfolio:', {
                error: error.message,
                address,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    private validateRequest(params: any) {
        if (!params || typeof params !== 'object') {
            throw new Error('Invalid request parameters');
        }

        if (!params.token && !params.address) {
            throw new Error('Either token or address is required');
        }

        // Validate environment variables are present
        const requiredVars = ['BIRDEYE_API_KEY', 'HELIUS_API_KEY', 'JUPITER_API_URL'];
        const missingVars = requiredVars.filter(key => !process.env[key]);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
    }
}
