import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Palette,
  Cpu,
  Layers,
  MapPin,
  HelpCircle,
  Accessibility,
  Award,
  BookOpen,
} from 'lucide-react';
import { PRESET_INSPIRATIONS, PresetInspiration } from '../types/workshop';

interface FormPanelProps {
  isLoading: boolean;
  onGenerate: (data: {
    theme: string;
    audience: string;
    duration: string;
    accessibility: string;
    bnccSkills: string;
    artMovement: string;
    makerFocus: string;
    spaceEnvironment: string;
    additionalNotes: string;
  }) => void;
}

const AUDIENCE_OPTIONS = [
  'Ensino Fundamental I (6 a 10 anos)',
  'Ensino Fundamental II (11 a 14 anos)',
  'Ensino Médio (15 a 17 anos)',
  'Educação de Jovens e Adultos (EJA)',
  'Ensino Superior & Artistas Visuais',
  'Público Geral & Comunidade',
  'Famílias com Crianças (Intergeracional)',
  'Formação de Professores & Educadores',
];

const DURATION_PRESETS = [
  'Oficina Relâmpago (2 horas)',
  'Oficina Intensiva (4 horas)',
  'Imersão de Dia Inteiro (6 a 8 horas)',
  'Módulo de 3 Encontros Semanais (2h cada)',
  'Módulo de 4 Encontros Semanais (2h cada)',
  'Projeto Semestral (Aulas regulares)',
];

const BNCC_PRESETS = [
  {
    value: 'AUTO',
    label: '🎯 Mapeamento Automático Inteligente pela IA (Recomendado)',
  },
  {
    value: 'EF69AR04, EF69AR05: Experimentar e criar formas tridimensionais a partir de materialidades não convencionais e resíduos.',
    label: '📐 EF69AR04 / EF69AR05: Materialidades & Tridimensionalidade (Fund. II)',
  },
  {
    value: 'EF69AR01, EF69AR07: Pesquisar, apreciar e dialogar com princípios da Arte Contemporânea e intervenções espaciais.',
    label: '🎨 EF69AR01 / EF69AR07: Pesquisa Estética & Arte Contemporânea (Fund. II)',
  },
  {
    value: 'EM13LGG601, EM13LGG604: Apropriar-se criticamente de tecnologias digitais e processos de criação em práticas artísticas contemporâneas.',
    label: '💻 EM13LGG601 / EM13LGG604: Tecnologias Digitais & Práticas Artísticas (Ensino Médio)',
  },
  {
    value: 'EF15AR04, EF15AR06: Experimentar diferentes formas de expressão artística tridimensional e ferramentas manuais nos anos iniciais.',
    label: '✂️ EF15AR04 / EF15AR06: Experimentação de Formas e Ferramentas (Fund. I)',
  },
  {
    value: 'Competência Geral 5 (Cultura Digital) e Competência Geral 3 (Repertório Cultural e Fruição Artística).',
    label: '🌐 Competências Gerais 3 e 5: Repertório Cultural & Cultura Digital',
  },
  {
    value: 'CUSTOM',
    label: '✏️ Especificar códigos ou foco personalizado da BNCC...',
  },
];

const ART_MOVEMENTS = [
  'Arte Povera & Resíduos Urbanos',
  'Cubismo Sintético & Colagem',
  'Arte Cinética & Esculturas em Movimento',
  'Dadaísmo & Readymade',
  'Arte Sonora & Instalações Eletroacústicas',
  'Land Art, Biofilia & Biomateriais',
  'Concretismo & Poesia Visual Brasileira',
  'Arte Contemporânea & Instalação Imersiva',
];

const MAKER_FOCUSES = [
  'Sucata Tecnológica, Desmontagem & Assemblage',
  'Circuitos Simples, Papel Condutivo & LEDs',
  'Robótica Educacional & Microcontroladores (Arduino/BBC micro:bit)',
  'Mecânica Desplugada, Engrenagens de Papelão & Autômatos',
  'E-Têxteis, Costura & Wearables',
  'Fabricação Digital (Corte a Laser & Impressão 3D)',
  'Interatividade Sonora (Makey Makey & Scratch)',
  'Biomateriais Caseiros & Alquimia Maker',
];

