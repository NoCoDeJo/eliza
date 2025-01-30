import { Action, IAgentRuntime, Memory, HandlerCallback, Handler } from '@elizaos/core';
import { TradingProvider } from '../providers/TradingProvider';
import { TradeResult } from '../types';

export const profitTradingAction: Action = {
    name: 'profit_trading',
    description: 'Execute profitable trades based on market opportunities',
    similes: ['trade', 'execute trades', 'profit trade'],
    examples: [
        [{
            user: 'trader',
            content: {
                text: 'Start profit trading with SOL',
                action: 'profit_trading'
            }
        }],
        [{
            user: 'trader',
            content: {
                text: 'Begin profit trading with USDC',
                action: 'profit_trading'
            }
        }]
    ],
    handler: async (runtime: IAgentRuntime, message: Memory, state: any, _options: any, callback?: HandlerCallback): Promise<void> => {
        if (!callback) {
            throw new Error('Callback is required');
        }

        try {
            // Get trading provider
            const provider = runtime.providers.find(
                p => p instanceof TradingProvider
            ) as TradingProvider | undefined;

            if (!provider) {
                callback({
                    text: 'Trading provider not available',
                    action: 'error'
                });
                return;
            }

            // Check if trading is enabled
            const tradingEnabled = await provider.isTradingEnabled();
            if (!tradingEnabled) {
                callback({
                    text: 'Trading is currently disabled',
                    action: 'error'
                });
                return;
            }

            // Get opportunities
            const opportunities = await provider.scanOpportunities();
            if (opportunities.length === 0) {
                callback({
                    text: 'No profitable trading opportunities found',
                    action: 'info'
                });
                return;
            }

            // Execute trades
            const results = await Promise.all(
                opportunities.map(opp => provider.executeTrade(opp))
            );

            const successfulTrades = results.filter((r: { success: boolean }) => r.success);
            if (successfulTrades.length === 0) {
                callback({
                    text: 'No trades were successfully executed',
                    action: 'warning'
                });
                return;
            }

            // Format trade summary
            const summary = successfulTrades.map((trade: TradeResult) => `
                Pair: ${trade.pair || 'Unknown'}
                Type: ${trade.type || 'Unknown'}
                Amount: ${trade.amount || 0}
                Price: ${trade.price || 0}
                Profit: ${trade.profit || 0}
                TX: ${trade.txHash || 'Pending'}
            `).join('\n');

            callback({
                text: `Successfully executed ${successfulTrades.length} trades:\n${summary}`,
                action: 'success'
            });

        } catch (err) {
            const error = err as Error;
            callback({
                text: `Error executing trades: ${error.message}`,
                action: 'error'
            });
        }
    },
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text.toLowerCase();
        return text.includes('trade') || 
               text.includes('profit') || 
               text.includes('execute trades');
    }
};
