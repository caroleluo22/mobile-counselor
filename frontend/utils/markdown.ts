import { marked } from 'marked';

/**
 * Converts a markdown string to an HTML string.
 * @param markdown The markdown text to convert.
 * @returns The resulting HTML string.
 */
export const renderMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  return marked(markdown) as string;
};