"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createItemAction } from "@/lib/action";

interface FormState {
  error?: {
    nama_barang?: string[];
    stok_barang?: string[];
    satuan_barang?: string[];
  };
  message?: string;
  success?: boolean;
}

export default function FormTambahBarang() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createItemAction as (
      state: FormState | null,
      payload: FormData
    ) => Promise<FormState>,
    null
  );

  // Redirect on success
  React.useEffect(() => {
    if (state?.success) {
      router.push("/admin/dashboard/data-barang");
    }
  }, [state?.success, router]);

  return (
    <div className="w-full bg-white p-6 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8">
          <Image
            src="/tambahbarang_icon.png"
            alt="Icon Tambah Barang"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <h1 className="text-black text-2xl font-bold">Tambah Barang Baru</h1>
      </div>

      {/* Blue Separator Line */}
      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      {/* Form Container */}
      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form action={formAction} className="flex flex-col">
          {/* Row 1: Nama Barang & Opsi Periode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Barang</label>
              <input
                name="nama_barang"
                type="text"
                placeholder="Masukkan Nama Barang ..."
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state?.error?.nama_barang && (
                <p className="text-red-500 text-sm">
                  {state.error.nama_barang}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Opsi Periode</label>
              <div className="flex gap-8 items-center h-[48px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periode"
                    value="Reguler"
                    defaultChecked
                    className="w-5 h-5 accent-[#1E88E5] cursor-pointer"
                  />
                  <span className="text-black font-medium">Reguler</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periode"
                    value="Unreguler"
                    className="w-5 h-5 accent-[#1E88E5] cursor-pointer"
                  />
                  <span className="text-black font-medium">Unreguler</span>
                </label>
              </div>
            </div>
          </div>

          {/* White Separator */}
          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Satuan Barang & Jumlah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Satuan Barang</label>
              <div className="relative">
                <select
                  name="satuan_barang"
                  defaultValue=""
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    Masukkan Satuan Barang ...
                  </option>
                  <option value="Pcs">Pcs</option>
                  <option value="Box">Box</option>
                  <option value="Unit">Unit</option>
                  <option value="Lusin">Lusin</option>
                  <option value="Rim">Rim</option>
                  <option value="Kodi">Kodi</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state?.error?.satuan_barang && (
                <p className="text-red-500 text-sm">
                  {state.error.satuan_barang}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah Awal</label>
              <input
                name="stok_barang"
                type="number"
                min={0}
                placeholder="Masukkan Jumlah Awal ..."
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state?.error?.stok_barang && (
                <p className="text-red-500 text-sm">
                  {state.error.stok_barang}
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
              onClick={() => router.push("/admin/dashboard/data-barang")}
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
