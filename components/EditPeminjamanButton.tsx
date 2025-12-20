"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updatePeminjamanAction } from "@/lib/action"; // Pastikan import dari lib/action
import { FaEdit, FaCaretDown, FaHandshake, FaTimes } from "react-icons/fa";
import Toast from "@/components/toast";

// Definisi Tipe State
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditPeminjamanButtonProps {
  item: {
    id_peminjaman: number;
    nomor_ktp: string;
    nama_peminjam: string;
    kategori_peminjam: string;
    no_telepon: string;
    alamat: string;
    jumlah_peminjaman: number;
    tanggal_peminjaman: string | Date;
    data_barang: {
      nama_barang: string;
      satuan_barang: string;
    };
  };
}

const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};

export default function EditPeminjamanButton({ item }: EditPeminjamanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Binding ID ke action
  const updateWithId = updatePeminjamanAction.bind(null, item.id_peminjaman);
  const [state, formAction] = useActionState(updateWithId, initialState);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper: Format Tanggal
  const formatDateForInput = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (state?.success) {
      setToast({ message: "Data peminjaman berhasil diperbarui!", type: "success" });
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
        title="Edit Peminjaman"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2 text-white">
                <FaHandshake />
                <h2 className="text-lg font-bold">Edit Peminjaman</h2>
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
                  
                  {/* Nomor KTP (Read Only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                    <input 
                      type="text" 
                      name="nomor_ktp" 
                      defaultValue={item.nomor_ktp} 
                      className={`w-full border ${state?.error?.nomor_ktp ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {/* Menampilkan pesan error jika validasi gagal */}
                    {state?.error?.nomor_ktp && <p className="text-red-500 text-xs mt-1">{state.error.nomor_ktp}</p>}
                  </div>

                  {/* Nama Peminjam */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
                    <input 
                      type="text" 
                      name="nama_peminjam" 
                      defaultValue={item.nama_peminjam} 
                      className={`w-full border ${state?.error?.nama_peminjam ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {state?.error?.nama_peminjam && <p className="text-red-500 text-xs mt-1">{state.error.nama_peminjam}</p>}
                  </div>

                  {/* Kategori Peminjam */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <div className="relative">
                      <select 
                        name="kategori_peminjam" 
                        defaultValue={item.kategori_peminjam} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Warga">Warga</option>
                        <option value="Instansi">Instansi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>

                  {/* No Telepon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WA</label>
                    <input 
                      type="text" 
                      name="no_telepon" 
                      defaultValue={item.no_telepon} 
                      className={`w-full border ${state?.error?.no_telepon ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {state?.error?.no_telepon && <p className="text-red-500 text-xs mt-1">{state.error.no_telepon}</p>}
                  </div>

                  {/* Alamat (Full Width di MD) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea 
                      name="alamat" 
                      defaultValue={item.alamat} 
                      rows={2}
                      className={`w-full border ${state?.error?.alamat ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none`} 
                    />
                    {state?.error?.alamat && <p className="text-red-500 text-xs mt-1">{state.error.alamat}</p>}
                  </div>

                  {/* Nama Barang (Read Only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barang</label>
                    <input 
                      type="text" 
                      value={`${item.data_barang.nama_barang} (${item.data_barang.satuan_barang})`} 
                      readOnly 
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">*Barang tidak dapat diubah saat edit.</p>
                  </div>

                  {/* Jumlah Peminjaman */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                    <input 
                      type="number" 
                      name="jumlah_peminjaman" 
                      defaultValue={item.jumlah_peminjaman} 
                       readOnly 
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">*Jumlah tidak dapat diubah saat edit.</p>
                  </div>

                  {/* Tanggal Peminjaman */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                    <input 
                      type="date" 
                      name="tanggal_peminjaman" 
                      defaultValue={formatDateForInput(item.tanggal_peminjaman)} 
                      className={`w-full border ${state?.error?.tanggal_peminjaman ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} 
                    />
                    {state?.error?.tanggal_peminjaman && <p className="text-red-500 text-xs mt-1">{state.error.tanggal_peminjaman}</p>}
                  </div>

                </div>

                {/* Tombol Aksi */}
                <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsOpen(false)} 
                     className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
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