# Budgeto: Smart Finance Manager 💰

A modern, AI-powered personal finance management web application built with Next.js 14, featuring voice input and OCR receipt scanning.

## 🚀 Features

- **Dashboard**: View financial summary with total income, expenses, and balance
- **Expense Tracking**: Add and manage expenses with categories
- **Income Tracking**: Record and track income sources
- **AI-Powered Features**:
  - 🎤 **Voice Input**: Use Web Speech API to fill forms with voice commands
  - 📄 **OCR Receipt Scanning**: Upload receipt images to automatically extract expense details using Tesseract.js
- **Data Visualization**: Interactive charts showing income vs expenses and category breakdowns
- **Predictions**: AI-assisted expense trend predictions based on recent entries

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (Mongoose)
- **Charts**: Recharts
- **OCR**: Tesseract.js
- **Voice Recognition**: Web Speech API
- **Deployment**: Vercel


## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Modern browser with Web Speech API support (Chrome, Edge)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string_here
AUTH_SECRET=generate_a_long_random_string
```

Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas connection string.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
smart-finance-manager/
├── app/
│   ├── actions/          # Server Actions (addExpense, addIncome)
│   ├── api/              # API Routes (expenses, income, predictions)
│   ├── dashboard/        # Dashboard page
│   ├── expenses/         # Expenses page
│   ├── income/           # Income page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/           # React components
│   ├── ExpenseForm.tsx   # Expense form with OCR and voice input
│   ├── ExpenseTable.tsx  # Expense table display
│   ├── IncomeForm.tsx    # Income form with voice input
│   └── VoiceInput.tsx    # Voice-to-text component
├── lib/                  # Utility functions
│   ├── mongodb.ts        # MongoDB connection helper
│   └── ocr.ts            # OCR text extraction
├── models/               # Mongoose models
│   ├── Expense.ts        # Expense schema
│   └── Income.ts         # Income schema
└── package.json
```

## 🎯 Usage

### Adding Expenses

1. Navigate to the **Expenses** page
2. Fill in the form manually, OR:
   - Click the **Voice Input** button to speak the title
   - Upload a receipt image to auto-fill using OCR
3. Select category and date
4. Submit the form

### Adding Income

1. Navigate to the **Income** page
2. Fill in the form (similar to expenses)
3. Use voice input for quick entry

### Viewing Dashboard

- See financial summary cards
- View interactive charts
- Check expense predictions
- Browse recent expenses

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your `MONGODB_URI` environment variable in Vercel dashboard
4. Deploy!

The app is optimized for Vercel deployment with:
- Server Actions for form submissions
- API routes for data fetching
- Cached MongoDB connections for serverless functions

## 📝 Notes

- **Voice Input**: Works best in Chrome or Edge browsers
- **OCR**: First-time OCR processing may take a few seconds as Tesseract.js loads the language model
- **Database**: Uses connection caching to prevent multiple connections in serverless environments

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available for educational purposes.

---

Built with ❤️ using Next.js 14

