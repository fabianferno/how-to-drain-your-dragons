# Dragon Battle Game

A multiplayer dragon battle game built with Next.js and Excalibur.js, featuring commit-reveal mechanics for fair gameplay.

## How to Play

### 1. Registration
- Choose your player name
- Select 3 dragons from different elements:
  - 🔥 **Fire** - Strong against Air & Earth
  - 💧 **Water** - Strong against Fire & Aether  
  - 💨 **Air** - Strong against Water & Earth
  - 🌍 **Earth** - Strong against Aether & Fire
  - ✨ **Aether** - Strong against Air & Water

### 2. Lobby
- View other players and challenge them to battles
- Check the leaderboard to see top players
- AI players are automatically added for testing

### 3. Battle System
Each battle consists of 2 duels with the following phases:

- **Commit Phase**: Secretly select your dragon (hidden from opponent)
- **Reveal Phase**: Prove your commitment with cryptographic verification
- **Resolution**: Winner determined by dragon type effectiveness
- **Important**: Losing dragons cannot be used in the next duel!

### 4. Victory
- The player with the most dragons remaining wins the battle
- Winners gain points, losers lose points
- Climb the leaderboard to become the top dragon trainer!

## Development Setup

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## Game Architecture

- **Frontend**: Next.js with TypeScript
- **Game Engine**: Excalibur.js for rendering and interactions
- **Game Logic**: Custom battle system with commit-reveal mechanics
- **AI Players**: Simulated opponents for testing

## Features

- ✅ Dragon type effectiveness system (rock-paper-scissors style)
- ✅ Commit-reveal battle mechanics for fair play
- ✅ Real-time battle interface with Excalibur.js
- ✅ Leaderboard and point system
- ✅ AI players for testing
- ⏳ Future: On-chain integration with Aleo for zero-knowledge proofs
- ⏳ Future: P2P multiplayer networking

## Built for ZK Hackathon

This game demonstrates commit-reveal mechanics that can be enhanced with zero-knowledge proofs for fully trustless gameplay on blockchain.