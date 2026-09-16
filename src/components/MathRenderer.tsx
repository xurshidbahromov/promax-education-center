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
 * Checks if an inner string between $...$ or standalone text is genuinely a math expression,
 * as opposed to natural language text, currency ($100, $50), or general sentences.
 */
function isMathExpression(str: string): boolean {
  const t = str.trim();
  if (!t) return false;

  // LaTeX commands: \frac, \sqrt, \pm, \alpha, \sum, \int, \le, \ge, etc.
  if (/\\(frac|sqrt|sum|int|pm|times|div|cdot|neq|le|ge|approx|infty|in|alpha|beta|gamma|delta|pi|theta|vec|begin|end|cases|pmatrix|text|left|right|partial|sin|cos|tan|log|ln|lim|circ|mathbf|mathrm|mathbb)/.test(t)) {
    return true;
  }

  // Math symbols: ^, _, {}, ±, √, ≠, ≤, ≥, ≈, ∞, ×, ÷
  if (/[\^_\{\}\±\√\≠\≤\≥\≈\∞\×\÷]/.test(t)) {
    if (/^_+$/.test(t)) return false; // ignore pure underscores e.g. "____" (blank fill-in)
    return true;
  }

  // Math operators between operands: e.g. "x = 5", "a + b = c", "2 + 2 = 4", "x < 10"
  if (/[a-zA-Z0-9]\s*[\+\-\*\/\=\<\>]\s*[a-zA-Z0-9]/.test(t)) {
    const words = t.split(/\s+/).filter(w => /^[a-zA-Z]{4,}$/.test(w));
    if (words.length >= 2) return false; // Natural language text with words
    return true;
  }

  // Single math variable / function call: e.g. "x", "y", "f(x)"
  if (/^[a-zA-Z](?:\([a-zA-Z0-9, ]+\))?$/.test(t)) {
    return true;
  }

  return false;
}

/**
 * Parses text containing LaTeX expressions (e.g. $x^2 + y^2 = z^2$ or \frac{a}{b} or x^{2})
 * while safely preserving literal dollar signs ($100, $50, \$5) and normal text.
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
        text.includes('√') ||
        text.includes('≠') ||
        text.includes('≤') ||
        text.includes('≥');

      if (!hasMathSymbol) {
        // Plain text without math
        return null;
      }

      // Protect escaped dollars "\$" or "\\$" so they become literal "$" in output
      const ESC_DOLLAR = "___ESCAPED_DOLLAR___";
      const processed = text.replace(/\\+(\$)/g, ESC_DOLLAR);

      // Split out explicit math delimiters: $$...$$, \[...\], \(...\), and $...$
      // Inlined $ must not start or end with a space: (?:\$(?!\s)[^\$\n]+?(?<!\s)\$)
      const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?:\$(?!\s)[^\$\n]+?(?<!\s)\$))/g;
      const rawParts = processed.split(tokenRegex);
      const elements: React.ReactNode[] = [];

      for (let i = 0; i < rawParts.length; i++) {
        const part = rawParts[i];
        if (!part) continue;

        let isMath = false;
        let isDisplayMode = false;
        let formula = "";

        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          formula = part.slice(2, -2).trim();
          isDisplayMode = true;
          isMath = true;
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          formula = part.slice(2, -2).trim();
          isDisplayMode = true;
          isMath = true;
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          formula = part.slice(2, -2).trim();
          isDisplayMode = false;
          isMath = true;
        } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const candidate = part.slice(1, -1);
          if (isMathExpression(candidate)) {
            formula = candidate.trim();
            isDisplayMode = false;
            isMath = true;
          }
        }

        if (isMath) {
          const finalFormula = formula.replace(new RegExp(ESC_DOLLAR, "g"), "\\$");
          try {
            const html = katex.renderToString(finalFormula, {
              displayMode: isDisplayMode || (!inline && isDisplayMode),
              throwOnError: false,
            });

            elements.push(
              <span
                key={`m-${i}`}
                dangerouslySetInnerHTML={{ __html: html }}
                className={isDisplayMode ? "block my-2 text-center overflow-x-auto py-1" : "inline-block px-1 align-middle"}
              />
            );
          } catch {
            elements.push(
              <span key={`t-${i}`}>{part.replace(new RegExp(ESC_DOLLAR, "g"), "$")}</span>
            );
          }
          continue;
        }

        // Non-delimited segment: check for standalone LaTeX commands (e.g. \frac{1}{2}, x^{2}) within text
        const standaloneSplitRegex = /(\\frac\{[^{}]*\}\{[^{}]*\}|\\sqrt(?:\[[^{}]*\])?\{[^{}]*\}|\\[a-zA-Z]+(?:\{[^{}]*\})*|\b[a-zA-Z]\^\{?[0-9a-zA-Z+\-]+\}?|\b[a-zA-Z]_\{?[0-9a-zA-Z+\-]+\}?)/g;
        const standaloneMatchRegex = /^(\\frac\{[^{}]*\}\{[^{}]*\}|\\sqrt(?:\[[^{}]*\])?\{[^{}]*\}|\\[a-zA-Z]+(?:\{[^{}]*\})*|\b[a-zA-Z]\^\{?[0-9a-zA-Z+\-]+\}?|\b[a-zA-Z]_\{?[0-9a-zA-Z+\-]+\}?)$/;
        const subParts = part.split(standaloneSplitRegex);

        for (let j = 0; j < subParts.length; j++) {
          const sub = subParts[j];
          if (!sub) continue;

          if (standaloneMatchRegex.test(sub.trim()) && !/^_+$/.test(sub.trim())) {
            try {
              const html = katex.renderToString(sub.trim(), {
                displayMode: false,
                throwOnError: true,
              });

              elements.push(
                <span
                  key={`sm-${i}-${j}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                  className="inline-block px-1 align-middle"
                />
              );
              continue;
            } catch {
              // Not a valid standalone formula, treat as text
            }
          }

          // Plain text chunk: restore escaped dollar placeholder as literal "$"
          elements.push(
            <span key={`st-${i}-${j}`}>{sub.replace(new RegExp(ESC_DOLLAR, "g"), "$")}</span>
          );
        }
      }

      return elements;
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