const ENVIRONMENTS = [
  'Espaço Maker / FabLab Equipado',
  'Ateliê de Artes / Sala de Desenho',
  'Sala de Aula Convencional (Low-tech / Desplugado)',
  'Pátio, Jardim ou Espaço Aberto',
  'Laboratório de Informática Escolar',
];

const ACCESSIBILITY_PRESETS = [
  {
    value: 'Desenho Universal para Aprendizagem (DUA) - Inclusão Ampla e Multissensorial',
    label: '✨ DUA Geral: Inclusão Ampla & Multissensorial',
  },
  {
    value: 'Neurodiversidade, TEA e TDAH (Rotina visual estruturada, previsibilidade e regulação sensorial)',
    label: '🧩 Neurodiversidade / TEA / TDAH (Rotinas visuais & sensorial)',
  },
  {
    value: 'Deficiência Visual e Baixa Visão (Pistas táteis em alto-relevo, cola quente, texturas e audiodescrição)',
    label: '👁️ Deficiência Visual / Baixa Visão (Pistas táteis & texturas)',
  },
  {
    value: 'Deficiência Auditiva e Surdez (Sinalização visual por LEDs, vibração mecânica e mediação imagética)',
    label: '👂 Deficiência Auditiva / Surdez (LEDs, vibração & visual)',
  },
  {
    value: 'Deficiência Motora e Paralisia Cerebral (Engrossadores de EVA/espuma, apoios antiderrapantes e tesouras adaptadas)',
    label: '♿ Deficiência Motora / P.C. (Engrossadores & apoios)',
  },
  {
    value: 'Deficiência Intelectual e Múltipla (Etapas concretas passo a passo e comunicação aumentativa)',
    label: '🤝 Deficiência Intelectual / Múltipla (Passos concretos)',
  },
  {
    value: 'CUSTOM',
    label: '✏️ Especificar necessidades particulares da turma...',
  },
];

