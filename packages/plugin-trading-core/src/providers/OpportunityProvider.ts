import { IAgentRuntime, Memory } from '@elizaos/core';
import { WhaleTrackingProvider } from '@elizaos/plugin-whale-tracking';
import { Opportunity } from '../types';

export class OpportunityProvider {
    private whaleTracking: WhaleTrackingProvider;
    private minConfidence: number = 0.6;

    constructor(runtime: IAgentRuntime) {
        if (!runtime) {
            throw new Error('Runtime is required');
        }

        this.whaleTracking = new WhaleTrackingProvider();
    }

    async get(runtime: IAgentRuntime, message: Memory): Promise<Opportunity[]> {
        try {
            const whaleData = await this.whaleTracking.get();

            // Extract token from message content
            const token = message.content?.text?.match(/\\b(SOL|USDC|BTC)\\b/)?.[0] || 'SOL';

            return whaleData.movements
                .filter(movement => movement.amount > 500) // Filter significant movements
                .map(movement => ({
                    id: `${movement.type}-${movement.token}-${movement.address}`,
                    type: 'whale_movement',
                    token: movement.token,
                    expectedProfit: movement.amount > 1000 ? 0.05 : 0.02,
                    confidence: movement.amount > 1000 ? 0.8 : 0.6,
                    timestamp: Date.now(),
                    metadata: {
                        whaleAddress: movement.address,
                        movementType: movement.type,
                        amount: movement.amount
                    }
                }))
                .filter(opp => opp.confidence >= this.minConfidence);
        } catch (error) {
            console.error('Error getting opportunities:', error);
            return [];
        }
    }
}
