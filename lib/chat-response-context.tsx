'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ParsedLegalResponse } from './response-parser';

interface ChatResponseContextType {
  lastResponse: ParsedLegalResponse | null;
  setLastResponse: (response: ParsedLegalResponse | null) => void;
  hasResponse: boolean;
}

const ChatResponseContext = createContext<ChatResponseContextType>({
  lastResponse: null,
  setLastResponse: () => {},
  hasResponse: false,
});

export function ChatResponseProvider({ children }: { children: ReactNode }) {
  const [lastResponse, setLastResponse] = useState<ParsedLegalResponse | null>(null);

  const handleSetResponse = useCallback((response: ParsedLegalResponse | null) => {
    setLastResponse(response);
  }, []);

  return (
    <ChatResponseContext.Provider value={{
      lastResponse,
      setLastResponse: handleSetResponse,
      hasResponse: !!lastResponse,
    }}>
      {children}
    </ChatResponseContext.Provider>
  );
}

export const useChatResponse = () => useContext(ChatResponseContext);
