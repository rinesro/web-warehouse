"use client";

import React, { useActionState, useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { FaCaretDown, FaTimes } from "react-icons/fa"; // Tambah FaTimes
import { useRouter } from "next/navigation";
import { createItemAction } from "@/lib/action"; // Pastikan path ini benar sesuai file action Anda
import { triggerToast } from "@/utils/toastEvent";

interface FormState {
  error?: {
    nama_barang?: string[];
    stok_barang?: string[];
    satuan_barang?: string[];
  };
  message?: string;
  success?: boolean;
}

// Daftar Satuan Standar (Untuk pengecekan)
const STANDARD_UNITS = ["Pcs", "Box", "Unit", "Lusin", "Rim", "Kodi", "Kg", "Liter"];

export default function FormTambahBarang() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createItemAction as (state: FormState | null, payload: FormData) => Promise<FormState>,
    null
  );

  const [sumber, setSumber] = useState("");
  const [satuan, setSatuan] = useState("");
  
  // State untuk Modal & Custom Input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSatuan, setTempSatuan] = useState(""); // Untuk menampung ketikan di dalam modal

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      triggerToast(state.message || "Barang berhasil ditambahkan!", "success");
      router.push("/admin/dashboard/data-barang");
    } else if (state?.message) {
      triggerToast(state.message, "error");
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    // Pastikan nilai satuan yang dikirim adalah nilai dari state, bukan "Lainnya"
    // Kita set manual agar backend menerima string satuan yang benar (misal: "Galon")
    formData.set("satuan_barang", satuan);

    startTransition(() => {
      formAction(formData);
    });
  };

  // Handler saat dropdown berubah
  const handleSatuanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Lainnya") {
      setTempSatuan(""); // Reset input modal
      setIsModalOpen(true); // Buka Modal
    } else {
      setSatuan(value);
    }
  };

  // Handler Simpan di Modal
  const handleSaveCustomSatuan = () => {
    if (!tempSatuan.trim()) return; // Validasi kosong
    setSatuan(tempSatuan); // Set satuan terpilih jadi yang baru diketik
    setIsModalOpen(false); // Tutup modal
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl relative">
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

      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form action={handleSubmit} className="flex flex-col">
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
              {state?.error?.nama_barang && <p className="text-red-500 text-sm">{state.error.nama_barang}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Opsi Periode</label>
              <div className="flex gap-8 items-center h-12">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="periode" value="Reguler" defaultChecked className="w-5 h-5 accent-[#1E88E5]" />
                  <span className="text-black font-medium">Reguler</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="periode" value="Unreguler" className="w-5 h-5 accent-[#1E88E5]" />
                  <span className="text-black font-medium">Unreguler</span>
                </label>
              </div>
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Satuan Barang (MODIFIED) & Jumlah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Satuan Barang</label>
              <div className="relative">
                <select
                  name="satuan_display_only" // Name dummy, karena nilai asli kita inject via handleSubmit
                  value={satuan}
                  onChange={handleSatuanChange}
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>Pilih Satuan ...</option>
                  
                  {/* Render Satuan Standar */}
                  {STANDARD_UNITS.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}

                  {/* Render Satuan Custom (Jika user sudah mengetik di modal) */}
                  {satuan && !STANDARD_UNITS.includes(satuan) && (
                    <option value={satuan}>{satuan}</option>
                  )}

                  <option value="Lainnya" className="font-bold text-blue-600">+ Input Manual (Lainnya)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state?.error?.satuan_barang && <p className="text-red-500 text-sm">{state.error.satuan_barang}</p>}
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
              {state?.error?.stok_barang && <p className="text-red-500 text-sm">{state.error.stok_barang}</p>}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 3: Sumber Barang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Sumber Barang</label>
              <div className="relative">
                <select
                  name="sumber_barang"
                  value={sumber}
                  onChange={(e) => setSumber(e.target.value)}
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>Pilih Sumber ...</option>
                  <option value="Pembelian">Pembelian (Anggaran Kantor)</option>
                  <option value="Pemberian">Pemberian / Hibah</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
            </div>

            {sumber === "Pemberian" && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-black font-semibold">Detail Pemberi</label>
                <input
                  name="keterangan_sumber"
                  type="text"
                  placeholder="Contoh: Pemerintah Pusat, Warga RT 01..."
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
                />
              </div>
            )}
          </div>

          <div className="h-2 w-full bg-white"></div>

          <div className="p-6 flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => router.push("/admin/dashboard/data-barang")}
              className="bg-[#616161] text-white font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      {/* --- MODAL POPUP SATUAN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Tambah Satuan Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Masukkan nama satuan baru yang ingin Anda gunakan.
            </p>

            <input
              type="text"
              autoFocus
              placeholder="Contoh: Galon, Lembar, Botol..."
              value={tempSatuan}
              onChange={(e) => setTempSatuan(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-gray-800"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Cegah submit form utama
                  handleSaveCustomSatuan();
                }
              }}
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCustomSatuan}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-md"
              >
                Gunakan Satuan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}