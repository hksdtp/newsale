#!/bin/bash

# Docker Startup Script with MCP Integration
# Tác giả: AI Assistant
# Mô tả: Khởi động webapp với Docker và cấu hình MCP servers

echo "🚀 Khởi động NewsAle Web App với Docker + MCP Integration"
echo "================================================================"

# Màu sắc cho terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Kiểm tra Docker
echo -e "${BLUE}🔍 Kiểm tra Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker chưa được cài đặt!${NC}"
    echo -e "${YELLOW}📥 Vui lòng cài đặt Docker từ https://docker.com${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose chưa được cài đặt!${NC}"
    echo -e "${YELLOW}📥 Vui lòng cài đặt Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker version: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose version: $(docker-compose --version)${NC}"

# Kiểm tra file cấu hình
echo -e "${BLUE}📋 Kiểm tra file cấu hình...${NC}"

if [ ! -f ".env.docker" ]; then
    echo -e "${YELLOW}⚠️  File .env.docker không tồn tại. Tạo từ template...${NC}"
    cp .env.example .env.docker
    echo -e "${YELLOW}📝 Vui lòng cập nhật .env.docker với thông tin thực tế${NC}"
fi

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ File docker-compose.yml không tồn tại!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ File cấu hình đã sẵn sàng!${NC}"

# Kiểm tra MCP servers
echo -e "${BLUE}🤖 Kiểm tra MCP servers...${NC}"

# Kiểm tra Human-MCP
if command -v human-mcp &> /dev/null; then
    echo -e "${GREEN}✅ Human-MCP đã được cài đặt globally${NC}"
elif command -v npx &> /dev/null; then
    echo -e "${GREEN}✅ Human-MCP có thể chạy qua npx${NC}"
else
    echo -e "${YELLOW}⚠️  Cài đặt Human-MCP...${NC}"
    npm install -g @goonnguyen/human-mcp
fi

# Kiểm tra Serena MCP
if command -v uvx &> /dev/null; then
    echo -e "${GREEN}✅ Serena MCP có thể chạy qua uvx${NC}"
else
    echo -e "${YELLOW}⚠️  uvx chưa được cài đặt. Serena MCP có thể không hoạt động${NC}"
fi

# Menu lựa chọn
echo ""
echo -e "${BLUE}🎯 Chọn chế độ khởi động:${NC}"
echo -e "${GREEN}1)${NC} Development mode (app + database)"
echo -e "${GREEN}2)${NC} Production mode"
echo -e "${GREEN}3)${NC} Chỉ database services"
echo -e "${GREEN}4)${NC} Full stack (app + database + supabase)"
echo -e "${GREEN}5)${NC} Dọn dẹp containers và volumes"
echo -e "${GREEN}6)${NC} Xem logs"
echo -e "${GREEN}7)${NC} Thoát"
echo ""

read -p "Nhập lựa chọn của bạn (1-7): " choice

case $choice in
    1)
        echo -e "${BLUE}🌐 Khởi động Development mode...${NC}"
        echo -e "${YELLOW}📱 App sẽ chạy tại: http://localhost:3000${NC}"
        echo -e "${YELLOW}🗄️  Database: http://localhost:8080 (pgAdmin)${NC}"
        echo -e "${YELLOW}📊 Redis: localhost:6379${NC}"
        echo ""
        
        # Load environment variables
        export $(cat .env.docker | grep -v '^#' | xargs)
        
        # Start development services
        docker-compose --profile dev up --build -d
        
        echo -e "${GREEN}✅ Services đã khởi động!${NC}"
        echo -e "${PURPLE}🤖 MCP Servers có sẵn:${NC}"
        echo -e "   • Serena MCP: Code manipulation, file operations"
        echo -e "   • Human-MCP: Visual analysis, UI debugging"
        echo ""
        echo -e "${BLUE}📋 Thông tin truy cập:${NC}"
        echo -e "   • Web App: http://localhost:3000"
        echo -e "   • pgAdmin: http://localhost:8080 (admin@newsale.com / admin123)"
        echo -e "   • PostgreSQL: localhost:5432"
        echo -e "   • Redis: localhost:6379"
        ;;
    2)
        echo -e "${BLUE}🏗️  Khởi động Production mode...${NC}"
        echo -e "${YELLOW}📱 App sẽ chạy tại: http://localhost:80${NC}"
        echo ""
        
        # Load environment variables
        export $(cat .env.docker | grep -v '^#' | xargs)
        export NODE_ENV=production
        
        # Start production services
        docker-compose --profile prod up --build -d
        
        echo -e "${GREEN}✅ Production server đã khởi động!${NC}"
        echo -e "${BLUE}📋 Truy cập: http://localhost:80${NC}"
        ;;
    3)
        echo -e "${BLUE}🗄️  Khởi động Database services...${NC}"
        echo ""
        
        # Start only database services
        docker-compose --profile db up -d
        
        echo -e "${GREEN}✅ Database services đã khởi động!${NC}"
        echo -e "${BLUE}📋 Thông tin truy cập:${NC}"
        echo -e "   • pgAdmin: http://localhost:8080"
        echo -e "   • PostgreSQL: localhost:5432"
        echo -e "   • Redis: localhost:6379"
        ;;
    4)
        echo -e "${BLUE}🚀 Khởi động Full stack...${NC}"
        echo ""
        
        # Load environment variables
        export $(cat .env.docker | grep -v '^#' | xargs)
        
        # Start all services
        docker-compose --profile dev --profile supabase up --build -d
        
        echo -e "${GREEN}✅ Full stack đã khởi động!${NC}"
        echo -e "${BLUE}📋 Thông tin truy cập:${NC}"
        echo -e "   • Web App: http://localhost:3000"
        echo -e "   • pgAdmin: http://localhost:8080"
        echo -e "   • Supabase Studio: http://localhost:54321"
        echo -e "   • Supabase DB: localhost:54322"
        ;;
    5)
        echo -e "${YELLOW}🧹 Dọn dẹp containers và volumes...${NC}"
        echo ""
        
        # Stop and remove containers
        docker-compose down --volumes --remove-orphans
        
        # Remove unused images
        docker image prune -f
        
        echo -e "${GREEN}✅ Dọn dẹp hoàn tất!${NC}"
        ;;
    6)
        echo -e "${BLUE}📊 Xem logs...${NC}"
        echo ""
        
        # Show logs
        docker-compose logs -f --tail=100
        ;;
    7)
        echo -e "${YELLOW}👋 Tạm biệt!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${PURPLE}🤖 MCP Integration Ready!${NC}"
echo -e "${BLUE}Để sử dụng MCP servers, cấu hình client của bạn với:${NC}"
echo -e "   • mcp-config.json (đã tạo sẵn)"
echo -e "   • Serena MCP: uvx mcp-server-serena"
echo -e "   • Human-MCP: npx @goonnguyen/human-mcp"
echo ""
echo -e "${GREEN}🎉 Webapp với MCP integration đã sẵn sàng!${NC}"
