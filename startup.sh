#!/bin/bash

# Script tự động khởi động QataLog Login Web App
# Tác giả: Tự động hóa khởi động
# Ngày tạo: $(date +"%Y-%m-%d")

echo "🚀 Đang khởi động QataLog Login Web App..."
echo "================================================"

# Màu sắc cho terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Đường dẫn đến project
PROJECT_DIR="/Users/nih/web app/webapp/BLN/qatalog-login"

# Chuyển đến thư mục project
echo -e "${BLUE}📁 Chuyển đến thư mục project...${NC}"
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ Không thể truy cập thư mục project!${NC}"
    exit 1
}

# Kiểm tra Node.js
echo -e "${BLUE}🔍 Kiểm tra Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js chưa được cài đặt!${NC}"
    echo -e "${YELLOW}📥 Vui lòng cài đặt Node.js từ https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Kiểm tra npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm chưa được cài đặt!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# Kiểm tra file package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Không tìm thấy package.json!${NC}"
    exit 1
fi

# Kiểm tra node_modules
echo -e "${BLUE}📦 Kiểm tra dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules không tồn tại. Đang cài đặt dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Cài đặt dependencies thất bại!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies đã được cài đặt thành công!${NC}"
else
    echo -e "${GREEN}✅ Dependencies đã sẵn sàng!${NC}"
fi

# Kiểm tra Supabase CLI
echo -e "${BLUE}🗄️  Kiểm tra Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI chưa được cài đặt globally.${NC}"
    echo -e "${BLUE}📥 Sử dụng npx để chạy Supabase...${NC}"
fi

# Kiểm tra file environment
echo -e "${BLUE}🔧 Kiểm tra file cấu hình...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Không tìm thấy file .env.local!${NC}"
    echo -e "${YELLOW}📄 Vui lòng tạo file .env.local với cấu hình Supabase${NC}"
    exit 1
fi

echo -e "${GREEN}✅ File cấu hình đã sẵn sàng!${NC}"

# Menu lựa chọn
echo ""
echo -e "${BLUE}🎯 Chọn chế độ khởi động:${NC}"
echo -e "${GREEN}1)${NC} Chỉ khởi động Web App (dev)"
echo -e "${GREEN}2)${NC} Khởi động Web App + Supabase Local Database (dev:full)"
echo -e "${GREEN}3)${NC} Khởi động chế độ production preview"
echo -e "${GREEN}4)${NC} Kiểm tra và khởi động database Supabase"
echo -e "${GREEN}5)${NC} Thoát"
echo ""

read -p "Nhập lựa chọn của bạn (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🌐 Khởi động Web App (Development mode)...${NC}"
        echo -e "${YELLOW}📱 App sẽ chạy tại: http://localhost:5173${NC}"
        echo -e "${YELLOW}⏹️  Nhấn Ctrl+C để dừng server${NC}"
        echo ""
        npm run dev
        ;;
    2)
        echo -e "${BLUE}🌐 Khởi động Web App + Database (Full Development mode)...${NC}"
        echo -e "${YELLOW}📱 App sẽ chạy tại: http://localhost:5173${NC}"
        echo -e "${YELLOW}🗄️  Database dashboard: http://localhost:54323${NC}"
        echo -e "${YELLOW}⏹️  Nhấn Ctrl+C để dừng cả hai services${NC}"
        echo ""
        npm run dev:full
        ;;
    3)
        echo -e "${BLUE}🏗️  Building application...${NC}"
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Build thành công!${NC}"
            echo -e "${BLUE}🌐 Khởi động Preview mode...${NC}"
            echo -e "${YELLOW}📱 Preview sẽ chạy tại: http://localhost:4173${NC}"
            npm run preview
        else
            echo -e "${RED}❌ Build thất bại!${NC}"
            exit 1
        fi
        ;;
    4)
        echo -e "${BLUE}🗄️  Khởi động Supabase Local Database...${NC}"
        echo -e "${YELLOW}🗄️  Database dashboard sẽ chạy tại: http://localhost:54323${NC}"
        echo -e "${YELLOW}⏹️  Nhấn Ctrl+C để dừng database${NC}"
        echo ""
        npm run db:start
        ;;
    5)
        echo -e "${YELLOW}👋 Tạm biệt!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
        exit 1
        ;;
esac
