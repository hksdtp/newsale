import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // Convert markdown-like text to HTML for display
  const formatContent = (text: string): string => {
    if (!text) return '';
    
    // Split text into lines and process systematically
    const lines = text.split('\n');
    const processedLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Apply text formatting first
      line = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<u>$1</u>');
      
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- ')) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${trimmedLine.substring(2)}</li>`);
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
        wordBreak: 'break-word'
      }}
    />
  );
};

export default RichTextDisplay;
