import { WorkshopPlan } from '../types/workshop';

export function formatPlanAsMarkdown(plan: WorkshopPlan): string {
  const md: string[] = [];

  md.push(`# ${plan.titulo_oficina}`);
  if (plan.subtitulo_poetico) {
    md.push(`*${plan.subtitulo_poetico}*\n`);
  }
  md.push(`**Público-Alvo:** ${plan.audience || 'Não especificado'} | **Duração:** ${plan.duration || 'Não especificado'}\n`);
  md.push(`---\n`);

  md.push(`## 1. Resumo Conceitual & Curatorial`);
  md.push(`${plan.resumo_conceitual}\n`);

  if (plan.alinhamento_bncc) {
    md.push(`### Alinhamento BNCC & Diretrizes Gerais`);
    md.push(`${plan.alinhamento_bncc}\n`);
  }

  if (plan.habilidades_especificas_bncc && plan.habilidades_especificas_bncc.length > 0) {
    md.push(`### Habilidades Específicas da BNCC`);
    plan.habilidades_especificas_bncc.forEach((h) => {
      md.push(`- **[${h.codigo}]** *${h.campo_ou_unidade}*: ${h.descricao}`);
      md.push(`  - *Aplicação na Oficina:* ${h.aplicacao_na_oficina}`);
    });
    md.push('');
  }

  if (plan.competencias_gerais_bncc && plan.competencias_gerais_bncc.length > 0) {
    md.push(`### Competências Gerais da Educação Básica`);
    plan.competencias_gerais_bncc.forEach((c) => {
      md.push(`- ${c}`);
    });
    md.push('');
  }

  if (plan.referencias_artistas && plan.referencias_artistas.length > 0) {
    md.push(`### Referências Artísticas & Movimentos`);
    plan.referencias_artistas.forEach((ref) => {
      md.push(`- **${ref.artista}** (${ref.movimento}): ${ref.obra_ou_conceito}`);
    });
    md.push('');
  }

  md.push(`## 2. Objetivos de Aprendizagem`);
  md.push(`- **Cognitivo:** ${plan.objetivos.cognitivo}`);
  md.push(`- **Poético & Sensível:** ${plan.objetivos.poetico_sensivel}`);
  md.push(`- **Prático / Maker:** ${plan.objetivos.pratico_maker}\n`);

  md.push(`## 3. Lista de Materiais e Componentes`);
  if (plan.materiais.reciclaveis_organicos?.length) {
    md.push(`### Materiais Recicláveis, Descarte & Orgânicos`);
    plan.materiais.reciclaveis_organicos.forEach((m) => md.push(`- [ ] ${m}`));
    md.push('');
  }

  if (plan.materiais.tecnologicos_eletronicos?.length) {
    md.push(`### Componentes Tecnológicos & Eletrônicos`);
    plan.materiais.tecnologicos_eletronicos.forEach((m) => md.push(`- [ ] ${m}`));
    md.push('');
  }

  if (plan.materiais.ferramentas_epi?.length) {
    md.push(`### Ferramentas, Segurança & EPIs`);
    plan.materiais.ferramentas_epi.forEach((m) => md.push(`- [ ] ${m}`));
    md.push('');
  }

  if (plan.materiais.dica_coleta) {
    md.push(`> **Dica de Coleta / Economia Circular:** ${plan.materiais.dica_coleta}\n`);
  }

  md.push(`## 4. Roteiro Cronológico Passo a Passo`);
  plan.roteiro_passo_a_passo.forEach((etapa, idx) => {
    md.push(`### ${idx + 1}. ${etapa.fase} (${etapa.duracao_estimada})`);
    md.push(`*Foco:* ${etapa.foco}`);
    md.push(`${etapa.descricao}`);
    md.push(`💡 *Dica de Mediação:* ${etapa.dica_mediacao}\n`);
  });

  md.push(`## 5. Critérios de Avaliação & Perguntas Disparadoras`);
  md.push(`### Perguntas para Roda de Conversa / Reflexão`);
  plan.perguntas_disparadoras?.forEach((p) => md.push(`- ${p}`));
  md.push('');

  md.push(`### Critérios de Avaliação Formativa`);
  plan.criterios_avaliacao?.forEach((c) => md.push(`- ${c}`));
  md.push('');

  md.push(`## 6. Acessibilidade, Inclusão & Tecnologias Assistivas (DIY)`);
  if (plan.accessibility) {
    md.push(`**Diretriz de Acessibilidade da Turma:** ${plan.accessibility}\n`);
  }

  if (plan.tecnologias_assistivas_baixo_custo && plan.tecnologias_assistivas_baixo_custo.length > 0) {
    md.push(`### Tecnologias Assistivas de Baixo Custo Sugeridas:`);
    plan.tecnologias_assistivas_baixo_custo.forEach((ta) => {
      md.push(`- **${ta.recurso}** (${ta.publico_beneficiado}):`);
      md.push(`  - *Adaptação do Material:* ${ta.adaptacao_material}`);
      md.push(`  - *Como Fazer / Aplicar:* ${ta.como_construir_ou_aplicar}`);
    });
    md.push('');
  }

  md.push(`### Adaptações Complementares`);
  md.push(`- **Baixo Recurso / Escassez:** ${plan.adaptacoes.baixo_recurso}`);
  md.push(`- **Mediação Inclusiva:** ${plan.adaptacoes.acessibilidade_inclusao}`);
  md.push(`- **Desafio Avançado:** ${plan.adaptacoes.desafio_avancado}\n`);

  if (plan.seguranca_atelier) {
    md.push(`## 7. Segurança no Ateliê Maker`);
    md.push(`⚠️ ${plan.seguranca_atelier}\n`);
  }

  md.push(`\n*Planejamento gerado no Ateliê Maker & Arte - Assistente Pedagógico.*`);

  return md.join('\n');
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}
