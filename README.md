# Estimator GPT - Frontend

This is the React frontend for **Estimator GPT**, an AI-powered platform that helps contractors create complete construction estimates in 15–30 minutes using AI takeoffs and regional pricing intelligence.

## 🌐 Live Site

🔗 https://estimator-gpt.vercel.app

## 📦 Tech Stack

- React 18 + Vite
- Supabase (project data + file metadata)
- GPT-4o (AI document analysis + pricing)
- Tailored UI for contractors and estimators

## 📁 Folder Structure

estimator-gpt-frontend/
├── src/
│ ├── components/ # All 7 tab components
│ │ ├── FilesTab.jsx
│ │ ├── SummaryTab.jsx
│ │ ├── TakeoffTab.jsx
│ │ ├── TablesTab.jsx
│ │ ├── DiscussionTab.jsx
│ │ ├── NotesTab.jsx
│ │ ├── AnalyticsDashboard.jsx
│ │ └── analytics/ # Charts and dashboards
│ ├── App.jsx # Main layout and tab controller
│ └── config.js # Backend API URL config
├── vite.config.js
├── .env.production
├── index.html

bash
Copy
Edit

## 🚀 Getting Started (Local Development)

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
