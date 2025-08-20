import { 
  Bold, 
  Italic, 
  List, 
  Underline, 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo,
  Link,
  Quote
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
  const [isFocused, setIsFocused] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);

  // Predefined colors for quick access
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#000080', '#008000'
  ];

  // Convert plain text to HTML with enhanced formatting
  const textToHtml = (text: string): string => {
    if (!text) return '';

    // Enhanced text processing with colors and more formatting
    let result = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<u>$1</u>')
      .replace(/\[color:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|[a-zA-Z]+)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
      .replace(/\[bg:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|[a-zA-Z]+)\](.*?)\[\/bg\]/g, '<span style="background-color: $1; padding: 2px 4px; border-radius: 3px">$2</span>')
      .replace(/\[size:(\d+)\](.*?)\[\/size\]/g, '<span style="font-size: $1px">$2</span>')
      .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center">$1</div>')
      .replace(/\[right\](.*?)\[\/right\]/g, '<div style="text-align: right">$1</div>')
      .replace(/\[quote\](.*?)\[\/quote\]/g, '<blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; font-style: italic">$1</blockquote>');

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
              return `[color:${colorMatch[1]}]${element.textContent}[/color]`;
            } else if (bgMatch) {
              return `[bg:${bgMatch[1]}]${element.textContent}[/bg]`;
            } else if (sizeMatch) {
              return `[size:${sizeMatch[1]}]${element.textContent}[/size]`;
            }
            return element.textContent || '';
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
    const cleanedResult = result
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\n+|\n+$/g, '');

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
      document.execCommand('insertHTML', false, `<blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; font-style: italic">${selectedText}</blockquote>`);
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

  return (
    <div className={`border border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Mobile Toolbar Toggle */}
      <div className="md:hidden flex justify-between items-center p-2 bg-gray-800/30 border-b border-gray-600">
        <span className="text-gray-400 text-sm">Công cụ định dạng</span>
        <button
          type="button"
          onClick={() => setShowMobileToolbar(!showMobileToolbar)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          disabled={disabled}
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Toolbar - Always visible on desktop */}
      <div className={`hidden md:flex items-center gap-1 p-2 bg-gray-800/50 border-b border-gray-600 flex-wrap`}>
        {/* Basic Formatting */}
        <button
          type="button"
          onClick={undo}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Hoàn tác (Ctrl+Z)"
          disabled={disabled}
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Làm lại (Ctrl+Y)"
          disabled={disabled}
        >
          <Redo className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-gray-600 mx-1" />

        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="In đậm (Ctrl+B)"
          disabled={disabled}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="In nghiêng (Ctrl+I)"
          disabled={disabled}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Gạch chân (Ctrl+U)"
          disabled={disabled}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-600 mx-1" />

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Màu chữ"
            disabled={disabled}
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
              <div className="text-xs text-gray-400 mb-2">Màu chữ</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-2">Màu nền</div>
              <div className="grid grid-cols-5 gap-1">
                {colors.map((color) => (
                  <button
                    key={`bg-${color}`}
                    type="button"
                    onClick={() => applyBackgroundColor(color)}
                    className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform relative"
                    style={{ backgroundColor: color }}
                    title={`Nền ${color}`}
                  >
                    <div className="absolute inset-1 border border-gray-300 rounded" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-gray-600 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => applyAlignment('Left')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Căn trái"
          disabled={disabled}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyAlignment('Center')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Căn giữa"
          disabled={disabled}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyAlignment('Right')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Căn phải"
          disabled={disabled}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-600 mx-1" />

        {/* List and Quote */}
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Danh sách"
          disabled={disabled}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertQuote}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Trích dẫn"
          disabled={disabled}
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Toolbar - Collapsible */}
      {showMobileToolbar && (
        <div className="md:hidden p-2 bg-gray-800/50 border-b border-gray-600">
          <div className="grid grid-cols-6 gap-2 mb-2">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="In đậm"
              disabled={disabled}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="In nghiêng"
              disabled={disabled}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Gạch chân"
              disabled={disabled}
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Danh sách"
              disabled={disabled}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertQuote}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Trích dẫn"
              disabled={disabled}
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Màu chữ"
              disabled={disabled}
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mobile Color Picker */}
          {showColorPicker && (
            <div className="mt-2 p-3 bg-gray-700/50 rounded border border-gray-600">
              <div className="text-xs text-gray-400 mb-2">Màu chữ</div>
              <div className="grid grid-cols-8 gap-1 mb-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded border border-gray-600"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-2">Màu nền</div>
              <div className="grid grid-cols-8 gap-1">
                {colors.map((color) => (
                  <button
                    key={`bg-${color}`}
                    type="button"
                    onClick={() => applyBackgroundColor(color)}
                    className="w-6 h-6 rounded border border-gray-600 relative"
                    style={{ backgroundColor: color }}
                    title={`Nền ${color}`}
                  >
                    <div className="absolute inset-1 border border-gray-300 rounded" />
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
        className={`p-3 sm:p-4 min-h-[120px] sm:min-h-[150px] text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
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
