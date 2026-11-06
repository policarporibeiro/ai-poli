import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  Clock,
  BookOpen,
  PieChart as PieChartIcon,
  Layers,
  Sparkles,
  Accessibility,
  Palette,
  Timer,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
  Legend,
} from 'recharts';
import { WorkshopPlan } from '../types/workshop';
import { calculateWorkshopStats } from '../utils/stats';

interface StatsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: WorkshopPlan[];
  currentPlan?: WorkshopPlan | null;
  onSelectPlan?: (plan: WorkshopPlan) => void;
  isDark?: boolean;
}

const PALETTE_COLORS = [
  '#e05638', // Brand Orange
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#2563eb', // Royal Blue
  '#7c3aed', // Violet
  '#059669', // Emerald
  '#db2777', // Pink
  '#ea580c', // Dark Orange
];

export const StatsDashboardModal: React.FC<StatsDashboardModalProps> = ({
  isOpen,
  onClose,
  plans,
  currentPlan,
  onSelectPlan,
  isDark = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'themes' | 'time'>('overview');

  // Include currentPlan if not already in plans list
  const allConsideredPlans = useMemo(() => {
    if (!currentPlan) return plans;
    const exists = plans.some((p) => p.id === currentPlan.id);
    return exists ? plans : [currentPlan, ...plans];
  }, [plans, currentPlan]);

  const stats = useMemo(() => {
    return calculateWorkshopStats(allConsideredPlans);
  }, [allConsideredPlans]);

  if (!isOpen) return null;

  const chartTextColor = isDark ? '#d6d3d1' : '#44403c';
  const gridStroke = isDark ? '#292524' : '#e5e5e5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs no-print">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-fadeIn transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/90 dark:bg-stone-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#e05638] to-[#c84325] flex items-center justify-center text-white shadow-md shadow-orange-900/10">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
                  Painel de Estatísticas Pedagógicas
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/70 text-[#a3331b] dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Analytics Maker
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Visão quantitativa de temas, temporização e abrangência de oficinas planejadas
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

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-[#e05638] text-[#e05638] dark:text-orange-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visão Geral & Indicadores</span>
          </button>

          <button
            onClick={() => setActiveTab('themes')}
            className={`py-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'themes'
                ? 'border-[#e05638] text-[#e05638] dark:text-orange-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Temas Recorrentes ({stats.topThemes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('time')}
            className={`py-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'time'
                ? 'border-[#e05638] text-[#e05638] dark:text-orange-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Carga Horária & Oficinas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {allConsideredPlans.length === 0 ? (
            <div className="text-center py-14 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-3xl flex items-center justify-center mx-auto text-stone-400 dark:text-stone-500">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
                  Nenhum plano disponível para análise
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Gere oficinas pedagógicas no formulário principal ou salve seus projetos para
                  visualizar gráficos de temas mais recorrentes, carga horária acumulada e distribuição por público.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-[#e05638] hover:bg-[#c84325] rounded-xl shadow-xs transition-colors"
              >
                Gerar Primeira Oficina
              </button>
            </div>
          ) : (
            <>
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Metric 1: Total Plans */}
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[#a3331b] dark:text-orange-300">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Planos Gerados
                    </span>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#c84325] dark:text-orange-400 font-display">
                    {stats.totalPlans}
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {plans.length} salvos no IndexedDB
                  </p>
                </div>

                {/* Metric 2: Total Time */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Tempo Total
                    </span>
                    <Timer className="w-4 h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-display">
                    {stats.totalHoursFormatted}
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {stats.totalMinutes} min de formação planejada
                  </p>
                </div>

                {/* Metric 3: Average Duration */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-blue-800 dark:text-blue-300">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Duração Média
                    </span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-display">
                    {stats.averageHoursFormatted}
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Média estimada por oficina
                  </p>
                </div>

                {/* Metric 4: Accessibility */}
                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-purple-800 dark:text-purple-300">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Inclusão & DUA
                    </span>
                    <Accessibility className="w-4 h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 font-display">
                    {stats.accessibilityPercentage}%
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {stats.accessibilityCount} de {stats.totalPlans} com acessibilidade
                  </p>
                </div>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Chart Grid: Themes Bar Chart + Audience Donut */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Top Themes Bar Chart */}
                    <div className="lg:col-span-7 bg-stone-50/80 dark:bg-stone-950/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center space-x-1.5">
                          <TrendingUp className="w-4 h-4 text-[#e05638]" />
                          <span>Temas & Movimentos Mais Recorrentes</span>
                        </h4>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          Frequência absoluta
                        </span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.topThemes.slice(0, 5)}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: chartTextColor }} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={140}
                              tick={{ fontSize: 10, fill: chartTextColor }}
                            />
                            <Tooltip
                              formatter={(value: any) => [`${value} oficinas`, 'Total']}
                              contentStyle={{
                                backgroundColor: isDark ? '#1c1917' : '#1c1917',
                                borderColor: isDark ? '#44403c' : '#292524',
                                color: '#fafaf9',
                                borderRadius: '12px',
                                fontSize: '12px',
                              }}
                            />
                            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                              {stats.topThemes.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PALETTE_COLORS[index % PALETTE_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Audience Distribution Donut */}
                    <div className="lg:col-span-5 bg-stone-50/80 dark:bg-stone-950/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center space-x-1.5">
                          <PieChartIcon className="w-4 h-4 text-[#0d9488]" />
                          <span>Distribuição por Público</span>
                        </h4>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">Segmentação</span>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.audienceDistribution}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                            >
                              {stats.audienceDistribution.map((entry, index) => (
                                <Cell
                                  key={`pie-${index}`}
                                  fill={PALETTE_COLORS[(index + 1) % PALETTE_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any) => [`${value} planos`, name]}
                              contentStyle={{
                                backgroundColor: '#1c1917',
                                borderColor: '#44403c',
                                color: '#fafaf9',
                                borderRadius: '12px',
                                fontSize: '11px',
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Curatorial Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-[#e05638] dark:text-orange-400 flex items-center justify-center font-bold">
                        {stats.totalArtistReferences}
                      </div>
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">Referências Artísticas</span>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">Artistas mapeados nas oficinas</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                        {stats.totalMaterialsListed}
                      </div>
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">Itens de Materiais</span>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">Recicláveis, eletrônicos e EPIs</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                        {stats.accessibilityCount}
                      </div>
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">Planos com Acessibilidade</span>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">Tecnologias assistivas de baixo custo</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THEMES IN DEPTH */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div className="bg-stone-50/80 dark:bg-stone-950/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          Frequência Detalhada de Temas e Linguagens Maker
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Identificação das vertentes de arte contemporânea e práticas tecnológicas
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#e05638] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-lg">
                        {stats.topThemes.length} vertentes ativas
                      </span>
                    </div>

                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.topThemes}
                          margin={{ top: 10, right: 20, left: 10, bottom: 35 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                          <XAxis
                            dataKey="name"
                            angle={-20}
                            textAnchor="end"
                            height={45}
                            tick={{ fontSize: 10, fill: chartTextColor }}
                          />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartTextColor }} />
                          <Tooltip
                            formatter={(value: any) => [`${value} ocorrências`, 'Frequência']}
                            contentStyle={{
                              backgroundColor: '#1c1917',
                              borderColor: '#44403c',
                              color: '#fafaf9',
                              borderRadius: '12px',
                              fontSize: '11px',
                            }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {stats.topThemes.map((entry, index) => (
                              <Cell
                                key={`theme-bar-${index}`}
                                fill={PALETTE_COLORS[index % PALETTE_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Thematic breakdown list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stats.topThemes.map((theme, i) => {
                      const pct = Math.round((theme.count / stats.totalPlans) * 100);
                      return (
                        <div
                          key={theme.name}
                          className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: PALETTE_COLORS[i % PALETTE_COLORS.length] }}
                            />
                            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                              {theme.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="font-bold text-stone-900 dark:text-stone-100">{theme.count}</span>
                            <span className="text-[11px] text-stone-400 dark:text-stone-500">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: DURATION & WORKSHOPS */}
              {activeTab === 'time' && (
                <div className="space-y-6">
                  {/* Workshop Duration Chart */}
                  <div className="bg-stone-50/80 dark:bg-stone-950/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          Carga Horária Planejada por Oficina
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Duração calculada a partir do cronograma passo a passo e parâmetros da proposta
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                        Total: {stats.totalHoursFormatted}
                      </span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.durationPerPlan}
                          margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                          <XAxis
                            dataKey="shortTitle"
                            angle={-25}
                            textAnchor="end"
                            height={45}
                            tick={{ fontSize: 10, fill: chartTextColor }}
                          />
                          <YAxis
                            label={{
                              value: 'Horas',
                              angle: -90,
                              position: 'insideLeft',
                              fontSize: 11,
                              fill: chartTextColor,
                            }}
                            tick={{ fontSize: 11, fill: chartTextColor }}
                          />
                          <Tooltip
                            formatter={(value: any) => [`${value} horas`, 'Duração']}
                            labelFormatter={(label: any, payload: any) => {
                              const item = payload?.[0]?.payload;
                              return item ? item.fullTitle : label;
                            }}
                            contentStyle={{
                              backgroundColor: '#1c1917',
                              borderColor: '#44403c',
                              color: '#fafaf9',
                              borderRadius: '12px',
                              fontSize: '11px',
                            }}
                          />
                          <Bar dataKey="hours" fill="#0d9488" radius={[6, 6, 0, 0]}>
                            {stats.durationPerPlan.map((entry, index) => (
                              <Cell
                                key={`duration-bar-${index}`}
                                fill={index % 2 === 0 ? '#0d9488' : '#e05638'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* List of planned workshops with time */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                      Relação de Oficinas Analisadas
                    </h5>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {allConsideredPlans.map((plan, i) => {
                        const durMin = stats.durationPerPlan[i]?.minutes || 120;
                        const hoursStr = (durMin / 60).toFixed(1);

                        return (
                          <div
                            key={plan.id || i}
                            className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5 max-w-[70%]">
                              <span className="font-bold text-stone-900 dark:text-stone-100 block truncate">
                                {plan.titulo_oficina}
                              </span>
                              <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                                {plan.audience || 'Geral'} • {plan.theme || 'Oficina Maker'}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
                                <Clock className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                                <span>{hoursStr}h ({durMin}m)</span>
                              </span>

                              {onSelectPlan && (
                                <button
                                  onClick={() => {
                                    onSelectPlan(plan);
                                    onClose();
                                  }}
                                  className="text-[11px] font-bold text-[#e05638] dark:text-orange-400 hover:text-[#a3331b] dark:hover:text-orange-300 hover:underline"
                                >
                                  Abrir
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between">
          <div className="text-[11px] text-stone-500 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Dados computados em tempo real a partir dos planos no IndexedDB
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
