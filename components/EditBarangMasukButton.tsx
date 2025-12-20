"use client";

import React, { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { FaEdit, FaTimes, FaCaretDown } from "react-icons/fa";
import { updateBarangMasukAction } from "@/lib/action";
import Toast from "@/components/toast";

// Definisikan tipe State agar Typescript senang
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditBarangMasukButtonProps {
  id: number;
  nama_barang: string;
  jumlah_awal: number;
  sumber_awal: string;
}

const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};

export default function EditBarangMasukButton({
  id,
  nama_barang,
  jumlah_awal,
  sumber_awal,
}: EditBarangMasukButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- LOGIKA PARSING STRING (Dipisahkan agar lebih stabil) ---
  const getInitialSumberData = (fullString: string) => {
    if (fullString === "Pembelian") {
      return { sumber: "Pembelian", ket: "" };
    } else if (fullString.startsWith("Pemberian")) {
      const match = fullString.match(/\((.*)\)/);
      return { sumber: "Pemberian", ket: match ? match[1] : "" };
    } else if (fullString.startsWith("Lainnya")) {
      const match = fullString.match(/\((.*)\)/);
      return { sumber: "Lainnya", ket: match ? match[1] : "" };
    } else {
      // Fallback untuk data lama atau format tidak standar
      return { sumber: "Lainnya", ket: fullString };
    }
  };

  const initialData = getInitialSumberData(sumber_awal);

  // State Form (Diinisialisasi langsung, bukan menunggu useEffect)
  const [jumlah, setJumlah] = useState(jumlah_awal);
  const [sumber, setSumber] = useState(initialData.sumber);
  const [keteranganSumber, setKeteranganSumber] = useState(initialData.ket);

  const [isPending, startTransition] = useTransition();
  const updateWithId = updateBarangMasukAction.bind(null, id);
  const [state, formAction] = useActionState(updateWithId, initialState);

  // Effect: Menangani respon sukses/gagal dari server
  useEffect(() => {
    if (state?.success) {
      setToast({ message: "Data berhasil diupdate!", type: "success" });
      const timer = setTimeout(() => setIsOpen(false), 500); // Beri waktu user membaca toast
      return () => clearTimeout(timer);
    } else if (state?.message && !state.success) {
      setToast({ message: state.message, type: "error" });
    }
  }, [state]);

  // Effect: Reset form saat modal dibuka kembali (jika data props berubah)
  useEffect(() => {
    if (isOpen) {
      const data = getInitialSumberData(sumber_awal);
      setJumlah(jumlah_awal);
      setSumber(data.sumber);
      setKeteranganSumber(data.ket);
    }
  }, [isOpen, jumlah_awal, sumber_awal]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Data"
      >
        <FaEdit />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h3 className="text-lg font-bold">Edit Barang Masuk</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white" 
                disabled={isPending}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Gunakan action={handleSubmit} agar FormData otomatis terisi dari input 'name' */}
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input 
                  type="text" 
                  value={nama_barang} 
                  readOnly 
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">*Nama barang tidak dapat diubah (Hapus & buat baru jika salah).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Masuk</label>
                <input
                  name="jumlah_barang" // Penting: atribut name agar terbaca server action
                  type="number"
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  min={1}
                  required
                  className={`w-full p-3 rounded-lg border ${state?.error?.jumlah_barang ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
                 {/* Error Message */}
                {state?.error?.jumlah_barang && <p className="text-red-500 text-xs mt-1">{state.error.jumlah_barang}</p>}
                <p className="text-xs text-gray-500 mt-1">*Stok gudang akan otomatis disesuaikan.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Barang</label>
                <div className="relative">
                  <select 
                    name="sumber_barang" // Penting: atribut name
                    value={sumber} 
                    onChange={(e) => {
                        setSumber(e.target.value);
                        // UX improvement: reset keterangan jika user memilih Pembelian
                        if (e.target.value === "Pembelian") setKeteranganSumber("");
                    }} 
                    className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-400 appearance-none bg-white cursor-pointer"
                  >
                    <option value="Pembelian">Pembelian (Anggaran Kantor)</option>
                    <option value="Pemberian">Pemberian / Hibah</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-600">
                    <FaCaretDown />
                  </div>
                </div>
                {state?.error?.sumber_barang && <p className="text-red-500 text-xs mt-1">{state.error.sumber_barang}</p>}
              </div>

              {(sumber === "Pemberian" || sumber === "Lainnya") && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {sumber === "Pemberian" ? "Detail Pemberi" : "Keterangan Sumber Lainnya"}
                  </label>
                  <input 
                    name="keterangan_sumber" // Penting: atribut name
                    type="text" 
                    value={keteranganSumber}
                    onChange={(e) => setKeteranganSumber(e.target.value)}
                    placeholder={sumber === "Pemberian" ? "Contoh: Pemerintah Pusat..." : "Sebutkan sumber barang..."} 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" 
                    required 
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    disabled={isPending} 
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                    Batal
                </button>
                <button 
                    type="submit" 
                    disabled={isPending} 
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-md active:scale-95 transition-transform"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}