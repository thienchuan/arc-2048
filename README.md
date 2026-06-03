
# 2048 Game

Welcome to the 2048 Game project! This is a web-based implementation of the popular 2048 puzzle game, created using React and styled with Tailwind CSS. The game features a sleek dark mode interface, optimized for both desktop and mobile devices.



## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Game Rules](#game-rules)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)
- [License](#license)
<div id=""overview">

## Overview

2048 is a single-player sliding tile puzzle game. The objective of the game is to slide numbered tiles on a grid to combine them and create a tile with the number 2048.
</div>

<div id="features">
  
## Features

- Dark mode interface for a sleek and modern look
- Smooth animations for tile appearance and merging
- Keyboard and touch controls for an optimized gaming experience on both desktop and mobile
- Score tracking with best score saving in local storage
- Responsive design for seamless play on various devices
- Connect wallet and mint game-over result as ERC-721 NFT on Arc Testnet
- Unique gameId guard to prevent duplicate minting for the same match
</div>

## Arc NFT Integration

This project includes an ERC-721 contract and frontend integration to mint a 2048 game result NFT when the game ends.

### Arc network configuration

- Chain ID: `5042002`
- Gas token: `USDC`
- Primary HTTP RPC: `https://rpc.testnet.arc.network`
- Primary WebSocket RPC: `wss://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`

Source: Arc docs (`arc/references/rpc-endpoints`, `arc-chain`).

### NFT metadata model

The contract currently uses **on-chain base64 tokenURI** for local simplicity.

Each minted token includes:

- `playerAddress`
- `score`
- `durationSeconds`
- `gameId`
- `playedAt`
- ERC-721 standard fields: `name`, `description`, `image`, `attributes`

`attributes` includes at least: `Score`, `Duration`, `GameId`, `PlayedAt`.

## Local Setup (NFT)

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Configure values in `.env`:

- `VITE_ARC_RPC_URL`
- `VITE_ARC_EXPLORER_URL`
- `ARC_RPC_URL`
- `DEPLOYER_PRIVATE_KEY` (for deployment only)

4. Compile contract:

```bash
npm run contract:compile
```

5. Deploy contract to Arc testnet:

```bash
npm run contract:deploy:sepolia
```

### Deploy commands for all configured networks

Legacy script (kept for backward compatibility):

```bash
npm run contract:deploy:arc
```

Testnet:

```bash
npm run contract:deploy:arcTestnet
npm run contract:deploy:optimismSepolia
npm run contract:deploy:sepolia
npm run contract:deploy:arbitrumSepolia
npm run contract:deploy:baseSepolia
npm run contract:deploy:polygonAmoy
```

Mainnet:

```bash
npm run contract:deploy:arbitrum
npm run contract:deploy:base
npm run contract:deploy:polygon
npm run contract:deploy:optimism
```

Recommended environment variables for deployment RPC endpoints:

- `ARC_RPC_URL`
- `OPTIMISM_SEPOLIA_RPC_URL`
- `SEPOLIA_RPC_URL`
- `ARBITRUM_SEPOLIA_RPC_URL`
- `BASE_SEPOLIA_RPC_URL`
- `POLYGON_AMOY_RPC_URL`
- `ARBITRUM_RPC_URL`
- `BASE_RPC_URL`
- `POLYGON_RPC_URL`
- `OPTIMISM_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`

6. Put deployed address into `.env`:

```bash
VITE_2048_NFT_CONTRACT_ADDRESS=0x...
```

7. Start app:

```bash
npm run dev
```

## Testing

Run smart contract tests:

```bash
npm run test:contract
```

Run frontend mint flow test:

```bash
npm run test:ui
```

Optional combined run:

```bash
npm run test:all
```

## Mint and Verify Transaction

1. Play a game until **Game Over** (or win).
2. Click **Connect Wallet**.
3. Click **Mint Result NFT**.
4. Confirm transaction in wallet.
5. Wait for status to reach success.
6. Inspect `Tx Hash`, `Token ID`, and click **View transaction** (Arc explorer).

## Assumptions and Limits

- Current implementation targets **Arc testnet** only (chainId `5042002`).
- Metadata image uses a placeholder URL.
- Off-chain metadata (IPFS/server) is not enabled yet; current design keeps metadata fully on-chain for easy local testing.
- Wallet support is EVM wallets exposing `window.ethereum` (e.g., MetaMask).

<div id="demo">
  
## Demo

### Video Demo

https://github.com/pawantech12/2048-game-using-reactjs/assets/118673866/3c74a363-782e-421a-8b88-64a029b4593a

### Live Demo

 You can play the game online [here](https://2048-game-using-reactjs.vercel.app/)
 
</div>


<div id="installation">
  
## Installation

To set up the project locally, follow these steps:

1. Clone the repository:


```bash
  git clone https://github.com/pawantech12/2048-game-using-reactjs.git
  cd 2048-game-using-reactjs-master
```

2. Install the dependencies:

```bash
npm i or npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

</div>

<div id="usage">
  
## Usage
- Use the arrow keys on your keyboard to move the tiles.
- On mobile devices, swipe in the direction you want to move the tiles.
- Combine tiles with the same number to merge them and increase their value.
- The game ends when there are no possible moves left or when you create a tile with the number 2048.
</div>



<div id="gaame-rules">
  
## Game Rules
- The game is played on a 4x4 grid.
- Each turn, a new tile (2 or 4) randomly appears in an empty spot on the board.
- Slide tiles using the arrow keys (or swipe on mobile) to move all tiles in the chosen direction.
- When two tiles with the same number collide, they merge into one tile with the sum of their values.
- The goal is to create a tile with the number 2048, but you can continue playing to achieve higher scores.
</div>

<div id="contributing">
  
## Contributing

Contributions are welcome! To contribute to the project:

1. Fork the repository.
2. Create a new branch with a descriptive name:
```bash
git checkout -b feature/new-feature
```
3. Make your changes and commit them with clear messages:
```bash
git commit -m "Add new feature"
```
4. Push your branch to your fork:
```bash
git push origin feature/new-feature
```
5. Open a pull request detailing your changes.
</div>

<div id="acknowledgements">
  
## Acknowledgements

The original 2048 game was created by [Gabriele Cirulli](https://github.com/gabrielecirulli/2048). This project is a recreation using modern web technologies.
</div>

<div id="contact">
  
## Contact
If you have any questions or feedback, feel free to reach out to the project maintainer:

- Name: Pawan Kumavat
- Email: pawankumavat042@gmail.com
- GitHub: [pawantech12](https://github.com/pawantech12)

Enjoy playing the 2048 Game! 🚀
</div>

<div id="license">
  
## License

(Note: This project is free to use and does not contain any license.)
</div>
