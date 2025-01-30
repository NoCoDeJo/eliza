import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface BirdeyeConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class BirdeyeService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: BirdeyeConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.BIRDEYE_API_URL || 'https://public-api.birdeye.so';
    this.apiKey = config.apiKey || process.env.BIRDEYE_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('Birdeye API key is required. Please set BIRDEYE_API_KEY in your environment variables.');
    }

    // Configure axios retry
    axiosRetry(axios, { 
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      }
    });
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-API-KEY': this.apiKey
        },
        params
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Birdeye API key');
        }
        if (error.response?.status === 429) {
          throw new Error('Birdeye API rate limit exceeded');
        }
      }
      throw error;
    }
  }

  // Token Price
  async getTokenPrice(tokenAddress: string) {
    return this.request(`/public/price`, {
      address: tokenAddress
    });
  }

  // Token Info
  async getTokenInfo(tokenAddress: string) {
    return this.request(`/public/token`, {
      address: tokenAddress
    });
  }

  // OHLCV Data
  async getOHLCV(tokenAddress: string, resolution: string = '1D') {
    return this.request(`/public/candles`, {
      address: tokenAddress,
      resolution
    });
  }

  // Market List
  async getMarketList(tokenAddress: string) {
    return this.request(`/public/market_list`, {
      address: tokenAddress
    });
  }
}
