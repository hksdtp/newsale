import React, { useState, useRef, useEffect } from 'react';
import { X, User, Search } from 'lucide-react';
import { employeeService, TaggedUser } from '../services/employeeService';

// TaggedUser interface is now imported from employeeService

interface TagUserInputProps {
  label: string;
  value: TaggedUser[];
  onChange: (users: TaggedUser[]) => void;
  placeholder?: string;
  required?: boolean;
  currentUserId?: string; // To exclude current user from suggestions
  currentUserLocation?: string; // To filter by location
}

const TagUserInput: React.FC<TagUserInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Nhập tên để tag người dùng...",
  required = false,
  currentUserId,
  currentUserLocation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<TaggedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search employees from HR system
  useEffect(() => {
    const searchEmployees = async () => {
      if (!currentUserId) return;

      setLoading(true);
      try {
        const employees = await employeeService.searchEmployees(searchTerm, currentUserId, currentUserLocation);

        // Filter out already tagged users
        const filtered = employees.filter(emp =>
          !value.some(taggedUser => taggedUser.id === emp.id)
        );

        setFilteredUsers(filtered);
      } catch (error) {
        console.error('Error searching employees:', error);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    searchEmployees();
  }, [searchTerm, value, currentUserId, currentUserLocation]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate avatar initials
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handle user selection
  const handleUserSelect = (user: TaggedUser) => {
    onChange([...value, user]);
    setSearchTerm('');
    setIsOpen(false);

    // Focus back to input for continuous tagging
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle user removal
  const handleUserRemove = (userId: string) => {
    onChange(value.filter(user => user.id !== userId));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(term.length > 0);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-white font-medium text-sm">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Tagged Users Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-700/20 rounded-lg border border-gray-600/30">
          {value.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm font-medium text-blue-300 hover:bg-blue-600/30 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getAvatarInitials(user.name)}
              </div>
              
              {/* Name */}
              <span className="max-w-32 truncate">{user.name}</span>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleUserRemove(user.id)}
                className="w-4 h-4 rounded-full bg-blue-500/20 hover:bg-red-500/20 flex items-center justify-center transition-colors group-hover:bg-red-500/30"
                title={`Xóa ${user.name}`}
              >
                <X className="w-3 h-3 text-blue-300 group-hover:text-red-300" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div ref={containerRef} className="relative">
        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-2.5 pl-9 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && filteredUsers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="py-2 max-h-64 overflow-y-auto modal-scrollbar">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getAvatarInitials(user.name)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{user.name}</div>
                    <div className="text-gray-400 text-sm truncate">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                        {user.role}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                        {user.location}
                      </span>
                      {user.team_name && (
                        <span className="px-2 py-0.5 bg-blue-700 text-blue-300 rounded text-xs">
                          {user.team_name}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {isOpen && searchTerm && filteredUsers.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 p-4 text-center">
            <div className="text-gray-400 text-sm">
              Không tìm thấy người dùng nào với từ khóa "{searchTerm}"
            </div>
          </div>
        )}
      </div>

      {/* Helper text - Compact */}
      {value.length > 0 && (
        <div className="text-gray-400 text-xs">
          Đã tag {value.length} người dùng
        </div>
      )}
    </div>
  );
};

export default TagUserInput;
