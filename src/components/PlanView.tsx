import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  PlayCircle,
  Sparkles,
  Layers,
  Award,
  Box,
  Compass,
  HelpCircle,
  ShieldAlert,
  Send,
  MessageSquare,
  Wand2,
  Share2,
  FileDown,
  Accessibility,
  Image as ImageIcon,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { WorkshopPlan } from '../types/workshop';
import { copyToClipboard, formatPlanAsMarkdown } from '../utils/export';
import { exportPlanObjectToPdf, sanitizeFilename } from '../utils/pdfExport';

interface PlanViewProps {
  plan: WorkshopPlan;
  isSaved: boolean;
  onSave: () => void;
  onPrint: () => void;
  onStartWorkshop: () => void;
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  isGeneratingCover?: boolean;
  onGenerateCover?: () => Promise<void>;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  isSaved,
  onSave,
  onPrint,
  onStartWorkshop,
  onRefine,
  isRefining,
  isGeneratingCover = false,
  onGenerateCover,
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});
  const [refineText, setRefineText] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [isCoverZoomed, setIsCoverZoomed] = useState(false);

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportPlanObjectToPdf(plan, {
        filename: sanitizeFilename(plan.titulo_oficina),
      });
      setPdfExported(true);
      setTimeout(() => setPdfExported(false), 3000);
    } catch (err) {
      console.error('Error generating PDF with html2pdf:', err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyMarkdown = async () => {
    const md = formatPlanAsMarkdown(plan);
    const ok = await copyToClipboard(md);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleMaterialCheck = (id: string) => {
    setCheckedMaterials((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isRefining) return;
    await onRefine(refineText.trim());
    setRefineText('');
  };

  const handleQuickRefine = async (suggestion: string) => {
    if (isRefining) return;
    await onRefine(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* 0. Imagen Artistic Cover Banner */}
      {(plan.coverImageUrl || isGeneratingCover) && (
        <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-stone-900 group print-break-inside-avoid">
          {plan.coverImageUrl ? (
            <>
              <div
                className="relative w-full h-52 sm:h-72 cursor-pointer overflow-hidden"
                onClick={() => setIsCoverZoomed(true)}
                title="Clique para ampliar a imagem de capa artística"
              >
                <img
                  src={plan.coverImageUrl}
                  alt={`Capa artística para ${plan.titulo_oficina}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />
              </div>

              {/* Bottom Info & Controls Bar inside Cover */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-auto">
                <div className="flex items-center space-x-2 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-[11px] tracking-wide">
                    Capa Artística • Modelo Imagen 3
                  </span>
                </div>

                <div className="flex items-center space-x-2 no-print">
                  <button
                    onClick={() => setIsCoverZoomed(true)}
                    className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-black/90 backdrop-blur-md text-white/90 hover:text-white border border-white/10 transition-colors"
                    title="Ampliar visualização"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {onGenerateCover && (
                    <button
                      onClick={onGenerateCover}
                      disabled={isGeneratingCover}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15 transition-all shadow-sm disabled:opacity-50"
                      title="Gerar nova imagem artística com o Imagen"
                    >
                      <RefreshCw className={`w-3 h-3 text-orange-400 ${isGeneratingCover ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingCover ? 'Gerando...' : 'Regenerar Capa'}</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-52 sm:h-64 bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100 flex flex-col items-center justify-center space-y-3 p-6 text-center animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e05638] to-[#c84325] text-white flex items-center justify-center shadow-md shadow-orange-900/20">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-stone-900 font-display">
                  Gerando capa artística com o modelo Imagen...
                </h4>
                <p className="text-xs text-stone-600">
                  Compondo representação visual com estética contemporânea e texturas de ateliê maker
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Button to generate cover if not yet available */}
      {!plan.coverImageUrl && !isGeneratingCover && onGenerateCover && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50/70 rounded-2xl border border-orange-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs no-print">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-[#e05638] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block">
                Capa Artística com Modelo Imagen
              </span>
              <span className="text-stone-600 text-[11px]">
                Gere uma imagem poética de abertura baseada no tema e materiais desta oficina.
              </span>
            </div>
          </div>

          <button
            onClick={onGenerateCover}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#e05638] hover:bg-[#c84325] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gerar Capa com Imagen</span>
          </button>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs p-6 print-break-inside-avoid transition-colors">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/70 text-[#a3331b] dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                Plano de Oficina Homologado
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-600">•</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {plan.audience || 'Geral'}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-600">•</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {plan.duration || 'Oficina'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-display leading-tight">
              {plan.titulo_oficina}
            </h2>

            {plan.subtitulo_poetico && (
              <p className="text-sm font-medium italic text-stone-600 dark:text-stone-300">
                "{plan.subtitulo_poetico}"
              </p>
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
            <button
              onClick={onStartWorkshop}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              title="Iniciar facilitador com timer e mediação"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Conduzir ao Vivo</span>
            </button>

            <button
              onClick={onSave}
              title={
                isSaved
                  ? 'Salvo no IndexedDB do navegador. Disponível mesmo offline.'
                  : 'Salvar no banco IndexedDB para consultar mesmo sem internet.'
              }
              className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Salvo no IndexedDB</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <span>Salvar Offline</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
              title="Copiar texto formatado em Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <span>Copiar MD</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#e05638] to-[#c84325] hover:from-[#c84325] hover:to-[#a3331b] disabled:opacity-60 rounded-xl shadow-xs transition-all"
              title="Baixar Plano de Aula formatado em PDF (A4)"
            >
              {isExportingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : pdfExported ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>PDF Baixado!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
              title="Imprimir ou Salvar PDF pelo navegador"
            >
              <Printer className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção 1: Conceito Curatorial & Referências Artísticas & BNCC */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs space-y-5 print-break-inside-avoid transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#e05638] dark:text-orange-400">
          <Compass className="w-4 h-4" />
          <span>1. Justificativa Curatorial & Fundamentação</span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1.5">
            Conceito & Contexto da Experiência
          </h3>
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal whitespace-pre-line">
            {plan.resumo_conceitual}
          </p>
        </div>

        {/* Alinhamento BNCC & Competências Gerais */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a3331b] dark:text-orange-300 flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#e05638]" />
              <span>Alinhamento Curricular: Habilidades Específicas da BNCC</span>
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              MEC / BNCC Oficial
            </span>
          </div>

          {plan.alinhamento_bncc && (
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
              {plan.alinhamento_bncc}
            </p>
          )}

          {/* Cards de Habilidades Específicas */}
          {plan.habilidades_especificas_bncc && plan.habilidades_especificas_bncc.length > 0 && (
            <div className="space-y-3 pt-1">
              {plan.habilidades_especificas_bncc.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-stone-950 border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-2 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 shadow-2xs">
                      {item.codigo}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      {item.campo_ou_unidade}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                    {item.descricao}
                  </p>

                  <div className="p-2.5 rounded-lg bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/50 text-xs text-orange-950 dark:text-orange-200 flex items-start space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#e05638] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[10px] uppercase tracking-wider text-[#a3331b] dark:text-orange-300 block">
                        Como esta oficina mobiliza a habilidade:
                      </span>
                      <span className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                        {item.aplicacao_na_oficina}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Competências Gerais da Educação Básica */}
          {plan.competencias_gerais_bncc && plan.competencias_gerais_bncc.length > 0 && (
            <div className="pt-2 border-t border-amber-200/70 dark:border-amber-900/50 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                Competências Gerais da Educação Básica Contempladas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {plan.competencias_gerais_bncc.map((comp, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-900/60 text-stone-800 dark:text-stone-200 shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{comp}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {plan.referencias_artistas && plan.referencias_artistas.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2.5">
              Referências de Artistas & Movimentos Estéticos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.referencias_artistas.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs space-y-1"
                >
                  <div className="font-bold text-stone-900 dark:text-stone-100">{ref.artista}</div>
                  <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    {ref.movimento}
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-snug pt-0.5">
                    {ref.obra_ou_conceito}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seção 2: Tríade de Objetivos Pedagógicos */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs print-break-inside-avoid transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
          <Award className="w-4 h-4" />
          <span>2. Objetivos de Aprendizagem (Tríade Pedagógica)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cognitivo */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Cognitivo / Conceitual
              </h4>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              {plan.objetivos.cognitivo}
            </p>
          </div>

          {/* Poético & Sensível */}
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                Poético & Sensível
              </h4>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              {plan.objetivos.poetico_sensivel}
            </p>
          </div>

          {/* Prático & Maker */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Prático & Maker
              </h4>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              {plan.objetivos.pratico_maker}
            </p>
          </div>
        </div>
      </div>

      {/* Seção 3: Materiais e Componentes Interativa */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs print-break-inside-avoid transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Box className="w-4 h-4" />
            <span>3. Materiais, Ferramentas & Economia Circular</span>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 no-print">
            Marque os itens conforme separar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Recicláveis & Orgânicos */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Descarte & Orgânicos</span>
            </h4>
            <div className="space-y-1.5">
              {plan.materiais.reciclaveis_organicos?.map((item, idx) => {
                const id = `rec_${idx}`;
                const isChecked = !!checkedMaterials[id];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleMaterialCheck(id)}
                    className={`flex items-start space-x-2 text-xs p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-stone-400 dark:text-stone-500 line-through'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="leading-snug">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tecnológicos & Eletrônicos */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Eletrônicos & Tech</span>
            </h4>
            <div className="space-y-1.5">
              {plan.materiais.tecnologicos_eletronicos?.map((item, idx) => {
                const id = `tech_${idx}`;
                const isChecked = !!checkedMaterials[id];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleMaterialCheck(id)}
                    className={`flex items-start space-x-2 text-xs p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-stone-400 dark:text-stone-500 line-through'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="leading-snug">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ferramental & EPIs */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-600 dark:bg-stone-400"></span>
              <span>Ferramentas & EPIs</span>
            </h4>
            <div className="space-y-1.5">
              {plan.materiais.ferramentas_epi?.map((item, idx) => {
                const id = `tool_${idx}`;
                const isChecked = !!checkedMaterials[id];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleMaterialCheck(id)}
                    className={`flex items-start space-x-2 text-xs p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-stone-100 dark:bg-stone-950/40 text-stone-400 dark:text-stone-500 line-through'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-stone-600 focus:ring-stone-500"
                    />
                    <span className="leading-snug">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {plan.materiais.dica_coleta && (
          <div className="mt-4 p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 leading-relaxed flex items-start space-x-2">
            <span className="font-bold shrink-0">♻️ Dica de Coleta Comunitária:</span>
            <span>{plan.materiais.dica_coleta}</span>
          </div>
        )}
      </div>

      {/* Seção 4: Roteiro Cronológico Passo a Passo com Mediação */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Layers className="w-4 h-4" />
            <span>4. Roteiro Cronológico & Estratégias de Mediação</span>
          </div>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {plan.roteiro_passo_a_passo.length} Etapas Estruturadas
          </span>
        </div>

        <div className="space-y-4">
          {plan.roteiro_passo_a_passo.map((etapa, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-800/70 transition-colors space-y-3 print-break-inside-avoid"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
                    {etapa.fase}
                  </h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ⏱️ {etapa.duracao_estimada}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-300 font-medium px-2 py-0.5 bg-stone-200/80 dark:bg-stone-700 rounded-md">
                    {etapa.foco}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-8">
                {etapa.descricao}
              </p>

              {/* Dica de Mediação */}
              <div className="ml-8 p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-start space-x-2">
                <span className="font-bold shrink-0">💡 Dica de Mediação:</span>
                <span className="leading-relaxed">{etapa.dica_mediacao}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 5: Avaliação & Perguntas Disparadoras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
        {/* Perguntas Disparadoras */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <HelpCircle className="w-4 h-4" />
            <span>Perguntas para Roda de Conversa</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Questões provocativas para instigar reflexão estética e crítica durante e após a criação:
          </p>
          <ul className="space-y-2">
            {plan.perguntas_disparadoras?.map((q, idx) => (
              <li
                key={idx}
                className="text-xs text-stone-700 dark:text-stone-300 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-start space-x-2 leading-relaxed"
              >
                <span className="text-purple-600 dark:text-purple-400 font-bold">💬</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critérios de Avaliação Formativa */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            <Award className="w-4 h-4 text-[#e05638]" />
            <span>Critérios de Avaliação Formativa</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Indicadores para observar o processo de experimentação e autoria dos alunos:
          </p>
          <ul className="space-y-2">
            {plan.criterios_avaliacao?.map((c, idx) => (
              <li
                key={idx}
                className="text-xs text-stone-700 dark:text-stone-300 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 flex items-start space-x-2 leading-relaxed"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seção 6: Adaptações, Acessibilidade & Tecnologias Assistivas */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs space-y-5 print-break-inside-avoid transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <Accessibility className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>6. Acessibilidade & Tecnologias Assistivas de Baixo Custo (DIY)</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
            Adaptação de Materiais & Desenho Universal
          </span>
        </div>

        {plan.accessibility && (
          <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 flex items-start space-x-2">
            <span className="font-bold text-stone-900 dark:text-stone-100 shrink-0">🎯 Perfil / Foco de Inclusão da Turma:</span>
            <span>{plan.accessibility}</span>
          </div>
        )}

        {/* Tecnologias Assistivas DIY de Baixo Custo */}
        {plan.tecnologias_assistivas_baixo_custo && plan.tecnologias_assistivas_baixo_custo.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Recursos de Tecnologia Assistiva Sugeridos para a Oficina:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {plan.tecnologias_assistivas_baixo_custo.map((ta, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-xs text-emerald-950 dark:text-emerald-300 flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{ta.recurso}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {ta.publico_beneficiado}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1 pl-6">
                    <p>
                      <strong>Adaptação do Material:</strong> {ta.adaptacao_material}
                    </p>
                    <p className="text-emerald-900 dark:text-emerald-200 bg-white/70 dark:bg-stone-900/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-[11px] leading-relaxed">
                      <strong>🛠️ Como Fazer / Aplicar:</strong> {ta.como_construir_ou_aplicar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adaptações Complementares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
              🌱 Baixo Recurso / Escassez
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {plan.adaptacoes.baixo_recurso}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
              ♿ Mediação Inclusiva Geral
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {plan.adaptacoes.acessibilidade_inclusao}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
            <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
              🚀 Desafio Avançado
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {plan.adaptacoes.desafio_avancado}
            </p>
          </div>
        </div>

        {plan.seguranca_atelier && (
          <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-xl text-xs text-rose-950 dark:text-rose-200 flex items-start space-x-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <div>
              <span className="font-bold">Protocolos de Segurança do Ateliê: </span>
              <span>{plan.seguranca_atelier}</span>
            </div>
          </div>
        )}
      </div>

      {/* Seção 7: Refinamento Interativo com IA */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-2xl p-6 shadow-md space-y-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display">
              Refinar ou Customizar Este Planejamento
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Gemini 3.8 Flash • Adaptação Dinâmica
          </span>
        </div>

        <p className="text-xs text-stone-300">
          Precisa adaptar para turmas maiores, materiais diferentes ou incluir atividades digitais?
          Clique em uma sugestão rápida ou digite o ajuste desejado:
        </p>

        {/* Sugestões rápidas */}
        <div className="flex flex-wrap gap-2">
          {[
            'Adaptar para materiais 100% sem custo (apenas recicláveis de casa)',
            'Incluir adaptação sensorial detalhada para alunos no espectro autista (TEA)',
            'Transformar em projeto continuado de 4 encontros',
            'Adicionar rubrica de avaliação formativa com notas e níveis',
          ].map((sug, i) => (
            <button
              key={i}
              type="button"
              disabled={isRefining}
              onClick={() => handleQuickRefine(sug)}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-stone-800/90 border border-stone-700 hover:border-amber-400/60 hover:text-amber-200 text-stone-300 transition-colors disabled:opacity-50 text-left"
            >
              + {sug}
            </button>
          ))}
        </div>

        {/* Formulário de Refinamento */}
        <form onSubmit={handleRefineSubmit} className="flex gap-2">
          <input
            type="text"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            disabled={isRefining}
            placeholder="Ex: Altere o circuito para usar papel alumínio em vez de fio de cobre e detalhe a aula..."
            className="flex-1 rounded-xl bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={isRefining || !refineText.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors shrink-0"
          >
            {isRefining ? (
              <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Aplicar Ajuste</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lightbox Zoom Modal for Imagen Cover */}
      {isCoverZoomed && plan.coverImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn no-print"
          onClick={() => setIsCoverZoomed(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={plan.coverImageUrl}
              alt={plan.titulo_oficina}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
            <div className="p-4 bg-stone-950/90 flex items-center justify-between text-xs text-white">
              <div className="space-y-0.5">
                <span className="font-bold text-stone-200 block">{plan.titulo_oficina}</span>
                <span className="text-[11px] text-stone-400">Capa gerada artisticamente pelo modelo Imagen</span>
              </div>
              <button
                onClick={() => setIsCoverZoomed(false)}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
