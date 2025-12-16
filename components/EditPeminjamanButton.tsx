"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay"; // 1. Import Overlay
import { updatePeminjaman, State } from "@/actions/peminjaman";
import { FaEdit, FaCaretDown, FaHandshake } from "react-icons/fa";
import Toast from "@/components/toast";

interface PeminjamanData {
  id: number;
  nomor_ktp: string;
  nama_peminjam: string;
  kategori: string;
  id_barang: number;
  jumlah: number;
  tanggal_pinjam: string;
  no_telepon?: string;
  alamat?: string;
}

interface ItemBarang {
  id_barang: number;
  nama_barang: string;
  stok_barang: number;
}

interface EditPeminjamanButtonProps {
  item: PeminjamanData;
  barangList: ItemBarang[];
}

const initialState: State = {
  message: "",
  success: false,
};

export default function EditPeminjamanButton({ item, barangList }: EditPeminjamanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. Setup useTransition
  const [isPending, startTransition] = useTransition();

  const updateWithId = updatePeminjaman.bind(null, item.id);
  const [state, formAction] = useActionState(updateWithId, initialState);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        setToast({ message: "Data peminjaman berhasil diupdate!", type: "success" });
        setTimeout(() => setIsOpen(false), 100);
      } else {
        setToast({ message: state.message, type: "error" });
      }
    }
  }, [state]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === "-") return "";
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  // 3. Wrapper Handle Submit
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
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          {/* 4. Tambahkan Class 'relative' */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 relative">
            
            {/* 5. Pasang DelayedOverlay */}
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2 text-white">
                <FaHandshake />
                <h2 className="text-lg font-bold">Edit Peminjaman</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                disabled={isPending} // Disable saat loading
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* 6. Gunakan handleSubmit */}
              <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                    <input
                      type="text"
                      name="nomor_ktp"
                      defaultValue={item.nomor_ktp}
                      readOnly
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
                    <input
                      type="text"
                      name="nama_peminjam"
                      defaultValue={item.nama_peminjam}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <div className="relative">
                      <select
                        name="kategori_peminjam"
                        defaultValue={item.kategori}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="Warga">Warga</option>
                        <option value="Pihak Kelurahan">Pihak Kelurahan</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                    <input
                      type="text"
                      name="no_telp"
                      defaultValue={item.no_telepon}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <input
                      type="text"
                      name="alamat"
                      defaultValue={item.alamat}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barang</label>
                    <div className="relative">
                      <select
                        name="barang_id"
                        defaultValue={item.id_barang}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        {barangList.map((b) => (
                          <option key={b.id_barang} value={b.id_barang}>
                            {b.nama_barang} (Stok: {b.stok_barang})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                    <input
                      type="number"
                      name="jumlah"
                      defaultValue={item.jumlah}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                    <input
                      type="date"
                      name="tanggal_pinjam"
                      defaultValue={formatDate(item.tanggal_pinjam)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  {/* 7. Tombol Submit Biasa */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
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