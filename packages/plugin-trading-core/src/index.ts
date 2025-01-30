import { Plugin } from '@elizaos/core';
import { profitTradingAction } from './actions/profitTrading';
import { scanOpportunitiesAction } from './actions/scanOpportunities';
import { TradingProvider } from './providers/TradingProvider';
import { MarketDataProvider } from './providers/MarketDataProvider';

export class TradingPlugin implements Plugin {
    name = 'trading';
    description = 'Trading functionality for ElizaOS';
    version = '1.0.0';

    initialize(runtime: any) {
        // Initialize providers
        const marketData = new MarketDataProvider();
        const trading = new TradingProvider(runtime, marketData);

        // Register providers
        runtime.registerProvider(marketData);
        runtime.registerProvider(trading);

        // Register actions
        runtime.registerAction(profitTradingAction);
        runtime.registerAction(scanOpportunitiesAction);
    }
}
