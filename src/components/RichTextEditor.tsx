import { Bold, Italic, List, Underline } from 'lucide-react';
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

  // Convert plain text to HTML with basic formatting
  const textToHtml = (text: string): string => {
    if (!text) return '';

    // Split by double line breaks to preserve paragraphs
    let result = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<u>$1</u>');

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

  // Convert HTML back to plain text with markdown-like formatting
  const htmlToText = (html: string): string => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Process the HTML systematically
    let text = tempDiv.innerHTML
      // Handle line breaks first
      .replace(/<br\s*\/?>/gi, '\n')
      // Handle formatting
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u>(.*?)<\/u>/gi, '_$1_')
      // Handle lists properly - first add newlines around list items
      .replace(/<li>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      // Remove list container tags
      .replace(/<\/?ul>/gi, '\n')
      .replace(/<\/?ol>/gi, '\n')
      // Remove any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up multiple consecutive newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\n+|\n+$/g, ''); // Remove leading/trailing newlines

    return text;
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
      onChange(textContent);
    }
  };

  // Format text functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

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
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-800/50 border-b border-gray-600">
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
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Danh sách"
          disabled={disabled}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={`p-3 min-h-[120px] text-white bg-gray-800/50 focus:outline-none ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'
        }`}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Placeholder styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
