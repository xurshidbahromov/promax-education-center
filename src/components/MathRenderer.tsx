"use client";

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Parses text containing LaTeX expressions (e.g. $x^2 + y^2 = z^2$ or \frac{a}{b} or x^{2} or x_{1})
 * and renders formatted mathematical formulas using KaTeX.
 */
export default function MathRenderer({ content, className = "", inline = false }: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!content || typeof content !== 'string') return "";

    try {
      const text = content.trim();
      if (!text) return null;

      // Check if text has ANY math symbols, delimiters, superscripts, or subscripts
      const hasMathSymbol = 
        text.includes('$') || 
        text.includes('\\') || 
        text.includes('^') || 
        text.includes('_') || 
        text.includes('{') || 
        text.includes('}') ||
        text.includes('±') ||
        text.includes('√');

      if (!hasMathSymbol) {
        // Plain text without math
        return null;
      }

      // If the string starts with $ and ends with $, or contains $...$ pairs
      const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g);

      return parts.map((part, index) => {
        if (!part) return null;

        let formula = part;
        let isDisplayMode = false;
        let isMath = false;

        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          formula = part.slice(2, -2).trim();
          isDisplayMode = true;
          isMath = true;
        } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          formula = part.slice(1, -1).trim();
          isDisplayMode = false;
          isMath = true;
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          formula = part.slice(2, -2).trim();
          isDisplayMode = true;
          isMath = true;
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          formula = part.slice(2, -2).trim();
          isDisplayMode = false;
          isMath = true;
        } else if (
          part.includes('\\') || 
          part.includes('^') || 
          part.includes('_') || 
          part.includes('{') || 
          part.includes('}')
        ) {
          // Standalone LaTeX formula without $ delimiters (e.g. \frac{a}{b}, x^{2}, x_{1})
          formula = part.trim();
          isDisplayMode = !inline;
          isMath = true;
        }

        if (!isMath) {
          return <span key={index}>{part}</span>;
        }

        try {
          const html = katex.renderToString(formula, {
            displayMode: isDisplayMode,
            throwOnError: false,
          });

          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className={isDisplayMode ? "block my-2 text-center overflow-x-auto py-1" : "inline-block px-1 align-middle"}
            />
          );
        } catch (e) {
          return <code key={index} className="text-red-500 bg-red-50 dark:bg-red-950/40 px-1 py-0.5 rounded text-xs">{part}</code>;
        }
      });
    } catch (err) {
      console.error("Math rendering error:", err);
      return null;
    }
  }, [content, inline]);

  if (!content) return null;

  if (renderedHtml === null) {
    return <span className={className}>{content}</span>;
  }

  return <span className={`math-content font-sans ${className}`}>{renderedHtml}</span>;
}
