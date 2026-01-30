# OAuth Configuration Guide

This guide will help you set up Google and GitHub OAuth authentication for TripCalc.

## Prerequisites

- NextAuth.js is already configured in the project
- Database is set up with Prisma
- You have access to Google Cloud Console and GitHub

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [GitHub OAuth Setup](#github-oauth-setup)
3. [Environment Variables](#environment-variables)
4. [Testing](#testing)
5. [Production Deployment](#production-deployment)

---

## Google OAuth Setup

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Create a new project or select an existing one:
   - Click the project dropdown in the top bar
   - Click "New Project"
   - Name it "TripCalc" (or any name you prefer)
   - Click "Create"

### Step 2: Enable Required APIs

1. In the left sidebar, go to **"APIs & Services" > "Library"**
2. Search for and enable the following APIs:
   - **Google+ API** (click "Enable")
   - **Google People API** (click "Enable")

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `TripCalc`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page:
   - Don't add any additional scopes
   - Click **"Save and Continue"**
7. On the **Test users** page:
   - Add your email address for testing
   - Click **"Save and Continue"**

### Step 4: Create OAuth Client ID

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. Select **"Web application"** as the application type
4. Configure the client:
   - **Name**: `TripCalc Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Click **"Create"**
6. **IMPORTANT**: Copy the **Client ID** and **Client Secret** that appear
   - You'll need these for your `.env` file
   - Store them securely

### Step 5: Add Production URLs (Later)

When deploying to production:

1. Go back to your OAuth client in Google Cloud Console
2. Add production URLs to:
   - **Authorized JavaScript origins**:
     ```
     https://tripcalc.site
     ```
   - **Authorized redirect URIs**:
     ```
     https://tripcalc.site/api/auth/callback/google
     ```
3. Click **"Save"**

---

## GitHub OAuth Setup

### Step 1: Access GitHub Developer Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **"OAuth Apps"**
3. Click **"New OAuth App"**

### Step 2: Create OAuth App for Development

1. Fill in the application details:
   - **Application name**: `TripCalc (Development)`
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: `Travel cost calculator - Development`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
2. Click **"Register application"**

### Step 3: Get Credentials

1. On the app page, you'll see your **Client ID** - copy it
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** immediately (you won't see it again)
4. Store both securely

### Step 4: Create Production OAuth App

1. Repeat steps 1-3 but create a separate app for production:
   - **Application name**: `TripCalc (Production)`
   - **Homepage URL**: `https://tripcalc.site`
   - **Authorization callback URL**: `https://tripcalc.site/api/auth/callback/github`
2. Save the production credentials separately

---

## Environment Variables

### Update .env for Development

Open your `.env` file and add the credentials:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# GitHub OAuth
GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"
```

### Create .env.production for Production

Create a `.env.production` file with production credentials:

```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://tripcalc.site
NEXTAUTH_URL=https://tripcalc.site

# Google OAuth (Production)
GOOGLE_CLIENT_ID="YOUR_PROD_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_PROD_GOOGLE_CLIENT_SECRET"

# GitHub OAuth (Production)
GITHUB_CLIENT_ID="YOUR_PROD_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_PROD_GITHUB_CLIENT_SECRET"
```

---

## Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test OAuth Flow

1. Navigate to `http://localhost:3000`
2. Click **"Sign In"** in the header
3. You should see the sign-in page with three options:
   - Continue with Google
   - Continue with GitHub
   - Continue with Email

### 3. Test Google OAuth

1. Click **"Continue with Google"**
2. You should be redirected to Google's login page
3. Sign in with your Google account (use the test user you added)
4. Grant permissions to the app
5. You should be redirected back to TripCalc
6. Check if you're signed in (your name/avatar should appear in the header)

### 4. Test GitHub OAuth

1. Sign out if you're signed in
2. Click **"Sign In"** again
3. Click **"Continue with GitHub"**
4. You should be redirected to GitHub's authorization page
5. Click **"Authorize"**
6. You should be redirected back to TripCalc
7. Check if you're signed in

### 5. Common Issues and Solutions

#### Google OAuth Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**:
- Verify the redirect URI in Google Cloud Console is exactly:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Make sure there are no trailing slashes
- Make sure you're using `http://` not `https://` for localhost

#### GitHub OAuth Error: "The redirect_uri MUST match the registered callback URL"

**Problem**: Similar to Google, the callback URL doesn't match.

**Solution**:
- Verify the callback URL in GitHub OAuth App settings is exactly:
  ```
  http://localhost:3000/api/auth/callback/github
  ```
- No trailing slashes

#### Google OAuth Error: "This app is blocked"

**Problem**: The app is in testing mode and you're not added as a test user.

**Solution**:
- Go to Google Cloud Console > OAuth consent screen > Test users
- Add your Google account email
- Try again

#### Session Not Persisting

**Problem**: You're signed in but the session doesn't persist after refresh.

**Solution**:
- Check that `DATABASE_URL` is correctly set in `.env`
- Run database migrations: `npm run db:migrate`
- Check that the `Session` and `Account` tables exist in your database

---

## Production Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add each environment variable from `.env.production`
   - Make sure `NEXTAUTH_URL` is set to your production URL

2. Update OAuth apps with production URLs (see Google Step 5 and GitHub Step 4)

3. Redeploy your application

### Docker Deployment

1. Create a `.env.production` file with production credentials
2. Build the Docker image:
   ```bash
   npm run docker:build
   ```
3. Deploy to your VPS using the production environment file

---

## Security Best Practices

1. **Never commit credentials**:
   - `.env` files are in `.gitignore`
   - Never hardcode credentials in code

2. **Use separate OAuth apps for dev/prod**:
   - Development credentials should only work on localhost
   - Production credentials should only work on your domain

3. **Rotate secrets periodically**:
   - Generate new client secrets every 6-12 months
   - Update them in your deployment environment

4. **Monitor OAuth usage**:
   - Google Cloud Console shows OAuth usage statistics
   - GitHub shows which users have authorized your app

5. **Keep NextAuth.js updated**:
   - Security patches are released regularly
   - Update dependencies: `npm update next-auth`

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [NextAuth.js GitHub Provider](https://next-auth.js.org/providers/github)

---

**Last Updated**: 2026-01-29
