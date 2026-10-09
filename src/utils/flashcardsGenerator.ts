import { Flashcard, NotebookDocument } from '../types/notebook';

export function generateDefaultFlashcards(doc: NotebookDocument): Flashcard[] {
  const cards: Flashcard[] = [];

  // 1. Generate cards from Timeline steps
  if (doc.timelineItems && doc.timelineItems.length > 0) {
    doc.timelineItems.forEach((item) => {
      cards.push({
        id: `fc-step-${item.id}`,
        front: `[${doc.disciplineName || 'Direito'}] Etapa ${item.stepNumber}: ${item.title}`,
        back: `${item.detail}\n\nFundamentação Legal: ${item.article}`,
        article: item.article,
        category: 'Rito & Procedimento',
        mastery: 'unreviewed',
      });

      if (item.notes && item.notes.trim() && !item.notes.includes('Clique para adicionar')) {
        cards.push({
          id: `fc-note-${item.id}`,
          front: `[Anotação Chave] O que foi destacado sobre ${item.title} (${item.article})?`,
          back: item.notes,
          article: item.article,
          category: 'Anotações da Aula',
          mastery: 'unreviewed',
        });
      }
    });
  }

  // 2. Specific flow cards for Presidência da República
  if (doc.id === 'presidencia-republica-07' || doc.title.toLowerCase().includes('presidência')) {
    cards.push({
      id: 'fc-pres-sucessao-vs-substituicao',
      front: 'Qual a diferença entre sucessão definitiva e substituição na Presidência da República (CF, arts. 79 e 80)?',
      back: '• O Vice-Presidente é o ÚNICO que SUCEDE em caráter definitivo (assume por morte, renúncia ou impeachment).\n• Presidente da Câmara dos Deputados, Presidente do Senado e Presidente do STF apenas SUBSTITUEM interinamente (em caráter provisório e precário), convocando novas eleições.',
      article: 'CF/88, arts. 79 e 80',
      category: 'Linha Sucessória',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-pres-linha-substituicao',
      front: 'Em caso de impedimento ou vacância do Presidente e do Vice-Presidente, qual a ordem exata de substituição legal?',
      back: '1º Presidente da Câmara dos Deputados (representante do povo)\n2º Presidente do Senado Federal (representante dos Estados/DF)\n3º Presidente do Supremo Tribunal Federal (chefe do Poder Judiciário)',
      article: 'CF/88, art. 80',
      category: 'Linha Sucessória',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-pres-dupla-vacancia-regras',
      front: 'Ocorrendo vacância de ambos os cargos (Presidente e Vice), quais as regras para novas eleições (CF, art. 81)?',
      back: '• Se ocorrer nos PRIMEIROS 2 ANOS do mandato: far-se-á ELEIÇÃO DIRETA em 90 dias após aberta a última vaga.\n• Se ocorrer nos ÚLTIMOS 2 ANOS do mandato: far-se-á ELEIÇÃO INDIRETA pelo Congresso Nacional em 30 dias na forma da lei.\n• Em ambos os casos, os eleitos cumprem MANDATO-TAMPÃO (restante do período).',
      article: 'CF/88, art. 81',
      category: 'Dupla Vacância',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-pres-presidente-camara-papel',
      front: 'Qual o papel estratégico do Presidente da Câmara dos Deputados no processo de impeachment?',
      back: '• Detém a competência monocrática privativa de receber ou arquivar pedidos de impeachment (crime de responsabilidade) apresentados contra o Presidente da República.\n• É o primeiro na linha sucessória legal interina em caso de ausência do Vice-Presidente.',
      article: 'CF/88, arts. 51, I e 80',
      category: 'Poder Legislativo',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-pres-impeachment-quoruns',
      front: 'Quais os quóruns constitucionais exigidos no processo de impeachment do Presidente da República?',
      back: '• Admissibilidade na Câmara dos Deputados: 2/3 dos membros (342 votos).\n• Instauração no Senado: maioria simples (afastamento do Presidente por até 180 dias).\n• Condenação no Senado (presidido pelo Presidente do STF): 2/3 dos votos (54 senadores).',
      article: 'CF/88, arts. 51, I, 52 e 86',
      category: 'Impeachment',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-pres-impeachment-penalidades',
      front: 'Quais são as penalidades constitucionais aplicáveis em caso de condenação por crime de responsabilidade no Senado?',
      back: 'São penas cumulativas previstas no art. 52, parágrafo único:\n1. Perda do cargo público de Presidente da República;\n2. Inabilitação por 8 (oito) anos para o exercício de qualquer função pública (sem prejuízo das sanções judiciais comuns).',
      article: 'CF/88, art. 52, parágrafo único',
      category: 'Penalidades Constitucionais',
      mastery: 'unreviewed',
    });
  } else if (doc.id === 'inquerito-policial-04') {
    cards.push({
      id: 'fc-deadlines-inquerito',
      front: 'Quais os prazos da regra geral para a conclusão do Inquérito Policial (CPP, art. 10)?',
      back: '• Réu Preso: 10 dias (improrrogáveis).\n• Réu Solto: 30 dias (prorrogáveis mediante pedido da autoridade policial ao juiz).',
      article: 'CPP, art. 10',
      category: 'Prazos Fatais',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-characteristics',
      front: 'Quais são as 5 características clássicas do Inquérito Policial?',
      back: '1. Escrito e formal\n2. Inquisitivo (sem ampla defesa plena)\n3. Sigiloso (relativo à luz da Súmula Vinculante 14)\n4. Dispensável (se o titular já tiver elementos)\n5. Indisponível (o delegado não pode arquivar)',
      article: 'CPP, arts. 4º a 23',
      category: 'Conceito & Doutrina',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-start-forms',
      front: 'Como se inicia o Inquérito Policial nos crimes de ação penal pública incondicionada?',
      back: '• De ofício (Portaria da autoridade policial)\n• Por requisição (do Ministério Público ou Juiz)\n• Por requerimento (do ofendido ou representante legal)',
      article: 'CPP, art. 5º',
      category: 'Procedimento',
      mastery: 'unreviewed',
    });

    cards.push({
      id: 'fc-mp-outcomes',
      front: 'Recebidos os autos do inquérito, quais as 3 opções de atuação do Ministério Público?',
      back: '1. Oferecer Denúncia (início da ação penal)\n2. Requerer novas diligências imprescindíveis à denúncia\n3. Promover o Arquivamento do inquérito (art. 28 do CPP)',
      article: 'CPP, arts. 28 e 46',
      category: 'Atuação do MP',
      mastery: 'unreviewed',
    });
  } else {
    // Flowchart generic cards
    if (doc.flow?.card1) {
      cards.push({
        id: `fc-flow1-${doc.id}`,
        front: `[${doc.disciplineName}] ${doc.flow.card1.title}: Conceito e Estrutura Principal`,
        back: doc.flow.card1.body,
        category: 'Conceito Central',
        mastery: 'unreviewed',
      });
    }

    if (doc.flow?.card2?.branches) {
      doc.flow.card2.branches.forEach((b, idx) => {
        cards.push({
          id: `fc-flow2-branch-${idx}`,
          front: `[Bifurcação] ${b.title}`,
          back: `${b.note}\n\n${doc.flow.card2.annotation || ''}`,
          category: 'Desdobramentos',
          mastery: 'unreviewed',
        });
      });
    }

    if (doc.flow?.card5?.deadlines) {
      cards.push({
        id: `fc-flow5-deadlines-${doc.id}`,
        front: `[Prazos Principais] ${doc.flow.card5.title}`,
        back: doc.flow.card5.deadlines.map((d) => `• ${d.label}: ${d.text}`).join('\n'),
        category: 'Prazos Fatais',
        mastery: 'unreviewed',
      });
    }
  }

  // 3. Custom notes cards
  if (doc.customNotes && doc.customNotes.length > 0) {
    doc.customNotes.forEach((n) => {
      cards.push({
        id: `fc-custom-${n.id}`,
        front: `[Fixação] ${n.title}`,
        back: n.body,
        category: 'Bloco de Anotações',
        mastery: 'unreviewed',
      });
    });
  }

  return cards;
}
