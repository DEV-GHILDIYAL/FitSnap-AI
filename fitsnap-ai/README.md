# FitSnap AI — AI-powered Virtual Try-On

FitSnap AI is a high-performance SaaS application that allows users to virtually try on outfits using AI.

## 🚀 Deployment Checklist

### 1. Infrastructure (AWS)
- **DynamoDB Tables**:
  - `users`: Partition Key `userId` (String).
  - `generations`: Partition Key `userId` (String), Sort Key `createdAt` (String).
- **S3 Bucket**: Create a bucket for storing generated images. Ensure the bucket policy allows public reads if using direct S3 URLs.

### 2. Environment Configuration
Create a `.env.local` file with the following:
- `GOOGLE_CLIENT_ID` / `SECRET` (from Google Cloud Console)
- `REPLICATE_API_TOKEN` (from [Replicate](https://replicate.com))
- `RAZORPAY_KEY_ID` / `SECRET` (from Razorpay Dashboard)
- `CUSTOM_AWS_ACCESS_KEY_ID` / `SECRET` (AWS User with DDB/S3 permissions)
- `S3_BUCKET_NAME` (Your AWS bucket name)

### 3. Build & Deploy
```bash
npm install
npm run build
npm run deploy # Deploys to AWS Lambda via Serverless
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:lambda` | Build for AWS Lambda (standalone + asset copy) |
| `npm run deploy` | Build + deploy to AWS Lambda via Serverless |
| `npm run lint` | Run ESLint |

