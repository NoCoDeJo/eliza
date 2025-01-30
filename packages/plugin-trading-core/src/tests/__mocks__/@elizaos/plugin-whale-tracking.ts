export interface WhaleMovement {
    type: string;
    amount: number;
    token: string;
    address: string;
}

export interface WhaleTrackingData {
    movements: WhaleMovement[];
}

export class WhaleTrackingProvider {
    constructor() {}
    
    async get(): Promise<WhaleTrackingData> {
        return {
            movements: [
                {
                    type: 'buy',
                    amount: 1000,
                    token: 'SOL',
                    address: 'mock-address'
                }
            ]
        };
    }
}

export default WhaleTrackingProvider;
