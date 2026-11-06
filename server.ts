import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In AI Studio, Nginx listens on 8080 (Cloud Run $PORT) and proxies to 3000.
// The Express dev server must always listen on port 3000 (DEFAULT_APP_PORT).
const PORT =
  process.env.PORT && process.env.PORT !== '8080'
    ? Number(process.env.PORT)
    : Number(process.env.DEFAULT_APP_PORT || 3000);

const app = express();

app.use(express.json());

// Initialize GoogleGenAI server-side with required headers
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

async function generateContentWithRetry(params: any, retries = 2, delayMs = 1000): Promise<any> {
  const modelsToTry = [params.model || 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let currentDelay = delayMs;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model: ${modelName} (attempt ${attempt}/${retries})`);
        return await ai.models.generateContent({
          ...params,
          model: modelName,
        });
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err);
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        console.warn(`[Gemini API - ${modelName}] Error:`, errMsg.slice(0, 120));

        if (isTransient && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 1.5;
          continue;
        }

        // On transient spike, immediately try the next model in the fallback chain
        if (isTransient) {
          console.log(`[Gemini API] Switching to next fallback model...`);
          break;
        }
        throw err;
      }
    }
  }

  throw lastError;
}

const planResponseSchema = {
  type: Type.OBJECT,
  properties: {
    titulo_oficina: { type: Type.STRING },
    subtitulo_poetico: { type: Type.STRING },
    resumo_conceitual: { type: Type.STRING },
    alinhamento_bncc: { type: Type.STRING },
    objetivos: {
      type: Type.OBJECT,
      properties: {
        cognitivo: { type: Type.STRING },
        poetico_sensivel: { type: Type.STRING },
        pratico_maker: { type: Type.STRING },
      },
      required: ['cognitivo', 'poetico_sensivel', 'pratico_maker'],
    },
    materiais: {
      type: Type.OBJECT,
      properties: {
        reciclaveis_organicos: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        tecnologicos_eletronicos: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        ferramentas_epi: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        dica_coleta: { type: Type.STRING },
      },
      required: ['reciclaveis_organicos', 'tecnologicos_eletronicos', 'ferramentas_epi', 'dica_coleta'],
    },
    roteiro_passo_a_passo: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fase: { type: Type.STRING },
          duracao_estimada: { type: Type.STRING },
          foco: { type: Type.STRING },
          descricao: { type: Type.STRING },
          dica_mediacao: { type: Type.STRING },
        },
        required: ['fase', 'duracao_estimada', 'foco', 'descricao', 'dica_mediacao'],
      },
    },
    criterios_avaliacao: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    perguntas_disparadoras: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    adaptacoes: {
      type: Type.OBJECT,
      properties: {
        baixo_recurso: { type: Type.STRING },
        acessibilidade_inclusao: { type: Type.STRING },
        desafio_avancado: { type: Type.STRING },
      },
      required: ['baixo_recurso', 'acessibilidade_inclusao', 'desafio_avancado'],
    },
    tecnologias_assistivas_baixo_custo: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          recurso: { type: Type.STRING },
          adaptacao_material: { type: Type.STRING },
          como_construir_ou_aplicar: { type: Type.STRING },
          publico_beneficiado: { type: Type.STRING },
        },
        required: [
          'recurso',
          'adaptacao_material',
          'como_construir_ou_aplicar',
          'publico_beneficiado',
        ],
      },
    },
    habilidades_especificas_bncc: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          codigo: { type: Type.STRING },
          campo_ou_unidade: { type: Type.STRING },
          descricao: { type: Type.STRING },
          aplicacao_na_oficina: { type: Type.STRING },
        },
        required: ['codigo', 'campo_ou_unidade', 'descricao', 'aplicacao_na_oficina'],
      },
    },
    competencias_gerais_bncc: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    seguranca_atelier: { type: Type.STRING },
    referencias_artistas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          artista: { type: Type.STRING },
          movimento: { type: Type.STRING },
          obra_ou_conceito: { type: Type.STRING },
        },
        required: ['artista', 'movimento', 'obra_ou_conceito'],
      },
    },
  },
  required: [
    'titulo_oficina',
    'subtitulo_poetico',
    'resumo_conceitual',
    'alinhamento_bncc',
    'habilidades_especificas_bncc',
    'competencias_gerais_bncc',
    'objetivos',
    'materiais',
    'roteiro_passo_a_passo',
    'criterios_avaliacao',
    'perguntas_disparadoras',
    'adaptacoes',
    'tecnologias_assistivas_baixo_custo',
    'seguranca_atelier',
    'referencias_artistas',
  ],
};

app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chave de API do Gemini não configurada no servidor. Por favor, adicione GEMINI_API_KEY.',
      });
    }

    const {
      theme,
      audience = 'Ensino Fundamental II',
      duration = 'Oficina intensiva de 4 horas',
      accessibility = 'Desenho Universal para Aprendizagem (DUA) e Tecnologias Assistivas DIY',
      bnccSkills = '',
      artMovement = 'Arte Povera & Contemporânea',
      makerFocus = 'Reciclagem, Assemblage & Eletrônica Básica',
      spaceEnvironment = 'Espaço Maker / Ateliê de Artes',
      additionalNotes = '',
    } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'O tema da oficina é obrigatório.' });
    }

    const prompt = `Você é um curador de arte, artista visual contemporâneo renomado e educador sênior com vasta experiência em Ateliês Maker, FabLabs, Educação Inclusiva e Tecnologias Assistivas DIY de Baixo Custo, Arte Povera, Cubismo, Dadaísmo, Arte Cinética e Educação STEAM/STEAM+Artes, com domínio profundo da BNCC (Base Nacional Comum Curricular).

Crie um planejamento pedagógico de excelência, criativo, viável, estimulante, inclusivo e rigoroso para a seguinte oficina:
- Tema Central: ${theme}
- Público-Alvo: ${audience}
- Duração Prevista: ${duration}
- Habilidades / Competências da BNCC Priorizadas pelo Educador: ${bnccSkills || 'Mapear e articular as habilidades oficiais da BNCC mais ricas e pertinentes para este público-alvo e tema da oficina.'}
- Diretrizes de Acessibilidade & Inclusão: ${accessibility}
- Movimento Artístico / Referência Estética Primária: ${artMovement}
- Foco Tecnológico / Maker: ${makerFocus}
- Espaço / Ambiente: ${spaceEnvironment}
${additionalNotes ? `- Observações / Requisitos Especiais: ${additionalNotes}` : ''}

Diretrizes Pedagógicas, BNCC e de Acessibilidade:
1. Promover o "pensar com as mãos" (tinkering), experimentação de materiais não convencionais (sucatas, elementos naturais, papelão, circuitos de papel, motores DC, LEDs, sensores).
2. Articular a prática maker com história da arte crítica e poética (ex: Arte Povera de Michelangelo Pistoletto/Kounellis, assemblage de Arthur Bispo do Rosário, esculturas cinéticas de Alexander Calder/Tinguely, colagens cubistas de Picasso/Braque, autômatos, arte sonora).
3. ALINHAMENTO MANDATÓRIO DE HABILIDADES DA BNCC (Base Nacional Comum Curricular):
   - Em 'habilidades_especificas_bncc', liste de 3 a 5 habilidades oficiais da BNCC estritamente adequadas ao público-alvo (${audience}).
     * Para Ensino Fundamental II, use códigos como EF69AR01 (pesquisar e apreciar formas distintas das artes visuais), EF69AR04 (experimentar diferentes formas de expressão artística tridimensional), EF69AR05 (experimentar e criar utilizando materialidades convencionais e não convencionais), EF69AR06 (desenvolver processos de criação), EF69AR07 (dialogar com princípios conceituais da arte contemporânea), EF69AR35 (articular diferentes linguagens artísticas e tecnológicas).
     * Para Ensino Médio, use códigos como EM13LGG601 (apropriar-se criticamente de processos, linguagens e tecnologias digitais em práticas artísticas), EM13LGG602, EM13LGG604 (relacionar as práticas artísticas às diferentes dimensões da vida social), EM13LGG701, EM13LGG703.
     * Para Fundamental I, use códigos como EF15AR04, EF15AR05, EF15AR06.
   - Para cada habilidade em 'habilidades_especificas_bncc', preencha:
     * 'codigo': O código alfanumérico oficial (ex: 'EF69AR05').
     * 'campo_ou_unidade': Unidade temática ou campo de atuação (ex: 'Artes Visuais / Materialidades e Processos de Criação').
     * 'descricao': A redação formal oficial da habilidade segundo a BNCC.
     * 'aplicacao_na_oficina': Descrição prática e vívida de como esta oficina mobiliza essa habilidade através dos materiais, da prototipagem maker e da reflexão estética.
   - Em 'competencias_gerais_bncc', liste de 2 a 3 Competências Gerais da Educação Básica contempladas (ex: 'Competência 3: Repertório Cultural', 'Competência 5: Cultura Digital', 'Competência 2: Pensamento Científico, Crítico e Criativo', 'Competência 7: Argumentação').
4. O roteiro passo a passo deve ter momentos claros com temporização calculada proporcionalmente à duração (${duration}), dicas reais de mediação para o professor não entregar respostas prontas, mas instigar a autoria dos participantes.
5. FOCO MANDATÓRIO EM ACESSIBILIDADE E TECNOLOGIAS ASSISTIVAS DE BAIXO CUSTO:
   - Proponha soluções práticas, criativas e acessíveis de Tecnologia Assistiva (TA) com materiais de baixo custo ou recicláveis (ex: canudos de piscina/espuma para engrossar pincéis e tesouras; relevo com cola quente, barbante ou lixa para pistas táteis a pessoas cegas/baixa visão; organizadores visuais e pranchas de comunicação alternativa para autistas/TEA; sinalizadores visuais com LEDs para surdos/D.A.; fitas antiderrapantes e fixações magnéticas para alunos com mobilidade reduzida).
   - Detalhe em 'tecnologias_assistivas_baixo_custo' pelo menos 3 a 4 recursos específicos de TA de baixo custo que qualquer escola ou ateliê público pode construir com facilidade.
6. Assegurar linguagem viva em português brasileiro, acolhedora, inclusiva e inspiradora.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: planResponseSchema,
        systemInstruction:
          'Você é o especialista pedagógico e curador do Ateliê Maker & Arte. Forneça respostas estruturadas de alto valor pedagógico em português.',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Nenhum texto retornado pela API.');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return res.status(500).json({
      error: error?.message || 'Erro ao gerar o planejamento pedagógico.',
    });
  }
});

