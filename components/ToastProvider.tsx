"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast from "./toast"; // Import komponen Toast UI anda yang lama

type ToastType = "success" | "error";

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastData, setToastData] = useState<{
    message: string;
    type: ToastType;
    key: number; // Key unik untuk mereset timer toast
  } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToastData({ message, type, key: Date.now() });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastData && (
        <Toast
          key={toastData.key} // Memaksa re-render agar animasi ulang
          message={toastData.message}
          type={toastData.type}
          onClose={() => setToastData(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}