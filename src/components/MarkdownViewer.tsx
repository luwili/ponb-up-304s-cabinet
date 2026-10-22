import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownViewerProps {
  content: string;
  tableOfContents?: { id: string; text: string; level?: number }[];
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  tableOfContents = [],
  className = ''
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // 1. Pre-clean content
    const cleaned = content
      // normalize non-breaking spaces
      .replace(/\u00a0/g, ' ')
      // normalize messy nested list bullets e.g. "- - item" to "- item"
      .replace(/^[ \t]*[-*+][ \t]+[-*+][ \t]+/gm, '- ')
      // normalize "- 1. item" to "1. item"
      .replace(/^[ \t]*[-*+][ \t]+(\d+\.)[ \t]*/gm, '$1 ');

    // 2. Set up renderer with heading IDs for TOC navigation
    const renderer = new marked.Renderer();
    let headingIndex = 0;

    renderer.heading = ({ tokens, depth }: { tokens: any[]; depth: number }) => {
      const text = renderer.parser.parseInline(tokens);
      const cleanText = text.replace(/<[^>]+>/g, '').trim();

      // Look up in tableOfContents
      let anchorId = '';
      if (tableOfContents && tableOfContents.length > 0) {
        // Try match by clean text or substring
        const found = tableOfContents.find((item) => {
          const itemClean = item.text.replace(/<[^>]+>/g, '').trim().toLowerCase();
          const curClean = cleanText.toLowerCase();
          return itemClean === curClean || curClean.includes(itemClean) || itemClean.includes(curClean);
        });

        if (found) {
          anchorId = found.id;
        } else if (headingIndex < tableOfContents.length) {
          // fallback to index if level matches
          const candidate = tableOfContents[headingIndex];
          if (candidate && candidate.level === depth) {
            anchorId = candidate.id;
          }
        }
      }

      if (!anchorId) {
        anchorId = 'sec-' + cleanText.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '');
      }

      headingIndex++;
      return `<h${depth} id="${anchorId}" class="scroll-mt-24 group">${text}</h${depth}>\n`;
    };

    // Parse markdown synchronously
    const rawHtml = marked.parse(cleaned, {
      gfm: true,
      breaks: false,
      renderer
    }) as string;

    // Sanitize with DOMPurify
    return DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'id', 'class', 'style', 'href', 'rel']
    });
  }, [content, tableOfContents]);

  return (
    <div
      className={`study-markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
