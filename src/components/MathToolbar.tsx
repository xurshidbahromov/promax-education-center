"use client";

import React, { useState } from 'react';
import { Calculator, Sparkles, Variable, Binary, Beaker, ChevronDown } from 'lucide-react';
import MathRenderer from './MathRenderer';

interface MathToolbarProps {
  onInsert: (formulaText: string) => void;
  currentValue?: string;
}

export default function MathToolbar({ onInsert, currentValue = "" }: MathToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<'basic' | 'symbols' | 'greek' | 'chemistry' | 'calculus'>('basic');
  const [isOpen, setIsOpen] = useState(false);

  // Formula Templates
  const categories = {
    basic: {
      label: "Asosiy Formulalar",
      icon: Calculator,
      items: [
        { label: "Kasr (a/b)", formula: "\\frac{a}{b}", display: "a/b" },
        { label: "Daraja (x²)", formula: "x^{2}", display: "x²" },
        { label: "Indeks (x₁)", formula: "x_{1}", display: "x₁" },
        { label: "Kvadrat Ildiz", formula: "\\sqrt{x}", display: "√x" },
        { label: "N-dara Ildiz", formula: "\\sqrt[n]{x}", display: "ⁿ√x" },
        { label: "Qavs ( )", formula: "\\left( x \\right)", display: "(x)" },
        { label: "Modul |x|", formula: "|x|", display: "|x|" },
        { label: "Qavs { }", formula: "\\{ x \\}", display: "{x}" },
      ]
    },
    symbols: {
      label: "Matematik Belgilar",
      icon: Variable,
      items: [
        { label: "Plyus-Minus", formula: "\\pm", display: "±" },
        { label: "Ko'paytirish", formula: "\\times", display: "×" },
        { label: "Bo'lish", formula: "\\div", display: "÷" },
        { label: "Teng emas", formula: "\\neq", display: "≠" },
        { label: "Kichik yoki teng", formula: "\\le", display: "≤" },
        { label: "Katta yoki teng", formula: "\\ge", display: "≥" },
        { label: "Taqriban", formula: "\\approx", display: "≈" },
        { label: "Cheksizlik", formula: "\\infty", display: "∞" },
        { label: "Tegishli", formula: "\\in", display: "∈" },
        { label: "Burchak", formula: "\\angle", display: "∠" },
        { label: "Daraja °", formula: "^\\circ", display: "°" },
      ]
    },
    greek: {
      label: "Yunon & Trigonometriya",
      icon: Binary,
      items: [
        { label: "Pi (π)", formula: "\\pi", display: "π" },
        { label: "Alfa (α)", formula: "\\alpha", display: "α" },
        { label: "Beta (β)", formula: "\\beta", display: "β" },
        { label: "Gamma (γ)", formula: "\\gamma", display: "γ" },
        { label: "Teta (θ)", formula: "\\theta", display: "θ" },
        { label: "Delta (Δ)", formula: "\\Delta", display: "Δ" },
        { label: "Sinus", formula: "\\sin(x)", display: "sin(x)" },
        { label: "Kosinus", formula: "\\cos(x)", display: "cos(x)" },
        { label: "Tangens", formula: "\\tan(x)", display: "tan(x)" },
        { label: "Limes (Lim)", formula: "\\lim_{x \\to 0}", display: "lim" },
      ]
    },
    chemistry: {
      label: "Kimyo & Fizika",
      icon: Beaker,
      items: [
        { label: "Suv (H₂O)", formula: "H_{2}O", display: "H₂O" },
        { label: "Karbonat (CO₂)", formula: "CO_{2}", display: "CO₂" },
        { label: "Kislota (H₂SO₄)", formula: "H_{2}SO_{4}", display: "H₂SO₄" },
        { label: "Reaksiya Strelkasi", formula: "\\rightarrow", display: "→" },
        { label: "Qaytuvchan Strelka", formula: "\\rightleftharpoons", display: "⇌" },
        { label: "Vektor (v)", formula: "\\vec{v}", display: "v⃗" },
        { label: "Zichlik (ρ)", formula: "\\rho", display: "ρ" },
        { label: "Om (Ω)", formula: "\\Omega", display: "Ω" },
      ]
    },
    calculus: {
      label: "Oliy Matematika",
      icon: Sparkles,
      items: [
        { label: "Integral", formula: "\\int x \\, dx", display: "∫ dx" },
        { label: "Aniq Integral", formula: "\\int_{a}^{b} x \\, dx", display: "∫ₐᵇ" },
        { label: "Yig'indi (Summa)", formula: "\\sum_{i=1}^{n} i", display: "∑" },
        { label: "Hosila (dy/dx)", formula: "\\frac{dy}{dx}", display: "dy/dx" },
        { label: "Matritsa 2x2", formula: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", display: "Matritsa" },
        { label: "Sistema", formula: "\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}", display: "Sistema" },
      ]
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-3 my-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-extrabold text-brand-blue hover:text-blue-600 transition-colors"
        >
          <Calculator size={16} />
          <span>Formula & Matematik Panel {isOpen ? "▼" : "▶"}</span>
        </button>

        {currentValue && (
          currentValue.includes('$') || 
          currentValue.includes('\\') || 
          currentValue.includes('^') || 
          currentValue.includes('_') || 
          currentValue.includes('{') || 
          currentValue.includes('}')
        ) && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span>Ko'rinishi:</span>
            <MathRenderer content={currentValue} inline />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {(Object.keys(categories) as Array<keyof typeof categories>).map((catKey) => {
              const cat = categories[catKey];
              const Icon = cat.icon;
              const isActive = activeCategory === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/20"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Formulas & Symbols Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
            {categories[activeCategory].items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onInsert(`$${item.formula}$`)}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-brand-blue/10 hover:border-brand-blue/30 dark:hover:border-brand-blue/40 transition-all group"
                title={`Kiriting: ${item.formula}`}
              >
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">
                  <MathRenderer content={`$${item.formula}$`} inline />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
