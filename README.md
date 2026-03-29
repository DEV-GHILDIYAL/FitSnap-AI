<div align="center">

# FitSnap AI 🪞✨

### AI-Powered Virtual Try-On — See Any Outfit on Yourself Instantly

<br />

<img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
<img src="https://img.shields.io/badge/AWS-Lambda%20•%20DynamoDB%20•%20S3-FF9900?style=for-the-badge&logo=amazon-aws" alt="AWS" />
<img src="https://img.shields.io/badge/Replicate-IDM--VTON-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=" alt="Replicate AI" />
<img src="https://img.shields.io/badge/Razorpay-Payments-3395FF?style=for-the-badge&logo=razorpay" alt="Razorpay" />
<img src="https://img.shields.io/badge/Serverless-v3-FD5750?style=for-the-badge&logo=serverless" alt="Serverless" />

<br /><br />

**FitSnap AI** is a production-grade SaaS web application that uses state-of-the-art AI diffusion models to let users virtually try on any outfit. Upload a photo of yourself, pick a garment from the catalog (or upload your own), and see a photorealistic preview in seconds — powered by [Replicate IDM-VTON](https://replicate.com/cuuupid/idm-vton).

<br />

[Getting Started](#-getting-started) •
[Features](#-features) •
[Architecture](#-architecture) •
[API Reference](#-api-reference) •
[Deployment](#-deployment-cicd) •
[Environment Variables](#-environment-variables) •
[Contributing](#-contributing)

</div>

---

## ✨ Features

### Core Experience
- **AI Virtual Try-On Engine** — Upload your photo + any garment image → receive a photorealistic composite using Replicate's IDM-VTON diffusion model (30-step inference, seed reproducibility)
- **Fashion Catalog** — Browse 25+ curated outfits across Men's and Women's collections (Tops, Bottoms, Full Body, Traditional) with one-click "Try This" that auto-injects the garment into the studio via URL parameters
- **Preset Quick-Select** — Thumbnail strip of popular outfits instantly loadable without leaving the try-on page
- **Result Gallery** — AI-generated outputs persist in a "Wardrobe Gallery" powered by DynamoDB, viewable across sessions

### SaaS Platform
- **Google OAuth Authentication** — Secure sign-in via NextAuth.js with Google provider; all API routes are session-gated
- **Credit-Based Monetization** — Each generation costs 1 credit; balance stored in DynamoDB per-user and enforced server-side
- **Razorpay Payment Integration** — Two pricing tiers (₹99 for 20 credits / ₹199 for 50 credits) with HMAC-SHA256 signature verification ensuring atomic credit deposits only on verified payments
- **Profile Dashboard** — View account info, live credit balance, and purchase credits through embedded Razorpay checkout

### UI / UX
- **Two-Column SaaS Shell** — Fixed sidebar navigation with responsive mobile hamburger menu, collapsing to a floating header on screens ≤ 1024px
- **Dark/Light Theme Toggle** — System-aware theme switching via `next-themes` with CSS custom property design tokens
- **Drag & Drop Upload** — Intuitive file drop zones with live image preview, file type validation, and base64 encoding
- **Loading Overlay** — Full-screen animated overlay with spinner during AI generation
- **Responsive Design** — Fully fluid layout from mobile (375px) to desktop (1920px+)

### Infrastructure
- **Serverless on AWS Lambda** — Zero server management; Next.js standalone mode deployed via [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter)
- **Automated CI/CD** — GitHub Actions pipeline: `npm ci` → `next build` → `serverless deploy` on every push to `main`
- **S3 Image Persistence** — Generated outfit images uploaded to S3 with permanent public URLs (fallback to Replicate temporary URLs if S3 is unconfigured)
- **DynamoDB Backend** — Two tables: `users` (credit balances) and `generations` (try-on history with timestamps)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                             │
│  Next.js 16 App Router • React 19 • CSS Modules • next-themes      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    AWS API Gateway (HTTP API)                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       AWS Lambda Function                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Lambda Web Adapter Layer (v0.8.4)                           │   │
│  │  AWS_LAMBDA_EXEC_WRAPPER=/opt/bootstrap                     │   │
│  │  Executes: run.sh → node .next/standalone/server.js         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Next.js Standalone Server (Port 8080)                      │   │
│  │                                                              │   │
│  │  Pages:  / (Studio) • /catalog • /profile                   │   │
│  │  APIs:   /api/generate • /api/credits • /api/history        │   │
│  │          /api/payment/createOrder • /api/payment/verify      │   │
│  │          /api/auth/[...nextauth]                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────┬─────────────┬──────────────┬────────────┬───────────────┘
           │             │              │            │
           ▼             ▼              ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
    │ Replicate│  │ DynamoDB │  │     S3     │  │ Razorpay │
    │ IDM-VTON │  │  users   │  │  generated │  │ Checkout │
    │  Model   │  │  gens    │  │   images   │  │  Gateway │
    └──────────┘  └──────────┘  └────────────┘  └──────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.2 (App Router) | Full-stack React framework with server-side API routes |
| **UI Library** | React 19 | Client-side rendering with hooks (useState, useCallback, useEffect) |
| **Styling** | CSS Modules + CSS Custom Properties | Scoped component styles with global design token system |
| **Theming** | next-themes | System-aware dark/light mode toggle |
| **Auth** | NextAuth.js v4 (Google Provider) | OAuth 2.0 session management with JWT |
| **AI Model** | Replicate IDM-VTON | Diffusion-based virtual garment try-on |
| **Database** | AWS DynamoDB | NoSQL storage for user credits and generation history |
| **Object Storage** | AWS S3 | Persistent image hosting for generated outfits |
| **Payments** | Razorpay | Indian payment gateway with signature verification |
| **Runtime** | AWS Lambda (Node.js 20.x) | Serverless compute via Lambda Web Adapter |
| **API Gateway** | AWS API Gateway v2 (HTTP API) | HTTP routing and TLS termination |
| **Deployment** | Serverless Framework v3 | Infrastructure-as-code for Lambda + API Gateway |
| **CI/CD** | GitHub Actions | Automated build and deploy on push to `main` |

---

## 📁 Project Structure

```
FitSnap-AI/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline: build → deploy to AWS Lambda
├── fitsnap-ai/                     # Next.js application root
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js           # Root layout: Inter font, sidebar shell, providers
│   │   │   ├── page.js             # Home: Try-on studio (upload, preview, generate)
│   │   │   ├── globals.css         # Design system: CSS custom properties, themes
│   │   │   ├── catalog/
│   │   │   │   └── page.js         # Fashion catalog with gender/category filters
│   │   │   ├── profile/
│   │   │   │   └── page.js         # User profile: credits, Razorpay checkout
│   │   │   └── api/
│   │   │       ├── auth/[...nextauth]/route.js  # Google OAuth endpoints
│   │   │       ├── generate/route.js            # AI generation (Replicate + S3)
│   │   │       ├── credits/route.js             # GET user credit balance
│   │   │       ├── history/route.js             # GET generation history
│   │   │       └── payment/
│   │   │           ├── createOrder/route.js     # POST create Razorpay order
│   │   │           └── verify/route.js          # POST verify payment signature
│   │   ├── components/
│   │   │   ├── Sidebar/            # Fixed sidebar nav (desktop) + hamburger (mobile)
│   │   │   ├── Navbar/             # Mobile-only floating header bar
│   │   │   ├── ImageUpload/        # Drag-and-drop file upload with preview
│   │   │   ├── PreviewSection/     # Side-by-side user + outfit preview
│   │   │   ├── PresetOutfits/      # Quick-select thumbnail strip
│   │   │   ├── GenerateButton/     # Animated CTA for AI generation
│   │   │   ├── ResultSection/      # Generated output display with download
│   │   │   ├── WardrobeGallery/    # Historical generations gallery
│   │   │   ├── LoadingOverlay/     # Full-screen loading spinner
│   │   │   ├── ThemeToggle/        # Dark/light mode switch
│   │   │   └── Providers.js        # NextAuth + ThemeProvider wrapper
│   │   └── lib/
│   │       └── dynamodb.js         # DynamoDB Document Client singleton
│   ├── public/                     # Static assets (favicon, images)
│   ├── run.sh                      # Lambda bootstrap: starts Next.js server
│   ├── serverless.yml              # Serverless Framework config for AWS Lambda
│   ├── next.config.mjs             # Next.js config (standalone output mode)
│   ├── package.json                # Dependencies and scripts
│   └── .gitattributes              # Enforces LF line endings for shell scripts
└── README.md                       # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|----------------|-------|
| **Node.js** | 20.x | Required for Next.js 16 and AWS Lambda runtime |
| **npm** | 10.x | Ships with Node.js 20 |
| **AWS Account** | — | For DynamoDB, S3, and Lambda deployment |
| **Replicate Account** | — | [Sign up](https://replicate.com) for API token |
| **Google Cloud Project** | — | For OAuth client credentials |
| **Razorpay Account** | — | [Test mode](https://dashboard.razorpay.com) credentials work for dev |

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/DEV-GHILDIYAL/FitSnap-AI.git
cd FitSnap-AI/fitsnap-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local   # Then fill in your keys (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

---

## 🔑 Environment Variables

Create a `.env.local` file inside the `fitsnap-ai/` directory:

```ini
# ── AI Engine ──────────────────────────────────────────
REPLICATE_API_TOKEN=r8_your_replicate_api_token

# ── AWS Services ───────────────────────────────────────
# Use custom-prefixed keys to avoid Lambda reserved var conflicts
CUSTOM_AWS_ACCESS_KEY_ID=AKIA...
CUSTOM_AWS_SECRET_ACCESS_KEY=your_secret_key
CUSTOM_AWS_REGION=us-east-1
S3_BUCKET_NAME=fitsnap-ai-images

# ── Authentication (NextAuth.js) ──────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_base64_secret_string

# ── Google OAuth ──────────────────────────────────────
GOOGLE_CLIENT_ID=your_gcp_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret

# ── Razorpay Payments ────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_yourkey
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> **⚠️ Important:** Do NOT use `AWS_REGION`, `AWS_ACCESS_KEY_ID`, or `AWS_SECRET_ACCESS_KEY` as env var names — these are reserved by AWS Lambda and will cause deployment failures. Use the `CUSTOM_` prefix instead.

### Generating `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

---

## 📡 API Reference

All API routes are Next.js App Router server-side handlers located in `src/app/api/`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/generate` | ✅ Required | Accepts `{ userImage, outfitImage }` (base64), calls Replicate IDM-VTON, uploads result to S3, deducts 1 credit, logs to history |
| `GET` | `/api/credits` | ✅ Required | Returns `{ credits: number }` from DynamoDB for the authenticated user |
| `GET` | `/api/history` | ✅ Required | Returns array of past generations `[{ userId, createdAt, resultUrl }]` |
| `POST` | `/api/payment/createOrder` | ✅ Required | Creates a Razorpay order `{ amount }` → returns `{ id, amount, currency }` |
| `POST` | `/api/payment/verify` | ✅ Required | Verifies Razorpay payment signature (HMAC-SHA256), atomically credits user balance |
| `*` | `/api/auth/[...nextauth]` | — | NextAuth.js OAuth callbacks (Google sign-in/sign-out/session) |

### Generate Endpoint Example

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "userImage": "data:image/jpeg;base64,...",
    "outfitImage": "data:image/jpeg;base64,..."
  }'
```

**Response:**
```json
{
  "resultUrl": "https://fitsnap-ai-images.s3.us-east-1.amazonaws.com/generated-outfits/fitsnap-1711700000000-abc123.jpg"
}
```

---

## 📜 Available Scripts

Run these from the `fitsnap-ai/` directory:

| Script | Command | Description |
|--------|---------|-------------|
| **Dev Server** | `npm run dev` | Starts Next.js development server on port 3000 |
| **Production Build** | `npm run build` | Compiles Next.js standalone output to `.next/` |
| **Lambda Build** | `npm run build:lambda` | Builds for Lambda: compiles + copies `public/` and `.next/static/` into standalone |
| **Full Deploy** | `npm run deploy` | Runs `build:lambda` then `serverless deploy` |
| **Start** | `npm start` | Runs production build locally (requires `npm run build` first) |
| **Lint** | `npm run lint` | Runs ESLint on the codebase |

---

## ☁️ Deployment (CI/CD)

### How It Works

The project uses **GitHub Actions** (`.github/workflows/deploy.yml`) to automatically deploy on every push to `main`:

```
Push to main → npm ci → chmod +x run.sh → next build (standalone)
                → copy assets into standalone → serverless deploy --stage prod
```

The Lambda function uses **AWS Lambda Web Adapter** — a layer that bridges API Gateway events to a standard HTTP server. Instead of a traditional Lambda handler, it executes `run.sh` which starts the Next.js standalone server:

```bash
#!/bin/bash
[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache
HOSTNAME=0.0.0.0 exec node .next/standalone/server.js
```

### Setup Steps

1. **Add GitHub Secrets** — Go to your repo → **Settings** → **Secrets and variables** → **Actions** and add all env vars:

   | Secret Name | Value |
   |-------------|-------|
   | `CUSTOM_AWS_ACCESS_KEY_ID` | Your IAM access key |
   | `CUSTOM_AWS_SECRET_ACCESS_KEY` | Your IAM secret key |
   | `REPLICATE_API_TOKEN` | Replicate API token |
   | `S3_BUCKET_NAME` | S3 bucket name |
   | `NEXTAUTH_URL` | Production URL (e.g., `https://your-api-id.execute-api.us-east-1.amazonaws.com`) |
   | `NEXTAUTH_SECRET` | NextAuth encryption secret |
   | `GOOGLE_CLIENT_ID` | Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
   | `RAZORPAY_KEY_ID` | Razorpay key ID |
   | `RAZORPAY_KEY_SECRET` | Razorpay key secret |

2. **Push to `main`** — The workflow triggers automatically.

3. **Get your URL** — After successful deployment, the API Gateway URL is printed in the GitHub Actions logs.

### AWS Resources Created

The Serverless Framework automatically provisions:

| Resource | Type | Purpose |
|----------|------|---------|
| `fitsnap-ai-prod-web` | Lambda Function | Runs the Next.js app (1024 MB, 30s timeout) |
| `LambdaAdapterLayerX86:27` | Lambda Layer | AWS Lambda Web Adapter for HTTP bridging |
| `HttpApi` | API Gateway v2 | Routes all HTTP traffic to the Lambda function |
| `WebLogGroup` | CloudWatch Logs | Lambda execution logs |
| `IamRoleLambdaExecution` | IAM Role | Execution permissions for the Lambda function |

> **Note:** DynamoDB tables (`users`, `generations`) and the S3 bucket must be created manually or via a separate IaC stack. They are not provisioned by `serverless.yml`.

### Manual Deploy (without CI/CD)

```bash
cd fitsnap-ai

# Set env vars in your shell
export CUSTOM_AWS_ACCESS_KEY_ID=AKIA...
export CUSTOM_AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
# ... (all other env vars)

# Build and deploy
npm run deploy
```

---

## 🗄 AWS Setup Guide

### DynamoDB Tables

Create two tables in the `us-east-1` region:

**`users` table:**
| Attribute | Type | Key |
|-----------|------|-----|
| `userId` | String | Partition Key |
| `credits` | Number | — |

**`generations` table:**
| Attribute | Type | Key |
|-----------|------|-----|
| `userId` | String | Partition Key |
| `createdAt` | String (ISO 8601) | Sort Key |
| `resultUrl` | String | — |

### S3 Bucket

1. Create a bucket (e.g., `fitsnap-ai-images`) in `us-east-1`
2. Enable public access for the `generated-outfits/` prefix (or configure CloudFront)
3. Add a bucket policy allowing `s3:PutObject` from your IAM user

### IAM User

Create an IAM user with the following permissions:
- `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem` on both tables
- `s3:PutObject` on your S3 bucket
- Use the access key/secret as `CUSTOM_AWS_ACCESS_KEY_ID` and `CUSTOM_AWS_SECRET_ACCESS_KEY`

---

## 🔐 Security Notes

- **All API routes are session-gated** — `getServerSession()` validates the NextAuth JWT before processing any request
- **Credit deduction is server-side** — Credits are checked and atomically decremented in DynamoDB with `ConditionExpression: "credits > :min"` preventing race conditions
- **Payment verification uses HMAC-SHA256** — Razorpay signatures are verified server-side before crediting the user, preventing forged payment callbacks
- **AWS credentials use custom prefixes** — `CUSTOM_AWS_*` env vars prevent conflicts with Lambda's reserved environment variables
- **No secrets in client bundles** — All sensitive tokens are server-side only; only `NEXT_PUBLIC_RAZORPAY_KEY_ID` (the publishable key) is exposed to the browser

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ☕ and AI by [DEV-GHILDIYAL](https://github.com/DEV-GHILDIYAL)

</div>