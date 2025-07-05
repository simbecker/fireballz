# Deploy Fireballz to Railway (Recommended)

## Quick Deployment Steps

### 1. Prepare Your Code
Make sure all files are committed to git:
```bash
git add .
git commit -m "Ready for deployment"
```

### 2. Deploy to Railway

**Option A: Using Railway CLI (Easiest)**
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Get your URL: `railway status`

**Option B: Using Railway Dashboard**
1. Go to [railway.app](https://railway.app)
2. Create account and login
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub repository
5. Railway will automatically detect it's a Node.js app
6. Deploy and get your URL

### 3. Share Your Game
Once deployed, you'll get a URL like: `https://your-game-name.railway.app`

Share this URL with friends to play together online!

## Alternative Platforms

### Render.com
1. Go to [render.com](https://render.com)
2. Create account and connect GitHub
3. Create new "Web Service"
4. Select your repository
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Deploy and get URL

### Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-game-name`
4. Deploy: `git push heroku main`
5. Open: `heroku open`

## Testing Your Deployment

1. Open your deployed URL in a browser
2. Test the game works locally
3. Open the same URL in another browser/device
4. Verify multiplayer works (you should see both players)

## Troubleshooting

- **Port issues**: Railway/Render automatically handle ports
- **WebSocket errors**: Make sure your platform supports WebSockets
- **Connection issues**: Check the browser console for errors

## Cost

- **Railway**: Free tier available, then $5/month
- **Render**: Free tier available
- **Heroku**: Free tier discontinued, paid plans only

Railway is recommended for its simplicity and good free tier! 