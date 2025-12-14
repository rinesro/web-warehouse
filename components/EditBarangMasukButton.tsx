"use client";

import React, { useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { updateBarangMasukAction } from "@/lib/action";
import Toast from "@/components/toast";
interface EditBarangMasukButtonProps {
  id: number;
  nama_barang: string;
  jumlah_awal: number;
}

export default function EditBarangMasukButton({
  id,
  nama_barang,
  jumlah_awal,
}: EditBarangMasukButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jumlah, setJumlah] = useState(jumlah_awal);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("jumlah_barang", jumlah.toString());

    try {
      const result = await updateBarangMasukAction(id, null, formData);
      if (result.success) {
        setToast({ message: "Data berhasil diupdate!", type: "success" }); 
        setTimeout(() => setIsOpen(false), 1000);
      } else {
        setToast({ message: result.message || "Gagal update!", type: "error" }); 
      }
    } catch (error) {
      setToast({ message: "Terjadi kesalahan sistem.", type: "error" }); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Jumlah"
      >
        <FaEdit />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h3 className="text-lg font-bold">Edit Barang Masuk</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={nama_barang}
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Masuk
                </label>
                <input
                  type="number"
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  *Stok di gudang akan otomatis menyesuaikan dengan perubahan
                  ini.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
