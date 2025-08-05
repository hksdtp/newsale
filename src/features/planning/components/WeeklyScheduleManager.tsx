import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, ArrowRight, Save, RotateCcw, Eye } from 'lucide-react';
import { getCurrentUser } from '../../../data/usersMockData';
import { supabase } from '../../../shared/api/supabase';

interface Employee {
  id: string;
  name: string;
  location: string;
  role: string;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  timeSlot: string; // '8h-17h30', '17h30-10h', etc.
  location: string;
}

interface WeeklyScheduleManagerProps {
  onClose: () => void;
}

export function WeeklyScheduleManager({ onClose }: WeeklyScheduleManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const currentUser = getCurrentUser();
  const canManageSchedule = currentUser?.name === 'Khổng Đức Mạnh' || currentUser?.email === 'manh.khong@company.com';

  // Time slots for showroom shifts
  const timeSlots = [
    { id: '8h-17h30', label: '8h-17h30', type: 'day' },
    { id: '17h30-10h', label: '17h30-10h', type: 'night' },
    { id: '8h30-18h', label: '8h30-18h', type: 'day' },
    { id: '9h-17h30', label: '9h-17h30', type: 'day' }
  ];

  // Days of week
  const daysOfWeek = [
    { key: 'monday', label: 'Thứ 2', short: 'T2' },
    { key: 'tuesday', label: 'Thứ 3', short: 'T3' },
    { key: 'wednesday', label: 'Thứ 4', short: 'T4' },
    { key: 'thursday', label: 'Thứ 5', short: 'T5' },
    { key: 'friday', label: 'Thứ 6', short: 'T6' },
    { key: 'saturday', label: 'Thứ 7', short: 'T7' },
    { key: 'sunday', label: 'Chủ nhật', short: 'CN' }
  ];

  useEffect(() => {
    if (canManageSchedule) {
      loadEmployees();
      loadWeeklyAssignments();
    }
  }, [canManageSchedule, selectedWeek]);

  const loadEmployees = async () => {
    try {
      const { data: employeesData, error } = await supabase
        .from('users')
        .select('id, name, email, role, location')
        .order('name');

      if (error) throw error;
      setEmployees(employeesData || []);
      console.log('👥 Loaded employees:', employeesData?.length || 0);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadWeeklyAssignments = async () => {
    try {
      setLoading(true);
      const weekStart = getWeekStart(selectedWeek);
      const weekEnd = getWeekEnd(selectedWeek);

      // Load existing assignments for the week
      const { data: assignmentsData, error } = await supabase
        .from('schedule_assignments')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      if (error) throw error;

      // Transform data to match our interface
      const transformedAssignments = (assignmentsData || []).map(item => ({
        id: item.id,
        employeeId: item.employee_id,
        employeeName: item.employee_name,
        date: item.date,
        timeSlot: item.time_slot,
        location: item.location
      }));

      setAssignments(transformedAssignments);
      console.log('📅 Loaded weekly assignments:', transformedAssignments.length);
    } catch (error) {
      console.error('Error loading weekly assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    start.setDate(diff);
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const end = getWeekStart(date);
    end.setDate(end.getDate() + 6);
    return end;
  };

  const getDateForDay = (dayIndex: number) => {
    const weekStart = getWeekStart(selectedWeek);
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const handleDragStart = (e: React.DragEvent, employee: Employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', employee.id);

    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(5deg)';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-500/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/10');
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, timeSlot: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/10');

    if (!draggedEmployee) return;

    const date = getDateForDay(dayIndex);
    const dateStr = date.toISOString().split('T')[0];

    // Check if employee already assigned to this slot
    const existingAssignment = assignments.find(
      a => a.employeeId === draggedEmployee.id &&
           a.date === dateStr &&
           a.timeSlot === timeSlot
    );

    if (existingAssignment) {
      alert('Nhân viên đã được phân công vào ca này!');
      setDraggedEmployee(null);
      return;
    }

    // Check for conflicts (employee already assigned to another slot on same day)
    const dayConflict = assignments.find(
      a => a.employeeId === draggedEmployee.id &&
           a.date === dateStr &&
           a.timeSlot !== timeSlot
    );

    if (dayConflict) {
      const confirmReplace = window.confirm(
        `${draggedEmployee.name} đã được phân công ca ${dayConflict.timeSlot} trong ngày này. Bạn có muốn thay đổi không?`
      );

      if (confirmReplace) {
        // Remove existing assignment
        setAssignments(prev => prev.filter(a => a.id !== dayConflict.id));
      } else {
        setDraggedEmployee(null);
        return;
      }
    }

    // Create new assignment
    const newAssignment: ShiftAssignment = {
      id: `temp-${Date.now()}`,
      employeeId: draggedEmployee.id,
      employeeName: draggedEmployee.name,
      date: dateStr,
      timeSlot,
      location: draggedEmployee.location
    };

    setAssignments(prev => [...prev, newAssignment]);
    setHasChanges(true);
    setDraggedEmployee(null);

    // Success feedback
    console.log(`✅ Assigned ${draggedEmployee.name} to ${timeSlot} on ${dateStr}`);
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    setHasChanges(true);
  };

  const saveSchedule = async () => {
    try {
      setLoading(true);

      // Delete existing assignments for the week
      const weekStart = getWeekStart(selectedWeek);
      const weekEnd = getWeekEnd(selectedWeek);

      console.log('🗑️ Deleting existing assignments for week:', {
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0]
      });

      const { error: deleteError } = await supabase
        .from('schedule_assignments')
        .delete()
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      if (deleteError) throw deleteError;

      // Insert new assignments (only non-temp ones)
      const assignmentsToSave = assignments
        .filter(a => !a.id.startsWith('temp-')) // Keep existing assignments
        .concat(
          assignments.filter(a => a.id.startsWith('temp-')) // Add new assignments
        )
        .map(a => ({
          employee_id: a.employeeId,
          employee_name: a.employeeName,
          date: a.date,
          time_slot: a.timeSlot,
          location: a.location,
          created_by: currentUser?.id || 'admin'
        }));

      console.log('💾 Saving assignments:', assignmentsToSave.length);

      if (assignmentsToSave.length > 0) {
        const { data: savedData, error: insertError } = await supabase
          .from('schedule_assignments')
          .insert(assignmentsToSave)
          .select();

        if (insertError) throw insertError;

        // Update assignments with real IDs
        if (savedData) {
          const updatedAssignments = savedData.map(item => ({
            id: item.id,
            employeeId: item.employee_id,
            employeeName: item.employee_name,
            date: item.date,
            timeSlot: item.time_slot,
            location: item.location
          }));
          setAssignments(updatedAssignments);
        }
      } else {
        setAssignments([]);
      }

      setHasChanges(false);
      alert('✅ Lưu lịch thành công!');
      console.log('✅ Schedule saved successfully');
    } catch (error) {
      console.error('❌ Error saving schedule:', error);
      alert('❌ Lỗi khi lưu lịch: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetChanges = () => {
    loadWeeklyAssignments();
    setHasChanges(false);
  };

  if (!canManageSchedule) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <Eye className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Không có quyền truy cập</h3>
            <p className="text-gray-400 mb-4">Chỉ Khổng Đức Mạnh mới có thể quản lý lịch làm việc.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Quản Lý Lịch Showroom</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <div className="flex items-center gap-2">
                <button
                  onClick={resetChanges}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Reset
                </button>
                <button
                  onClick={saveSchedule}
                  disabled={loading}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Lưu Lịch
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const prevWeek = new Date(selectedWeek);
              prevWeek.setDate(prevWeek.getDate() - 7);
              setSelectedWeek(prevWeek);
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Tuần trước
          </button>
          
          <div className="text-white font-medium">
            Tuần {getWeekStart(selectedWeek).toLocaleDateString('vi-VN')} - {getWeekEnd(selectedWeek).toLocaleDateString('vi-VN')}
          </div>
          
          <button
            onClick={() => {
              const nextWeek = new Date(selectedWeek);
              nextWeek.setDate(nextWeek.getDate() + 7);
              setSelectedWeek(nextWeek);
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Tuần sau →
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Employee List */}
          <div className="w-64 border-r border-gray-700 p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nhân Viên ({employees.length})
            </h3>
            <div className="space-y-2 max-h-full overflow-y-auto">
              {employees.map(employee => {
                // Count how many shifts this employee has this week
                const weekStart = getWeekStart(selectedWeek);
                const weekEnd = getWeekEnd(selectedWeek);
                const employeeShifts = assignments.filter(a =>
                  a.employeeId === employee.id &&
                  new Date(a.date) >= weekStart &&
                  new Date(a.date) <= weekEnd
                ).length;

                return (
                  <div
                    key={employee.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, employee)}
                    className="p-2 bg-gray-700 rounded cursor-move hover:bg-gray-600 transition-colors border-l-4 border-blue-500 relative"
                  >
                    <div className="text-white text-sm font-medium">{employee.name}</div>
                    <div className="text-gray-400 text-xs">{employee.location}</div>
                    {employeeShifts > 0 && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {employeeShifts}
                      </div>
                    )}
                  </div>
                );
              })}
              {employees.length === 0 && (
                <div className="text-gray-400 text-sm text-center py-4">
                  Đang tải danh sách nhân viên...
                </div>
              )}
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-8 gap-2 min-w-max">
              {/* Header Row */}
              <div className="text-gray-400 text-sm font-medium p-2">Ca làm việc</div>
              {daysOfWeek.map((day, index) => {
                const date = getDateForDay(index);
                return (
                  <div key={day.key} className="text-center">
                    <div className="text-white font-medium">{day.short}</div>
                    <div className="text-gray-400 text-xs">{date.getDate()}/{date.getMonth() + 1}</div>
                  </div>
                );
              })}

              {/* Time Slot Rows */}
              {timeSlots.map(slot => (
                <React.Fragment key={slot.id}>
                  <div className="p-2 bg-gray-700 rounded text-white text-sm font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {slot.label}
                  </div>
                  {daysOfWeek.map((day, dayIndex) => {
                    const date = getDateForDay(dayIndex);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayAssignments = assignments.filter(
                      a => a.date === dateStr && a.timeSlot === slot.id
                    );

                    return (
                      <div
                        key={`${day.key}-${slot.id}`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, dayIndex, slot.id)}
                        className="min-h-[80px] border-2 border-dashed border-gray-600 rounded p-1 hover:border-blue-400 transition-all duration-200 relative"
                      >
                        {dayAssignments.map(assignment => (
                          <div
                            key={assignment.id}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs p-2 rounded mb-1 relative group shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="font-medium">{assignment.employeeName}</div>
                            <div className="text-blue-200 text-xs">{assignment.location}</div>
                            <button
                              onClick={() => removeAssignment(assignment.id)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                              title="Xóa phân công"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {/* Drop zone indicator */}
                        {dayAssignments.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs pointer-events-none">
                            Kéo nhân viên vào đây
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
