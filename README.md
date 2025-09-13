# 📡 Boiler Mate - Telecom Hackathon App

A hackathon-ready boilerplate for telecom network management and analytics. Built with modern tech stack for rapid development and easy customization when PRD is provided.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- npm/yarn

### Backend Setup (Express.js)
```bash
cd backend
npm install
cp env.example .env
npm run dev
```
Backend runs on: http://localhost:3000

### Frontend Setup (React + Vite)
```bash
cd frontend
npm install
cp env.example .env
npm start
```
Frontend runs on: http://localhost:3001

### ML Service Setup (Optional - Flask)
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```
ML Service runs on: http://localhost:5000

## 🏗️ Project Structure

```
hackathon-app/
├── backend/                # Express API
│   ├── src/
│   │   ├── config/        # DB & env setup (placeholder)
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Mongoose schemas (placeholder)
│   │   └── app.js         # Express setup
│   ├── env.example
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Tailwind CSS
│   │   └── App.jsx        # React Router setup
│   ├── env.example
│   └── package.json
├── ml-service/            # Optional Flask ML service
│   ├── app.py             # Flask app with /predict
│   └── requirements.txt
└── README.md
```

## 🔧 API Endpoints

### Backend (Express)
- `GET /api/health` - Health check
- `GET /api/network/data` - Get network tower data
- `GET /api/network/stats` - Get network statistics
- `POST /api/network/analyze` - Analyze network performance

### ML Service (Flask)
- `GET /health` - Health check
- `POST /predict` - Single tower prediction
- `POST /analyze` - Multi-tower analysis

## 🎨 Features

### Current (Mock Data)
- ✅ Network tower data visualization
- ✅ Real-time statistics dashboard
- ✅ Responsive UI with Tailwind CSS
- ✅ React Router navigation
- ✅ Mock ML predictions
- ✅ Health check endpoints

### Ready for PRD Customization
- 🔄 Database integration (MongoDB placeholder)
- 🔄 Real-time data streaming
- 🔌 External API integrations
- 🤖 Advanced ML models
- 📊 Custom analytics dashboards
- 🔐 Authentication system
- 📱 Mobile responsiveness

## 🛠️ Tech Stack

- **Backend**: Express.js, Node.js, CORS
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **ML Service**: Flask, scikit-learn, pandas, numpy
- **Development**: Hot reload, ESLint, Prettier ready

## 🚀 Development Commands

```bash
# Backend
npm run dev          # Start with nodemon
npm start           # Production start

# Frontend  
npm start           # Start Vite dev server
npm run build       # Build for production

# ML Service
python app.py       # Start Flask server
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_ML_SERVICE_URL=http://localhost:5000
```

## 🎯 Hackathon Ready Features

1. **Modular Architecture**: Easy to add/remove features
2. **Mock Data**: Ready to run without external dependencies
3. **Modern UI**: Professional look with Tailwind CSS
4. **API Ready**: RESTful endpoints for all services
5. **ML Integration**: Optional AI/ML service for predictions
6. **Responsive Design**: Works on desktop and mobile
7. **Error Handling**: Proper error states and loading indicators
8. **Documentation**: Clear setup and customization guide

## 🔄 Customization Guide

When PRD is provided:

1. **Database**: Add MongoDB connection in `backend/src/config/`
2. **Models**: Create Mongoose schemas in `backend/src/models/`
3. **Controllers**: Update business logic in `backend/src/controllers/`
4. **Frontend**: Add new pages in `frontend/src/pages/`
5. **Components**: Create reusable UI in `frontend/src/components/`
6. **ML Models**: Replace mock predictions in `ml-service/app.py`

## 🐛 Troubleshooting

- **Port conflicts**: Change ports in respective `.env` files
- **CORS issues**: Check backend CORS configuration
- **Build errors**: Ensure Node.js 16+ and Python 3.8+
- **Dependencies**: Run `npm install` in each directory

## 📞 Support

This boilerplate is designed for rapid hackathon development. All services include proper error handling and logging for easy debugging.

---

**Happy Hacking! 🚀📡**

*Built with ❤️ for the telecom hackathon*


