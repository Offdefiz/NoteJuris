import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface GeneratedCard {
  front: string;
  back: string;
  article: string;
  category: string;
}

interface AiContextType {
  apiKey: string;
  isOfflineMode: boolean;
  hasServerKey: boolean;
  isConfigModalOpen: boolean;
  isKeyConfigured: boolean;
  openConfigModal: () => void;
  closeConfigModal: () => void;
  saveSettings: (newKey: string, offline: boolean) => void;
  testApiKey: (keyToTest?: string) => Promise<{ success: boolean; message: string }>;
  getAuthHeaders: () => Record<string, string>;
  askAiAssistant: (params: { prompt: string; currentTitle: string; discipline: string }) => Promise<{ text: string; isOffline: boolean }>;
  generateAiFlashcards: (params: { currentTitle: string; discipline: string; count?: number; notesContext?: string }) => Promise<{ cards: GeneratedCard[]; isOffline: boolean }>;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('caderno_custom_gemini_key') || '';
  });

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return localStorage.getItem('caderno_ai_offline_mode') === 'true';
  });

  const [hasServerKey, setHasServerKey] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Check server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasGeminiKey) {
          setHasServerKey(true);
        }
      })
      .catch((err) => {
        console.warn('Status check unreachable (offline mode available):', err);
      });
  }, []);

  const openConfigModal = useCallback(() => setIsConfigModalOpen(true), []);
  const closeConfigModal = useCallback(() => setIsConfigModalOpen(false), []);

  const saveSettings = useCallback((newKey: string, offline: boolean) => {
    const trimmed = newKey.trim();
    setApiKey(trimmed);
    setIsOfflineMode(offline);
    localStorage.setItem('caderno_custom_gemini_key', trimmed);
    localStorage.setItem('caderno_ai_offline_mode', offline ? 'true' : 'false');
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey.trim()) {
      headers['x-gemini-key'] = apiKey.trim();
    }
    return headers;
  }, [apiKey]);

  const testApiKey = useCallback(async (keyToTest?: string): Promise<{ success: boolean; message: string }> => {
    const targetKey = (keyToTest !== undefined ? keyToTest : apiKey).trim();
    if (!targetKey) {
      return {
        success: false,
        message: 'Por favor, informe uma chave Google Gemini válida.',
      };
    }

    try {
      const res = await fetch('/api/gemini/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: targetKey }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        return {
          success: true,
          message: data.message || 'Chave Google Gemini conectada com sucesso!',
        };
      }
      return {
        success: false,
        message: data.error || 'A chave informada não pôde ser validada pelo Google Gemini.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Falha ao conectar com o serviço de validação.',
      };
    }
  }, [apiKey]);

  const askAiAssistant = useCallback(async (params: {
    prompt: string;
    currentTitle: string;
    discipline: string;
  }) => {
    const res = await fetch('/api/gemini/assist', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt: params.prompt,
        currentTitle: params.currentTitle,
        discipline: params.discipline,
        customApiKey: apiKey.trim() || undefined,
        mode: isOfflineMode ? 'offline' : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro na resposta do assistente.');
    }
    return {
      text: data.text || '',
      isOffline: Boolean(data.isOfflineMode),
    };
  }, [apiKey, isOfflineMode, getAuthHeaders]);

  const generateAiFlashcards = useCallback(async (params: {
    currentTitle: string;
    discipline: string;
    count?: number;
    notesContext?: string;
  }) => {
    const res = await fetch('/api/gemini/flashcards', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentTitle: params.currentTitle,
        discipline: params.discipline,
        count: params.count || 4,
        notesContext: params.notesContext,
        customApiKey: apiKey.trim() || undefined,
        mode: isOfflineMode ? 'offline' : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao gerar flashcards.');
    }
    return {
      cards: data.cards || [],
      isOffline: Boolean(data.isOfflineMode),
    };
  }, [apiKey, isOfflineMode, getAuthHeaders]);

  const isKeyConfigured = (!isOfflineMode && Boolean(apiKey.trim() || hasServerKey));

  return (
    <AiContext.Provider
      value={{
        apiKey,
        isOfflineMode,
        hasServerKey,
        isConfigModalOpen,
        isKeyConfigured,
        openConfigModal,
        closeConfigModal,
        saveSettings,
        testApiKey,
        getAuthHeaders,
        askAiAssistant,
        generateAiFlashcards,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};

export const useAi = (): AiContextType => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
};
