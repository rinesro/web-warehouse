"use client";

import React, { useState } from "react";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { deleteBarangMasukAction } from "@/lib/action";

interface DeleteBarangMasukButtonProps {
  id: number;
  nama_barang: string;
  jumlah: number;
}

export default function DeleteBarangMasukButton({
  id,
  nama_barang,
  jumlah,
}: DeleteBarangMasukButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteBarangMasukAction(id);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition-colors"
        title="Hapus Data"
      >
        <FaTrash />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Hapus Data Masuk?
              </h3>
              <p className="text-gray-500 text-sm mb-6 wrap-break-word whitespace-normal">
                Apakah Anda yakin ingin menghapus data masuk untuk{" "}
                <strong>{nama_barang}</strong> (Jumlah: {jumlah})? Tindakan ini
                tidak dapat dibatalkan dan stok akan berkurang.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
