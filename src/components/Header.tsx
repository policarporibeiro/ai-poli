import React from 'react';
import {
  Hammer,
  Bookmark,
  BookOpen,
  Printer,
  FileDown,
  Database,
  WifiOff,
  BarChart3,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAbout: () => void;
  onOpenStats?: () => void;
  hasPlan: boolean;
  onPrint: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
  isOnline?: boolean;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  onOpenAbout,
  onOpenStats,
  hasPlan,
  onPrint,
  onExportPdf,
  isExportingPdf,
  isOnline = true,
  isDark = false,
  onToggleTheme,
}) => {
  return (
    <header className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 shadow-xs transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e05638] to-[#c84325] flex items-center justify-center text-white shadow-md shadow-orange-900/10 dark:shadow-none">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight font-display">
                Ateliê Maker & Arte
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 dark:bg-orange-950/70 text-[#a3331b] dark:text-orange-300 border border-orange-200 dark:border-orange-800/80">
                BNCC & STEAM
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Planejamento Pedagógico para Arte Contemporânea, Tinkering & FabLabs
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Online/Offline Status Indicator */}
          <div
            title={
              isOnline
                ? 'Conectado à internet. Planos salvos persistem offline no IndexedDB.'
                : 'Modo Offline. Você pode consultar e exportar todos os seus projetos salvos no IndexedDB.'
            }
            className={`hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-stone-50 dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Database className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span className="text-[11px]">IndexedDB Ativo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[11px] font-bold">Modo Offline</span>
              </>
            )}
          </div>

          {onOpenStats && (
            <button
              onClick={onOpenStats}
              title="Painel de Estatísticas: temas mais recorrentes, tempo total e abrangência"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all"
            >
              <BarChart3 className="w-4 h-4 text-[#e05638]" />
              <span className="hidden sm:inline">Estatísticas</span>
            </button>
          )}

          {hasPlan && onExportPdf && (
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              title="Baixar Plano de Aula formatado em PDF"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-[#e05638] hover:bg-[#c84325] disabled:opacity-60 rounded-xl transition-all shadow-xs"
            >
              {isExportingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isExportingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>
          )}

          {hasPlan && (
            <button
              onClick={onPrint}
              title="Imprimir ou Salvar PDF"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span className="hidden md:inline">Imprimir</span>
            </button>
          )}

          <button
            onClick={onOpenSaved}
            className="relative inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all"
          >
            <Bookmark className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            <span>Biblioteca</span>
            {savedCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-[#e05638] rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAbout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guia do Ateliê</span>
          </button>

          {/* Dark Mode Global Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              title={isDark ? 'Alternar para Modo Claro (Ambiente iluminado)' : 'Alternar para Modo Escuro (Ambiente com pouca luz)'}
              className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-amber-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-all focus:outline-none focus:ring-2 focus:ring-[#e05638]"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600 transition-transform duration-300 hover:-rotate-12" />
              )}
              <span className="sr-only">
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
