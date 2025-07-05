const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve multiplayer.html as default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'multiplayer.html'));
});

// Serve static files (after routes)
app.use(express.static(path.join(__dirname)));

// Game world dimensions
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2250;

// Game state
const players = new Map();
const fireballs = [];
const coins = [];
const bots = [];
const teleportEffects = [];

// Generate initial coins
function generateCoins() {
    for (let i = 0; i < 50; i++) {
        coins.push({
            id: uuidv4(),
            x: Math.random() * (WORLD_WIDTH - 40) + 20,
            y: Math.random() * (WORLD_HEIGHT - 40) + 20,
            size: 12,
            collected: false,
            bobOffset: Math.random() * Math.PI * 2,
            sparkles: []
        });
    }
}

// Generate initial bots
function generateBots() {
    for (let i = 0; i < 3; i++) {
        bots.push({
            id: uuidv4(),
            x: Math.random() * (WORLD_WIDTH - 100) + 50,
            y: Math.random() * (WORLD_HEIGHT - 100) + 50,
            width: 32,
            height: 32,
            speed: 5,
            health: 2,
            maxHealth: 2,
            direction: Math.random() * Math.PI * 2,
            coins: 0,
            lastShot: 0,
            shootCooldown: 60,
            state: 'wander',
            alive: true,
            color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5]
        });
    }
}

// Initialize game objects
generateCoins();
generateBots();

// WebSocket connection handling
wss.on('connection', (ws) => {
    const playerId = uuidv4();
    
    // Create new player
    const player = {
        id: playerId,
        x: Math.random() * (WORLD_WIDTH - 100) + 50,
        y: Math.random() * (WORLD_HEIGHT - 100) + 50,
        width: 32,
        height: 32,
        baseWidth: 32,
        baseHeight: 32,
        speed: 8,
        minSpeed: 4,
        health: 100,
        maxHealth: 100,
        direction: 0,
        coins: 0,
        level: 1,
        coinsToNextLevel: 10,
        fireballSize: 12,
        teleportCooldown: 0,
        teleportMaxCooldown: 180,
        teleportDistance: 120,
        shootCooldown: 0,
        shootMaxCooldown: 12, // 200ms at 60 FPS
        alive: true,
        mouseX: 0,
        mouseY: 0,
        keys: {}
    };
    
    players.set(playerId, player);
    
    console.log(`Player ${playerId} connected. Total players: ${players.size}`);
    console.log(`Current game state: ${coins.filter(c => !c.collected).length} coins, ${bots.filter(b => b.alive).length} bots, ${fireballs.length} fireballs`);
    
    // Send initial game state to new player
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        players: Array.from(players.values()),
        coins: coins,
        bots: bots,
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT
    }));
    
    // Broadcast updated game state to ALL players (including the new one)
    // This ensures everyone has the same shared state
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'gameUpdate',
                players: Array.from(players.values()),
                fireballs: fireballs,
                coins: coins.filter(coin => !coin.collected),
                bots: bots.filter(bot => bot.alive)
            }));
        }
    });
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'updateInput':
                    if (players.has(playerId)) {
                        const player = players.get(playerId);
                        player.keys = data.keys || {};
                        player.mouseX = data.mouseX || 0;
                        player.mouseY = data.mouseY || 0;
                        if (typeof data.direction === 'number') {
                            player.direction = data.direction;
                        }
                    }
                    break;
                    
                case 'shootFireball':
                    if (players.has(playerId)) {
                        const player = players.get(playerId);
                        if (player.shootCooldown <= 0) {
                            const fireball = {
                                id: uuidv4(),
                                x: data.x,
                                y: data.y,
                                direction: data.direction,
                                speed: 8,
                                size: data.size || 12,
                                lifetime: 120,
                                isPlayerFireball: true,
                                playerId: playerId,
                                damage: 1 + (player.level - 1)
                            };
                            fireballs.push(fireball);
                            
                            // Set shooting cooldown
                            player.shootCooldown = player.shootMaxCooldown;
                            
                            // Broadcast fireball to all players
                            wss.clients.forEach((client) => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'fireballShot',
                                        fireball: fireball
                                    }));
                                }
                            });
                        }
                    }
                    break;
                    
                case 'teleport':
                    if (players.has(playerId)) {
                        const player = players.get(playerId);
                        if (player.teleportCooldown <= 0) {
                            player.x = data.x;
                            player.y = data.y;
                            player.teleportCooldown = player.teleportMaxCooldown;
                            
                            // Broadcast teleport to all players
                            wss.clients.forEach((client) => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: 'playerTeleported',
                                        playerId: playerId,
                                        x: player.x,
                                        y: player.y
                                    }));
                                }
                            });
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    // Handle player disconnect
    ws.on('close', () => {
        players.delete(playerId);
        console.log(`Player ${playerId} disconnected. Total players: ${players.size}`);
        
        // Broadcast player disconnect to all other players
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'playerLeft',
                    playerId: playerId
                }));
            }
        });
    });
});

