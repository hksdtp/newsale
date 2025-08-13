#!/bin/bash

# Script khởi động web app bằng Docker

echo "🐳 Docker Web App Launcher"
echo "=========================="
echo ""
echo "Chọn môi trường:"
echo "1) Development (port 3000)"
echo "2) Production (port 80)"
echo "3) Development + Supabase"
echo "4) Dừng tất cả containers"
echo "5) Xem logs"
echo ""

read -p "Nhập lựa chọn (1-5): " choice

case $choice in
    1)
        echo "🚀 Khởi động môi trường Development..."
        docker-compose --profile dev up --build -d app-dev
        echo "✅ App đang chạy tại: http://localhost:3000"
        ;;
    2)
        echo "🚀 Khởi động môi trường Production..."
        docker-compose --profile prod up --build -d app-prod
        echo "✅ App đang chạy tại: http://localhost"
        ;;
    3)
        echo "🚀 Khởi động Development + Supabase..."
        docker-compose --profile dev --profile supabase up --build -d
        echo "✅ App đang chạy tại: http://localhost:3000"
        echo "✅ Supabase Studio: http://localhost:54321"
        ;;
    4)
        echo "⏹️  Dừng tất cả containers..."
        docker-compose down
        echo "✅ Đã dừng tất cả containers"
        ;;
    5)
        echo "📋 Xem logs..."
        docker-compose logs -f
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ"
        exit 1
        ;;
esac
