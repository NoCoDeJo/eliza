import { Memory } from '@elizaos/core';

export interface PriceData {
    price: number;
    timestamp: number;
    confidence: number;
    volume: number;
    priceChange24h: number;
}

export interface LiquidityData {
    amount: number;
    timestamp: number;
}

export interface MarketSignal {
    type: 'buy' | 'sell';
    strength: number;
    confidence: number;
}

export interface TradeConfig {
    inputToken: string;  // SOL, USDC etc
    outputToken: string; // Token to swap to
    amount: number;      // Amount to swap
    slippage?: number;   // Optional slippage tolerance
}

export interface SwapResult {
    success: boolean;
    inputAmount: number;
    outputAmount: number;
    priceImpact: number;
    txHash?: string;
    timestamp: number;
    error?: string;
}

export interface TradeResult {
    success: boolean;
    profit?: number;
    txHash?: string;
    error?: string;
    pair?: string;
    type?: string;
    amount?: number;
    price?: number;
}

export interface TradeOpportunity {
    token: string;
    type: 'buy' | 'sell';
    expectedProfit: number;
    confidence: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface Opportunity {
    id: string;
    type: string;
    token: string;
    expectedProfit: number;
    confidence: number;
    timestamp: number;
    metadata?: Record<string, any>;
}
