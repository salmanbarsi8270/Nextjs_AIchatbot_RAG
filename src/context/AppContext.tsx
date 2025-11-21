"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // clear chat shared method (optional)
  const [clearChatSignal, setClearChatSignal] = useState(0);

  const handleClearChat = () => {
    setClearChatSignal(prev => prev + 1); // notif for pages to clear chat
  };

  return (
    <AppContext.Provider
      value={{ isDarkMode, setIsDarkMode, clearChatSignal, handleClearChat }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
