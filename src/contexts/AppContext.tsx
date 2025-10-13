import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ViewType, TabType } from '../types';
import { useChat } from '../hooks/useChat';
import { useRequests } from '../hooks/useRequests';
import { useDocuments } from '../hooks/useDocuments';

/**
 * Application-wide context type
 */
interface AppContextType {
  // View state
  view: ViewType;
  setView: (view: ViewType) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Chat hook
  chat: ReturnType<typeof useChat>;

  // Requests hook
  requests: ReturnType<typeof useRequests>;

  // Documents hook
  documents: ReturnType<typeof useDocuments>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VIEW_STORAGE_KEY = 'revops:view';
const VALID_VIEWS: ViewType[] = ['requester', 'product-owner', 'dev', 'management'];

function getInitialView(): ViewType {
  if (typeof window === 'undefined') {
    return 'requester';
  }

  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored && VALID_VIEWS.includes(stored as ViewType)) {
      return stored as ViewType;
    }
  } catch (error) {
    console.warn('View preference unavailable, defaulting to requester', error);
  }

  return 'requester';
}

/**
 * App context provider component
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>(getInitialView);
  const [activeTab, setActiveTab] = useState<TabType>('submit');

  const chat = useChat();
  const requests = useRequests();
  const documents = useDocuments();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch (error) {
      console.warn('Failed to persist view preference', error);
    }
  }, [view]);

  const value: AppContextType = {
    view,
    setView,
    activeTab,
    setActiveTab,
    chat,
    requests,
    documents
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access app context
 * Throws error if used outside of AppProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
