import React from 'react';
import { X, Sparkles, BookOpen, Layers, ShieldCheck, Cpu, Accessibility } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/70 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-fadeIn transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e05638] flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                Guia Pedagógico do Ateliê Maker & Arte
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Fundamentos conceituais, metodológicos e de segurança
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          {/* Card 1: Arte Povera e Cultura Maker */}
          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a3331b] dark:text-orange-300 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#e05638]" />
              <span>Por que Unir Arte Povera e Cultura Maker?</span>
            </h4>
            <p>
              O movimento italiano da <strong>Arte Povera</strong> (década de 1960) desafiou os
              materiais tradicionais da arte nobre usando terra, gravetos, trapos, ferro e resíduos do
              cotidiano. Ao aproximar esse movimento da <strong>Cultura Maker</strong> e da
              computação física, libertamos os alunos do tecnocentrismo: a tecnologia deixa de ser um
              fim em si mesmo e passa a ser matéria poética e expressiva.
            </p>
          </div>

          {/* Card 2: Tinkering e o Pensar com as Mãos */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tinkering & Construcionismo (Seymour Papert)</span>
            </h4>
            <p>
              Acreditamos na aprendizagem baseada na experimentação exploratória (tinkering). Em vez de
              seguir manuais de montagem rígidos ("receita de bolo"), o ateliê encoraja o erro como
              fonte de descoberta, o desmonte investigativo e a prototipagem rápida de ideias autorais.
            </p>
          </div>

          {/* Card 3: BNCC Integrada */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Conexão com a BNCC</span>
            </h4>
            <p>
              Cada planejamento gerado busca integrar as <strong>Competências Gerais da BNCC</strong>,
              especialmente:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-stone-600 dark:text-stone-400">
              <li>
                <strong>Competência 3 (Repertório Cultural):</strong> fruição e manifestação artística.
              </li>
              <li>
                <strong>Competência 4 (Comunicação):</strong> expressão em múltiplas linguagens
                visuais e tecnológicas.
              </li>
              <li>
                <strong>Competência 5 (Cultura Digital):</strong> uso crítico, significativo e ético
                da tecnologia e computação criativa.
              </li>
              <li>
                <strong>Competência 7 (Argumentação) & 10 (Autonomia):</strong> resolução colaborativa
                de problemas socioambientais.
              </li>
            </ul>
          </div>

          {/* Card 4: Tecnologias Assistivas DIY de Baixo Custo */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center space-x-1.5">
              <Accessibility className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Tecnologias Assistivas de Baixo Custo (DIY)</span>
            </h4>
            <p>
              O ateliê inclusivo não depende de equipamentos caros: materiais simples de descarte e papelaria
              podem transformar a experiência para alunos com deficiência ou neurodivergência:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
              <li>
                <strong>Engrossadores e apoios:</strong> canudos de piscina, tubos de silicone e EVA para ferramentas com empunhadura acessível.
              </li>
              <li>
                <strong>Pistas táteis e relevos:</strong> linhas de cola quente, barbante e lixas para leitura tátil de circuitos e formas.
              </li>
              <li>
                <strong>Sinalização multissensorial:</strong> LEDs coloridos para feedback visual e motores de vibração para percepção tátil.
              </li>
            </ul>
          </div>

          {/* Card 5: Coleta Segura de E-lixo */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Boas Práticas de Sucata Eletrônica Limpa</span>
            </h4>
            <p>
              Para ateliês escolares com crianças e jovens:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
              <li>
                <strong>Evitar:</strong> Monitores CRT de tubo antigo, fontes ligadas à tomada de alta
                tensão e baterias de lítio inchadas ou danificadas.
              </li>
              <li>
                <strong>Priorizar:</strong> Brinquedos velhos a pilha, teclados USB desativados,
                impressoras antigas (ótimas fontes de motores de passo e engrenagens), cabos flat e
                caixas de papelão corrugado.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#e05638] hover:bg-[#c84325] rounded-xl transition-colors"
          >
            Entendido, vamos criar!
          </button>
        </div>
      </div>
    </div>
  );
};
