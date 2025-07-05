# Fireballz - Multiplayer Wizard Battle Game

A real-time multiplayer wizard battle game where players shoot fireballs, collect coins, and fight bots and other players!

## Features

- 🧙‍♂️ **Multiplayer battles** - Fight other players in real-time
- 🔥 **Fireball combat** - Shoot fireballs with 360-degree aiming
- 🪙 **Coin collection** - Collect coins to level up and reduce cooldowns
- 🤖 **Bot enemies** - AI wizards that move, shoot, and collect coins
- ⚡ **Teleport ability** - Quick movement with cooldown
- 📈 **Level progression** - Get bigger and stronger as you collect coins
- 🎯 **Precise aiming** - Mouse-based aiming system
- 🌍 **Large world** - Explore a massive 3000x2250 pixel world

## Controls

- **WASD / Arrow Keys**: Move
- **Mouse**: Aim direction
- **Spacebar**: Shoot fireball
- **C**: Teleport (with cooldown)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Online Deployment

### Option 1: Railway (Recommended)

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Deploy: `railway up`
5. Your game will be available at the provided URL

### Option 2: Render

1. Create a Render account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy and get your URL

### Option 3: Heroku

1. Create a Heroku account
2. Install Heroku CLI
3. Run these commands:
```bash
heroku create your-game-name
git add .
git commit -m "Deploy multiplayer game"
git push heroku main
```

## Multiplayer Setup

Once deployed, anyone can join your game by visiting the URL. The game supports:

- **Real-time multiplayer** - Up to 10+ players simultaneously
- **Shared world** - All players see the same coins, bots, and fireballs
- **PvP combat** - Players can shoot and damage each other
- **Cross-platform** - Works on any device with a web browser

## Game Mechanics

- **Leveling**: Collect 10 coins to level up (increases size and damage)
- **Health**: Players have 100 HP, bots have 2 HP
- **Fireballs**: Damage scales with player level
- **Teleport**: 3-second cooldown, reduced by collecting coins
- **Shooting**: 200ms cooldown between shots
- **Bots**: Move around, shoot every second, and collect coins

## Technical Details

- **Backend**: Node.js with Express and WebSocket
- **Frontend**: HTML5 Canvas with JavaScript
- **Real-time**: WebSocket connections for instant updates
- **Scalable**: Can handle multiple concurrent players

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this code for your own projects! 