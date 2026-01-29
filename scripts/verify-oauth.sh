#!/bin/bash

# OAuth Configuration Verification Script
# Run this before deploying OAuth to ensure everything is configured

set -e

echo "🔍 Verifying OAuth Configuration for TripCalc..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create a .env file from .env.example"
    exit 1
fi

echo -e "${GREEN}✅ .env file exists${NC}"

# Source .env file
set -a
source .env
set +a

# Check NextAuth configuration
echo ""
echo "📋 Checking NextAuth Configuration..."

if [ -z "$NEXTAUTH_URL" ]; then
    echo -e "${RED}❌ NEXTAUTH_URL is not set${NC}"
    exit 1
else
    echo -e "${GREEN}✅ NEXTAUTH_URL: $NEXTAUTH_URL${NC}"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ NEXTAUTH_SECRET is not set${NC}"
    echo "   Generate one with: openssl rand -base64 32"
    exit 1
else
    echo -e "${GREEN}✅ NEXTAUTH_SECRET is set${NC}"
fi

# Check Database
echo ""
echo "📋 Checking Database Configuration..."

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is not set${NC}"
    exit 1
else
    echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
fi

# Check OAuth Providers
echo ""
echo "📋 Checking OAuth Providers..."

PROVIDERS_CONFIGURED=0

# Google OAuth
if [ -n "$GOOGLE_CLIENT_ID" ] && [ "$GOOGLE_CLIENT_ID" != "" ] && [ "$GOOGLE_CLIENT_ID" != "xxxxx.apps.googleusercontent.com" ]; then
    if [ -n "$GOOGLE_CLIENT_SECRET" ] && [ "$GOOGLE_CLIENT_SECRET" != "" ] && [ "$GOOGLE_CLIENT_SECRET" != "xxxxx" ]; then
        echo -e "${GREEN}✅ Google OAuth configured${NC}"
        PROVIDERS_CONFIGURED=$((PROVIDERS_CONFIGURED + 1))
    else
        echo -e "${YELLOW}⚠️  Google Client ID set but Secret is missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Google OAuth not configured (optional)${NC}"
fi

# GitHub OAuth
if [ -n "$GITHUB_CLIENT_ID" ] && [ "$GITHUB_CLIENT_ID" != "" ] && [ "$GITHUB_CLIENT_ID" != "xxxxx" ]; then
    if [ -n "$GITHUB_CLIENT_SECRET" ] && [ "$GITHUB_CLIENT_SECRET" != "" ] && [ "$GITHUB_CLIENT_SECRET" != "xxxxx" ]; then
        echo -e "${GREEN}✅ GitHub OAuth configured${NC}"
        PROVIDERS_CONFIGURED=$((PROVIDERS_CONFIGURED + 1))
    else
        echo -e "${YELLOW}⚠️  GitHub Client ID set but Secret is missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub OAuth not configured (optional)${NC}"
fi

# Email Provider
if [ -n "$EMAIL_SERVER" ] && [ "$EMAIL_SERVER" != "smtp://apikey:your-resend-api-key@smtp.resend.com:587" ]; then
    if [ -n "$EMAIL_FROM" ]; then
        echo -e "${GREEN}✅ Email provider configured${NC}"
        PROVIDERS_CONFIGURED=$((PROVIDERS_CONFIGURED + 1))
    else
        echo -e "${YELLOW}⚠️  EMAIL_SERVER set but EMAIL_FROM is missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Email provider not configured (optional)${NC}"
fi

if [ $PROVIDERS_CONFIGURED -eq 0 ]; then
    echo -e "${RED}❌ No authentication providers configured${NC}"
    echo "   Configure at least one provider (Google, GitHub, or Email)"
    exit 1
fi

# Check Prisma schema
echo ""
echo "📋 Checking Prisma Schema..."

if [ ! -f prisma/schema.prisma ]; then
    echo -e "${RED}❌ prisma/schema.prisma not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Prisma schema exists${NC}"
fi

# Check if required tables exist in schema
REQUIRED_TABLES=("Account" "Session" "User" "VerificationToken")
for table in "${REQUIRED_TABLES[@]}"; do
    if grep -q "model $table" prisma/schema.prisma; then
        echo -e "${GREEN}  ✅ $table model exists${NC}"
    else
        echo -e "${RED}  ❌ $table model missing${NC}"
        exit 1
    fi
done

# Check auth configuration files
echo ""
echo "📋 Checking Auth Configuration Files..."

if [ ! -f lib/auth.ts ]; then
    echo -e "${RED}❌ lib/auth.ts not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ lib/auth.ts exists${NC}"
fi

if [ ! -f app/api/auth/[...nextauth]/route.ts ]; then
    echo -e "${RED}❌ app/api/auth/[...nextauth]/route.ts not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ NextAuth route handler exists${NC}"
fi

# Check auth pages
if [ ! -f app/\[locale\]/auth/signin/page.tsx ]; then
    echo -e "${RED}❌ Sign in page not found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Sign in page exists${NC}"
fi

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ OAuth Configuration Verified!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  • Providers configured: $PROVIDERS_CONFIGURED"
echo "  • Database: Configured"
echo "  • NextAuth: Configured"
echo "  • Auth pages: Ready"
echo ""
echo "🚀 Next Steps:"
echo "  1. Run database migrations: npm run db:migrate"
echo "  2. Start dev server: npm run dev"
echo "  3. Test at: $NEXTAUTH_URL/auth/signin"
echo ""
echo "📖 For OAuth setup instructions, see:"
echo "   docs/OAUTH_SETUP.md"
echo ""
