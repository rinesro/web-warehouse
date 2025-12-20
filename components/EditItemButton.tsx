"use client";

import { useState, useEffect, useActionState, useTransition, useRef} from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateItemAction, getDaftarSatuan, saveSatuanAction } from "@/lib/action";
import { FaEdit, FaTimes, FaCaretDown, FaPlus } from "react-icons/fa";
import Toast from "@/components/toast";

// Definisi tipe State agar konsisten
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditItemProps { 
  item: { 
    id_barang: number; 
    nama_barang: string; 
    stok_barang: number; 
    satuan_barang: string; 
    is_stock_bulanan: boolean; 
  }; 
}

// Inisialisasi state yang aman
const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};

export default function EditItemButton({ item }: EditItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [satuan, setSatuan] = useState(item.satuan_barang);
  const [daftarSatuan, setDaftarSatuan] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSatuanInput, setNewSatuanInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Binding ID ke action
  const updateItemWithId = updateItemAction.bind(null, item.id_barang);
  const [state, formAction] = useActionState(updateItemWithId, initialState);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSatuan = async () => {
        const data = await getDaftarSatuan();
        setDaftarSatuan(data.map((s) => s.nama));
      };
      fetchSatuan();
      // Reset satuan ke nilai item saat modal dibuka
      setSatuan(item.satuan_barang); 
    }
  }, [isOpen, item.satuan_barang]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Handle Response Server
  useEffect(() => {
    if (state?.success) {
      setToast({ message: "Data barang berhasil diperbarui!", type: "success" });
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

  const handleAddSatuan = async () => {
    if (!newSatuanInput.trim()) return;
    const formatted = newSatuanInput.charAt(0).toUpperCase() + newSatuanInput.slice(1);
    
    // Optimistic Update
    if (!daftarSatuan.includes(formatted)) {
      setDaftarSatuan([...daftarSatuan, formatted]);
    }
    setSatuan(formatted);
    setNewSatuanInput("");
    setIsDropdownOpen(false); // Tutup dropdown setelah nambah

    // Simpan ke DB background
    await saveSatuanAction(formatted);
  };
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Data Barang"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h2 className="text-lg font-bold">Edit Barang</h2>
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
                {/* Nama Barang */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                  <input 
                    type="text" 
                    name="nama_barang" 
                    defaultValue={item.nama_barang} 
                    readOnly 
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">*Nama barang tidak dapat diubah (Hapus & buat baru jika salah).</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stok */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input 
                      type="number" 
                      name="stok_barang" 
                      defaultValue={item.stok_barang} 
                      min="0" 
                      className={`w-full border ${state?.error?.stok_barang ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {state?.error?.stok_barang && <p className="text-red-500 text-xs mt-1">{state.error.stok_barang}</p>}
                  </div>
                  {/* Satuan */}
                 <div className="flex flex-col relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                    
                    {/* Hidden Input agar terkirim di FormData */}
                    <input type="hidden" name="satuan_barang" value={satuan} />

                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full border ${state?.error?.satuan_barang ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer bg-white focus:ring-2 focus:ring-blue-400`}
                    >
                      <span className="text-gray-700">{satuan}</span>
                      <FaCaretDown className="text-gray-500" />
                    </div>

                    {/* Menu Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {/* Input Tambah Satuan */}
                        <div className="p-2 border-b bg-gray-50 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Baru..."
                            value={newSatuanInput}
                            onChange={(e) => setNewSatuanInput(e.target.value)}
                            className="flex-1 p-1 px-2 text-sm border rounded outline-none focus:border-blue-500 text-black"
                            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSatuan(); }}}
                          />
                          <button 
                            type="button" 
                            onClick={handleAddSatuan}
                            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                          {daftarSatuan.map((s) => (
                            <div 
                              key={s} 
                              onClick={() => {
                                setSatuan(s);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${satuan === s ? 'bg-blue-100 font-semibold text-blue-800' : 'text-gray-700'}`}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {state?.error?.satuan_barang && <p className="text-red-500 text-xs mt-1">{state.error.satuan_barang}</p>}
                  </div>
                </div>

                {/* Checkbox Stok Bulanan */}
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_stock_bulanan" 
                    id="edit_is_stock_bulanan" 
                    defaultChecked={item.is_stock_bulanan} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                  />
                  <label htmlFor="edit_is_stock_bulanan" className="text-sm text-gray-700 cursor-pointer select-none">
                    Stok Bulanan (Barang Habis Pakai)
                  </label>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
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
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md active:scale-95 transition-transform"
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