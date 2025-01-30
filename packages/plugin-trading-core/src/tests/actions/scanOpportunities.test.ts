import { IAgentRuntime, Memory, State } from '@elizaos/core';
import { scanOpportunitiesAction } from '../../actions/scanOpportunities';
import { OpportunityProvider } from '../../providers/OpportunityProvider';
import { Opportunity } from '../../types';

jest.mock('../../providers/OpportunityProvider');

describe('scanOpportunitiesAction', () => {
    let mockRuntime: IAgentRuntime;
    let mockCallback: jest.Mock;

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

        mockCallback = jest.fn();

        (OpportunityProvider as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue([
                {
                    id: '1',
                    type: 'whale_movement',
                    token: 'SOL',
                    expectedProfit: 0.05,
                    confidence: 0.8,
                    timestamp: Date.now()
                }
            ])
        }));
    });

    it('should scan for opportunities and report results', async () => {
        const message: Memory = {
            content: { text: 'Scan for SOL opportunities' }
        } as Memory;

        const mockState: State = {
            bio: '',
            lore: '',
            messageDirections: '',
            postDirections: '',
            messageExamples: [],
            postExamples: [],
            goals: '',
            memory: {},
            roomId: '12345678-1234-1234-1234-123456789012',
            actors: '',
            recentMessages: '',
            recentMessagesData: []
        };

        await scanOpportunitiesAction.handler(
            mockRuntime,
            message,
            mockState,
            {},
            mockCallback
        );

        expect(mockCallback).toHaveBeenCalled();
        const callbackArgs = mockCallback.mock.calls[0][0];
        expect(callbackArgs.text).toContain('Found trading opportunities');
    });

    it('should handle errors gracefully', async () => {
        (OpportunityProvider as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockRejectedValue(new Error('API Error'))
        }));

        const message: Memory = {
            content: { text: 'Scan for SOL opportunities' }
        } as Memory;

        const mockState: State = {
            bio: '',
            lore: '',
            messageDirections: '',
            postDirections: '',
            messageExamples: [],
            postExamples: [],
            goals: '',
            memory: {},
            roomId: '12345678-1234-1234-1234-123456789012',
            actors: '',
            recentMessages: '',
            recentMessagesData: []
        };

        await scanOpportunitiesAction.handler(
            mockRuntime,
            message,
            mockState,
            {},
            mockCallback
        );

        expect(mockCallback).toHaveBeenCalled();
        const callbackArgs = mockCallback.mock.calls[0][0];
        expect(callbackArgs.text).toContain('No opportunities found');
    });
});
