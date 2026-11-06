import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Search,
  Trash2,
  ExternalLink,
  Calendar,
  Users,
  Clock,
  Copy,
  Check,
  FileDown,
  Database,
  Download,
  Upload,
  BarChart3,
  Tag,
  Filter,
} from 'lucide-react';
import { WorkshopPlan } from '../types/workshop';
import { copyToClipboard, formatPlanAsMarkdown } from '../utils/export';
import { exportPlanObjectToPdf, sanitizeFilename } from '../utils/pdfExport';
import { exportAllPlansAsJson, importPlansFromJson } from '../utils/storage';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: WorkshopPlan[];
  onSelectPlan: (plan: WorkshopPlan) => void;
  onDeletePlan: (id: string) => void;
  onPlansUpdated?: (updatedPlans: WorkshopPlan[]) => void;
  onOpenStats?: () => void;
}

const QUICK_SEARCH_CHIPS = [
  'Arte Povera',
  'Sucata',
  'Robótica',
  'Papelão',
  'Circuitos',
  'Cianotipia',
  'E-Têxteis',
];

/**
 * Normalizes text removing accents/diacritics and converting to lowercase for robust searching
 */
function normalizeText(text?: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSelectPlan,
  onDeletePlan,
  onPlansUpdated,
  onOpenStats,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownloadPdf = async (plan: WorkshopPlan) => {
    if (!plan.id || downloadingId) return;
    setDownloadingId(plan.id);
    try {
      await exportPlanObjectToPdf(plan, {
        filename: sanitizeFilename(plan.titulo_oficina),
      });
    } catch (e) {
      console.error('Failed to export PDF:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBackupExport = async () => {
    try {
      const jsonStr = await exportAllPlansAsJson();
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `atelie_maker_backup_indexeddb_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao exportar backup:', e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const updated = await importPlansFromJson(text);
      if (onPlansUpdated) {
        onPlansUpdated(updated);
      }
      setImportStatus('Backup importado com sucesso no IndexedDB!');
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      console.error('Falha ao importar backup:', err);
      setImportStatus('Arquivo JSON inválido. Verifique o arquivo de backup.');
      setTimeout(() => setImportStatus(null), 4000);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filter plans by keywords matching title or theme
  const filtered = useMemo(() => {
    if (!search.trim()) return plans;

    const keywords = normalizeText(search)
      .split(/\s+/)
      .map((k) => k.trim())
      .filter(Boolean);

    if (keywords.length === 0) return plans;

    return plans.filter((plan) => {
      // Primary search targets: title and theme
      const titleNormalized = normalizeText(plan.titulo_oficina);
      const themeNormalized = normalizeText(plan.theme);

      // Secondary search targets: subtitle, summary and audience
      const secondaryNormalized = normalizeText(
        `${plan.subtitulo_poetico || ''} ${plan.resumo_conceitual || ''} ${plan.audience || ''}`
      );

      // Plan matches if all keywords are found in title, theme, or general content
      return keywords.every((kw) => {
        return (
          titleNormalized.includes(kw) ||
          themeNormalized.includes(kw) ||
          secondaryNormalized.includes(kw)
        );
      });
    });
  }, [plans, search]);

  const handleCopy = async (plan: WorkshopPlan) => {
    const md = formatPlanAsMarkdown(plan);
    const ok = await copyToClipboard(md);
    if (ok && plan.id) {
      setCopiedId(plan.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-fadeIn transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/90 dark:bg-stone-900/90">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                Biblioteca de Planos Pedagógicos
              </h3>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                <Database className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>IndexedDB Offline</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {plans.length} {plans.length === 1 ? 'planejamento salvo' : 'planejamentos salvos'} no navegador para consulta online ou offline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline & Backup Tools Bar */}
        <div className="px-4 py-2.5 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-stone-700 dark:text-stone-300">
            <Database className="w-3.5 h-3.5 text-[#e05638]" />
            <span className="font-medium text-[11px]">
              Seus planos ficam disponíveis mesmo sem conexão com a internet.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenStats && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStats();
                }}
                title="Abrir Painel de Estatísticas com gráficos e indicadores"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-[#e05638] bg-orange-100/80 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/60 border border-orange-300 dark:border-orange-800 rounded-lg shadow-2xs transition-colors"
              >
                <BarChart3 className="w-3 h-3 text-[#e05638]" />
                <span>Estatísticas</span>
              </button>
            )}

            <button
              onClick={handleBackupExport}
              disabled={plans.length === 0}
              title="Baixar cópia de segurança em arquivo JSON"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xs transition-colors disabled:opacity-40"
            >
              <Download className="w-3 h-3 text-stone-500 dark:text-stone-400" />
              <span>Exportar Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restaurar projetos a partir de arquivo JSON"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xs transition-colors"
            >
              <Upload className="w-3 h-3 text-stone-500 dark:text-stone-400" />
              <span>Importar Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {importStatus && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Dedicated Search Bar Section */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por palavras-chave no título ou tema (ex: robótica, sucata, assemblage, papelão)..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#e05638] focus:border-transparent transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-950"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Result Counter & Quick Keyword Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center space-x-1 shrink-0 mr-1">
                <Tag className="w-3 h-3 text-[#e05638]" />
                <span>Tags:</span>
              </span>
              {QUICK_SEARCH_CHIPS.map((chip) => {
                const isActive = search.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    onClick={() => setSearch(isActive ? '' : chip)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors shrink-0 ${
                      isActive
                        ? 'bg-[#e05638] text-white border-[#e05638]'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium shrink-0">
              {search.trim() ? (
                <span>
                  Mostrando <strong>{filtered.length}</strong> de <strong>{plans.length}</strong>
                  {filtered.length !== plans.length && (
                    <button
                      onClick={() => setSearch('')}
                      className="ml-1.5 text-[#e05638] hover:underline font-semibold"
                    >
                      (ver todos)
                    </button>
                  )}
                </span>
              ) : (
                <span>{plans.length} {plans.length === 1 ? 'plano disponível' : 'planos disponíveis'}</span>
              )}
            </div>
          </div>
        </div>

        {/* List of Plans */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 dark:text-stone-500 space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                  {search.trim()
                    ? `Nenhum plano encontrado para "${search}"`
                    : 'Nenhum plano salvo ainda.'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {search.trim()
                    ? 'Tente buscar por outras palavras-chave no título ou tema, ou remova os filtros de pesquisa.'
                    : 'Gere um plano pedagógico no Ateliê e clique em "Salvar Offline" para guardá-lo aqui.'}
                </p>
              </div>

              {search.trim() && (
                <button
                  onClick={() => setSearch('')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#e05638] bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-xl transition-colors"
                >
                  Limpar Pesquisa
                </button>
              )}
            </div>
          ) : (
            filtered.map((plan) => {
              const formattedDate = plan.createdAt
                ? new Date(plan.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Data recente';

              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800/70 hover:border-orange-200 dark:hover:border-orange-800/80 hover:shadow-xs transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug group-hover:text-[#c84325] dark:group-hover:text-orange-400 transition-colors">
                        {plan.titulo_oficina}
                      </h4>
                      {plan.subtitulo_poetico && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                          "{plan.subtitulo_poetico}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleDownloadPdf(plan)}
                        disabled={downloadingId === plan.id}
                        title="Baixar PDF formatado"
                        className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-[#e05638] dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
                      >
                        {downloadingId === plan.id ? (
                          <div className="w-4 h-4 border-2 border-[#e05638] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(plan)}
                        title="Copiar Markdown"
                        className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                      >
                        {copiedId === plan.id ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => plan.id && onDeletePlan(plan.id)}
                        title="Excluir do IndexedDB"
                        className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Explicit Theme display so educator sees the matched theme */}
                  {plan.theme && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 flex items-start space-x-2">
                      <Tag className="w-3.5 h-3.5 text-[#e05638] shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-stone-900 dark:text-stone-100">Tema da Oficina: </span>
                        <span>{plan.theme}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{formattedDate}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{plan.audience || 'Geral'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{plan.duration || 'Oficina'}</span>
                    </span>
                    {plan.accessibility && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Inclusão ativa
                      </span>
                    )}
                    {plan.habilidades_especificas_bncc && plan.habilidades_especificas_bncc.length > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {plan.habilidades_especificas_bncc.length} BNCC
                      </span>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center space-x-1">
                      <Database className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                      <span>IDB #{plan.id?.replace('plan_', '').slice(-6)}</span>
                    </span>

                    <button
                      onClick={() => {
                        onSelectPlan(plan);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#e05638] hover:text-[#a3331b] dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                    >
                      <span>Abrir no Ateliê</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Armazenamento permanente e offline no navegador (IndexedDB)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