// Game loop for server-side updates
setInterval(() => {
    // Update all players
    players.forEach((player, playerId) => {
        if (!player.alive) return;
        
        // Update player movement based on keys
        let dx = 0;
        let dy = 0;
        if (player.keys['w'] || player.keys['arrowup']) dy -= player.speed;
        if (player.keys['s'] || player.keys['arrowdown']) dy += player.speed;
        if (player.keys['a'] || player.keys['arrowleft']) dx -= player.speed;
        if (player.keys['d'] || player.keys['arrowright']) dx += player.speed;
        
        // Diagonal movement normalization
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Update player position
        player.x = Math.max(0, Math.min(player.x + dx, WORLD_WIDTH - player.width));
        player.y = Math.max(0, Math.min(player.y + dy, WORLD_HEIGHT - player.height));
        
        // Check coin collection
        coins.forEach(coin => {
            if (!coin.collected) {
                // Check if coin intersects with player's body rectangle
                const playerLeft = player.x;
                const playerRight = player.x + player.width;
                const playerTop = player.y;
                const playerBottom = player.y + player.height;
                
                const coinLeft = coin.x - coin.size;
                const coinRight = coin.x + coin.size;
                const coinTop = coin.y - coin.size;
                const coinBottom = coin.y + coin.size;
                
                // Check for rectangle intersection
                if (playerLeft < coinRight && playerRight > coinLeft && 
                    playerTop < coinBottom && playerBottom > coinTop) {
                    coin.collected = true;
                    player.coins++;
                    
                    // Level up every 10 coins
                    if (player.coins >= player.coinsToNextLevel) {
                        player.level++;
                        player.coinsToNextLevel += 10;
                        const scaleFactor = 1 + Math.log(player.level) * 1.5;
                        player.width = player.baseWidth * scaleFactor;
                        player.height = player.baseHeight * scaleFactor;
                        player.fireballSize = 12 * scaleFactor;
                        player.speed = Math.max(player.minSpeed, player.speed - 0.3);
                    }
                    
                    // Reduce teleport cooldown
                    player.teleportCooldown = Math.max(0, player.teleportCooldown - 30);
                    
                    // Broadcast coin collected
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'coinCollected',
                                coinId: coin.id,
                                playerId: playerId,
                                newCoins: player.coins,
                                newLevel: player.level
                            }));
                        }
                    });
                }
            }
        });
        
        // Update teleport cooldown
        if (player.teleportCooldown > 0) {
            player.teleportCooldown--;
        }
        
        // Update shooting cooldown
        if (player.shootCooldown > 0) {
            player.shootCooldown--;
        }
    });
    
    // Update fireballs
    const fireballsToRemove = [];
    for (let i = fireballs.length - 1; i >= 0; i--) {
        const fireball = fireballs[i];
        
        // Move fireball
        fireball.x += Math.cos(fireball.direction) * fireball.speed;
        fireball.y += Math.sin(fireball.direction) * fireball.speed;
        
        // Check bounds
        if (fireball.x < 0 || fireball.x > WORLD_WIDTH || 
            fireball.y < 0 || fireball.y > WORLD_HEIGHT) {
            fireballsToRemove.push(i);
            continue;
        }
        
        // Check collisions
        let shouldRemove = false;
        if (fireball.isPlayerFireball) {
            // Player fireball hits bots
            for (let j = 0; j < bots.length; j++) {
                const bot = bots[j];
                if (bot.alive) {
                    const distance = Math.sqrt(
                        Math.pow(fireball.x - (bot.x + bot.width/2), 2) + 
                        Math.pow(fireball.y - (bot.y + bot.height/2), 2)
                    );
                    if (distance < fireball.size) {
                        bot.health -= fireball.damage;
                        if (bot.health <= 0) {
                            bot.alive = false;
                            // Drop coins
                            const coinsToDrop = Math.max(5, bot.coins);
                            for (let k = 0; k < coinsToDrop; k++) {
                                const angle = (k / coinsToDrop) * Math.PI * 2;
                                const dropDistance = 30 + Math.random() * 20;
                                const dropX = bot.x + bot.width/2 + Math.cos(angle) * dropDistance;
                                const dropY = bot.y + bot.height/2 + Math.sin(angle) * dropDistance;
                                coins.push({
                                    id: uuidv4(),
                                    x: dropX,
                                    y: dropY,
                                    size: 12,
                                    collected: false,
                                    bobOffset: Math.random() * Math.PI * 2,
                                    sparkles: []
                                });
                            }
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
            // Player fireball hits other players
            for (const [otherId, otherPlayer] of players.entries()) {
                if (otherPlayer.alive && otherId !== fireball.playerId) {
                    const distance = Math.sqrt(
                        Math.pow(fireball.x - (otherPlayer.x + otherPlayer.width/2), 2) +
                        Math.pow(fireball.y - (otherPlayer.y + otherPlayer.height/2), 2)
                    );
                    if (distance < fireball.size) {
                        otherPlayer.health -= fireball.damage;
                        if (otherPlayer.health <= 0) {
                            otherPlayer.alive = false;
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
        } else {
            // Bot fireball hits players
            for (let j = 0; j < players.size; j++) {
                const player = Array.from(players.values())[j];
                if (player.alive) {
                    const distance = Math.sqrt(
                        Math.pow(fireball.x - (player.x + player.width/2), 2) + 
                        Math.pow(fireball.y - (player.y + player.height/2), 2)
                    );
                    if (distance < fireball.size) {
                        player.health -= fireball.damage;
                        if (player.health <= 0) {
                            player.alive = false;
                        }
                        shouldRemove = true;
                        break;
                    }
                }
            }
        }
        
        // Update lifetime
        fireball.lifetime--;
        if (fireball.lifetime <= 0) {
            shouldRemove = true;
        }
        
        if (shouldRemove) {
            fireballsToRemove.push(i);
        }
    }
    
    // Remove fireballs that should be removed
    fireballsToRemove.forEach(index => {
        fireballs.splice(index, 1);
    });
    
    // Update bots
    bots.forEach(bot => {
        if (!bot.alive) return;
        
        // Simple AI: move towards nearest coin or player, or wander randomly
        let targetX = bot.x;
        let targetY = bot.y;
        let hasTarget = false;
        
        // Find nearest coin
        let nearestCoin = null;
        let nearestDistance = Infinity;
        coins.forEach(coin => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(bot.x - coin.x, 2) + Math.pow(bot.y - coin.y, 2)
                );
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestCoin = coin;
                }
            }
        });
        
        if (nearestCoin && nearestDistance < 150) {
            targetX = nearestCoin.x;
            targetY = nearestCoin.y;
            hasTarget = true;
        } else {
            // Move towards nearest player
            let nearestPlayer = null;
            let nearestPlayerDistance = Infinity;
            players.forEach(player => {
                if (player.alive) {
                    const distance = Math.sqrt(
                        Math.pow(bot.x - (player.x + player.width/2), 2) + 
                        Math.pow(bot.y - (player.y + player.height/2), 2)
                    );
                    if (distance < nearestPlayerDistance) {
                        nearestPlayerDistance = distance;
                        nearestPlayer = player;
                    }
                }
            });
            
            if (nearestPlayer && nearestPlayerDistance < 200) {
                targetX = nearestPlayer.x + nearestPlayer.width/2;
                targetY = nearestPlayer.y + nearestPlayer.height/2;
                hasTarget = true;
            }
        }
        
        // If no specific target, wander randomly
        if (!hasTarget) {
            // Change wandering direction occasionally
            if (!bot.wanderTarget || Math.random() < 0.02) {
                bot.wanderTarget = {
                    x: Math.random() * (WORLD_WIDTH - 100) + 50,
                    y: Math.random() * (WORLD_HEIGHT - 100) + 50
                };
            }
            targetX = bot.wanderTarget.x;
            targetY = bot.wanderTarget.y;
        }
        
        // Move towards target
        const dx = targetX - bot.x;
        const dy = targetY - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            bot.direction = Math.atan2(dy, dx);
            bot.x += Math.cos(bot.direction) * bot.speed;
            bot.y += Math.sin(bot.direction) * bot.speed;
        }
        
        // Keep within bounds
        bot.x = Math.max(0, Math.min(bot.x, WORLD_WIDTH - bot.width));
        bot.y = Math.max(0, Math.min(bot.y, WORLD_HEIGHT - bot.height));
        
        // Shoot at players
        bot.lastShot++;
        if (bot.lastShot >= bot.shootCooldown && Math.random() < 1.0) {
            players.forEach(player => {
                if (player.alive) {
                    const distance = Math.sqrt(
                        Math.pow(bot.x - (player.x + player.width/2), 2) + 
                        Math.pow(bot.y - (player.y + player.height/2), 2)
                    );
                    if (distance < 300) {
                        const direction = Math.atan2(
                            (player.y + player.height/2) - bot.y,
                            (player.x + player.width/2) - bot.x
                        );
                        
                        fireballs.push({
                            id: uuidv4(),
                            x: bot.x + bot.width/2,
                            y: bot.y + bot.height/2,
                            direction: direction,
                            speed: 6,
                            size: 10,
                            lifetime: 90,
                            isPlayerFireball: false,
                            damage: 1
                        });
                        
                        bot.lastShot = 0;
                    }
                }
            });
        }
        
        // Collect coins
        coins.forEach(coin => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(bot.x - coin.x, 2) + Math.pow(bot.y - coin.y, 2)
                );
                if (distance < 25) {
                    coin.collected = true;
                    bot.coins++;
                }
            }
        });
    });
    
    // Regenerate coins if needed
    const activeCoins = coins.filter(coin => !coin.collected).length;
    if (activeCoins < 20) {
        for (let i = 0; i < 5; i++) {
            coins.push({
                id: uuidv4(),
                x: Math.random() * (WORLD_WIDTH - 40) + 20,
                y: Math.random() * (WORLD_HEIGHT - 40) + 20,
                size: 12,
                collected: false,
                bobOffset: Math.random() * Math.PI * 2,
                sparkles: []
            });
        }
    }
    
    // Regenerate bots if needed
    const aliveBots = bots.filter(bot => bot.alive).length;
    if (aliveBots < 3) {
        bots.push({
            id: uuidv4(),
            x: Math.random() * (WORLD_WIDTH - 100) + 50,
            y: Math.random() * (WORLD_HEIGHT - 100) + 50,
            width: 32,
            height: 32,
            speed: 5,
            health: 2,
            maxHealth: 2,
            direction: Math.random() * Math.PI * 2,
            coins: 0,
            lastShot: 0,
            shootCooldown: 60,
            state: 'wander',
            alive: true,
            color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
        });
    }
    
    // Broadcast updated game state to all players
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'gameUpdate',
                players: Array.from(players.values()),
                fireballs: fireballs,
                coins: coins.filter(coin => !coin.collected),
                bots: bots.filter(bot => bot.alive)
            }));
        }
    });
}, 1000 / 60); // 60 FPS

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Fireballz server running on http://0.0.0.0:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://[YOUR_IP]:${PORT}`);
    console.log(`WebSocket server ready for multiplayer connections`);
    console.log(`Other devices on your network can connect using your computer's IP address`);
}); 