"use client";

import { useState } from "react";
import { deletePeminjamanAction } from "@/lib/action";
import { FaTrash } from "react-icons/fa";

export default function DeletePeminjamanButton({
  id,
  nama_peminjam,
  nama_barang,
}: {
  id: number;
  nama_peminjam: string;
  nama_barang: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deletePeminjamanAction(id);
    setIsDeleting(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition-colors"
        title="Hapus Peminjaman"
      >
        <FaTrash size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Hapus Peminjaman?
              </h3>
              <p className="text-gray-500 text-sm mb-6 break-words whitespace-normal">
                Apakah Anda yakin ingin menghapus data peminjaman{" "}
                <strong>{nama_peminjam}</strong> ({nama_barang})? Tindakan ini
                tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
