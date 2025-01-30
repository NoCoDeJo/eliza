jest.mock('@elizaos/plugin-whale-tracking');

import { IAgentRuntime, Memory } from '@elizaos/core';
import { OpportunityProvider } from '../../providers/OpportunityProvider';
import { Opportunity } from '../../types';
import { WhaleTrackingProvider } from '@elizaos/plugin-whale-tracking';

describe('OpportunityProvider', () => {
    let provider: OpportunityProvider;
    let mockRuntime: IAgentRuntime;
    let mockWhaleTrackingGet: jest.Mock;

    beforeEach(() => {
        mockRuntime = {
            getSetting: jest.fn().mockReturnValue('mock-rpc-url'),
            getMemory: jest.fn(),
            setMemory: jest.fn(),
            databaseAdapter: {
                getGoals: jest.fn(),
                setGoals: jest.fn()
            }
        } as unknown as IAgentRuntime;

        // Reset all mocks
        jest.clearAllMocks();

        // Create a new mock for the get method
        mockWhaleTrackingGet = jest.fn().mockResolvedValue({
            movements: [
                {
                    type: 'buy',
                    amount: 1000,
                    token: 'SOL',
                    address: 'mock-address'
                }
            ]
        });

        // Mock the WhaleTrackingProvider implementation
        (WhaleTrackingProvider as jest.Mock).mockImplementation(() => ({
            get: mockWhaleTrackingGet
        }));

        provider = new OpportunityProvider(mockRuntime);
    });

    describe('get', () => {
        it('should return opportunities for a given token', async () => {
            const opportunities = await provider.get(mockRuntime, {
                content: { text: 'Check SOL opportunities' }
            } as Memory);

            expect(opportunities).toHaveLength(1);
            expect(opportunities[0].token).toBe('SOL');
            expect(opportunities[0].type).toBe('whale_movement');
        });

        it('should handle errors gracefully', async () => {
            // Mock error case
            mockWhaleTrackingGet.mockRejectedValueOnce(new Error('API Error'));

            const opportunities = await provider.get(mockRuntime, {
                content: { text: 'Check SOL opportunities' }
            } as Memory);

            expect(opportunities).toHaveLength(0);
        });

        it('should filter out low confidence opportunities', async () => {
            // Mock low amount movement
            mockWhaleTrackingGet.mockResolvedValueOnce({
                movements: [
                    {
                        type: 'buy',
                        amount: 100, // Small amount
                        token: 'SOL',
                        address: 'mock-address'
                    }
                ]
            });

            const opportunities = await provider.get(mockRuntime, {
                content: { text: 'Check SOL opportunities' }
            } as Memory);

            expect(opportunities).toHaveLength(0);
        });
    });

    describe('error handling', () => {
        it('should throw error if runtime is not provided', () => {
            expect(() => {
                new OpportunityProvider(undefined as unknown as IAgentRuntime);
            }).toThrow();
        });
    });
});
