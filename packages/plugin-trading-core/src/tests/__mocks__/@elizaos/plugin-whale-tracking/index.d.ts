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
    constructor();
    get(): Promise<WhaleTrackingData>;
}
