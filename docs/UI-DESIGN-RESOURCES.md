# UI Design Resources & Search Tool

## 🎨 Tổng quan

Công cụ tìm kiếm thiết kế UI/UX giúp bạn nhanh chóng tìm các mẫu thiết kế đẹp từ các trang chia sẻ mã nguồn phổ biến.

## 📦 Cài đặt

Công cụ đã được tích hợp sẵn trong dự án. Để sử dụng:

```bash
# Tạo file cấu hình
npm run ui:config

# Tìm kiếm thiết kế
npm run ui:search [từ khóa...]

# Tìm component cụ thể  
npm run ui:component [loại]
```

## 🚀 Cách sử dụng

### 1. Tìm kiếm thiết kế chung

```bash
# Tìm dashboard modern
npm run ui:search dashboard modern

# Tìm form đăng nhập
npm run ui:search login form

# Tìm card component
npm run ui:search card product
```

### 2. Tìm component cụ thể

```bash
# Tìm button examples
npm run ui:component button

# Tìm card examples  
npm run ui:component card

# Tìm form examples
npm run ui:component form

# Tìm navigation examples
npm run ui:component navigation

# Tìm dashboard examples
npm run ui:component dashboard
```

## 📚 Nguồn tài nguyên

### Component Libraries (Có mã nguồn)

1. **UIVerse** (https://uiverse.io)
   - UI elements HTML/CSS miễn phí
   - Buttons, cards, loaders, inputs
   - Copy paste ready

2. **Tailwind Components** (https://tailwindcomponents.com)
   - Components Tailwind CSS miễn phí
   - Cards, forms, navigation, marketing
   - Community driven

3. **shadcn/ui** (https://ui.shadcn.com)
   - Components hiện đại với Radix UI + Tailwind
   - Copy paste components
   - TypeScript support

4. **Flowbite** (https://flowbite.com)
   - Tailwind CSS components & templates
   - Interactive components
   - Pro templates available

5. **DaisyUI** (https://daisyui.com)
   - Tailwind CSS component library
   - Semantic class names
   - Multiple themes

6. **Material-UI** (https://mui.com)
   - React components
   - Material Design
   - Enterprise ready

7. **Ant Design** (https://ant.design)
   - Enterprise design language
   - React components
   - Design resources

8. **Chakra UI** (https://chakra-ui.com)
   - Modular component library
   - Dark mode support
   - Accessible by default

### Free Code Resources

1. **Free Frontend** (https://freefrontend.com)
   - HTML, CSS, JavaScript examples
   - Categorized by framework
   - Updated regularly

2. **CodeMyUI** (https://codemyui.com)
   - Curated web design inspiration
   - With code snippets
   - Pure CSS, Bootstrap, JS

3. **CSS Author** (https://cssauthor.com)
   - Design & development resources
   - UI kits, templates
   - Free & premium

## 💡 Tips sử dụng

### Cho Dashboard/Admin Panel
- Tìm trên: Flowbite, Tailwind Components, Material-UI
- Keywords: dashboard, admin, analytics, chart

### Cho Landing Page
- Tìm trên: Tailwind Components, UIVerse, Free Frontend
- Keywords: hero, landing, marketing, cta

### Cho E-commerce
- Tìm trên: Flowbite, Tailwind Components
- Keywords: product, cart, checkout, shop

### Cho Forms
- Tìm trên: shadcn/ui, Flowbite, DaisyUI
- Keywords: form, input, validation, login

## 📋 Kết quả lưu trữ

Kết quả tìm kiếm được lưu trong file:
- `design-search-results.json` - Danh sách nguồn tài nguyên
- `.mcp/ui-design-search.json` - File cấu hình

## 🔧 Tùy chỉnh

Để thêm nguồn mới, chỉnh sửa file `scripts/search-ui-designs.js`:

```javascript
const DESIGN_SOURCES = {
  // Thêm nguồn mới
  mySource: {
    name: 'My Source',
    baseUrl: 'https://example.com',
    description: 'Description',
    categories: ['category1', 'category2']
  }
};
```

## 🎯 Best Practices

1. **Kiểm tra License**: Đảm bảo component có license phù hợp
2. **Responsive Design**: Chọn components hỗ trợ responsive
3. **Accessibility**: Ưu tiên components có accessibility tốt
4. **Performance**: Kiểm tra kích thước và performance
5. **Customization**: Chọn components dễ tùy chỉnh

## 🌟 Recommended cho dự án

Với tech stack hiện tại (React + Tailwind + TypeScript):

1. **shadcn/ui** - Best choice cho TypeScript projects
2. **Tailwind Components** - Nhiều lựa chọn miễn phí
3. **Flowbite** - Components chất lượng cao
4. **DaisyUI** - Nếu muốn semantic classes

## 📝 Notes

- Script này chỉ cung cấp links, không tự động tải code
- Luôn kiểm tra compatibility với phiên bản React/Tailwind
- Một số components có thể cần điều chỉnh cho phù hợp
- Premium components thường có documentation tốt hơn
