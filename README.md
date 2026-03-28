# FitSnap AI 🪞✨

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/AWS-Lambda%20%7C%20DynamoDB-orange?style=for-the-badge&logo=amazon-aws" alt="AWS" />
  <img src="https://img.shields.io/badge/Razorpay-Integrated-blue?style=for-the-badge&logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/AI-Replicate%20%7C%20IDM--VTON-violet?style=for-the-badge&logo=openai" alt="AI Model" />
</div>

<br />

**FitSnap AI** is a production-grade SaaS application that leverages advanced AI models (Replicate IDM-VTON) to let users virtually try on outfits instantly. Built with a pristine two-column SaaS architecture, it manages secure user sessions, AWS-based credit balances, and features a full-stack e-commerce styled `Fashion Catalog` that auto-hydrates the trial studio.

## 🚀 Key Features

- **AI Virtual Try-On**: Seamlessly map any user's face/body onto clothing items utilizing state-of-the-art Replicate diffusion models.
- **SaaS App Shell**: Fully responsive Next.js Layout grid with a locked intuitive sidebar replacing traditional navigation.
- **Dynamic Fashion Catalog**: A categorized wardrobe exploring Men's, Women's, and Traditional wear natively injecting items securely into the studio via URL Parameters.
- **Monetization Engine**: Integrated secure Razorpay checkout gateway tied directly to HMAC SHA256 Webhooks verifying payments dynamically before crediting DynamoDB balances.
- **Serverless AWS Setup**: Automated CI/CD architecture utilizing GitHub Actions to run CI and deploy strictly natively via Web Adapters onto AWS Lambda.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS Modules
- **Backend**: Next.js Serverless API Routes
- **Database / Storage**: AWS DynamoDB (for User Balances), AWS S3 (for Image hosting)
- **Authentication**: NextAuth.js (Google Providers)
- **Deployment**: Serverless Framework (v3/v4), AWS Lambda, GitHub Actions (CI/CD)

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js `20.x` or higher
- An AWS Account (For S3 and DynamoDB)
- Replicate API Token
- Razorpay Account (Test Mode)

### 2. Installation Setup
Clone the repository, navigate into the nested codebase, and initialize NPM:
```bash
git clone https://github.com/YourUsername/FitSnap-AI.git
cd FitSnap-AI/fitsnap-ai
npm install
```

### 3. Environment Variables
Create a `.env.local` file inside the `fitsnap-ai/` directory requiring the following infrastructure keys:

```ini
# FitSnap AI AI Engine
REPLICATE_API_TOKEN=your_replicate_token

# AWS Core Services
CUSTOM_AWS_ACCESS_KEY_ID=your_aws_access_key
CUSTOM_AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=fitsnap-ai-images
AWS_REGION=us-east-1

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secure_base64_string
GOOGLE_CLIENT_ID=your_gcp_oauth_client_id
GOOGLE_CLIENT_SECRET=your_gcp_oauth_secret

# Financial Gateway
RAZORPAY_KEY_ID=rzp_test_yourkey
RAZORPAY_KEY_SECRET=rzp_test_yoursecret
```

### 4. Run the Application
Boot the Next.js development server.
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the local studio.

---

## 🌍 Infrastructure Deployment (CI/CD)

This monorepo utilizes an automated GitHub Action workflow `.github/workflows/deploy.yml` that monitors the `main` branch. 

**Steps to enable automated deployments:**
1. Navigate to **Settings > Secrets and variables > Actions** in your GitHub repository.
2. Store your exact `.env.local` keys as explicit **Repository Secrets**.
3. Push to `main`. 

GitHub's Linux servers will spawn, boot the environment, hook the `serverless` compiler natively via AWS, and push the Edge-Ready package to Lambda/API Gateway instances instantly.