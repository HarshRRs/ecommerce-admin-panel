// Editor helper utilities

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

export function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getCharacterCount(html: string): number {
  return stripHtml(html).length;
}

export function getWordCount(html: string): number {
  const text = stripHtml(html);
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
