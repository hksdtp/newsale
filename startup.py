#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script tự động khởi động QataLog Login Web App
Hỗ trợ nhiều chế độ khởi động và kiểm tra hệ thống
"""

import os
import sys
import subprocess
import time
import json
from pathlib import Path

class Colors:
    """Màu sắc cho terminal"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    WHITE = '\033[1;37m'
    BOLD = '\033[1m'
    END = '\033[0m'

class WebAppStarter:
    def __init__(self):
        self.project_dir = Path("/Users/nih/web app/webapp/BLN/qatalog-login")
        self.package_json_path = self.project_dir / "package.json"
        self.env_path = self.project_dir / ".env.local"
        
    def print_header(self):
        """In header đẹp"""
        print(f"{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.WHITE}🚀 QataLog Login Web App Starter{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}")
        print()
        
    def check_prerequisites(self):
        """Kiểm tra các yêu cầu hệ thống"""
        print(f"{Colors.BLUE}🔍 Kiểm tra yêu cầu hệ thống...{Colors.END}")
        
        # Kiểm tra thư mục project
        if not self.project_dir.exists():
            print(f"{Colors.RED}❌ Không tìm thấy thư mục project: {self.project_dir}{Colors.END}")
            return False
            
        # Chuyển đến thư mục project
        os.chdir(self.project_dir)
        print(f"{Colors.GREEN}✅ Thư mục project: {self.project_dir}{Colors.END}")
        
        # Kiểm tra Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"{Colors.GREEN}✅ Node.js version: {result.stdout.strip()}{Colors.END}")
            else:
                print(f"{Colors.RED}❌ Node.js không hoạt động đúng{Colors.END}")
                return False
        except FileNotFoundError:
            print(f"{Colors.RED}❌ Node.js chưa được cài đặt{Colors.END}")
            print(f"{Colors.YELLOW}📥 Vui lòng cài đặt Node.js từ https://nodejs.org{Colors.END}")
            return False
            
        # Kiểm tra npm
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"{Colors.GREEN}✅ npm version: {result.stdout.strip()}{Colors.END}")
            else:
                print(f"{Colors.RED}❌ npm không hoạt động đúng{Colors.END}")
                return False
        except FileNotFoundError:
            print(f"{Colors.RED}❌ npm chưa được cài đặt{Colors.END}")
            return False
            
        # Kiểm tra package.json
        if not self.package_json_path.exists():
            print(f"{Colors.RED}❌ Không tìm thấy package.json{Colors.END}")
            return False
        print(f"{Colors.GREEN}✅ package.json tồn tại{Colors.END}")
        
        # Kiểm tra .env.local
        if not self.env_path.exists():
            print(f"{Colors.RED}❌ Không tìm thấy file .env.local{Colors.END}")
            print(f"{Colors.YELLOW}📄 Vui lòng tạo file .env.local với cấu hình Supabase{Colors.END}")
            return False
        print(f"{Colors.GREEN}✅ File cấu hình .env.local tồn tại{Colors.END}")
        
        return True
        
    def check_dependencies(self):
        """Kiểm tra và cài đặt dependencies"""
        node_modules = self.project_dir / "node_modules"
        
        if not node_modules.exists():
            print(f"{Colors.YELLOW}⚠️  node_modules không tồn tại{Colors.END}")
            print(f"{Colors.BLUE}📦 Đang cài đặt dependencies...{Colors.END}")
            
            try:
                result = subprocess.run(['npm', 'install'], check=True)
                print(f"{Colors.GREEN}✅ Dependencies đã được cài đặt thành công!{Colors.END}")
                return True
            except subprocess.CalledProcessError:
                print(f"{Colors.RED}❌ Cài đặt dependencies thất bại!{Colors.END}")
                return False
        else:
            print(f"{Colors.GREEN}✅ Dependencies đã sẵn sàng{Colors.END}")
            return True
            
    def get_package_info(self):
        """Lấy thông tin từ package.json"""
        try:
            with open(self.package_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"{Colors.RED}❌ Không thể đọc package.json: {e}{Colors.END}")
            return None
            
    def show_menu(self):
        """Hiển thị menu lựa chọn"""
        print(f"\n{Colors.BLUE}🎯 Chọn chế độ khởi động:{Colors.END}")
        print(f"{Colors.GREEN}1){Colors.END} 🌐 Khởi động Web App (Development)")
        print(f"{Colors.GREEN}2){Colors.END} 🌐🗄️  Khởi động Web App + Database (Full Dev)")
        print(f"{Colors.GREEN}3){Colors.END} 🏗️  Build và Preview (Production)")
        print(f"{Colors.GREEN}4){Colors.END} 🗄️  Chỉ khởi động Database")
        print(f"{Colors.GREEN}5){Colors.END} 🧪 Chạy Tests")
        print(f"{Colors.GREEN}6){Colors.END} 📊 Chạy Storybook")
        print(f"{Colors.GREEN}7){Colors.END} 🔧 Kiểm tra và sửa lỗi code (Lint)")
        print(f"{Colors.GREEN}8){Colors.END} 📋 Hiển thị thông tin project")
        print(f"{Colors.GREEN}9){Colors.END} 🚪 Thoát")
        print()
        
    def run_command(self, command, description):
        """Chạy lệnh với mô tả"""
        print(f"{Colors.BLUE}{description}...{Colors.END}")
        print(f"{Colors.YELLOW}⏹️  Nhấn Ctrl+C để dừng{Colors.END}")
        print()
        
        try:
            subprocess.run(command, shell=True, check=True)
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}⏹️  Đã dừng bởi người dùng{Colors.END}")
        except subprocess.CalledProcessError as e:
            print(f"{Colors.RED}❌ Lệnh thất bại với mã lỗi: {e.returncode}{Colors.END}")
            
    def show_project_info(self):
        """Hiển thị thông tin project"""
        package_info = self.get_package_info()
        if not package_info:
            return
            
        print(f"\n{Colors.PURPLE}📋 Thông tin Project:{Colors.END}")
        print(f"{Colors.CYAN}Tên:{Colors.END} {package_info.get('name', 'N/A')}")
        print(f"{Colors.CYAN}Version:{Colors.END} {package_info.get('version', 'N/A')}")
        print(f"{Colors.CYAN}Mô tả:{Colors.END} {package_info.get('description', 'N/A')}")
        
        print(f"\n{Colors.PURPLE}🔧 Scripts có sẵn:{Colors.END}")
        scripts = package_info.get('scripts', {})
        for script_name, script_command in scripts.items():
            print(f"  {Colors.GREEN}{script_name}:{Colors.END} {script_command}")
            
        # Hiển thị thông tin dependencies chính
        print(f"\n{Colors.PURPLE}📦 Dependencies chính:{Colors.END}")
        deps = package_info.get('dependencies', {})
        main_deps = ['react', 'next', 'vite', '@supabase/supabase-js', 'react-router-dom']
        for dep in main_deps:
            if dep in deps:
                print(f"  {Colors.GREEN}{dep}:{Colors.END} {deps[dep]}")
                
    def run(self):
        """Chạy ứng dụng chính"""
        self.print_header()
        
        # Kiểm tra yêu cầu hệ thống
        if not self.check_prerequisites():
            print(f"\n{Colors.RED}❌ Kiểm tra yêu cầu hệ thống thất bại!{Colors.END}")
            sys.exit(1)
            
        # Kiểm tra dependencies
        if not self.check_dependencies():
            print(f"\n{Colors.RED}❌ Kiểm tra dependencies thất bại!{Colors.END}")
            sys.exit(1)
            
        print(f"\n{Colors.GREEN}✅ Hệ thống đã sẵn sàng!{Colors.END}")
        
        while True:
            self.show_menu()
            
            try:
                choice = input(f"{Colors.BOLD}Nhập lựa chọn của bạn (1-9): {Colors.END}").strip()
                
                if choice == '1':
                    print(f"\n{Colors.BLUE}🌐 Khởi động Web App (Development mode){Colors.END}")
                    print(f"{Colors.YELLOW}📱 App sẽ chạy tại: http://localhost:5173{Colors.END}")
                    self.run_command('npm run dev', '🚀 Đang khởi động development server')
                    
                elif choice == '2':
                    print(f"\n{Colors.BLUE}🌐🗄️  Khởi động Web App + Database{Colors.END}")
                    print(f"{Colors.YELLOW}📱 App: http://localhost:5173{Colors.END}")
                    print(f"{Colors.YELLOW}🗄️  Database: http://localhost:54323{Colors.END}")
                    self.run_command('npm run dev:full', '🚀 Đang khởi động full development environment')
                    
                elif choice == '3':
                    print(f"\n{Colors.BLUE}🏗️  Build và Preview{Colors.END}")
                    self.run_command('npm run build && npm run preview', '🏗️  Đang build và khởi động preview')
                    
                elif choice == '4':
                    print(f"\n{Colors.BLUE}🗄️  Khởi động Database{Colors.END}")
                    print(f"{Colors.YELLOW}🗄️  Database dashboard: http://localhost:54323{Colors.END}")
                    self.run_command('npm run db:start', '🗄️  Đang khởi động Supabase database')
                    
                elif choice == '5':
                    print(f"\n{Colors.BLUE}🧪 Chạy Tests{Colors.END}")
                    test_choice = input("Chọn loại test (1: Unit, 2: E2E, 3: All): ").strip()
                    if test_choice == '1':
                        self.run_command('npm run test:unit', '🧪 Đang chạy unit tests')
                    elif test_choice == '2':
                        self.run_command('npm run test:e2e', '🧪 Đang chạy E2E tests')
                    elif test_choice == '3':
                        self.run_command('npm run test:all', '🧪 Đang chạy tất cả tests')
                    else:
                        self.run_command('npm run test', '🧪 Đang chạy tests')
                        
                elif choice == '6':
                    print(f"\n{Colors.BLUE}📊 Khởi động Storybook{Colors.END}")
                    print(f"{Colors.YELLOW}📊 Storybook sẽ chạy tại: http://localhost:6006{Colors.END}")
                    self.run_command('npm run storybook', '📊 Đang khởi động Storybook')
                    
                elif choice == '7':
                    print(f"\n{Colors.BLUE}🔧 Kiểm tra và sửa lỗi code{Colors.END}")
                    lint_choice = input("Chọn hành động (1: Check, 2: Fix, 3: Format): ").strip()
                    if lint_choice == '1':
                        self.run_command('npm run lint', '🔍 Đang kiểm tra code')
                    elif lint_choice == '2':
                        self.run_command('npm run lint:fix', '🔧 Đang sửa lỗi code')
                    elif lint_choice == '3':
                        self.run_command('npm run format', '💅 Đang format code')
                    else:
                        self.run_command('npm run lint', '🔍 Đang kiểm tra code')
                        
                elif choice == '8':
                    self.show_project_info()
                    input(f"\n{Colors.YELLOW}Nhấn Enter để tiếp tục...{Colors.END}")
                    
                elif choice == '9':
                    print(f"\n{Colors.YELLOW}👋 Tạm biệt!{Colors.END}")
                    break
                    
                else:
                    print(f"{Colors.RED}❌ Lựa chọn không hợp lệ! Vui lòng chọn từ 1-9.{Colors.END}")
                    
            except KeyboardInterrupt:
                print(f"\n\n{Colors.YELLOW}👋 Tạm biệt!{Colors.END}")
                break
            except Exception as e:
                print(f"{Colors.RED}❌ Lỗi: {e}{Colors.END}")

if __name__ == "__main__":
    starter = WebAppStarter()
    starter.run()