export const FormPanel: React.FC<FormPanelProps> = ({ isLoading, onGenerate }) => {
  const [theme, setTheme] = useState(
    'Assemblage com materiais recicláveis, sucata eletrônica e poética da Arte Povera'
  );
  const [audience, setAudience] = useState('Ensino Fundamental II (11 a 14 anos)');
  const [duration, setDuration] = useState('Oficina Intensiva (4 horas)');
  const [customDuration, setCustomDuration] = useState('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  const [bnccPreset, setBnccPreset] = useState(BNCC_PRESETS[0].value);
  const [bnccCustom, setBnccCustom] = useState('');

  const [accessibilityPreset, setAccessibilityPreset] = useState(ACCESSIBILITY_PRESETS[0].value);
  const [accessibilityCustom, setAccessibilityCustom] = useState('');

  const [artMovement, setArtMovement] = useState(ART_MOVEMENTS[0]);
  const [makerFocus, setMakerFocus] = useState(MAKER_FOCUSES[0]);
  const [spaceEnvironment, setSpaceEnvironment] = useState(ENVIRONMENTS[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSelectPreset = (preset: PresetInspiration) => {
    setTheme(preset.theme);
    setAudience(preset.audience);
    setDuration(preset.duration);
    setIsCustomDuration(false);
    setArtMovement(preset.artMovement);
    setMakerFocus(preset.makerFocus);
    setSpaceEnvironment(preset.spaceEnvironment);

    if (preset.defaultBncc) {
      setBnccPreset('CUSTOM');
      setBnccCustom(preset.defaultBncc);
    } else {
      setBnccPreset('AUTO');
      setBnccCustom('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;

    const resolvedAccessibility =
      accessibilityPreset === 'CUSTOM'
        ? (accessibilityCustom.trim() || 'Desenho Universal para Aprendizagem (DUA) e Tecnologias Assistivas DIY')
        : accessibilityPreset;

    const resolvedBncc =
      bnccPreset === 'CUSTOM'
        ? bnccCustom.trim()
        : bnccPreset === 'AUTO'
        ? ''
        : bnccPreset;

    onGenerate({
      theme: theme.trim(),
      audience,
      duration: isCustomDuration && customDuration.trim() ? customDuration.trim() : duration,
      accessibility: resolvedAccessibility,
      bnccSkills: resolvedBncc,
      artMovement,
      makerFocus,
      spaceEnvironment,
      additionalNotes: additionalNotes.trim(),
    });
  };

  return (
    <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs p-5 sm:p-6 lg:sticky lg:top-24 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e05638] ring-4 ring-orange-100 dark:ring-orange-950"></span>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
            Parâmetros da Oficina
          </h2>
        </div>
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
          Ateliê Maker
        </span>
      </div>

      {/* Preset Inspirations */}
      <div className="mb-5">
        <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#e05638]" />
          <span>Inspirações Prontas (Clique para preencher)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_INSPIRATIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:border-orange-200 dark:hover:border-orange-800 text-stone-700 dark:text-stone-300 transition-all font-medium"
            >
              {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}...
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tema Central */}
        <div>
          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#e05638]" />
              <span>Tema Central da Oficina / Projeto</span>
            </span>
            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-normal">Obrigatório</span>
          </label>
          <textarea
            rows={3}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
            placeholder="Ex: Assemblage com materiais recicláveis e robótica educacional explorando a Arte Povera..."
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#e05638] focus:border-transparent transition-all leading-relaxed"
          />
        </div>

        {/* Linha Dupla: Público e Duração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Público */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              <Users className="w-3.5 h-3.5 text-[#e05638]" />
              <span>Público-Alvo</span>
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-[#e05638] focus:border-transparent transition-all"
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-stone-950 dark:text-stone-100">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Duração */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-[#e05638]" />
              <span>Duração Estimada</span>
            </label>
            {!isCustomDuration ? (
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomDuration(true);
                    } else {
                      setDuration(e.target.value);
                    }
                  }}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-[#e05638] focus:border-transparent transition-all"
                >
                  {DURATION_PRESETS.map((d) => (
                    <option key={d} value={d} className="dark:bg-stone-950 dark:text-stone-100">
                      {d}
                    </option>
                  ))}
                  <option value="CUSTOM" className="dark:bg-stone-950 dark:text-stone-100">+ Personalizar duração...</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Ex: 5 dias x 3 horas"
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#e05638]"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(false)}
                  className="text-[10px] text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline shrink-0"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CAMPO: Habilidades & Competências da BNCC */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200">
              <Award className="w-4 h-4 text-[#e05638]" />
              <span>Habilidades & Competências da BNCC</span>
            </label>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
              MEC / BNCC
            </span>
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-tight">
            Direcione competências específicas (ex: EF69AR04, EM13LGG601) ou selecione um foco:
          </p>

          <select
            value={bnccPreset}
            onChange={(e) => {
              setBnccPreset(e.target.value);
              if (e.target.value !== 'CUSTOM') {
                setBnccCustom('');
              }
            }}
            className="w-full rounded-xl border border-amber-300/80 dark:border-amber-900/70 px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-[#e05638] focus:border-transparent transition-all"
          >
            {BNCC_PRESETS.map((item) => (
              <option key={item.value} value={item.value} className="dark:bg-stone-950 dark:text-stone-100">
                {item.label}
              </option>
            ))}
          </select>

          {bnccPreset === 'CUSTOM' && (
            <div className="pt-1 animate-fadeIn">
              <textarea
                rows={2}
                value={bnccCustom}
                onChange={(e) => setBnccCustom(e.target.value)}
                placeholder="Ex: EF69AR04, EF69AR05, EF69AR35 com ênfase em arte tridimensional e eletrônica de sucata..."
                className="w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-stone-950 px-3 py-2 text-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#e05638]"
              />
            </div>
          )}
        </div>

        {/* Campo Acessibilidade & Tecnologias Assistivas */}
        <div className="bg-orange-50/40 dark:bg-orange-950/20 p-3.5 rounded-xl border border-orange-200/70 dark:border-orange-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#a3331b] dark:text-orange-300">
              <Accessibility className="w-4 h-4 text-[#e05638]" />
              <span>Acessibilidade & Tecnologias Assistivas</span>
            </label>
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Baixo Custo / DIY
            </span>
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-tight">
            Adaptações táteis, sensoriais e ferramentas adaptadas com materiais de sucata/baixo custo:
          </p>

          <select
            value={accessibilityPreset}
            onChange={(e) => {
              setAccessibilityPreset(e.target.value);
              if (e.target.value !== 'CUSTOM') {
                setAccessibilityCustom('');
              }
            }}
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-xs font-medium text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-[#e05638] focus:border-transparent transition-all"
          >
            {ACCESSIBILITY_PRESETS.map((item) => (
              <option key={item.value} value={item.value} className="dark:bg-stone-950 dark:text-stone-100">
                {item.label}
              </option>
            ))}
          </select>

          {accessibilityPreset === 'CUSTOM' && (
            <div className="pt-1 animate-fadeIn">
              <textarea
                rows={2}
                value={accessibilityCustom}
                onChange={(e) => setAccessibilityCustom(e.target.value)}
                placeholder="Descreva as especificidades dos alunos (ex: aluno com baixa visão necessita de contraste e relevo tátil; turma com 2 alunos no espectro autista)..."
                className="w-full rounded-xl border border-orange-300 dark:border-orange-800 bg-white dark:bg-stone-950 px-3 py-2 text-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#e05638]"
              />
            </div>
          )}
        </div>

        {/* Accordion: Configurações Avançadas */}
        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50/50 dark:bg-stone-800/40">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#e05638]" />
              <span>Configurações Estéticas & Espaciais Avançadas</span>
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-3.5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 animate-fadeIn">
              {/* Movimento Artístico */}
              <div>
                <label className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  <Palette className="w-3 h-3 text-[#e05638]" />
                  <span>Movimento Artístico Primário</span>
                </label>
                <select
                  value={artMovement}
                  onChange={(e) => setArtMovement(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1.5 text-xs bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#e05638]"
                >
                  {ART_MOVEMENTS.map((m) => (
                    <option key={m} value={m} className="dark:bg-stone-950 dark:text-stone-100">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Foco Maker */}
              <div>
                <label className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  <Cpu className="w-3 h-3 text-[#e05638]" />
                  <span>Foco Tecnológico / Maker</span>
                </label>
                <select
                  value={makerFocus}
                  onChange={(e) => setMakerFocus(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1.5 text-xs bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#e05638]"
                >
                  {MAKER_FOCUSES.map((f) => (
                    <option key={f} value={f} className="dark:bg-stone-950 dark:text-stone-100">
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Espaço */}
              <div>
                <label className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  <MapPin className="w-3 h-3 text-[#e05638]" />
                  <span>Espaço / Ambiente Disponível</span>
                </label>
                <select
                  value={spaceEnvironment}
                  onChange={(e) => setSpaceEnvironment(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1.5 text-xs bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#e05638]"
                >
                  {ENVIRONMENTS.map((env) => (
                    <option key={env} value={env} className="dark:bg-stone-950 dark:text-stone-100">
                      {env}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas Adicionais */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 block mb-1">
                  Requisitos ou Restrições Adicionais
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ex: Sem ferramentas cortantes afiadas; foco em sustentabilidade..."
                  className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#e05638]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={isLoading || !theme.trim()}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-xs sm:text-sm bg-gradient-to-r from-[#e05638] to-[#c84325] hover:from-[#c84325] hover:to-[#a3331b] shadow-md shadow-orange-950/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Elaborando Planejamento Curatorial...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Gerar Planejamento de Oficina</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
};
