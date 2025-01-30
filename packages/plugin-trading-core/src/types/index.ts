import { PublicKey } from '@solana/web3.js';

export interface TradeConfig {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippage: number;
}

export interface SwapResult {
    inputAmount: number;
    outputAmount: number;
    priceImpact: number;
    txHash: string;
    timestamp: number;
}

export interface MarketData {
    price: number;
    volume24h: number;
    priceChange24h: number;
    liquidityUSD: number;
}

export interface TokenBalance {
    mint: string;
    amount: number;
    decimals: number;
}

export interface WhaleMovement {
    timestamp: number;
    fromAddress: string;
    toAddress: string;
    amount: number;
    token: string;
    type: 'accumulation' | 'distribution' | 'transfer';
    significance: number;
}

export interface TradingSignal {
    type: 'entry' | 'exit';
    confidence: number;
    reason: string;
    price: number;
    timestamp: number;
}

export interface PositionConfig {
    size: number;
    leverage?: number;
    stopLoss?: number;
    takeProfit?: number;
    trailingStop?: number;
}

export interface TradeStrategy {
    name: string;
    description: string;
    timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
    indicators: {
        name: string;
        params: Record<string, any>;
    }[];
    entryConditions: string[];
    exitConditions: string[];
    positionSizing: PositionConfig;
}

export interface PriceLevel {
    price: number;
    size: number;
    side: 'bid' | 'ask';
    exchange: string;
}

export interface OrderbookSnapshot {
    bids: PriceLevel[];
    asks: PriceLevel[];
    timestamp: number;
}

export interface LiquidityPool {
    address: string;
    token0: string;
    token1: string;
    reserve0: number;
    reserve1: number;
    fee: number;
}

export interface MEVProtectionConfig {
    enabled: boolean;
    useJito: boolean;
    maxPriorityFee: number;
    bundleExecutor?: string;
}

export interface TradeExecutionConfig {
    mevProtection: MEVProtectionConfig;
    maxRetries: number;
    timeoutMs: number;
    gasLimit?: number;
}

export interface DynamicAMMConfig {
    poolType: 'DLMM' | 'CONCENTRATED' | 'ALPHA';
    settings: {
        baseSpread: number;
        variableSpread: number;
        maxPrice: number;
        minPrice: number;
    };
    alphaVault?: {
        enabled: boolean;
        rebalanceThreshold: number;
        performanceFee: number;
    };
}

export interface SwapConfig {
    routeType: "MEV_AWARE" | "CROSS_EXCHANGE" | "FLASH_LOAN";
    settings: {
        slippageTolerance: number;
        maxHops: number;
        excludedPools: string[];
    };
    protection: {
        sandwichProtection: boolean;
        frontrunningProtection: boolean;
        mevProtection: boolean;
    };
}

export interface LendingConfig {
    protocol: "SOLEND" | "PORT" | "LULO";
    strategy: {
        leverageLevel: number;
        rebalanceThreshold: number;
        collateralFactor: number;
    };
    automation: {
        autoRepay: boolean;
        healthFactorTarget: number;
        emergencyUnwind: boolean;
    };
}

export interface PriceData {
    price: number;
    timestamp: number;
    volume: number;
    priceChange24h: number;
}

export interface LiquidityData {
    liquidity: number;
    timestamp: number;
    utilization: number;
    tvl: number;
}

export interface MarketSignal {
    type: 'price' | 'volume' | 'liquidity' | 'whale';
    timestamp: number;
    value: number;
    confidence: number;
}

export interface TradeOpportunity {
    tokenA: string;
    tokenB: string;
    expectedProfit: number;
    route: string[];
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
    expiresAt: number;
}

export interface TradeResult {
    success: boolean;
    pair: string;
    type: string;
    amount: number;
    price: number;
    profit: number;
    txHash?: string;
    error?: string;
}

export interface ProviderConfig {
    name: string;
    provider: any;
}
