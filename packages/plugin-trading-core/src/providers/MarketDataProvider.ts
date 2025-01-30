import { Provider, IAgentRuntime, Memory } from '@elizaos/core';
import { PriceData, LiquidityData, MarketSignal } from '../types';

export { PriceData, LiquidityData, MarketSignal } from '../types';

export class MarketDataProvider implements Provider {
    private prices: Map<string, PriceData>;
    private liquidity: Map<string, LiquidityData>;
    private signals: Map<string, MarketSignal[]>;
    private updateInterval: number;

    constructor() {
        this.prices = new Map();
        this.liquidity = new Map();
        this.signals = new Map();
        this.updateInterval = 60000; // 1 minute

        // Start data updates
        this.startUpdates();
    }

    private startUpdates(): void {
        setInterval(() => {
            this.updatePrices();
            this.updateLiquidity();
            this.updateSignals();
        }, this.updateInterval);
    }

    private async updatePrices(): Promise<void> {
        try {
            // Simulate getting price data
            const tokens = ['SOL', 'USDC', 'ETH', 'BTC'];
            for (const token of tokens) {
                this.prices.set(token, {
                    price: Math.random() * 1000,
                    timestamp: Date.now(),
                    volume: Math.random() * 1000000,
                    priceChange24h: (Math.random() - 0.5) * 10,
                    confidence: 0.95 // High confidence for simulated data
                });
            }
        } catch (error) {
            console.error('Error updating prices:', error);
        }
    }

    private async updateLiquidity(): Promise<void> {
        try {
            // Simulate getting liquidity data
            const tokens = ['SOL', 'USDC', 'ETH', 'BTC'];
            for (const token of tokens) {
                this.liquidity.set(token, {
                    amount: Math.random() * 1000000,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error updating liquidity:', error);
        }
    }

    private async updateSignals(): Promise<void> {
        try {
            // Simulate market signals
            const tokens = ['SOL', 'USDC', 'ETH', 'BTC'];
            for (const token of tokens) {
                const signals: MarketSignal[] = [
                    {
                        type: 'buy',
                        strength: Math.random(),
                        confidence: Math.random()
                    },
                    {
                        type: 'sell',
                        strength: Math.random(),
                        confidence: Math.random()
                    }
                ];
                this.signals.set(token, signals);
            }
        } catch (error) {
            console.error('Error updating signals:', error);
        }
    }

    async getPriceData(): Promise<Record<string, PriceData>> {
        return Object.fromEntries(this.prices);
    }

    async getLiquidityData(): Promise<Record<string, LiquidityData>> {
        return Object.fromEntries(this.liquidity);
    }

    async getMarketSignals(token: string): Promise<MarketSignal[]> {
        if (token === '*') {
            // Return all signals
            return Array.from(this.signals.values()).flat();
        }
        return this.signals.get(token) || [];
    }

    async get(runtime: IAgentRuntime, message: Memory): Promise<any> {
        try {
            const prices = await this.getPriceData();
            const liquidity = await this.getLiquidityData();
            const signals = await this.getMarketSignals('*');

            return {
                prices,
                liquidity,
                signals
            };
        } catch (error) {
            console.error('Error in MarketDataProvider get:', error);
            return null;
        }
    }
}
