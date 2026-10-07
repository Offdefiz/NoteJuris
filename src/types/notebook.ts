export type LegendType = 'conceito' | 'procedimento' | 'atencao';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  themePreference: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface TimelineItem {
  id: string;
  stepNumber: string;
  article: string;
  title: string;
  detail: string;
  notes: string;
  type?: LegendType;
}

export interface TimelineAlert {
  id: string;
  title: string;
  text: string;
}

export interface FlowBranch {
  letter: string;
  title: string;
  note: string;
}

export interface FlowData {
  card1: {
    number: string;
    eyebrow: string;
    title: string;
    body: string;
    tags: string[];
  };
  card2: {
    number: string;
    eyebrow: string;
    title: string;
    branches: FlowBranch[];
    annotation: string;
  };
  card3: {
    number: string;
    eyebrow: string;
    title: string;
    items: string[];
    legalNote: string;
  };
  card4: {
    number: string;
    eyebrow: string;
    title: string;
    noteLines: string[];
    promptBox: string;
  };
  card5: {
    number: string;
    eyebrow: string;
    title: string;
    body: string;
    deadlines: { label: string; text: string }[];
    outcomes: { actor: string; action: string }[];
  };
}

export interface NoteBlock {
  id: string;
  number: string;
  title: string;
  body: string;
}

export type CardMastery = 'unreviewed' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  article?: string;
  category?: string;
  mastery?: CardMastery;
}

export interface Discipline {
  id: string;
  name: string;
  dotColor: string;
  topics: TopicItem[];
}

export interface TopicItem {
  id: string;
  title: string;
  subtitle: string;
  lessonMeta: string;
}

export interface NotebookDocument {
  id: string;
  disciplineId: string;
  disciplineName: string;
  lessonMeta: string;
  courseMeta: string;
  title: string;
  subtitle: string;
  timelineHeading: {
    eyebrow: string;
    title: string;
    note: string;
  };
  timelineItems: TimelineItem[];
  timelineAlerts: TimelineAlert[];
  flow: FlowData;
  customNotes: NoteBlock[];
  lastSavedAt?: string;
}
