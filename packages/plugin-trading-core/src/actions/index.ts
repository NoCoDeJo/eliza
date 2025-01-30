import { Action } from '@elizaos/core';
import { profitTradingAction } from './profitTrading';
import { scanOpportunitiesAction } from './scanOpportunities';

export const actions: Action[] = [
    profitTradingAction,
    scanOpportunitiesAction
];
