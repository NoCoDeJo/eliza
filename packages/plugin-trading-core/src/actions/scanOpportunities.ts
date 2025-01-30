import { Action, IAgentRuntime, Memory, State, Handler } from '@elizaos/core';
import { OpportunityProvider } from '../providers/OpportunityProvider';

export const scanOpportunitiesAction: Action = {
    name: 'SCAN_OPPORTUNITIES',
    description: 'Scan for trading opportunities',
    similes: ['analyze market', 'find trades', 'check opportunities'],
    examples: [
        [
            {
                user: 'trader',
                content: {
                    text: 'Find trading opportunities for SOL',
                    action: 'SCAN_OPPORTUNITIES'
                }
            }
        ]
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    handler: (async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State | undefined,
        context: any,
        callback: (response: any) => void
    ) => {
        try {
            const provider = new OpportunityProvider(runtime);
            const opportunities = await provider.get(runtime, message);

            if (opportunities.length === 0) {
                callback({
                    text: 'No opportunities found at this time. Try again later.'
                });
                return;
            }

            const opportunityDescriptions = opportunities.map(opp => {
                return `
                Type: ${opp.type}
                Token: ${opp.token}
                Expected Profit: ${(opp.expectedProfit * 100).toFixed(2)}%
                Confidence: ${(opp.confidence * 100).toFixed(2)}%
                Timestamp: ${new Date(opp.timestamp).toLocaleString()}
                `;
            });

            callback({
                text: `Found trading opportunities:\n${opportunityDescriptions.join('\n')}`
            });
        } catch (error) {
            console.error('Error scanning for opportunities:', error);
            callback({
                text: 'No opportunities found at this time. Try again later.'
            });
        }
    }) as Handler
};
