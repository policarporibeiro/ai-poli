import { WorkshopPlan } from '../types/workshop';

export interface ThemeStat {
  name: string;
  count: number;
}

export interface AudienceStat {
  name: string;
  count: number;
  percentage: number;
}

export interface PlanDurationStat {
  id: string;
  shortTitle: string;
  fullTitle: string;
  minutes: number;
  hours: number;
}

export interface WorkshopStats {
  totalPlans: number;
  totalMinutes: number;
  totalHoursFormatted: string;
  averageMinutesPerPlan: number;
  averageHoursFormatted: string;
  topThemes: ThemeStat[];
  audienceDistribution: AudienceStat[];
  durationPerPlan: PlanDurationStat[];
  accessibilityCount: number;
  accessibilityPercentage: number;
  totalArtistReferences: number;
  totalMaterialsListed: number;
}

/**
 * Extracts minutes from a phase duration string (e.g., "30 min", "1 hora", "45 minutos")
 */
function parsePhaseMinutes(durationStr: string): number {
  if (!durationStr) return 0;
  const str = durationStr.toLowerCase().trim();

  // Match hours like "1h", "1 hora", "1.5 horas"
  const hourMatch = str.match(/(\d+(?:[.,]\d+)?)\s*(?:h|hora|horas)/);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1].replace(',', '.'));
    return Math.round(hours * 60);
  }

  // Match minutes like "30 min", "45 minutos", "20m"
  const minMatch = str.match(/(\d+)\s*(?:m|min|minuto|minutos)/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  // Just a number
  const numMatch = str.match(/\d+/);
  if (numMatch) {
    const val = parseInt(numMatch[0], 10);
    return val > 10 ? val : val * 60;
  }

  return 30; // sensible fallback for a phase
}

/**
 * Parses total workshop duration from plan
 */
export function calculatePlanDurationMinutes(plan: WorkshopPlan): number {
  // If roadmap phases exist and have durations, sum them
  if (plan.roteiro_passo_a_passo && plan.roteiro_passo_a_passo.length > 0) {
    const phaseSum = plan.roteiro_passo_a_passo.reduce((acc, phase) => {
      return acc + parsePhaseMinutes(phase.duracao_estimada);
    }, 0);
    if (phaseSum > 0) return phaseSum;
  }

  // Fallback to top-level duration string
  const str = (plan.duration || '').toLowerCase();
  
  // Check for patterns like "2 encontros de 3 horas" or "3 encontros de 2h"
  const encountersMatch = str.match(/(\d+)\s*(?:encontros?|aulas?)\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:h|hora|horas)/);
  if (encountersMatch) {
    const count = parseInt(encountersMatch[1], 10);
    const hoursPer = parseFloat(encountersMatch[2].replace(',', '.'));
    return Math.round(count * hoursPer * 60);
  }

  // Check for simple hours like "4 horas", "3h"
  const simpleHours = str.match(/(\d+(?:[.,]\d+)?)\s*(?:h|hora|horas)/);
  if (simpleHours) {
    return Math.round(parseFloat(simpleHours[1].replace(',', '.')) * 60);
  }

  // Check for minutes
  const simpleMins = str.match(/(\d+)\s*(?:m|min|minutos)/);
  if (simpleMins) {
    return parseInt(simpleMins[1], 10);
  }

  return 120; // default 2 hours
}

/**
 * Formats minutes into human-readable Portuguese time (e.g., "14h 30min" or "4 horas")
 */
export function formatMinutesToReadable(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return hours === 1 ? '1 hora' : `${hours} horas`;
  return `${hours}h ${mins}min`;
}

/**
 * Identifies primary thematic keywords from titles and themes
 */
const THEME_CATEGORIES = [
  { label: 'Arte Povera & Descarte', pattern: /povera|sucata|descarte|recicl|lixo|e-lixo|res[ií]duo/i },
  { label: 'Robótica & Circuitos', pattern: /rob[oó]tic|circuit|eletr[oô]nic|led|arduino|makey|condutiv|sensor/i },
  { label: 'Assemblage & Colagem', pattern: /assemblage|colagem|cubis|objeto|apropria/i },
  { label: 'Escultura & Construtivismo', pattern: /escultur|cin[eé]tic|calder|aut[oô]mat|mecan|engrenag|papel[aã]o/i },
  { label: 'E-Têxteis & Wearables', pattern: /t[eê]xtil|vest[ií]vel|wearable|bordad|tecido|costur/i },
  { label: 'Fotografia & Cianotipia', pattern: /fotograf|cianotip|luz|c[aâ]mar|qu[ií]mic|biofil/i },
  { label: 'Arte Sonora & Interatividade', pattern: /som|sonor|m[uú]sic|interativ|ru[ií]do|paisagem/i },
  { label: 'Biomateriais & Natureza', pattern: /biomater|bot[aâ]nic|naturez|argila|terra|org[aâ]nic/i },
  { label: 'Impressão 3D & FabLab', pattern: /3d|fablab|laser|corte|prototip/i },
];

