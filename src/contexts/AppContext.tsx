import { createContext, useContext, useState, ReactNode } from 'react';
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

/**
 * App context provider component
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>('requester');
  const [activeTab, setActiveTab] = useState<TabType>('submit');

  const chat = useChat();
  const requests = useRequests();
  const documents = useDocuments();

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
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
