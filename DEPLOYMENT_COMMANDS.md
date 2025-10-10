# 🚀 Community Connect Deployment Commands

## Step 1: Prepare Your Project for Deployment

# Navigate to your project root
cd c:\communityconnect

# Test your frontend build locally first
cd client
npm run build
cd ..

## Step 2: Create GitHub Repository (if not already done)

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Deploy Community Connect to Render"

# Create repository on GitHub and push
# Go to github.com, create new repository named "community-connect"
# Then run these commands:
git remote add origin https://github.com/yourusername/community-connect.git
git branch -M main
git push -u origin main

## Step 3: Deploy Backend to Render

# 1. Go to https://render.com and sign up/login
# 2. Click "New +" → "Web Service"
# 3. Connect your GitHub repository
# 4. Use these settings:

# Environment: Node
# Build Command: npm install
# Start Command: npm start
# Root Directory: server

# Environment Variables to set in Render dashboard:
# NODE_ENV=production
# JWT_SECRET=your-super-secret-jwt-key-for-production-2024
# MONGODB_URI=your-mongodb-atlas-connection-string

## Step 4: Deploy Frontend to Render

# 1. In Render dashboard, click "New +" → "Static Site"  
# 2. Connect the SAME GitHub repository
# 3. Use these settings:

# Build Command: npm run build
# Publish Directory: build
# Root Directory: client

# Environment Variables for frontend:
# REACT_APP_API_URL=https://your-backend-url.onrender.com

## Step 5: Alternative - Deploy Frontend to Netlify (Easier)

# Install Netlify CLI
npm install -g netlify-cli

# Build your frontend
cd client
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build

## Step 6: Alternative - Deploy Frontend to Vercel (Fastest)

# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel --prod

## Step 7: Test Your Deployed App

# Your app will be available at:
# Frontend: https://your-frontend-url.render.com (or netlify/vercel URL)
# Backend: https://your-backend-url.render.com
# The frontend will automatically connect to the backend using the environment variables