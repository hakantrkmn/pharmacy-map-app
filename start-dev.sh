#!/bin/bash

# Start development servers for pharmacy map app with Redis caching

echo "🚀 Starting Pharmacy Map App with Redis Caching..."

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please create backend/.env with REDIS_URL configuration"
    exit 1
fi

# Start backend server
echo "📡 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📡 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for both processes
wait
