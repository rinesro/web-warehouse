"use client";

import React, {
  useEffect,
  useActionState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaCaretDown } from "react-icons/fa";
import { createUserAction } from "@/lib/action";
import { triggerToast } from "@/utils/toastEvent";

interface FormState {
  error?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
  message?: string;
  success?: boolean;
}

const initialState: FormState = {
  message: "",
  success: false,
};

export default function FormTambahAkun() {
  const router = useRouter();
  
  const [state, formAction, isPendingAction] = useActionState(
    createUserAction as (state: FormState | null, payload: FormData) => Promise<FormState>,
    initialState
  );

  const [isPendingTransition, startTransition] = useTransition();
  const isPending = isPendingAction || isPendingTransition;

  // Cek apakah ada error validasi field
  const hasValidationErrors = state?.error && Object.keys(state.error).length > 0;

  useEffect(() => {
    if (state.success) {
      triggerToast(state.message || "Berhasil disimpan!", "success");
      router.push("/admin/dashboard/manajemen-akun");
    } else if (state.message && !hasValidationErrors) {
      triggerToast(state.message, "error");
    }
  }, [state, router, hasValidationErrors]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8 text-[#1E88E5]">
          <FaUserPlus className="w-full h-full" />
        </div>
        <h1 className="text-black text-2xl font-bold">Tambah Staff Baru</h1>
      </div>

      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            handleSubmit(formData);
          }}
          className="flex flex-col"
        >
          {/* Row 1: Nama & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                placeholder="Contoh: Budi Santoso"
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white placeholder-gray-400"
              />
              {/* Error Merah di Bawah Input */}
              {state?.error?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.name[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Email Kedinasan</label>
              <input
                type="email"
                name="email"
                placeholder="email@kelurahan.go.id"
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white placeholder-gray-400"
              />
              {state?.error?.email && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.email[0]}
                </p>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Role & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jabatan / Role</label>
              <div className="relative">
                <select
                  name="role"
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                  defaultValue="Staff Gudang"
                >
                  <option value="Staff Gudang">Staff Gudang</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
               {state?.error?.role && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.role[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Password Awal</label>
              <input
                type="password"
                name="password"
                // Ganti placeholder agar user tahu syaratnya
                placeholder="Min. 8 karakter, Huruf Besar, Angka, Simbol"
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white placeholder-gray-400"
              />
              <p className="text-[10px] text-gray-500">
                *Wajib: Huruf Besar, Huruf Kecil, Angka, & Simbol.
              </p>
               {state?.error?.password && (
                <div className="text-red-500 text-sm mt-1 flex flex-col">
                  {/* Tampilkan semua error validasi password baris per baris */}
                  {state.error.password.map((err, idx) => (
                    <span key={idx}>• {err}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

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
              onClick={() => router.push("/admin/dashboard/manajemen-akun")}
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