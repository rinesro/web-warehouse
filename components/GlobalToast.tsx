"use client";

import React, { useEffect, useState } from "react";
import Toast from "@/components/toast"; 

export default function GlobalToast() {
  const [toastData, setToastData] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        message: string;
        type: "success" | "error";
      }>;
      setToastData(customEvent.detail);
      
      setTimeout(() => setToastData(null), 3000);
    };

    window.addEventListener("show-toast", handleToastEvent);

    return () => window.removeEventListener("show-toast", handleToastEvent);
  }, []);

  if (!toastData) return null;

  return (
    <Toast
      message={toastData.message}
      type={toastData.type}
      onClose={() => setToastData(null)}
    />
  );
}