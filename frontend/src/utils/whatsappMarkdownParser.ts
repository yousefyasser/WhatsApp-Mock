import React from 'react';

export const parseWhatsAppMarkdown = (text: string) => {
  if (!text) return '';

  // Escape HTML to prevent XSS before we add our own tags
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Replace WhatsApp markdown patterns
  // Code block: ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<code>$1</code>');
  // Bold: *bold*
  html = html.replace(/\*([^\*\n]+)\*/g, '<strong>$1</strong>');
  // Italic: _italic_
  html = html.replace(/_([^\_\n]+)_/g, '<em>$1</em>');
  // Strikethrough: ~strikethrough~
  html = html.replace(/~([^~\n]+)~/g, '<del>$1</del>');
  
  // Replace newlines with <br />
  html = html.replace(/\n/g, '<br />');

  return html;
};
