"use client";

import React, { useActionState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaHandshake, FaCaretDown } from "react-icons/fa";
import { createPeminjamanAction } from "@/lib/action";
import { triggerToast } from "@/utils/toastEvent";

interface FormTambahPeminjamanProps {
  barangList: {
    id_barang: number;
    nama_barang: string;
    stok_barang: number;
  }[];
  initialData?: {
    id_peminjaman: number;
    nomor_ktp: string;
    nama_peminjam: string;
    kategori_peminjam: string;
    no_telepon: string;
    alamat: string;
    id_barang: number;
    jumlah_peminjaman: number;
    tanggal_peminjaman: string | Date | null;
  };
  isEdit?: boolean;
}

const initialState = {
  message: "",
  success: false,
};

export default function FormTambahPeminjaman({
  barangList,
  initialData, 
  isEdit = false, 
}: FormTambahPeminjamanProps) {
  const router = useRouter();
  const [state, formAction, isPendingAction] = useActionState(
    createPeminjamanAction, 
    initialState
  );
  const [isPendingTransition, startTransition] = useTransition();
  const isPending = isPendingAction || isPendingTransition;

  useEffect(() => {
    if (state?.success) {
      triggerToast("Peminjaman berhasil disimpan!", "success");
      router.push("/admin/dashboard/pinjam-barang");
    } else if (state?.message) {
      triggerToast(state.message, "error");
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    if (isEdit && initialData) {
        formData.append("id_peminjaman", initialData.id_peminjaman.toString());
    }
    
    startTransition(() => {
      formAction(formData);
    });
  };

  const getDefaultDate = () => {
    if (initialData?.tanggal_peminjaman) {
        return new Date(initialData.tanggal_peminjaman).toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  }

  return (
    <div className="w-full bg-white p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8 text-[#1E88E5]">
          <FaHandshake className="w-full h-full" />
        </div>
        <h1 className="text-black text-2xl font-bold">
          {isEdit ? "Edit Peminjaman Barang" : "Form Peminjaman Barang"}
        </h1>
      </div>

      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form
          action={formAction}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            handleSubmit(formData);
          }}
          className="flex flex-col"
        >
          {state.message && !state.success && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6">
              <span className="block sm:inline">{state.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nomor KTP (NIK)</label>
              <input
                type="text" 
                inputMode="numeric" 
                name="nomor_ktp"
                placeholder="16 Digit NIK"
                maxLength={16} 
                minLength={16} 
                pattern="\d*"  
                required
                defaultValue={initialData?.nomor_ktp || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
                
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, "");
                  if (target.value.length > 16) target.value = target.value.slice(0, 16);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Peminjam</label>
              <input
                type="text"
                name="nama_peminjam"
                placeholder="Contoh: Budi Santoso"
                required
                defaultValue={initialData?.nama_peminjam || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Kategori Peminjam</label>
              <div className="relative">
                <select
                  name="kategori_peminjam"
                  required
                  defaultValue={initialData?.kategori_peminjam || "Warga"}
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="Warga">Warga</option>
                  <option value="Pihak Kelurahan">Pihak Kelurahan</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nomor Telepon / WA</label>
              <input
                type="tel"
                name="no_telp"
                placeholder="0812xxxx"
                required
                defaultValue={initialData?.no_telepon || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          <div className="flex flex-col gap-2 p-6">
            <label className="text-black font-semibold">Alamat Domisili</label>
            <input
              type="text"
              name="alamat"
              placeholder="Masukkan alamat lengkap..."
              required
              defaultValue={initialData?.alamat || ""}
              className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
            />
          </div>

           <div className="h-2 w-full bg-white"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Pilih Barang</label>
              <div className="relative">
                <select
                  name="barang_id"
                  required
                  defaultValue={initialData?.id_barang || ""}
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Barang Inventaris --</option>
                  {barangList.map((item) => (
                    <option
                      key={item.id_barang}
                      value={item.id_barang}
                      disabled={item.stok_barang === 0}
                    >
                      {item.nama_barang} (Stok: {item.stok_barang})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah Pinjam</label>
              <input
                type="number"
                name="jumlah"
                placeholder="0"
                min="1"
                required
                defaultValue={initialData?.jumlah_peminjaman || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 pb-6 pt-0 items-start">
             <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Tanggal Peminjaman</label>
              <input
                type="date"
                name="tanggal_pinjam"
                required
                defaultValue={getDefaultDate()}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              />
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          <div className="p-6 flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Menyimpan..." : (isEdit ? "Update Data" : "Simpan Data")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/pinjam-barang")}
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