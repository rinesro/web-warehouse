"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createBarangKeluar, State } from "@/actions/barangKeluar";

interface FormBarangKeluarClientProps {
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

export default function FormBarangKeluarClient({
  items,
}: FormBarangKeluarClientProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<State, FormData>(
    createBarangKeluar,
    initialState
  );

  return (
    <div className="w-full bg-white p-6 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8">
          <Image
            src="/form_barang_keluar_con.png"
            alt="Icon Form Barang Keluar"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <h1 className="text-black text-2xl font-bold">Form Barang Keluar</h1>
      </div>

      {/* Blue Separator Line */}
      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      {/* Form Container */}
      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form action={formAction} className="flex flex-col">
          {/* Global Error Message */}
          {state.message && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6">
              <span className="block sm:inline">{state.message}</span>
            </div>
          )}

          {/* Row 1: Nama Barang & Tanggal Keluar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama barang</label>
              <div className="relative">
                <select
                  name="id_barang"
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pilih Barang ...
                  </option>
                  {items.map((item) => (
                    <option key={item.id_barang} value={item.id_barang}>
                      {item.nama_barang} (Satuan: {item.satuan_barang})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state.error?.id_barang && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.id_barang}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Tanggal Keluar</label>
              <input
                type="date"
                name="tanggal_keluar"
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              />
              {state.error?.tanggal_keluar && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.tanggal_keluar}
                </p>
              )}
            </div>
          </div>

          {/* White Separator */}
          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Keterangan & Jumlah Barang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Keterangan</label>
              <div className="relative">
                <select
                  name="keterangan"
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pilih Keterangan ...
                  </option>
                  <option value="Dipakai Habis">Dipakai Habis</option>
                  <option value="Diberikan">Diberikan</option>
                  {/* <option value="Rusak">Rusak</option>
                  <option value="Kadaluarsa">Kadaluarsa</option>
                  <option value="Lainnya">Lainnya</option> */}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state.error?.keterangan && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.keterangan}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah Barang</label>
              <input
                type="number"
                name="jumlah_keluar"
                placeholder="Masukkan Jumlah Barang ..."
                min="1"
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state.error?.jumlah_keluar && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.jumlah_keluar}
                </p>
              )}
            </div>
          </div>

          {/* White Separator */}
          <div className="h-2 w-full bg-white"></div>

          {/* Buttons */}
          <div className="p-6 flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/barang-keluar")}
              className="bg-[#616161] text-white font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
