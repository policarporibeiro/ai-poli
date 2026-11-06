import html2pdf from 'html2pdf.js';
import { WorkshopPlan } from '../types/workshop';

export interface GeneratePdfOptions {
  filename?: string;
}

/**
 * Sanitizes a title string to be safe as a filename.
 */
export function sanitizeFilename(title: string): string {
  const clean = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 45);
  return `Plano_Aula_${clean || 'Oficina'}.pdf`;
}

/**
 * Generates and downloads a formatted PDF from an existing DOM element using html2pdf.js.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options?: GeneratePdfOptions
): Promise<void> {
  const filename = options?.filename || 'Plano_de_Aula_Atelie_Maker.pdf';

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number], // mm
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el: Element) =>
        el.classList.contains('no-print') || el.classList.contains('no-pdf'),
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
      compress: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'] as ('avoid-all' | 'css' | 'legacy')[],
      before: '.pdf-page-break-before',
      after: '.pdf-page-break-after',
      avoid: ['.print-break-inside-avoid', '.pdf-avoid-break'],
    },
  };

  await html2pdf().set(opt).from(element).save();
}

/**
 * Creates a dedicated, high-resolution, professionally styled A4 template for a WorkshopPlan
 * and downloads it as a PDF using html2pdf.js.
 */
export async function exportPlanObjectToPdf(
  plan: WorkshopPlan,
  options?: GeneratePdfOptions
): Promise<void> {
  const filename = options?.filename || sanitizeFilename(plan.titulo_oficina);

  // Build clean HTML template with inline styling optimized for html2pdf / A4 print
  const container = document.createElement('div');
  container.className = 'atelie-pdf-export-wrapper';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width in pixels at 96 DPI
  container.style.padding = '32px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1c1917';
  container.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.5';

  const formattedDate = plan.createdAt
    ? new Date(plan.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR');

  const artistsHtml =
    plan.referencias_artistas && plan.referencias_artistas.length > 0
      ? `
      <div style="margin-top: 12px;">
        <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #57534e; margin-bottom: 6px;">
          Referências Artísticas & Movimentos Estéticos
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${plan.referencias_artistas
            .map(
              (r) => `
            <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 8px;">
              <div style="font-weight: 700; font-size: 11px; color: #1c1917;">${escapeHtml(r.artista)}</div>
              <div style="display: inline-block; background-color: #e7e5e4; border-radius: 4px; padding: 1px 6px; font-size: 9px; font-weight: 600; color: #44403c; margin: 3px 0;">
                ${escapeHtml(r.movimento)}
              </div>
              <div style="font-size: 10px; color: #57534e; line-height: 1.3;">${escapeHtml(r.obra_ou_conceito)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  const materialsRec = plan.materiais.reciclaveis_organicos?.map(
    (m) => `<div style="font-size: 11px; padding: 3px 0; color: #292524;">• ${escapeHtml(m)}</div>`
  ).join('') || '<div style="font-size: 11px; color: #a8a29e;">Nenhum item listado</div>';

  const materialsTech = plan.materiais.tecnologicos_eletronicos?.map(
    (m) => `<div style="font-size: 11px; padding: 3px 0; color: #292524;">• ${escapeHtml(m)}</div>`
  ).join('') || '<div style="font-size: 11px; color: #a8a29e;">Nenhum item listado</div>';

  const materialsTools = plan.materiais.ferramentas_epi?.map(
    (m) => `<div style="font-size: 11px; padding: 3px 0; color: #292524;">• ${escapeHtml(m)}</div>`
  ).join('') || '<div style="font-size: 11px; color: #a8a29e;">Nenhum item listado</div>';

  const phasesHtml = plan.roteiro_passo_a_passo
    .map(
      (p, idx) => `
      <div style="border: 1px solid #e7e5e4; border-radius: 10px; padding: 12px; margin-bottom: 10px; background-color: #fafaf9; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-weight: 700; font-size: 12px; color: #1c1917;">
            <span style="background-color: #059669; color: #ffffff; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 6px;">${idx + 1}</span>
            ${escapeHtml(p.fase)}
          </div>
          <div style="background-color: #d1fae5; color: #065f46; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">
            ⏱️ ${escapeHtml(p.duracao_estimada)} | ${escapeHtml(p.foco)}
          </div>
        </div>
        <div style="font-size: 11px; color: #292524; line-height: 1.4; margin-bottom: 8px;">
          ${escapeHtml(p.descricao)}
        </div>
        <div style="background-color: #ecfdf5; border-left: 3px solid #059669; border-radius: 4px; padding: 6px 10px; font-size: 10.5px; color: #064e3b; line-height: 1.35;">
          <strong>💡 Dica de Mediação:</strong> ${escapeHtml(p.dica_mediacao)}
        </div>
      </div>
    `
    )
    .join('');

  const questionsHtml = plan.perguntas_disparadoras?.map(
    (q) => `<li style="margin-bottom: 6px; font-size: 11px; color: #292524;">💬 ${escapeHtml(q)}</li>`
  ).join('') || '';

  const criteriaHtml = plan.criterios_avaliacao?.map(
    (c) => `<li style="margin-bottom: 6px; font-size: 11px; color: #292524;">✓ ${escapeHtml(c)}</li>`
  ).join('') || '';

  const taHtml =
    plan.tecnologias_assistivas_baixo_custo && plan.tecnologias_assistivas_baixo_custo.length > 0
      ? `
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #047857; margin-bottom: 6px;">
          🛠️ Tecnologias Assistivas DIY de Baixo Custo:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          ${plan.tecnologias_assistivas_baixo_custo
            .map(
              (ta) => `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #14532d; font-size: 10.5px;">${escapeHtml(ta.recurso)}</strong>
                <span style="background-color: #dcfce7; color: #166534; font-size: 8.5px; font-weight: 700; padding: 1px 5px; border-radius: 8px;">${escapeHtml(ta.publico_beneficiado)}</span>
              </div>
              <div style="color: #374151; margin-bottom: 3px;"><strong>Adaptação:</strong> ${escapeHtml(ta.adaptacao_material)}</div>
              <div style="color: #166534; background-color: #ffffff; padding: 4px 6px; border-radius: 4px; border: 1px solid #dcfce7; font-size: 9.5px;"><strong>Como Fazer:</strong> ${escapeHtml(ta.como_construir_ou_aplicar)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  container.innerHTML = `
    <!-- Top Header Branding -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e05638; padding-bottom: 12px; margin-bottom: 16px;">
      <div>
        <div style="font-size: 18px; font-weight: 800; color: #e05638; text-transform: uppercase; letter-spacing: 0.5px;">
          Ateliê Maker & Arte
        </div>
        <div style="font-size: 11px; color: #78716c; font-weight: 500;">
          Assistente de Planejamento Pedagógico & Cultural • BNCC, Tinkering & STEAM
        </div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #78716c;">
        <div><strong>Data:</strong> ${formattedDate}</div>
        <div style="color: #e05638; font-weight: 600;">Documento Pedagógico Homologado</div>
      </div>
    </div>

    ${
      plan.coverImageUrl
        ? `
      <div style="margin-bottom: 12px; border-radius: 10px; overflow: hidden; max-height: 150px; border: 1px solid #fed7aa;">
        <img src="${plan.coverImageUrl}" style="width: 100%; height: 150px; object-fit: cover;" alt="Capa Artística Imagen" />
      </div>
    `
        : ''
    }

    <!-- Title and Subtitle -->
    <div style="margin-bottom: 16px; background-color: #fdf8f6; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px;">
      <div style="display: flex; gap: 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a3331b; margin-bottom: 4px;">
        <span>Público: ${escapeHtml(plan.audience || 'Geral')}</span>
        <span>•</span>
        <span>Duração: ${escapeHtml(plan.duration || 'Oficina')}</span>
        ${
          plan.accessibility
            ? `<span>•</span><span style="color: #047857;">Inclusão: ${escapeHtml(plan.accessibility)}</span>`
            : ''
        }
      </div>
      <h1 style="font-size: 20px; font-weight: 800; color: #1c1917; margin: 0 0 4px 0; line-height: 1.25;">
        ${escapeHtml(plan.titulo_oficina)}
      </h1>
      ${
        plan.subtitulo_poetico
          ? `<div style="font-size: 12px; font-style: italic; color: #57534e;">"${escapeHtml(plan.subtitulo_poetico)}"</div>`
          : ''
      }
    </div>

    <!-- 1. Justificativa & Conceito -->
    <div style="margin-bottom: 16px; page-break-inside: avoid;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #e05638; margin-bottom: 6px;">
        1. Justificativa Curatorial & Fundamentação Teórica
      </div>
      <div style="font-size: 11px; color: #292524; line-height: 1.5; margin-bottom: 10px;">
        ${escapeHtml(plan.resumo_conceitual)}
      </div>

      ${
        plan.alinhamento_bncc
          ? `
        <div style="background-color: #fff7ed; border-left: 3px solid #f97316; border-radius: 4px; padding: 8px 12px; font-size: 10.5px; color: #9a3412; margin-bottom: 8px;">
          <strong>Alinhamento BNCC & Competências:</strong> ${escapeHtml(plan.alinhamento_bncc)}
        </div>
      `
          : ''
      }

      ${
        plan.habilidades_especificas_bncc && plan.habilidades_especificas_bncc.length > 0
          ? `
        <div style="margin-top: 10px; margin-bottom: 12px; page-break-inside: avoid;">
          <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #a3331b; margin-bottom: 6px;">
            Habilidades Específicas da BNCC Articuladas
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${plan.habilidades_especificas_bncc
              .map(
                (h) => `
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 7px 10px; font-size: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                  <span style="background-color: #f59e0b; color: #ffffff; font-weight: 800; padding: 1px 6px; border-radius: 4px; font-size: 9.5px;">${escapeHtml(h.codigo)}</span>
                  <span style="color: #92400e; font-weight: 600; font-size: 9px;">${escapeHtml(h.campo_ou_unidade)}</span>
                </div>
                <div style="color: #1c1917; line-height: 1.35; margin-bottom: 3px;">${escapeHtml(h.descricao)}</div>
                <div style="color: #b45309; font-size: 9px; line-height: 1.3;"><strong>Aplicação na oficina:</strong> ${escapeHtml(h.aplicacao_na_oficina)}</div>
              </div>
            `
              )
              .join('')}
          </div>
          ${
            plan.competencias_gerais_bncc && plan.competencias_gerais_bncc.length > 0
              ? `
            <div style="margin-top: 6px; font-size: 9.5px; color: #92400e; line-height: 1.3;">
              <strong>Competências Gerais:</strong> ${escapeHtml(plan.competencias_gerais_bncc.join(' • '))}
            </div>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      ${artistsHtml}
    </div>

    <!-- 2. Objetivos de Aprendizagem -->
    <div style="margin-bottom: 16px; page-break-inside: avoid;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #2563eb; margin-bottom: 8px;">
        2. Objetivos de Aprendizagem (Tríade Pedagógica)
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #1e40af; margin-bottom: 4px;">Cognitivo / Teórico</div>
          <div style="font-size: 10.5px; color: #1e3a8a; line-height: 1.35;">${escapeHtml(plan.objetivos.cognitivo)}</div>
        </div>
        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #9f1239; margin-bottom: 4px;">Poético & Sensível</div>
          <div style="font-size: 10.5px; color: #881337; line-height: 1.35;">${escapeHtml(plan.objetivos.poetico_sensivel)}</div>
        </div>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #065f46; margin-bottom: 4px;">Prático / Maker</div>
          <div style="font-size: 10.5px; color: #064e3b; line-height: 1.35;">${escapeHtml(plan.objetivos.pratico_maker)}</div>
        </div>
      </div>
    </div>

    <!-- 3. Materiais e Componentes -->
    <div style="margin-bottom: 16px; page-break-inside: avoid;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #d97706; margin-bottom: 8px;">
        3. Materiais, Ferramentas & Economia Circular
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px;">
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #b45309; margin-bottom: 6px;">🌱 Descarte & Orgânicos</div>
          ${materialsRec}
        </div>
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #2563eb; margin-bottom: 6px;">⚡ Eletrônicos & Tech</div>
          ${materialsTech}
        </div>
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #44403c; margin-bottom: 6px;">🛠️ Ferramentas & EPIs</div>
          ${materialsTools}
        </div>
      </div>
      ${
        plan.materiais.dica_coleta
          ? `
        <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 6px 10px; font-size: 10px; color: #713f12;">
          <strong>♻️ Dica de Coleta Sustentável:</strong> ${escapeHtml(plan.materiais.dica_coleta)}
        </div>
      `
          : ''
      }
    </div>

    <!-- 4. Roteiro Cronológico -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 8px;">
        4. Roteiro Cronológico Passo a Passo & Estratégias de Mediação
      </div>
      ${phasesHtml}
    </div>

    <!-- 5. Avaliação e Perguntas -->
    <div style="margin-bottom: 16px; page-break-inside: avoid;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="border: 1px solid #e9d5ff; background-color: #faf5ff; border-radius: 10px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #7e22ce; margin-bottom: 6px; text-transform: uppercase;">
            Perguntas para Roda de Conversa
          </div>
          <ul style="margin: 0; padding-left: 14px; list-style-type: none;">
            ${questionsHtml}
          </ul>
        </div>
        <div style="border: 1px solid #e7e5e4; background-color: #fafaf9; border-radius: 10px; padding: 10px;">
          <div style="font-weight: 700; font-size: 11px; color: #e05638; margin-bottom: 6px; text-transform: uppercase;">
            Critérios de Avaliação Formativa
          </div>
          <ul style="margin: 0; padding-left: 14px; list-style-type: none;">
            ${criteriaHtml}
          </ul>
        </div>
      </div>
    </div>

    <!-- 6. Adaptações, Acessibilidade & Tecnologias Assistivas -->
    <div style="margin-bottom: 16px; page-break-inside: avoid;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #047857; margin-bottom: 8px;">
        6. Acessibilidade, Inclusão & Tecnologias Assistivas DIY de Baixo Custo
      </div>
      ${taHtml}
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 8px; font-size: 10px;">
          <strong>🌱 Baixo Recurso:</strong><br />${escapeHtml(plan.adaptacoes.baixo_recurso)}
        </div>
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 8px; font-size: 10px;">
          <strong>♿ Inclusão & Acessibilidade:</strong><br />${escapeHtml(plan.adaptacoes.acessibilidade_inclusao)}
        </div>
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 8px; font-size: 10px;">
          <strong>🚀 Desafio Avançado:</strong><br />${escapeHtml(plan.adaptacoes.desafio_avancado)}
        </div>
      </div>

      ${
        plan.seguranca_atelier
          ? `
        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 8px 10px; font-size: 10px; color: #9f1239;">
          <strong>⚠️ Protocolos de Segurança do Ateliê:</strong> ${escapeHtml(plan.seguranca_atelier)}
        </div>
      `
          : ''
      }
    </div>

    <!-- Footer -->
    <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #e7e5e4; display: flex; justify-content: space-between; font-size: 9px; color: #a8a29e;">
      <span>Ateliê Maker & Arte — Planejador Pedagógico</span>
      <span>Documento gerado com Inteligência Artificial • Uso educacional livre</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const opt = {
      margin: [10, 8, 10, 8] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: true,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'] as ('avoid-all' | 'css' | 'legacy')[],
      },
    };

    await html2pdf().set(opt).from(container).save();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />');
}