app.post('/api/refine-plan', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chave de API do Gemini não configurada.',
      });
    }

    const { currentPlan, instruction } = req.body;
    if (!currentPlan || !instruction) {
      return res.status(400).json({ error: 'Plano atual e instrução de ajuste são obrigatórios.' });
    }

    const prompt = `Aqui está o planejamento atual de uma oficina no Ateliê Maker & Arte:
${JSON.stringify(currentPlan, null, 2)}

Instrução de Ajuste / Refinamento do Educador:
"${instruction}"

Reescreva e aprimore o planejamento mantendo a estrutura exata do schema JSON, atendendo com precisão à solicitação do educador (mantendo a coerência poética e maker).`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: planResponseSchema,
        systemInstruction:
          'Você é o consultor de refinamento do Ateliê Maker & Arte. Aplique as modificações solicitadas mantendo consistência e riqueza pedagógica.',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Nenhum texto retornado pela API.');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error refining plan:', error);
    return res.status(500).json({
      error: error?.message || 'Erro ao refinar o planejamento pedagógico.',
    });
  }
});

function generateArtisticSvgCover(title: string, subtitle?: string, theme?: string): string {
  const safeTitle = (title || 'Ateliê Maker & Arte').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSub = (subtitle || 'Planejamento Pedagógico & Práticas de Ateliê').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let accent1 = '#e05638';
  let accent2 = '#f59e0b';
  let accent3 = '#0d9488';

  const contentStr = `${title} ${theme || ''} ${subtitle || ''}`.toLowerCase();
  if (contentStr.includes('cianotip') || contentStr.includes('foto') || contentStr.includes('azul')) {
    accent1 = '#0284c7';
    accent2 = '#38bdf8';
    accent3 = '#0369a1';
  } else if (contentStr.includes('botan') || contentStr.includes('eco') || contentStr.includes('organ') || contentStr.includes('naturez')) {
    accent1 = '#059669';
    accent2 = '#34d399';
    accent3 = '#d97706';
  } else if (contentStr.includes('robotic') || contentStr.includes('circuit') || contentStr.includes('e-lixo')) {
    accent1 = '#e05638';
    accent2 = '#0d9488';
    accent3 = '#fbbf24';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1917" />
        <stop offset="50%" stop-color="#292524" />
        <stop offset="100%" stop-color="#0c0a09" />
      </linearGradient>
      <radialGradient id="glow1" cx="30%" cy="35%" r="60%">
        <stop offset="0%" stop-color="${accent1}" stop-opacity="0.45" />
        <stop offset="60%" stop-color="${accent1}" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="glow2" cx="75%" cy="70%" r="50%">
        <stop offset="0%" stop-color="${accent2}" stop-opacity="0.35" />
        <stop offset="60%" stop-color="${accent3}" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1" />
      </pattern>
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.07" />
      </pattern>
    </defs>

    <rect width="1200" height="675" fill="url(#bg)" />
    <rect width="1200" height="675" fill="url(#glow1)" />
    <rect width="1200" height="675" fill="url(#glow2)" />
    <rect width="1200" height="675" fill="url(#grid)" />
    <rect width="1200" height="675" fill="url(#dots)" opacity="0.6" />

    <g opacity="0.85">
      <path d="M 850 50 L 1150 120 L 1100 480 L 800 420 Z" fill="#d97706" fill-opacity="0.12" stroke="#d97706" stroke-opacity="0.3" stroke-width="2" />
      <path d="M 900 180 L 1180 230 L 1050 580 L 780 500 Z" fill="${accent1}" fill-opacity="0.15" stroke="${accent1}" stroke-opacity="0.4" stroke-width="2" />
      
      <path d="M 150 550 L 400 550 L 480 420 L 720 420 L 800 320 L 1050 320" fill="none" stroke="${accent2}" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 4" opacity="0.7" />
      <path d="M 220 600 L 350 480 L 600 480 L 680 250 L 920 250" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.3" />
      
      <circle cx="480" cy="420" r="7" fill="${accent1}" />
      <circle cx="480" cy="420" r="14" fill="${accent1}" fill-opacity="0.25" />
      <circle cx="720" cy="420" r="7" fill="${accent2}" />
      <circle cx="720" cy="420" r="14" fill="${accent2}" fill-opacity="0.25" />
      <circle cx="800" cy="320" r="8" fill="${accent3}" />
      <circle cx="800" cy="320" r="18" fill="${accent3}" fill-opacity="0.25" />

      <circle cx="980" cy="190" r="48" fill="none" stroke="${accent1}" stroke-width="2.5" stroke-dasharray="6 6" />
      <circle cx="980" cy="190" r="28" fill="${accent2}" fill-opacity="0.2" />
      <line x1="980" y1="50" x2="980" y2="142" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.5" />
      
      <circle cx="200" cy="140" r="65" fill="${accent3}" fill-opacity="0.12" stroke="${accent3}" stroke-opacity="0.35" stroke-width="2" />
      <circle cx="200" cy="140" r="6" fill="#ffffff" fill-opacity="0.8" />
    </g>

    <g transform="translate(80, 240)">
      <rect x="0" y="0" width="220" height="32" rx="16" fill="${accent1}" fill-opacity="0.25" stroke="${accent1}" stroke-opacity="0.5" stroke-width="1" />
      <text x="16" y="20" fill="#fef08a" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">ATELIÊ MAKER &amp; ARTE</text>

      <text x="0" y="90" fill="#ffffff" font-family="'Space Grotesk', 'Plus Jakarta Sans', sans-serif" font-size="42" font-weight="800" letter-spacing="-0.5">
        ${safeTitle.length > 36 ? safeTitle.slice(0, 34) + '...' : safeTitle}
      </text>

      <text x="0" y="135" fill="#d6d3d1" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-style="italic" font-weight="500">
        "${safeSub.length > 60 ? safeSub.slice(0, 58) + '...' : safeSub}"
      </text>

      <text x="0" y="200" fill="#a8a29e" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" letter-spacing="0.5">
        CULTURA MAKER • ARTE CONTEMPORÂNEA • BNCC &amp; STEAM • INCLUSÃO
      </text>
    </g>
  </svg>`;

  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

app.post('/api/generate-cover', async (req: Request, res: Response) => {
  try {
    const { title, theme, subtitle, movement } = req.body;
    if (!title && !theme) {
      return res.status(400).json({ error: 'Título ou tema é obrigatório.' });
    }

    const currentKey = process.env.GEMINI_API_KEY;
    const imagePrompt = `Artistic editorial hero photograph for an art and tinkering maker workshop. Subject: "${title || theme}". Conceptual vibe: "${subtitle || theme}". Context: contemporary art studio atelier, tactile assemblage materials, cardboard textures, raw recycled electronics, glowing subtle LEDs, copper tape traces, poetic craftsmanship, warm atmospheric studio lighting, 16:9 cinematic aspect ratio, award-winning museum documentation photography, clean framing, no text overlay, no watermarks, ultra high quality.`;

    let imageUrl: string | null = null;
    let methodUsed = '';

    // Strategy 1: Try Imagen / Gemini image models if key is available
    if (currentKey) {
      try {
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${currentKey}`;
        const imagenRes = await fetch(imagenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build',
          },
          body: JSON.stringify({
            instances: [{ prompt: imagePrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '16:9',
              outputOptions: { mimeType: 'image/jpeg' },
            },
          }),
        });

        if (imagenRes.ok) {
          const data = await imagenRes.json();
          const base64Data = data?.predictions?.[0]?.bytesBase64Encoded;
          if (base64Data) {
            imageUrl = `data:image/jpeg;base64,${base64Data}`;
            methodUsed = 'imagen-3.0-generate-002';
          }
        }
      } catch (err: any) {
        console.warn('Imagen 3 API attempt skipped:', err?.message || err);
      }

      // Strategy 2: If Imagen 3 didn't return, try gemini-3.1-flash-lite-image
      if (!imageUrl) {
        const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];
        for (const m of imageModels) {
          try {
            const genRes = await ai.models.generateContent({
              model: m,
              contents: { parts: [{ text: imagePrompt }] },
              config: { imageConfig: { aspectRatio: '16:9' } },
            });

            for (const part of genRes.candidates?.[0]?.content?.parts ?? []) {
              if (part.inlineData?.data) {
                const mime = part.inlineData.mimeType || 'image/jpeg';
                imageUrl = `data:${mime};base64,${part.inlineData.data}`;
                methodUsed = m;
                break;
              }
            }
            if (imageUrl) break;
          } catch (mErr: any) {
            // Free-tier quota exceeded or transient error
          }
        }
      }
    }

    // Strategy 3: Dynamic high-resolution artistic SVG cover generator
    if (!imageUrl) {
      imageUrl = generateArtisticSvgCover(title, subtitle, theme);
      methodUsed = 'atelier-generative-artwork';
    }

    return res.json({ imageUrl, method: methodUsed });
  } catch (error: any) {
    console.error('Error in generate-cover endpoint:', error);
    // Even if an unexpected error occurs, provide the artistic cover
    const fallbackCover = generateArtisticSvgCover(req.body.title, req.body.subtitle, req.body.theme);
    return res.json({ imageUrl: fallbackCover, method: 'atelier-generative-artwork' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Ateliê Maker & Arte server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
