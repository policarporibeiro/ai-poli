export interface ArtistReference {
  artista: string;
  movimento: string;
  obra_ou_conceito: string;
}

export interface WorkshopPhase {
  fase: string;
  duracao_estimada: string;
  foco: string;
  descricao: string;
  dica_mediacao: string;
}

export interface AssistiveTechnologyItem {
  recurso: string;
  adaptacao_material: string;
  como_construir_ou_aplicar: string;
  publico_beneficiado: string;
}

export interface BnccSkillItem {
  codigo: string; // Ex: "EF69AR04", "EM13LGG601", "EF15AR05"
  campo_ou_unidade: string; // Ex: "Artes Visuais / Materialidades", "Linguagens e suas Tecnologias"
  descricao: string; // Descrição formal oficial da habilidade
  aplicacao_na_oficina: string; // Como a habilidade se concretiza na prática maker/artística
}

export interface WorkshopPlan {
  id?: string;
  createdAt?: string;
  theme?: string;
  audience?: string;
  duration?: string;
  accessibility?: string;
  bnccSkills?: string;
  coverImageUrl?: string;
  titulo_oficina: string;
  subtitulo_poetico: string;
  resumo_conceitual: string;
  alinhamento_bncc: string;
  habilidades_especificas_bncc?: BnccSkillItem[];
  competencias_gerais_bncc?: string[];
  objetivos: {
    cognitivo: string;
    poetico_sensivel: string;
    pratico_maker: string;
  };
  materiais: {
    reciclaveis_organicos: string[];
    tecnologicos_eletronicos: string[];
    ferramentas_epi: string[];
    dica_coleta: string;
  };
  roteiro_passo_a_passo: WorkshopPhase[];
  criterios_avaliacao: string[];
  perguntas_disparadoras: string[];
  adaptacoes: {
    baixo_recurso: string;
    acessibilidade_inclusao: string;
    desafio_avancado: string;
  };
  tecnologias_assistivas_baixo_custo?: AssistiveTechnologyItem[];
  seguranca_atelier: string;
  referencias_artistas: ArtistReference[];
}

export interface PresetInspiration {
  id: string;
  title: string;
  theme: string;
  audience: string;
  duration: string;
  artMovement: string;
  makerFocus: string;
  spaceEnvironment: string;
  tag: string;
  defaultBncc?: string;
}

export const PRESET_INSPIRATIONS: PresetInspiration[] = [
  {
    id: 'arte-povera-sucata',
    title: 'Assemblage & Arte Povera com Sucata Eletrônica',
    theme: 'Assemblage com materiais recicláveis, placas de circuito desativadas e robótica educacional explorando a poética da Arte Povera e resíduos tecnológicos.',
    audience: 'Ensino Fundamental II (11 a 14 anos)',
    duration: 'Oficina Intensiva (4 horas)',
    artMovement: 'Arte Povera & Resíduos Urbanos',
    makerFocus: 'Sucata Tecnológica, Desmontagem & Assemblage',
    spaceEnvironment: 'Espaço Maker / FabLab Equipado',
    tag: 'Sustentabilidade & E-lixo',
    defaultBncc: 'EF69AR04, EF69AR05: Experimentar e criar formas tridimensionais a partir de resíduos tecnológicos e materialidades não convencionais.',
  },
  {
    id: 'cinetica-calder',
    title: 'Esculturas Cinéticas e Autômatos de Papelão',
    theme: 'Construção de autômatos mecânicos com engrenagens de papelão e móbiles cinéticos inspirados no equilíbrio e movimento de Alexander Calder e Jean Tinguely.',
    audience: 'Ensino Médio (15 a 17 anos)',
    duration: 'Módulo de 3 Encontros Semanais (2h cada)',
    artMovement: 'Arte Cinética & Esculturas em Movimento',
    makerFocus: 'Mecânica Desplugada, Engrenagens de Papelão & Autômatos',
    spaceEnvironment: 'Espaço Maker / FabLab Equipado',
    tag: 'Física & Movimento',
    defaultBncc: 'EM13LGG601, EM13LGG604: Apropriar-se criticamente de processos mecânicos e cinéticos para expressar poéticas visuais tridimensionais.',
  },
  {
    id: 'cianotipia-botanica',
    title: 'Cianotipia Botânica e Caixa de Luz UV Maker',
    theme: 'Fotografia artesanal do século XIX integrada à fabricação de câmaras de exposição UV com fitas LED para registrar a flora urbana e texturas vegetais.',
    audience: 'Público Geral & Comunidade',
    duration: 'Oficina Intensiva (4 horas)',
    artMovement: 'Land Art, Biofilia & Biomateriais',
    makerFocus: 'Interatividade Sonora (Makey Makey & Scratch)',
    spaceEnvironment: 'Ateliê de Artes / Sala de Desenho',
    tag: 'Biofilia & Fotografia',
    defaultBncc: 'EF69AR01, EF69AR07: Investigar e experimentar processos históricos de impressão fotográfica e registro da botânica local.',
  },
  {
    id: 'cubismo-makey',
    title: 'Pintura Sonora Interativa com Makey Makey',
    theme: 'Composição de painéis tridimensionais com colagem cubista e tintas condutivas que acionam paisagens sonoras quando tocados pelo público.',
    audience: 'Ensino Fundamental II (11 a 14 anos)',
    duration: 'Módulo de 3 Encontros Semanais (2h cada)',
    artMovement: 'Cubismo Sintético & Colagem',
    makerFocus: 'Circuitos Simples, Papel Condutivo & LEDs',
    spaceEnvironment: 'Laboratório de Informática Escolar',
    tag: 'Interatividade & Som',
    defaultBncc: 'EF69AR06, EF69AR08: Integrar artes visuais, som digital e computação física em instalações interativas colaborativas.',
  },
  {
    id: 'wearable-poesia',
    title: 'E-Têxteis e Poesia Concreta Vestível',
    theme: 'Bordado com linha condutiva, LEDs em tecido e tipografia poética inspirada no Concretismo brasileiro dos irmãos Campos e Décio Pignatari.',
    audience: 'Ensino Médio (15 a 17 anos)',
    duration: 'Oficina Intensiva (4 horas)',
    artMovement: 'Concretismo & Poesia Visual Brasileira',
    makerFocus: 'E-Têxteis, Costura & Wearables',
    spaceEnvironment: 'Ateliê de Artes / Sala de Desenho',
    tag: 'Moda Maker & Letramento',
    defaultBncc: 'EM13LGG701, EM13LGG703: Criar produções verbo-visuais integradas a suportes têxteis e circuitos flexíveis vestíveis.',
  },
];
