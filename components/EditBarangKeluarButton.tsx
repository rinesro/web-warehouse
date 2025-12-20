"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateBarangKeluarAction } from "@/lib/action";
import { FaEdit, FaCaretDown, FaTimes } from "react-icons/fa";
import Toast from "@/components/toast";

// Definisi tipe State
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditBarangKeluarProps {
  item: {
    id_barang_keluar: number;
    id_barang: number;
    tanggal_keluar: string | Date; // Bisa string atau Date tergantung Prisma return
    jumlah_keluar: number;
    keterangan: string;
  };
  items: {
    id_barang: number;
    nama_barang: string;
    satuan_barang: string;
  }[];
}

const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};

export default function EditBarangKeluarButton({
  item,
  items,
}: EditBarangKeluarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // --- HELPER: Parsing Data Awal ---
  const getInitialKeterangan = (fullString: string) => {
    if (!fullString) return { option: "", detail: "" };
    
    if (fullString.startsWith("Diberikan")) {
      const match = fullString.match(/\((.*)\)/); 
      return { option: "Diberikan", detail: match ? match[1] : "" };
    } 
    else if (fullString.startsWith("Lainnya")) {
      const match = fullString.match(/\((.*)\)/);
      return { option: "Lainnya", detail: match ? match[1] : "" };
    } 
    return { option: fullString, detail: "" };
  };

  const initialData = getInitialKeterangan(item.keterangan || "");

  // State Form
  const [selectedKeterangan, setSelectedKeterangan] = useState(initialData.option);
  const [detailKeterangan, setDetailKeterangan] = useState(initialData.detail);

  const [isPending, startTransition] = useTransition();

  const updateWithId = updateBarangKeluarAction.bind(null, item.id_barang_keluar);
  const [state, formAction] = useActionState(updateWithId, initialState);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper: Format Tanggal ke YYYY-MM-DD untuk input date
  const formatDateForInput = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Effect: Reset form saat modal dibuka kembali (jika props berubah)
  useEffect(() => {
    if (isOpen) {
      const data = getInitialKeterangan(item.keterangan || "");
      setSelectedKeterangan(data.option);
      setDetailKeterangan(data.detail);
    }
  }, [isOpen, item.keterangan]);

  // Effect: Handle respon server
  useEffect(() => {
    if (state?.success) {
      setToast({ message: "Data berhasil diperbarui!", type: "success" });
      const timer = setTimeout(() => setIsOpen(false), 500);
      return () => clearTimeout(timer);
    } else if (state?.message && !state.success) {
      setToast({ message: state.message, type: "error" });
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Barang Keluar"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h2 className="text-lg font-bold">Edit Barang Keluar</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white" 
                disabled={isPending}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Select Nama Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                    <div className="relative">
                      <select 
                        name="id_barang" 
                        defaultValue={item.id_barang} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="" disabled>Pilih Barang ...</option>
                        {items.map((opt) => (
                          <option key={opt.id_barang} value={opt.id_barang}>
                            {opt.nama_barang} ({opt.satuan_barang})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                    {state?.error?.id_barang && <p className="text-red-500 text-xs mt-1">{state.error.id_barang}</p>}
                  </div>

                  {/* Input Tanggal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Keluar</label>
                    <input 
                      type="date" 
                      name="tanggal_keluar" 
                      defaultValue={formatDateForInput(item.tanggal_keluar)} 
                      className={`w-full border ${state?.error?.tanggal_keluar ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                      // Opsional: onClick agar picker langsung muncul di beberapa browser
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} 
                    />
                    {state?.error?.tanggal_keluar && <p className="text-red-500 text-xs mt-1">{state.error.tanggal_keluar}</p>}
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                    <div className="relative">
                      <select 
                        name="keterangan" 
                        value={selectedKeterangan} 
                        onChange={(e) => { 
                          setSelectedKeterangan(e.target.value); 
                          // Reset detail jika user pindah ke opsi yang tidak butuh detail
                          if (e.target.value !== "Diberikan" && e.target.value !== "Lainnya") {
                            setDetailKeterangan(""); 
                          }
                        }} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="" disabled>Pilih Keterangan ...</option>
                        <option value="Dipakai Habis">Dipakai Habis</option>
                        <option value="Diberikan">Diberikan</option>
                        <option value="Rusak">Rusak</option>
                        <option value="Kadaluarsa">Kadaluarsa</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                    
                    {(selectedKeterangan === "Diberikan" || selectedKeterangan === "Lainnya") && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs text-gray-600 mb-1 block">
                              {selectedKeterangan === "Diberikan" ? "Diberikan Kepada:" : "Detail Keterangan:"}
                            </label>
                            <input 
                              type="text" 
                              name="detail_keterangan" 
                              value={detailKeterangan} 
                              onChange={(e) => setDetailKeterangan(e.target.value)} 
                              placeholder="Jelaskan..." 
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                              required 
                            />
                        </div>
                    )}
                    {state?.error?.keterangan && <p className="text-red-500 text-xs mt-1">{state.error.keterangan}</p>}
                  </div>

                  {/* Jumlah Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Barang</label>
                    <input 
                      type="number" 
                      name="jumlah_keluar" 
                      defaultValue={item.jumlah_keluar} 
                      min="1" 
                      className={`w-full border ${state?.error?.jumlah_keluar ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {state?.error?.jumlah_keluar && <p className="text-red-500 text-xs mt-1">{state.error.jumlah_keluar}</p>}
                  </div>
                </div>

                <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsOpen(false)} 
                     className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100" 
                     disabled={isPending}
                   >
                     Batal
                   </button>
                  <button 
                    type="submit" 
                    disabled={isPending} 
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md active:scale-95 transition-transform"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}