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
    
    return text
      // Convert line breaks
      .replace(/\n/g, '<br>')
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert underlined text
      .replace(/_(.*?)_/g, '<u>$1</u>')
      // Convert bullet points
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive list items in ul tags
      .replace(/(<li>.*<\/li>(\s*<br>\s*<li>.*<\/li>)*)/g, '<ul>$1</ul>')
      // Clean up extra br tags around lists
      .replace(/<br>\s*<ul>/g, '<ul>')
      .replace(/<\/ul>\s*<br>/g, '</ul>')
      // Clean up br tags inside lists
      .replace(/<li>(.*?)<br>\s*<\/li>/g, '<li>$1</li>');
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
