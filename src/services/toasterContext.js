import React, { createContext, useContext, useState, useCallback } from "react";

const ToasterContext = createContext();

export function useToaster() {
  return useContext(ToasterContext);
}

export function ToasterProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, duration = 2000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="toaster-popup">
          {toast}
        </div>
      )}
    </ToasterContext.Provider>
  );
}
