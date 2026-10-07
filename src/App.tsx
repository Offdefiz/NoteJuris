import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initialNotebook, defaultDisciplines } from './data/initialData';
import { NotebookDocument, LegendType, TimelineItem, NoteBlock, Discipline, TopicItem } from './types/notebook';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DocumentHeader } from './components/DocumentHeader';
import { TimelineSection } from './components/TimelineSection';
import { FlowchartSection } from './components/FlowchartSection';
import { CustomNotesSection } from './components/CustomNotesSection';
import { ZoomControl } from './components/ZoomControl';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { GeminiDrawer } from './components/GeminiDrawer';
import { CreateModal } from './components/CreateModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function MainApp() {
  const { user } = useAuth();

  // Disciplines list state (persisted)
  const [disciplines, setDisciplines] = useState<Discipline[]>(() => {
    const saved = localStorage.getItem('caderno_juridico_disciplines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultDisciplines;
  });

  const [activeDisciplineId, setActiveDisciplineId] = useState<string>('processual-penal');
  const [activeTopicId, setActiveTopicId] = useState<string>('inquerito-policial-04');

  // Multi-topic document store (cached in localStorage)
  const [documentData, setDocumentData] = useState<NotebookDocument>(() => {
    const saved = localStorage.getItem('caderno_juridico_doc_inquerito-policial-04');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialNotebook;
  });

  const [zoom, setZoom] = useState<number>(100);
  const [activeFilter, setActiveFilter] = useState<LegendType | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'discipline' | 'topic'>('topic');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Save disciplines to localStorage
  useEffect(() => {
    localStorage.setItem('caderno_juridico_disciplines', JSON.stringify(disciplines));
  }, [disciplines]);

  // Cloud sync when user logs in
  useEffect(() => {
    if (!user) return;
    const fetchUserNotebook = async () => {
      try {
        const notebookRef = doc(db, 'users', user.uid, 'notebooks', activeTopicId);
        const snap = await getDoc(notebookRef);
        if (snap.exists()) {
          const remoteData = snap.data();
          if (remoteData.content) {
            const parsed = JSON.parse(remoteData.content);
            setDocumentData(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote notebook:', err);
      }
    };
    fetchUserNotebook();
  }, [user, activeTopicId]);

  // Autosave handler (Local + Firestore debounce)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSave = useCallback(
    (newDoc: NotebookDocument) => {
      setIsSaving(true);
      localStorage.setItem(`caderno_juridico_doc_${newDoc.id}`, JSON.stringify(newDoc));

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (user) {
          try {
            const notebookRef = doc(db, 'users', user.uid, 'notebooks', newDoc.id);
            await setDoc(
              notebookRef,
              {
                userId: user.uid,
                disciplineId: newDoc.disciplineId,
                title: newDoc.title,
                subtitle: newDoc.subtitle,
                content: JSON.stringify(newDoc),
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (err) {
            console.error('Firestore save error:', err);
          }
        }
        setIsSaving(false);
      }, 700);
    },
    [user]
  );

  const updateDoc = (updater: (prev: NotebookDocument) => NotebookDocument) => {
    setDocumentData((prev) => {
      const next = updater(prev);
      triggerSave(next);
      return next;
    });
  };

  // Keyboard shortcut for Search ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Topic Selection Handler
  const handleSelectTopic = (disciplineId: string, topicId: string) => {
    setActiveDisciplineId(disciplineId);
    setActiveTopicId(topicId);

    // Save current before switching
    localStorage.setItem(`caderno_juridico_doc_${documentData.id}`, JSON.stringify(documentData));

    // Try loading saved data for the target topic
    const saved = localStorage.getItem(`caderno_juridico_doc_${topicId}`);
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        setDocumentData(loaded);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Otherwise, generate a customized initial document for this topic
    const disc = disciplines.find((d) => d.id === disciplineId);
    const top = disc?.topics.find((t) => t.id === topicId);

    if (top && disc) {
      const freshDoc: NotebookDocument = {
        ...initialNotebook,
        id: topicId,
        disciplineId: disc.id,
        disciplineName: disc.name,
        lessonMeta: top.lessonMeta,
        courseMeta: disc.name.toUpperCase(),
        title: top.title,
        subtitle: top.subtitle,
      };
      setDocumentData(freshDoc);
      triggerSave(freshDoc);
    }
  };

  // Create Discipline Handler
  const handleCreateDiscipline = (name: string, colorClass: string) => {
    const newId = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `disc-${Date.now()}`;

    const defaultFirstTopic: TopicItem = {
      id: `${newId}-intro`,
      title: 'Introdução e Conceitos Fundamentais',
      subtitle: 'Visão panorâmica e princípios aplicáveis',
      lessonMeta: 'AULA 01',
    };

    const newDisc: Discipline = {
      id: newId,
      name,
      dotColor: colorClass,
      topics: [defaultFirstTopic],
    };

    setDisciplines((prev) => [...prev, newDisc]);
    handleSelectTopic(newId, defaultFirstTopic.id);
  };

  // Create Topic (Matéria) Handler
  const handleCreateTopic = (disciplineId: string, title: string, subtitle: string, lessonMeta: string) => {
    const newId = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `top-${Date.now()}`;

    const newTopic: TopicItem = {
      id: newId,
      title,
      subtitle,
      lessonMeta,
    };

    setDisciplines((prev) =>
      prev.map((d) => (d.id === disciplineId ? { ...d, topics: [...d.topics, newTopic] } : d))
    );

    const disc = disciplines.find((d) => d.id === disciplineId);
    const freshDoc: NotebookDocument = {
      ...initialNotebook,
      id: newId,
      disciplineId,
      disciplineName: disc ? disc.name : 'Direito',
      lessonMeta,
      courseMeta: disc ? disc.name.toUpperCase() : 'DIREITO',
      title,
      subtitle,
    };

    setDocumentData(freshDoc);
    setActiveDisciplineId(disciplineId);
    setActiveTopicId(newId);
    triggerSave(freshDoc);
  };

  // Filter toggle
  const handleToggleFilter = (type: LegendType) => {
    setActiveFilter((prev) => (prev === type ? null : type));
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(150, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(60, z - 10));
  const handleResetZoom = () => setZoom(100);

  // Timeline handlers
  const handleUpdateHeading = (field: 'title' | 'note', value: string) => {
    updateDoc((prev) => ({
      ...prev,
      timelineHeading: {
        ...prev.timelineHeading,
        [field]: value,
      },
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<TimelineItem>) => {
    updateDoc((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const handleAddTimelineItem = () => {
    const nextNum = String(documentData.timelineItems.length + 1).padStart(2, '0');
    const newItem: TimelineItem = {
      id: `step-${Date.now()}`,
      stepNumber: nextNum,
      article: 'Artigo ou Lei Correlata',
      title: 'Nova Etapa Processual',
      detail: 'Descrição da etapa procedimental e prazos determinados pelo código.',
      notes: 'Clique para adicionar anotações da aula...',
      type: 'procedimento',
    };
    updateDoc((prev) => ({
      ...prev,
      timelineItems: [...prev.timelineItems, newItem],
    }));
  };

  const handleDeleteTimelineItem = (id: string) => {
    updateDoc((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.filter((i) => i.id !== id),
    }));
  };

  const handleUpdateAlert = (id: string, text: string) => {
    updateDoc((prev) => ({
      ...prev,
      timelineAlerts: prev.timelineAlerts.map((a) => (a.id === id ? { ...a, text } : a)),
    }));
  };

  // Custom Notes handlers
  const handleAddNote = () => {
    const nextNumber = String(documentData.customNotes.length + 1).padStart(2, '0');
    const newNote: NoteBlock = {
      id: `note-${Date.now()}`,
      number: nextNumber,
      title: 'Novo bloco de anotações da aula',
      body: 'Clique para redigir seus apontamentos e notas explicadas pelo professor...',
    };
    updateDoc((prev) => ({
      ...prev,
      customNotes: [...prev.customNotes, newNote],
    }));
  };

  const handleRemoveNote = (id: string) => {
    updateDoc((prev) => ({
      ...prev,
      customNotes: prev.customNotes.filter((n) => n.id !== id),
    }));
  };

  const handleUpdateNote = (id: string, updates: Partial<NoteBlock>) => {
    updateDoc((prev) => ({
      ...prev,
      customNotes: prev.customNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  };

  // Scroll to search target
  const handleSelectSearchResult = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-blue-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 2500);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f6f2] dark:bg-[#11141a] text-[#1c222e] dark:text-[#e4e7ee] font-sans antialiased selection:bg-[#284b63]/20 dark:selection:bg-[#60a5fa]/30">
      {/* Sidebar with Disciplines & Topics hierarchy */}
      <Sidebar
        disciplines={disciplines}
        activeDisciplineId={activeDisciplineId}
        activeTopicId={activeTopicId}
        onSelectTopic={handleSelectTopic}
        onOpenCreateModal={(mode) => {
          setCreateModalMode(mode);
          setIsCreateModalOpen(true);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenGemini={() => setIsGeminiOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar
          disciplineName={documentData.disciplineName}
          documentTitle={documentData.title}
          lessonMeta={documentData.lessonMeta}
          isSaving={isSaving}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenGemini={() => setIsGeminiOpen(true)}
          onOpenCreateTopic={() => {
            setCreateModalMode('topic');
            setIsCreateModalOpen(true);
          }}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scalable Canvas container */}
        <div className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10 transition-transform origin-top">
          <div
            style={{
              zoom: `${zoom}%`,
            }}
            className="max-w-[1240px] mx-auto space-y-12"
          >
            {/* Document Header */}
            <DocumentHeader
              lessonMeta={documentData.lessonMeta}
              courseMeta={documentData.courseMeta}
              title={documentData.title}
              subtitle={documentData.subtitle}
              activeFilter={activeFilter}
              onToggleFilter={handleToggleFilter}
              onUpdateTitle={(t) => updateDoc((prev) => ({ ...prev, title: t }))}
              onUpdateSubtitle={(s) => updateDoc((prev) => ({ ...prev, subtitle: s }))}
            />

            {/* Timeline Section */}
            <TimelineSection
              heading={documentData.timelineHeading}
              items={documentData.timelineItems}
              alerts={documentData.timelineAlerts}
              activeFilter={activeFilter}
              onUpdateHeading={handleUpdateHeading}
              onUpdateItem={handleUpdateItem}
              onUpdateAlert={handleUpdateAlert}
              onAddItem={handleAddTimelineItem}
              onDeleteItem={handleDeleteTimelineItem}
              onOpenGemini={() => setIsGeminiOpen(true)}
            />

            {/* Flowchart Section */}
            <FlowchartSection
              flow={documentData.flow}
              onUpdateCard1={(c) =>
                updateDoc((prev) => ({
                  ...prev,
                  flow: { ...prev.flow, card1: { ...prev.flow.card1, ...c } },
                }))
              }
              onUpdateCard2={(c) =>
                updateDoc((prev) => ({
                  ...prev,
                  flow: { ...prev.flow, card2: { ...prev.flow.card2, ...c } },
                }))
              }
              onUpdateCard3={(c) =>
                updateDoc((prev) => ({
                  ...prev,
                  flow: { ...prev.flow, card3: { ...prev.flow.card3, ...c } },
                }))
              }
              onUpdateCard4={(c) =>
                updateDoc((prev) => ({
                  ...prev,
                  flow: { ...prev.flow, card4: { ...prev.flow.card4, ...c } },
                }))
              }
              onUpdateCard5={(c) =>
                updateDoc((prev) => ({
                  ...prev,
                  flow: { ...prev.flow, card5: { ...prev.flow.card5, ...c } },
                }))
              }
            />

            {/* Custom Notes Section */}
            <CustomNotesSection
              notes={documentData.customNotes}
              onAddNote={handleAddNote}
              onRemoveNote={handleRemoveNote}
              onUpdateNote={handleUpdateNote}
            />
          </div>
        </div>
      </main>

      {/* Floating Zoom Control */}
      <ZoomControl
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      {/* Gemini Assistant Drawer */}
      <GeminiDrawer
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        currentTitle={documentData.title}
        disciplineName={documentData.disciplineName}
        onInsertTimelineItem={(item) => {
          const nextNum = String(documentData.timelineItems.length + 1).padStart(2, '0');
          const newItem: TimelineItem = {
            id: `step-${Date.now()}`,
            stepNumber: nextNum,
            article: item.article || 'Legislação Pertinente',
            title: item.title || 'Etapa Processual',
            detail: item.detail || '',
            notes: item.notes || '',
            type: item.type || 'procedimento',
          };
          updateDoc((prev) => ({
            ...prev,
            timelineItems: [...prev.timelineItems, newItem],
          }));
        }}
        onAddNoteBlock={(title, body) => {
          const nextNum = String(documentData.customNotes.length + 1).padStart(2, '0');
          const newBlock: NoteBlock = {
            id: `note-${Date.now()}`,
            number: nextNum,
            title,
            body,
          };
          updateDoc((prev) => ({
            ...prev,
            customNotes: [...prev.customNotes, newBlock],
          }));
        }}
      />

      {/* Create Discipline / Topic Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        mode={createModalMode}
        disciplines={disciplines}
        activeDisciplineId={activeDisciplineId}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDiscipline={handleCreateDiscipline}
        onCreateTopic={handleCreateTopic}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        document={documentData}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        notebookDoc={documentData}
        onImportBackup={(newDoc) => updateDoc(() => newDoc)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        document={documentData}
      />

      {/* Flashcards Interactive Study Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        document={documentData}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