/**
 * Computes comprehensive stats across all workshop plans
 */
export function calculateWorkshopStats(plans: WorkshopPlan[]): WorkshopStats {
  const totalPlans = plans.length;

  if (totalPlans === 0) {
    return {
      totalPlans: 0,
      totalMinutes: 0,
      totalHoursFormatted: '0 horas',
      averageMinutesPerPlan: 0,
      averageHoursFormatted: '0 min',
      topThemes: [],
      audienceDistribution: [],
      durationPerPlan: [],
      accessibilityCount: 0,
      accessibilityPercentage: 0,
      totalArtistReferences: 0,
      totalMaterialsListed: 0,
    };
  }

  let totalMinutes = 0;
  let accessibilityCount = 0;
  let totalArtistReferences = 0;
  let totalMaterialsListed = 0;

  const audienceCounts: Record<string, number> = {};
  const themeCounts: Record<string, number> = {};
  const durationPerPlan: PlanDurationStat[] = [];

  plans.forEach((plan, idx) => {
    // 1. Duration calculation
    const mins = calculatePlanDurationMinutes(plan);
    totalMinutes += mins;

    const short = plan.titulo_oficina.length > 22
      ? plan.titulo_oficina.slice(0, 20) + '…'
      : plan.titulo_oficina;

    durationPerPlan.push({
      id: plan.id || `plan_${idx}`,
      shortTitle: short,
      fullTitle: plan.titulo_oficina,
      minutes: mins,
      hours: +(mins / 60).toFixed(1),
    });

    // 2. Audience distribution
    const audience = plan.audience?.trim() || 'Geral / Comunitário';
    audienceCounts[audience] = (audienceCounts[audience] || 0) + 1;

    // 3. Accessibility detection
    const hasAccessibility = Boolean(
      (plan.accessibility && plan.accessibility.trim().length > 0) ||
      (plan.tecnologias_assistivas_baixo_custo && plan.tecnologias_assistivas_baixo_custo.length > 0) ||
      (plan.adaptacoes?.acessibilidade_inclusao && plan.adaptacoes.acessibilidade_inclusao.length > 15)
    );
    if (hasAccessibility) {
      accessibilityCount += 1;
    }

    // 4. Artist references
    if (Array.isArray(plan.referencias_artistas)) {
      totalArtistReferences += plan.referencias_artistas.length;
    }

    // 5. Materials listed
    if (plan.materiais) {
      const rec = plan.materiais.reciclaveis_organicos?.length || 0;
      const tec = plan.materiais.tecnologicos_eletronicos?.length || 0;
      const fer = plan.materiais.ferramentas_epi?.length || 0;
      totalMaterialsListed += rec + tec + fer;
    }

    // 6. Themes categorization
    const content = `${plan.titulo_oficina} ${plan.theme || ''} ${plan.subtitulo_poetico || ''} ${plan.resumo_conceitual || ''}`;
    let matchedTheme = false;

    for (const cat of THEME_CATEGORIES) {
      if (cat.pattern.test(content)) {
        themeCounts[cat.label] = (themeCounts[cat.label] || 0) + 1;
        matchedTheme = true;
      }
    }

    if (!matchedTheme) {
      themeCounts['Artes Visuais & Maker Geral'] = (themeCounts['Artes Visuais & Maker Geral'] || 0) + 1;
    }
  });

  // Sort top themes descending
  const topThemes: ThemeStat[] = Object.entries(themeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Audience array with percentage
  const audienceDistribution: AudienceStat[] = Object.entries(audienceCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalPlans) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const averageMinutesPerPlan = Math.round(totalMinutes / totalPlans);

  return {
    totalPlans,
    totalMinutes,
    totalHoursFormatted: formatMinutesToReadable(totalMinutes),
    averageMinutesPerPlan,
    averageHoursFormatted: formatMinutesToReadable(averageMinutesPerPlan),
    topThemes,
    audienceDistribution,
    durationPerPlan,
    accessibilityCount,
    accessibilityPercentage: Math.round((accessibilityCount / totalPlans) * 100),
    totalArtistReferences,
    totalMaterialsListed,
  };
}
