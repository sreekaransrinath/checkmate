# Check Mate 🎯

A Chrome extension for real-time fact-checking of tweets using Perplexity Sonar.

## Features

- 🔍 One-click fact checking of tweets
- ⚡ Real-time analysis using Perplexity Sonar
- 🎯 Claim-by-claim verification
- 📋 Easy copy-paste of results
- 🌙 Dark mode support
- 🔒 Secure API key storage

## Quick Start

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/sreekaransrinath/checkmate.git
   cd checkmate
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development server:
   ```bash
   pnpm dev
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Building for Production

```bash
pnpm build
```

The built extension will be in the `dist` folder.

## Configuration

1. Get a Perplexity Sonar API key from [Perplexity](https://perplexity.ai)
2. Open the extension options (right-click extension icon > Options)
3. Enter your API key and save
4. Adjust the confidence threshold if desired

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run unit tests
- `pnpm e2e` - Run E2E tests
- `pnpm format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE)
