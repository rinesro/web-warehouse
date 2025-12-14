"use client";

import React, { useState, useActionState } from "react";
import Image from "next/image";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { addStockAction } from "@/lib/action";
import Toast from "@/components/toast";

interface Item {
  id_barang: number;
  nama_barang: string;
  satuan_barang: string;
}

interface FormState {
  error?: {
    id_barang?: string[];
    jumlah_barang?: string[];
    sumber_barang?: string[];
  };
  message?: string;
  success?: boolean;
}

export default function FormTambahStok({ items }: { items: Item[] }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [state, formAction] = useActionState(
    addStockAction as (
      state: FormState | null,
      payload: FormData
    ) => Promise<FormState>,
    null
  );
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const item = items.find((i) => i.id_barang === id);
    setSelectedItem(item || null);
  };

  // Redirect on success
  React.useEffect(() => {
    if (state?.success) {
      setToast({ message: state.message || "Stok berhasil ditambahkan!", type: "success" });
      setTimeout(() => router.push("/admin/dashboard/barang-masuk"), 1000);
    } else if (state?.message) {
      setToast({ message: state.message, type: "error" });
    }
  }, [state?.success, state?.message, router]);
  
  return (
    <div className="w-full bg-white p-6 rounded-xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8">
          <Image
            src="/barang_masuk_blue_icon.png"
            alt="Icon Tambah Barang"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <h1 className="text-black text-2xl font-bold">Tambah Stok Barang</h1>
      </div>

      {/* Blue Separator Line */}
      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      {/* Form Container */}
      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form action={formAction} className="flex flex-col">
          {/* Row 1: Nama Barang */}
          <div className="p-6">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Barang</label>
              <div className="relative">
                <select
                  name="id_barang"
                  onChange={handleItemChange}
                  defaultValue=""
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Barang ...
                  </option>
                  {items.map((item) => (
                    <option key={item.id_barang} value={item.id_barang}>
                      {item.nama_barang}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state?.error?.id_barang && (
                <p className="text-red-500 text-sm">{state.error.id_barang}</p>
              )}
            </div>
          </div>

          {/* White Separator */}
          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Satuan Barang & Jumlah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Satuan Barang</label>
              <input
                type="text"
                value={selectedItem?.satuan_barang || ""}
                readOnly
                placeholder="Otomatis terisi ..."
                className="w-full p-3 rounded-lg border-none bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah</label>
              <input
                name="jumlah_barang"
                type="number"
                min={1}
                placeholder="Masukkan Jumlah yang Masuk ..."
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state?.error?.jumlah_barang && (
                <p className="text-red-500 text-sm">
                  {state.error.jumlah_barang}
                </p>
              )}
            </div>
          </div>

          {/* White Separator */}
          <div className="h-2 w-full bg-white"></div>

          {/* Error Message General */}
          {state?.message && !state.success && (
            <div className="px-6 pt-4">
              <p className="text-red-500 text-center font-medium">
                {state.message}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="p-6 flex gap-4">
            <button
              type="submit"
              className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 transition-colors"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/barang-masuk")}
              className="bg-[#616161] text-white font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
