import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // Convert enhanced markdown-like text to HTML for display
  const formatContent = (text: string): string => {
    if (!text) return '';
    
    // Split text into lines and process systematically
    const lines = text.split('\n');
    const processedLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Apply enhanced text formatting first
      line = line
        // Basic formatting
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<u>$1</u>')
        // Color formatting
        .replace(/\[color:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|[a-zA-Z]+)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
        // Background color
        .replace(/\[bg:(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|[a-zA-Z]+)\](.*?)\[\/bg\]/g, '<span style="background-color: $1; padding: 2px 4px; border-radius: 3px; display: inline-block">$2</span>')
        // Font size
        .replace(/\[size:(\d+)\](.*?)\[\/size\]/g, '<span style="font-size: $1px">$2</span>')
        // Alignment - will be handled at block level
        .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center">$1</div>')
        .replace(/\[right\](.*?)\[\/right\]/g, '<div style="text-align: right">$1</div>')
        // Quotes
        .replace(/\[quote\](.*?)\[\/quote\]/g, '<blockquote style="border-left: 4px solid #6b7280; margin: 10px 0; padding-left: 15px; font-style: italic; color: #d1d5db">$1</blockquote>');
      
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- ')) {
        if (!inList) {
          processedLines.push('<ul style="margin: 8px 0; padding-left: 20px; color: inherit">');
          inList = true;
        }
        processedLines.push(`<li style="margin: 4px 0; list-style-type: disc">${trimmedLine.substring(2)}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (trimmedLine === '') {
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

  const formattedContent = formatContent(content);

  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      style={{
        lineHeight: '1.6',
        wordBreak: 'break-word',
        fontSize: '14px',
        color: 'inherit'
      }}
    />
  );
};

export default RichTextDisplay;
