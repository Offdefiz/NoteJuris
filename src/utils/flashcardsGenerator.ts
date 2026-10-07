import { Flashcard, NotebookDocument } from '../types/notebook';

export function generateDefaultFlashcards(doc: NotebookDocument): Flashcard[] {
  const cards: Flashcard[] = [];

  // Generate cards from Timeline steps
  doc.timelineItems.forEach((item, idx) => {
    // Basic procedural card
    cards.push({
      id: `fc-step-${item.id}`,
      front: `Etapa ${item.stepNumber}: Em que consiste "${item.title}" no procedimento comum?`,
      back: `${item.detail}\n\nBase Legal: ${item.article}`,
      article: item.article,
      category: 'Procedimento',
      mastery: 'unreviewed',
    });

    // If student has written class notes, make a specific card for it
    if (item.notes && item.notes.trim() && !item.notes.includes('Clique para adicionar')) {
      cards.push({
        id: `fc-note-${item.id}`,
        front: `[Anotação de Aula] O que foi destacado sobre ${item.title} (${item.article})?`,
        back: item.notes,
        article: item.article,
        category: 'Anotações da Aula',
        mastery: 'unreviewed',
      });
    }
  });

  // Flowchart cards: Deadlines (prazos)
  cards.push({
    id: 'fc-deadlines-inquerito',
    front: 'Quais os prazos da regra geral para a conclusão do Inquérito Policial (CPP, art. 10)?',
    back: '• Réu Preso: 10 dias (improrrogáveis).\n• Réu Solto: 30 dias (prorrogáveis mediante pedido da autoridade policial ao juiz).',
    article: 'CPP, art. 10',
    category: 'Prazos Fatais',
    mastery: 'unreviewed',
  });

  // Flowchart cards: Nature & Characteristics
  cards.push({
    id: 'fc-characteristics',
    front: 'Quais são as 5 características clássicas do Inquérito Policial?',
    back: '1. Escrito e formal\n2. Inquisitivo (sem ampla defesa plena)\n3. Sigiloso (relativo à luz da Súmula Vinculante 14)\n4. Dispensável (se o titular já tiver elementos)\n5. Indisponível (o delegado não pode arquivar)',
    article: 'CPP, arts. 4º a 23',
    category: 'Conceito & Doutrina',
    mastery: 'unreviewed',
  });

  // Flowchart cards: Formas de início
  cards.push({
    id: 'fc-start-forms',
    front: 'Como se inicia o Inquérito Policial nos crimes de ação penal pública incondicionada?',
    back: '• De ofício (Portaria da autoridade policial)\n• Por requisição (do Ministério Público ou Juiz)\n• Por requerimento (do ofendido ou representante legal)',
    article: 'CPP, art. 5º',
    category: 'Procedimento',
    mastery: 'unreviewed',
  });

  // Flowchart cards: Outcomes do MP
  cards.push({
    id: 'fc-mp-outcomes',
    front: 'Recebidos os autos do inquérito, quais as 3 opções de atuação do Ministério Público?',
    back: '1. Oferecer Denúncia (início da ação penal)\n2. Requerer novas diligências imprescindíveis à denúncia\n3. Promover o Arquivamento do inquérito (art. 28 do CPP)',
    article: 'CPP, arts. 28 e 46',
    category: 'Atuação do MP',
    mastery: 'unreviewed',
  });

  // Custom notes
  doc.customNotes.forEach((n, idx) => {
    cards.push({
      id: `fc-custom-${n.id}`,
      front: `[Fixação] ${n.title}`,
      back: n.body,
      category: 'Bloco de Anotações',
      mastery: 'unreviewed',
    });
  });

  return cards;
}
