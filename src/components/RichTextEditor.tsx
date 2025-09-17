import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  Palette,
  Quote,
  Redo,
  Type,
  Underline,
  Undo,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });

  // Predefined colors optimized for dark theme with better contrast
  const colors = [
    '#ffffff',
    '#e5e7eb',
    '#d1d5db',
    '#9ca3af',
    '#6b7280',
    '#374151',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
  ];

  // Convert plain text to HTML with enhanced formatting
  const textToHtml = (text: string): string => {
    if (!text) return '';

    // Enhanced text processing with colors and more formatting
    let result = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<u>$1</u>')
      .replace(/\[color:([^\]]+)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
      .replace(
        /\[bg:([^\]]+)\](.*?)\[\/bg\]/g,
        '<span style="background-color: $1; padding: 2px 4px; border-radius: 3px">$2</span>'
      )
      .replace(/\[size:(\d+)\](.*?)\[\/size\]/g, '<span style="font-size: $1px">$2</span>')
      .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center">$1</div>')
      .replace(/\[right\](.*?)\[\/right\]/g, '<div style="text-align: right">$1</div>')
      .replace(
        /\[quote\](.*?)\[\/quote\]/g,
        '<blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; font-style: italic">$1</blockquote>'
      );

    // Handle bullet lists properly
    const lines = result.split('\n');
    const processedLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('- ')) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${line.substring(2)}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (line === '') {
          processedLines.push('<br>');
        } else {
          processedLines.push(line);
        }
      }
    }

    // Close any open list
    if (inList) {
      processedLines.push('</ul>');
    }

    return processedLines.join('');
  };

  // Convert HTML back to plain text with enhanced markdown-like formatting
  const htmlToText = (html: string): string => {
    if (!html) return '';

    console.log('🔍 htmlToText input:', html);

    // Create a temporary DOM element to properly parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Process each child node systematically
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const style = element.getAttribute('style') || '';

        switch (tagName) {
          case 'br':
            return '\n';
          case 'strong':
          case 'b':
            return `**${element.textContent}**`;
          case 'em':
          case 'i':
            return `*${element.textContent}*`;
          case 'u':
            return `_${element.textContent}_`;
          case 'li':
            return `- ${element.textContent}\n`;
          case 'ul':
          case 'ol':
            // Process child list items
            return Array.from(element.childNodes).map(processNode).join('');
          case 'span':
            const colorMatch = style.match(/color:\s*([^;]+)/);
            const bgMatch = style.match(/background-color:\s*([^;]+)/);
            const sizeMatch = style.match(/font-size:\s*(\d+)px/);

            if (colorMatch) {
              const colorValue = colorMatch[1].trim();
              // Process child nodes to avoid nested color tags
              const content = Array.from(element.childNodes).map(processNode).join('');
              // Only wrap if content doesn't already have color formatting
              if (!content.includes('[color:')) {
                return `[color:${colorValue}]${content}[/color]`;
              }
              return content;
            } else if (bgMatch) {
              const bgValue = bgMatch[1].trim();
              const content = Array.from(element.childNodes).map(processNode).join('');
              if (!content.includes('[bg:')) {
                return `[bg:${bgValue}]${content}[/bg]`;
              }
              return content;
            } else if (sizeMatch) {
              return `[size:${sizeMatch[1]}]${element.textContent}[/size]`;
            }
            return (
              Array.from(element.childNodes).map(processNode).join('') || element.textContent || ''
            );
          case 'div':
            const alignMatch = style.match(/text-align:\s*([^;]+)/);
            if (alignMatch) {
              const align = alignMatch[1];
              if (align === 'center') {
                return `[center]${element.textContent}[/center]`;
              } else if (align === 'right') {
                return `[right]${element.textContent}[/right]`;
              }
            }
            return Array.from(element.childNodes).map(processNode).join('');
          case 'blockquote':
            return `[quote]${element.textContent}[/quote]`;
          default:
            // For other elements, just process their content
            return Array.from(element.childNodes).map(processNode).join('');
        }
      }

      return '';
    };

    const result = Array.from(tempDiv.childNodes).map(processNode).join('');

    // Clean up extra newlines
    const cleanedResult = result.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/^\n+|\n+$/g, '');

    console.log('🔍 htmlToText output:', cleanedResult);
    return cleanedResult;
  };

  // Update editor content when value changes
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      const htmlContent = textToHtml(value);
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  }, [value, isFocused]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const textContent = htmlToText(htmlContent);

      // Debug: Log conversion process
      console.log('🔍 RichTextEditor input change:', {
        htmlContent,
        textContent,
        hasNewlines: textContent.includes('\n'),
        isList: textContent.includes('- '),
      });

      onChange(textContent);
    }
  };

  // Enhanced format text functions
  const formatText = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  // Apply color to selected text
  const applyColor = (color: string) => {
    formatText('foreColor', color);
    setShowColorPicker(false);
  };

  // Apply background color
  const applyBackgroundColor = (color: string) => {
    formatText('hiliteColor', color);
    setShowColorPicker(false);
  };

  // Apply font size
  const applyFontSize = (size: string) => {
    formatText('fontSize', size);
  };

  // Apply text alignment
  const applyAlignment = (align: string) => {
    formatText(`justify${align}`);
  };

  // Insert quote
  const insertQuote = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      document.execCommand(
        'insertHTML',
        false,
        `<blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; font-style: italic">${selectedText}</blockquote>`
      );
      handleInput();
    }
  };

  // Undo/Redo functions
  const undo = () => formatText('undo');
  const redo = () => formatText('redo');

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
      }
    }
  };

  // Toggle color picker with position calculation
  const toggleColorPicker = () => {
    if (!showColorPicker && colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate position - prefer right side, fallback to left
      let left = rect.right + 10;
      if (left + 320 > viewportWidth) {
        left = rect.left - 320;
      }

      // Calculate vertical position - prefer below, fallback to above
      let top = rect.bottom + 10;
      if (top + 400 > viewportHeight) {
        top = rect.top - 400;
      }

      setColorPickerPosition({ top, left });
    }
    setShowColorPicker(!showColorPicker);
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showColorPicker &&
        !colorButtonRef.current?.contains(e.target as Node) &&
        !(e.target as Element).closest('.color-picker-portal')
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showColorPicker]);

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Mobile Toolbar Toggle */}
      <div className="md:hidden flex justify-between items-center p-2 bg-white border-b border-gray-200">
        <span className="text-gray-600 text-sm">Công cụ định dạng</span>
        <button
          type="button"
          onClick={() => setShowMobileToolbar(!showMobileToolbar)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          disabled={disabled}
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Toolbar - Always visible on desktop */}
      <div
        className={`hidden md:flex items-center gap-1 p-2 bg-white border-b border-gray-200 flex-wrap`}
      >
        {/* Basic Formatting */}
        <button
          type="button"
          onClick={undo}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Hoàn tác (Ctrl+Z)"
          disabled={disabled}
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Làm lại (Ctrl+Y)"
          disabled={disabled}
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="In đậm (Ctrl+B)"
          disabled={disabled}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="In nghiêng (Ctrl+I)"
          disabled={disabled}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Gạch chân (Ctrl+U)"
          disabled={disabled}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Color Picker */}
        <div className="relative">
          <button
            ref={colorButtonRef}
            type="button"
            onClick={toggleColorPicker}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Màu chữ"
            disabled={disabled}
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => applyAlignment('Left')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Căn trái"
          disabled={disabled}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyAlignment('Center')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Căn giữa"
          disabled={disabled}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyAlignment('Right')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Căn phải"
          disabled={disabled}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* List and Quote */}
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Danh sách"
          disabled={disabled}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertQuote}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Trích dẫn"
          disabled={disabled}
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Toolbar - Collapsible */}
      {showMobileToolbar && (
        <div className="md:hidden p-2 bg-white border-b border-gray-200">
          <div className="grid grid-cols-6 gap-2 mb-2">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="In đậm"
              disabled={disabled}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="In nghiêng"
              disabled={disabled}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Gạch chân"
              disabled={disabled}
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Danh sách"
              disabled={disabled}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertQuote}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Trích dẫn"
              disabled={disabled}
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="Màu chữ"
              disabled={disabled}
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Color Picker */}
          {showColorPicker && (
            <div className="fixed inset-x-4 bottom-20 z-[9999] p-4 bg-white rounded-lg border border-gray-200 shadow-2xl max-h-[60vh] overflow-y-auto">
              <div className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Màu chữ
              </div>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-full aspect-square rounded-lg border-2 border-gray-600 active:border-blue-400 active:scale-95 transition-all"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                Màu nền
              </div>
              <div className="grid grid-cols-6 gap-2">
                {colors.map(color => (
                  <button
                    key={`bg-${color}`}
                    type="button"
                    onClick={() => applyBackgroundColor(color)}
                    className="w-full aspect-square rounded-lg border-2 border-gray-600 active:border-blue-400 active:scale-95 transition-all relative"
                    style={{ backgroundColor: color }}
                    title={`Nền ${color}`}
                  >
                    <div className="absolute inset-2 border-2 border-white/30 rounded" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => {
          setIsFocused(true);
          setShowColorPicker(false);
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={`p-3 sm:p-4 min-h-[120px] sm:min-h-[150px] text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'
        }`}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          fontSize: window.innerWidth < 768 ? '16px' : '14px', // Prevent zoom on iOS
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Desktop Color Picker Portal */}
      {showColorPicker &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="color-picker-portal fixed z-[99999] p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl min-w-[320px] max-h-[450px] overflow-y-auto"
            style={{
              top: `${colorPickerPosition.top}px`,
              left: `${colorPickerPosition.left}px`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Chọn màu
              </div>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-2 font-medium">Màu chữ</div>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyColor(color)}
                      className="w-11 h-11 rounded-lg border-2 border-gray-600 hover:border-blue-400 hover:scale-110 transition-all duration-200 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-400 rounded" />
                  Màu nền
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map(color => (
                    <button
                      key={`bg-${color}`}
                      type="button"
                      onClick={() => applyBackgroundColor(color)}
                      className="w-11 h-11 rounded-lg border-2 border-gray-600 hover:border-blue-400 hover:scale-110 transition-all duration-200 relative shadow-sm"
                      style={{ backgroundColor: color }}
                      title={`Nền ${color}`}
                    >
                      <div className="absolute inset-2 border-2 border-white/30 rounded" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Enhanced Placeholder and Editor styling */}
      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }

        [contenteditable] ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        [contenteditable] li {
          margin: 4px 0;
          list-style-type: disc;
        }

        [contenteditable] blockquote {
          margin: 10px 0;
          padding-left: 15px;
          border-left: 4px solid #6b7280;
          font-style: italic;
          color: #d1d5db;
        }

        [contenteditable] strong {
          font-weight: bold;
        }

        [contenteditable] em {
          font-style: italic;
        }

        [contenteditable] u {
          text-decoration: underline;
        }

        /* Mobile specific styles */
        @media (max-width: 768px) {
          [contenteditable] {
            font-size: 16px !important;
            line-height: 1.5;
          }

          [contenteditable] ul {
            padding-left: 16px;
          }

          [contenteditable] blockquote {
            padding-left: 12px;
            border-left-width: 3px;
          }
        }

        /* Focus styles for better accessibility */
        [contenteditable]:focus {
          outline: none;
        }

        /* Selection styles */
        [contenteditable] ::selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
