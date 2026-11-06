import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FormPanel } from './components/FormPanel';
import { PlanView } from './components/PlanView';
import { SavedPlansModal } from './components/SavedPlansModal';
import { StatsDashboardModal } from './components/StatsDashboardModal';
import { LiveWorkshopRunner } from './components/LiveWorkshopRunner';
import { AboutModal } from './components/AboutModal';
import { WorkshopPlan } from './types/workshop';
import { getSavedPlans, savePlanToStorage, deleteSavedPlan } from './utils/storage';
import { exportPlanObjectToPdf, sanitizeFilename } from './utils/pdfExport';
import { useTheme } from './utils/theme';
import {
  Sparkles,
  Hammer,
  BookOpen,
  AlertCircle,
  WifiOff,
  Database,
  BarChart3,
} from 'lucide-react';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const [currentPlan, setCurrentPlan] = useState<WorkshopPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedPlans, setSavedPlans] = useState<WorkshopPlan[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isLiveRunnerOpen, setIsLiveRunnerOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Online / Offline state
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Loading animation quote index
  const [quoteIdx, setQuoteIdx] = useState(0);

  const loadingQuotes = [
    'Tecendo referências de Arte Povera, Cubismo e Assemblage...',
    'Articulando habilidades e competências da BNCC para Artes Visuais...',
    'Calculando temporização e roteiro passo a passo com mediação...',
    'Organizando lista de materiais com descarte criativo e tecnologia...',
    'Estruturando tecnologias assistivas de baixo custo e Desenho Universal...',
    'Elaborando perguntas disparadoras e critérios de reflexão estética...',
  ];

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved plans from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        const plans = await getSavedPlans();
        if (isMounted) {
          setSavedPlans(plans);
        }
      } catch (err) {
        console.error('Erro ao carregar planos do IndexedDB:', err);
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (isLoading || isRefining) {
      interval = window.setInterval(() => {
        setQuoteIdx((prev) => (prev + 1) % loadingQuotes.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading, isRefining]);

  /**
   * Generates an artistic cover image for the plan using the Imagen model
   */
  const generateCoverForPlan = async (planToUpdate: WorkshopPlan) => {
    if (!planToUpdate || isGeneratingCover) return;
    setIsGeneratingCover(true);

    try {
      const response = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: planToUpdate.titulo_oficina,
          theme: planToUpdate.theme || planToUpdate.titulo_oficina,
          subtitle: planToUpdate.subtitulo_poetico || '',
        }),
      });

      if (!response.ok) {
        console.warn('Falha na geração de capa via Imagen (status):', response.status);
        return;
      }

      const data = await response.json();
      if (data?.imageUrl) {
        const updatedPlan: WorkshopPlan = {
          ...planToUpdate,
          coverImageUrl: data.imageUrl,
        };

        setCurrentPlan((prev) => (prev ? { ...prev, coverImageUrl: data.imageUrl } : null));

        // If it was already saved in IndexedDB, update the stored version
        setSavedPlans((prevSaved) => {
          const isSaved = prevSaved.some((p) => p.id === planToUpdate.id);
          if (isSaved) {
            savePlanToStorage(updatedPlan);
            return prevSaved.map((p) => (p.id === planToUpdate.id ? updatedPlan : p));
          }
          return prevSaved;
        });
      }
    } catch (err) {
      console.warn('Erro ao requisitar capa artística com Imagen:', err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleGenerate = async (formData: {
    theme: string;
    audience: string;
    duration: string;
    accessibility: string;
    bnccSkills: string;
    artMovement: string;
    makerFocus: string;
    spaceEnvironment: string;
    additionalNotes: string;
  }) => {
    if (!isOnline) {
      setError(
        'Você está sem conexão com a internet. A geração por IA necessita de conexão, mas você pode consultar, conduzir e exportar todos os seus projetos salvos na Biblioteca offline (IndexedDB).'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const plan: WorkshopPlan = await response.json();
      plan.theme = formData.theme;
      plan.audience = formData.audience;
      plan.duration = formData.duration;
      plan.accessibility = formData.accessibility;
      plan.bnccSkills = formData.bnccSkills;
      plan.id = `plan_${Date.now()}`;
      plan.createdAt = new Date().toISOString();

      setCurrentPlan(plan);

      // Automatically trigger Imagen artistic cover generation based on the new plan
      generateCoverForPlan(plan);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 'Falha ao gerar o planejamento pedagógico. Tente novamente em instantes.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!currentPlan) return;

    if (!isOnline) {
      setError(
        'Você está offline. O refinamento via IA requer internet. Suas alterações e projetos continuam salvos no IndexedDB.'
      );
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch('/api/refine-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan,
          instruction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const updated: WorkshopPlan = await response.json();
      updated.id = currentPlan.id;
      updated.createdAt = currentPlan.createdAt;
      updated.theme = currentPlan.theme;
      updated.audience = currentPlan.audience;
      updated.duration = currentPlan.duration;
      updated.coverImageUrl = currentPlan.coverImageUrl; // Retain existing cover

      setCurrentPlan(updated);

      // If it was already saved, update in IndexedDB storage as well
      if (savedPlans.some((p) => p.id === currentPlan.id)) {
        const refreshed = await savePlanToStorage(updated);
        setSavedPlans(refreshed);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao refinar o plano. Tente novamente.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveCurrentPlan = async () => {
    if (!currentPlan) return;
    try {
      const updated = await savePlanToStorage(currentPlan);
      setSavedPlans(updated);
    } catch (err) {
      console.error('Falha ao salvar plano:', err);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const updated = await deleteSavedPlan(id);
      setSavedPlans(updated);
    } catch (err) {
      console.error('Falha ao excluir plano:', err);
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!currentPlan || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportPlanObjectToPdf(currentPlan, {
        filename: sanitizeFilename(currentPlan.titulo_oficina),
      });
    } catch (e) {
      console.error('Failed to export PDF from Header:', e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const isCurrentPlanSaved = Boolean(
    currentPlan?.id && savedPlans.some((p) => p.id === currentPlan.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#0c0a09] text-stone-800 dark:text-stone-100 transition-colors duration-200">
      <Header
        savedCount={savedPlans.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        hasPlan={Boolean(currentPlan)}
        onPrint={() => window.print()}
        onExportPdf={currentPlan ? handleExportPdf : undefined}
        isExportingPdf={isExportingPdf}
        isOnline={isOnline}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500 dark:bg-amber-600 text-stone-900 dark:text-stone-900 px-4 py-2 text-xs font-semibold flex items-center justify-center space-x-2 shadow-inner no-print">
          <WifiOff className="w-4 h-4 text-stone-900 shrink-0" />
          <span>
            Você está sem conexão à internet. O Ateliê está funcionando em <strong>Modo Offline</strong>: todos os seus planos no <strong>IndexedDB</strong> estão prontos para consulta, timer de oficina e exportação em PDF.
          </span>
          <button
            onClick={() => setIsSavedModalOpen(true)}
            className="underline ml-2 hover:text-black font-bold"
          >
            Abrir Biblioteca Offline
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Parameters */}
        <div className="lg:col-span-5 no-print">
          <FormPanel isLoading={isLoading} onGenerate={handleGenerate} />
        </div>

        {/* Right Column: Output / Workspace */}
        <div className="lg:col-span-7">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Aviso pedagógico:</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-6 shadow-xs animate-pulse">
              <div className="w-16 h-16 border-4 border-[#e05638] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                  Construindo a Oficina no Ateliê...
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 transition-all duration-300 min-h-[36px]">
                  {loadingQuotes[quoteIdx]}
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !currentPlan && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 border-dashed p-10 sm:p-14 text-center space-y-4 transition-colors">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mx-auto text-[#e05638] shadow-xs">
                <Hammer className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 font-display">
                  Nenhum planejamento gerado ainda
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  Escolha uma das inspirações prontas ao lado ou digite sua proposta para gerar um roteiro pedagógico completo com BNCC, materiais, cronograma, mediação e tecnologias assistivas.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {savedPlans.length > 0 && (
                  <button
                    onClick={() => setIsSavedModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 rounded-xl transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>Ver {savedPlans.length} no IndexedDB</span>
                  </button>
                )}
                <button
                  onClick={() => setIsStatsModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-xl transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#e05638]" />
                  <span>Painel de Estatísticas</span>
                </button>
                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver Guia Pedagógico</span>
                </button>
              </div>
            </div>
          )}

          {/* Generated Plan View */}
          {!isLoading && currentPlan && (
            <PlanView
              plan={currentPlan}
              isSaved={isCurrentPlanSaved}
              onSave={handleSaveCurrentPlan}
              onPrint={() => window.print()}
              onStartWorkshop={() => setIsLiveRunnerOpen(true)}
              onRefine={handleRefine}
              isRefining={isRefining}
              isGeneratingCover={isGeneratingCover}
              onGenerateCover={() => generateCoverForPlan(currentPlan)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <SavedPlansModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        plans={savedPlans}
        onSelectPlan={(p) => setCurrentPlan(p)}
        onDeletePlan={handleDeletePlan}
        onPlansUpdated={(plans) => setSavedPlans(plans)}
        onOpenStats={() => setIsStatsModalOpen(true)}
      />

      <StatsDashboardModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        plans={savedPlans}
        currentPlan={currentPlan}
        onSelectPlan={(p) => setCurrentPlan(p)}
        isDark={isDark}
      />

      {currentPlan && (
        <LiveWorkshopRunner
          isOpen={isLiveRunnerOpen}
          onClose={() => setIsLiveRunnerOpen(false)}
          plan={currentPlan}
        />
      )}

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
