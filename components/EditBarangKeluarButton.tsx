"use client";

import { useState, useEffect, useActionState } from "react";
import { updateBarangKeluar, State } from "@/actions/barangKeluar";
import { useFormStatus } from "react-dom";
import { FaEdit, FaCaretDown } from "react-icons/fa";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
    >
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  );
};

interface EditBarangKeluarProps {
  item: {
    id_barang_keluar: number;
    id_barang: number;
    tanggal_keluar: string;
    jumlah_keluar: number;
    keterangan: string;
  };
  items: {
    id_barang: number;
    nama_barang: string;
    satuan_barang: string;
  }[];
}

const initialState: State = {
  message: "",
  error: {},
};

export default function EditBarangKeluarButton({
  item,
  items,
}: EditBarangKeluarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateWithId = updateBarangKeluar.bind(null, item.id_barang_keluar);
  const [state, formAction] = useActionState(updateWithId, initialState);

  useEffect(() => {
    if (state?.message === "Berhasil update") {
      setIsOpen(false);
    }
  }, [state?.message]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Data"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h2 className="text-lg font-bold">Edit Barang Keluar</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {state?.message && state.message !== "Berhasil update" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                  {state.message}
                </div>
              )}

              <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Barang
                    </label>
                    <div className="relative">
                      <select
                        name="id_barang"
                        defaultValue={item.id_barang}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          Pilih Barang ...
                        </option>
                        {items.map((opt) => (
                          <option key={opt.id_barang} value={opt.id_barang}>
                            {opt.nama_barang} (Satuan: {opt.satuan_barang})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                    {state?.error?.id_barang && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.id_barang}
                      </p>
                    )}
                  </div>

                  {/* Tanggal Keluar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Keluar
                    </label>
                    <input
                      type="date"
                      name="tanggal_keluar"
                      defaultValue={
                        item.tanggal_keluar
                          ? new Date(item.tanggal_keluar)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      onClick={(e) =>
                        (e.target as HTMLInputElement).showPicker()
                      }
                    />
                    {state?.error?.tanggal_keluar && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.tanggal_keluar}
                      </p>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan
                    </label>
                    <div className="relative">
                      <select
                        name="keterangan"
                        defaultValue={item.keterangan}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          Pilih Keterangan ...
                        </option>
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
                    {state?.error?.keterangan && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.keterangan}
                      </p>
                    )}
                  </div>

                  {/* Jumlah */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Barang
                    </label>
                    <input
                      type="number"
                      name="jumlah_keluar"
                      defaultValue={item.jumlah_keluar}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state?.error?.jumlah_keluar && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.jumlah_keluar}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
