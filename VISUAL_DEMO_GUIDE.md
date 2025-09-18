# 🎬 Visual Demo Guide - Thêm công việc con trong TaskDetailModal

## 📱 **Demo Workflow**

### **Step 1: Mở TaskDetailModal**
```
🖥️ Browser: http://localhost:3000
👆 Click: Bất kỳ task nào trong danh sách
📱 Result: Modal mở ra với chi tiết task
```

### **Step 2: Tìm section "Danh sách công việc con"**
```
📍 Location: Scroll xuống trong modal
👀 Look for: Section với icon ✅ và title "Danh sách công việc con"
📊 Counter: Hiển thị (X/Y) bên cạnh title
```

### **Step 3A: Trường hợp chưa có items (Empty State)**
```
📋 Display: "Danh sách công việc con (0/0)"
🎯 Target: Nút "Thêm công việc con đầu tiên" (center của section)
🎨 Style: Nút màu xanh lá với icon ➕
👆 Action: Click vào nút
```

### **Step 3B: Trường hợp đã có items**
```
📋 Display: "Danh sách công việc con (2/5)" (ví dụ)
🎯 Target: Nút "Thêm mục" (góc phải header)
🎨 Style: Nút nhỏ màu xanh lá với icon ➕
👆 Action: Click vào nút
```

### **Step 4: Input field xuất hiện**
```
✨ Animation: Input field fade in
🎯 Focus: Cursor tự động vào input
📝 Placeholder: "Nhập nội dung công việc con..."
⌨️ Ready: Sẵn sàng nhập text
```

### **Step 5: Nhập nội dung**
```
⌨️ Type: "Gọi điện xác nhận lịch hẹn với khách hàng"
👀 Visual: Text xuất hiện real-time trong input
🎨 Style: Text màu trắng trên nền tối
```

### **Step 6A: Lưu bằng Enter**
```
⌨️ Press: Enter key
⚡ Action: Instant save
✨ Animation: Input field disappears
📋 Result: Item mới xuất hiện trong danh sách
📊 Update: Counter thay đổi (0/0) → (0/1)
```

### **Step 6B: Lưu bằng Check button**
```
👆 Click: Icon ✅ màu xanh lá bên phải input
⚡ Action: Save item
✨ Animation: Input field disappears
📋 Result: Item mới xuất hiện trong danh sách
```

### **Step 6C: Hủy bằng ESC**
```
⌨️ Press: Escape key
⚡ Action: Cancel input
✨ Animation: Input field disappears
📋 Result: Không có item mới, trở về trạng thái ban đầu
```

### **Step 6D: Hủy bằng X button**
```
👆 Click: Icon ❌ màu xám bên phải input
⚡ Action: Cancel input
✨ Animation: Input field disappears
📋 Result: Không có item mới
```

## 🎨 **Visual Elements**

### **Buttons Styling:**
```css
/* Nút "Thêm mục" (header) */
.add-item-button {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(74, 222, 128);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}

/* Nút "Thêm công việc con đầu tiên" (empty state) */
.add-first-item-button {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(74, 222, 128);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
}

/* Input field */
.checklist-input {
  background: transparent;
  color: white;
  border: none;
  outline: none;
  placeholder-color: rgb(156, 163, 175);
}

/* Save button */
.save-button {
  color: rgb(74, 222, 128);
  padding: 4px;
}

/* Cancel button */
.cancel-button {
  color: rgb(156, 163, 175);
  padding: 4px;
}
```

### **Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ TaskDetailModal                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Header: Task Title                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Task Details: Description, Status, etc.            │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✅ Danh sách công việc con (2/5)    [+ Thêm mục] │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ ☐ Gọi điện xác nhận lịch hẹn              [⚙️][🗑️] │ │ │
│ │ │ ☑️ Chuẩn bị tài liệu thuyết trình         [⚙️][🗑️] │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ ☐ [Input: Nhập nội dung...] [✅][❌]     │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📎 Tệp đính kèm (3)                                │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🎯 **Interactive Elements**

### **Hover Effects:**
- **Buttons**: Màu nền đậm hơn khi hover
- **Icons**: Màu sáng hơn khi hover
- **Input**: Border glow khi focus

### **Click Feedback:**
- **Button press**: Slight scale animation
- **Icon click**: Color change
- **Input focus**: Border highlight

### **Loading States:**
- **Saving**: Spinner icon thay thế Check icon
- **Loading items**: Skeleton placeholders
- **Error**: Red border và error message

## 📱 **Mobile Experience**

### **Touch Targets:**
```
📱 Button size: Minimum 44px height
👆 Touch area: Adequate spacing between elements
⌨️ Virtual keyboard: Auto-opens when input focused
📱 Responsive: Layout adapts to screen size
```

### **Mobile Layout:**
```
┌─────────────────────────┐
│ TaskDetailModal         │
│ ┌─────────────────────┐ │
│ │ ✅ Công việc con    │ │
│ │    (2/5)            │ │
│ │         [+ Thêm]    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ☐ Item 1      [⚙️][🗑️] │ │
│ │ ☑️ Item 2      [⚙️][🗑️] │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Input field     │ │ │
│ │ │           [✅][❌] │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## 🧪 **Testing Scenarios**

### **Happy Path:**
1. ✅ Click "Thêm mục" → Input appears
2. ✅ Type content → Text shows in input
3. ✅ Press Enter → Item saves and appears
4. ✅ Counter updates → (0/1) → (0/2)
5. ✅ Progress bar appears

### **Edge Cases:**
1. 🔍 Empty input + Enter → No save, input remains
2. 🔍 Very long text → Truncates gracefully
3. 🔍 Special characters → Saves correctly
4. 🔍 Network error → Shows error message
5. 🔍 Rapid clicks → No duplicate inputs

### **Accessibility:**
1. ♿ Keyboard navigation → Tab through elements
2. ♿ Screen reader → Proper ARIA labels
3. ♿ High contrast → Visible in all themes
4. ♿ Focus indicators → Clear visual focus

## 🎬 **Demo Script**

### **For Screen Recording:**
```
1. "Chào mừng đến với demo thêm công việc con"
2. "Đầu tiên, tôi sẽ mở một task bất kỳ"
3. "Scroll xuống phần Danh sách công việc con"
4. "Click vào nút Thêm công việc con đầu tiên"
5. "Nhập nội dung: Gọi điện xác nhận lịch hẹn"
6. "Nhấn Enter để lưu"
7. "Thấy item mới xuất hiện và counter cập nhật"
8. "Click Thêm mục để thêm item thứ 2"
9. "Nhập: Chuẩn bị tài liệu thuyết trình"
10. "Click icon Check để lưu"
11. "Demo hoàn thành - 2 items đã được thêm"
```

---

## 🎉 **Kết luận**

Visual demo guide này cung cấp:
- ✅ **Step-by-step workflow** với visual cues
- ✅ **Layout structure** và styling details  
- ✅ **Interactive elements** và animations
- ✅ **Mobile experience** considerations
- ✅ **Testing scenarios** comprehensive
- ✅ **Demo script** for recordings

**Ready for user training và documentation! 🚀**
