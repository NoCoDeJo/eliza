# @elizaos/plugin-trading-core

A comprehensive trading plugin for ElizaOS that enables profitable trading on Solana (with cross-chain capabilities coming soon).

## Features

- **Automated Trading**: Implements trading strategies with proper risk management
- **Market Analysis**: Real-time market data analysis and opportunity detection
- **MEV Protection**: Built-in MEV protection using Jito bundles
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Provider Integration**: Seamless integration with ElizaOS provider system
- **Error Handling**: Robust error handling and logging throughout

## Prerequisites

1. Node.js >= 16.0.0
2. ElizaOS Core >= 1.0.0
3. Solana CLI (optional, for local development)

## Installation

1. Install the plugin:
```bash
npm install @elizaos/plugin-trading-core
```

2. Configure environment variables in your `.env` file:
```env
# Required
SOLANA_RPC_URL=your_rpc_url

# Optional (for enhanced features)
JITO_RPC_URL=your_jito_url
```

## Usage

1. Import and register the plugin with ElizaOS:

```typescript
import { TradingCorePlugin } from '@elizaos/plugin-trading-core';

// In your ElizaOS configuration
const tradingPlugin = new TradingCorePlugin(runtime);
await tradingPlugin.initialize();
```

2. Access trading functionality through providers:

```typescript
// Get trading provider
const tradingProvider = runtime.providers.find(
  p => p instanceof TradingProvider
) as TradingProvider;

// Execute a trade
const tradeConfig = {
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: 1.0,
  slippage: 0.5
};

const result = await tradingProvider.executeTrade(tradeConfig);
```

3. Monitor trading opportunities:

```typescript
// Get opportunity provider
const opportunityProvider = runtime.providers.find(
  p => p instanceof OpportunityProvider
) as OpportunityProvider;

// Find opportunities
const opportunities = await opportunityProvider.findOpportunities();
```

## Available Providers

### TradingProvider
- Execute trades with MEV protection
- Check token balances
- Extract trading parameters from messages
- Analyze market sentiment

### OpportunityProvider
- Monitor trading opportunities
- Track whale movements
- Analyze market conditions
- Find profitable trading routes

## Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
