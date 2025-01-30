import { Action, IAgentRuntime, Memory } from '@elizaos/core';
import { WhaleTrackingProvider } from '../providers/WhaleTrackingProvider';

export const whaleTrackingAction: Action = {
    name: 'TRACK_WHALES',
    description: 'Track whale movements for specified tokens',
    similes: ['MONITOR_WHALES', 'WATCH_LARGE_HOLDERS'],
    examples: [
        [
            {
                user: 'user1',
                content: {
                    text: 'Track whale movements for SOL',
                    action: 'TRACK_WHALES'
                }
            }
        ],
        [
            {
                user: 'user1',
                content: {
                    text: 'Monitor large holders of USDC',
                    action: 'TRACK_WHALES'
                }
            }
        ]
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const rpcUrl = runtime.getSetting('SOLANA_RPC_URL');
        if (!rpcUrl) return false;
        
        const provider = new WhaleTrackingProvider(rpcUrl);
        return true; // Basic validation, can be enhanced
    },
    handler: async (runtime: IAgentRuntime, message: Memory) => {
        const rpcUrl = runtime.getSetting('SOLANA_RPC_URL');
        if (!rpcUrl) {
            return {
                text: 'Error: SOLANA_RPC_URL not configured'
            };
        }
        
        const provider = new WhaleTrackingProvider(rpcUrl);
        const result = await provider.get(runtime, message);
        
        return {
            text: `Found ${result.movements.length} whale movements:\n\n` +
                  result.movements.map(m => 
                    `${m.type.toUpperCase()}: ${m.amount} ${m.token} at ${m.address}`
                  ).join('\n')
        };
    }
};
