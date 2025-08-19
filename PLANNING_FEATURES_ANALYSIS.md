# 📋 Phân tích Kỹ thuật: Tính năng Menu Kế Hoạch

## 🎯 Tổng quan Yêu cầu

### **Tính năng 1: Auto-pin công việc mới tạo vào Lịch**
- **Mục tiêu**: Tự động ghim task mới vào Menu Kế Hoạch theo ngày tạo
- **Logic**: `scheduled_date = created_at date`
- **Scope**: Tất cả task mới (không chỉ subtasks)

### **Tính năng 2: Xem công việc của thành viên khác**
- **Đối tượng**: Khổng Đức Mạnh, team_leader, retail_director
- **Chức năng**: Dropdown chọn xem task của team members
- **Hiển thị**: Multi-user calendar view

## 🔍 Phân tích Codebase Hiện tại

### **Database Schema**
```sql
-- tasks table đã có sẵn:
scheduled_date TIMESTAMP WITH TIME ZONE  ✅
scheduled_time TIME                      ✅
source VARCHAR(20) DEFAULT 'manual'      ✅
created_at TIMESTAMP WITH TIME ZONE     ✅
team_id UUID                            ✅
```

### **Components Liên quan**
1. **PlanningTab.tsx** - Main calendar component
2. **CreateTaskModal.tsx** - Task creation form
3. **taskService.ts** - Task CRUD operations
4. **schedulingService.ts** - Scheduling logic
5. **roleBasedPermissions.ts** - Permission system

### **Permission System Hiện tại**
- ✅ Đã có role-based permissions
- ✅ Khổng Đức Mạnh có `canViewAllSchedules`
- ✅ Team leader permissions đã định nghĩa
- ✅ TeamsService có `getTeamMembers()`

## 🛠️ Implementation Plan

### **Phase 1: Auto-pin Task mới (Ưu tiên cao)**

#### **1.1 Cập nhật TaskService.createTask()**
```typescript
// Trong taskService.ts - line 169
async createTask(taskData: CreateTaskData, createdById: string) {
  const dbTask = {
    // ... existing fields
    scheduled_date: new Date().toISOString(), // 🆕 Auto-pin to today
    source: 'manual' // Keep as manual for user-created tasks
  };
}
```

#### **1.2 Cập nhật CreateTaskModal**
- Thêm checkbox "Ghim vào lịch" (default: checked)
- User có thể tắt auto-pin nếu muốn

#### **1.3 Testing**
- Tạo task mới → Verify xuất hiện trong Planning tab
- Test với các role khác nhau

### **Phase 2: Multi-user Calendar View (Ưu tiên trung bình)**

#### **2.1 Cập nhật PlanningTab Component**

**2.1.1 Thêm User Selector**
```typescript
// Thêm state cho user selection
const [selectedUserId, setSelectedUserId] = useState<string>('');
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

// Load team members cho authorized users
useEffect(() => {
  if (canViewTeamSchedules) {
    loadTeamMembers();
  }
}, []);
```

**2.1.2 Permission Logic**
```typescript
const canViewTeamSchedules = 
  currentUser?.name === 'Khổng Đức Mạnh' ||
  currentUser?.role === 'team_leader' ||
  currentUser?.role === 'retail_director';
```

#### **2.2 UI Design**

**2.2.1 User Selector Dropdown**
```jsx
{canViewTeamSchedules && (
  <div className="mb-4">
    <select 
      value={selectedUserId} 
      onChange={(e) => setSelectedUserId(e.target.value)}
      className="bg-gray-700 text-white rounded-lg px-3 py-2"
    >
      <option value="">Tất cả thành viên</option>
      <option value={currentUser.id}>Công việc của tôi</option>
      {teamMembers.map(member => (
        <option key={member.id} value={member.id}>
          {member.name} ({member.role})
        </option>
      ))}
    </select>
  </div>
)}
```

**2.2.2 Calendar View Updates**
- Hiển thị avatar/tên người tạo task
- Color coding theo user
- Filter tasks theo selectedUserId

#### **2.3 Backend Updates**

**2.3.1 Cập nhật SchedulingService**
```typescript
// Thêm method mới
async getScheduledTasksForUser(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      created_by:users!tasks_created_by_id_fkey(id, name, email),
      assigned_to:users!tasks_assigned_to_id_fkey(id, name, email)
    `)
    .eq('created_by_id', userId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .not('scheduled_date', 'is', null);
    
  return data || [];
}
```

**2.3.2 Team Member Loading**
```typescript
async loadTeamMembers() {
  const currentUser = getCurrentUser();
  if (!currentUser?.team_id) return;
  
  const members = await teamsService.getTeamMembers(currentUser.team_id);
  setTeamMembers(members);
}
```

## 📅 Timeline Đề xuất

### **Week 1: Tính năng Auto-pin**
- **Day 1-2**: Cập nhật taskService.createTask()
- **Day 3**: Cập nhật CreateTaskModal UI
- **Day 4**: Testing và bug fixes
- **Day 5**: Code review và deployment

### **Week 2: Multi-user Calendar**
- **Day 1-2**: Cập nhật PlanningTab permissions
- **Day 3-4**: Implement user selector và calendar filtering
- **Day 5**: UI/UX improvements và testing

### **Week 3: Polish & Testing**
- **Day 1-2**: Integration testing
- **Day 3**: Performance optimization
- **Day 4-5**: User acceptance testing

## 🎨 UI/UX Mockup

### **User Selector Design**
```
┌─────────────────────────────────────┐
│ 👥 Xem công việc của:               │
│ ┌─────────────────────────────────┐ │
│ │ 🔽 Tất cả thành viên           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Options:                            │
│ • Tất cả thành viên                 │
│ • 👤 Công việc của tôi              │
│ • 👤 Nguyễn Văn A (team_leader)     │
│ • 👤 Trần Thị B (employee)          │
└─────────────────────────────────────┘
```

### **Calendar với Multi-user**
```
┌─────────────────────────────────────┐
│ 📅 18/08/2025                       │
│ ┌─────────────────────────────────┐ │
│ │ 🔵 Task A - Nguyễn Văn A        │ │
│ │ 🟢 Task B - Trần Thị B          │ │
│ │ 🟡 Task C - Lê Văn C            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔧 Database Changes

### **Không cần thay đổi schema**
- ✅ `scheduled_date` đã có sẵn
- ✅ `team_id` đã có sẵn  
- ✅ User relationships đã setup

### **Indexes cần thiết** (đã có)
- ✅ `idx_tasks_scheduled_date`
- ✅ `idx_tasks_team_id`
- ✅ `idx_tasks_created_by`

## 🚀 Immediate Next Steps

1. **Bắt đầu với Tính năng 1** (Auto-pin)
2. **Tạo branch mới**: `feature/planning-enhancements`
3. **Implement theo thứ tự ưu tiên**
4. **Test từng phase riêng biệt**

Bạn có muốn tôi bắt đầu implement ngay không? 🤔
