# Fireballz Multiplayer Wizard Game

A real-time multiplayer wizard game where players cast fireballs, collect coins, and compete against AI bots and other players!

## Features

🎮 **Multiplayer Gameplay:**
- Real-time multiplayer with WebSocket connections
- Multiple players can join simultaneously
- See other players moving and casting spells in real-time
- Competitive coin collection and combat

🧙‍♂️ **Wizard Features:**
- **Movement:** WASD or Arrow Keys
- **Fireball Casting:** Spacebar to shoot
- **Mouse Aiming:** Point and shoot with mouse
- **Teleportation:** C key (with cooldown)
- **Leveling:** Collect coins to grow stronger
- **Health System:** Take damage from bot fireballs

🤖 **AI Bots:**
- Intelligent bot wizards that collect coins
- Bots attack players when in range
- Bots drop coins when defeated
- Dynamic bot spawning system

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or use the batch file:
   ```bash
   start-server.bat
   ```

3. **Access the game:**
   - Open `http://localhost:3000` in your browser
   - The multiplayer game will load automatically
   - Multiple browser tabs/windows can be used to test multiplayer

## How to Play

### Controls
- **WASD/Arrow Keys:** Move your wizard
- **Mouse:** Aim fireball direction
- **Spacebar:** Cast fireball
- **C:** Teleport (with cooldown)

### Gameplay
1. **Collect coins** to level up and grow stronger
2. **Shoot fireballs** at AI bots to defeat them
3. **Avoid bot fireballs** - they can damage you
4. **Use teleport** strategically to escape or reposition
5. **Compete** with other players for coins and survival

### Multiplayer Features
- **Real-time Updates:** See other players moving and casting spells
- **Player Count:** View how many players are currently online
- **Connection Status:** Monitor your connection to the server
- **Cross-platform:** Works on any device with a web browser

## Network Access

The server is configured to be accessible on your local network:

- **Local access:** `http://localhost:3000`
- **Network access:** `http://[YOUR_IP]:3000`

Other devices on your network can join using your computer's IP address!

## Game Files

- `server.js` - Node.js server with WebSocket support
- `multiplayer.html` - Client-side multiplayer game
- `index.html` - Single-player version
- `package.json` - Dependencies and scripts
- `start-server.bat` - Windows startup script

## Server Features

- **WebSocket Server:** Real-time bidirectional communication
- **Player Management:** Track connected players and their states
- **Game Logic:** Server-side collision detection and bot AI
- **Auto-reconnection:** Clients automatically reconnect if disconnected
- **Network Access:** Accessible from any device on your local network

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server when files change.

### Testing Multiplayer
1. Start the server
2. Open multiple browser tabs to `http://localhost:3000`
3. Each tab represents a different player
4. Move around and cast spells to see real-time multiplayer interaction

## Technical Details

- **Backend:** Node.js with Express and WebSocket
- **Frontend:** HTML5 Canvas with JavaScript
- **Communication:** WebSocket for real-time updates
- **Game Loop:** 60 FPS server-side updates
- **World Size:** 2000x1500 pixels
- **Max Players:** Unlimited (limited by server resources)

## Troubleshooting

- **Connection Issues:** Check that the server is running on port 3000
- **Performance:** Close unused browser tabs to reduce server load
- **Reconnection:** The client automatically reconnects every 3 seconds if disconnected
- **Network Access:** Make sure your firewall allows connections on port 3000

Enjoy the magical multiplayer experience! 🧙‍♂️✨ 