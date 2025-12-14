"use client";

import { useState, useEffect, useActionState } from "react";
import { updateUserAction } from "@/lib/action"; // Pastikan import action ini benar
import { useFormStatus } from "react-dom";
import { FaEdit, FaCaretDown, FaUserEdit } from "react-icons/fa";
import Toast from "@/components/toast";

// Interface untuk data User
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EditAkunButtonProps {
  user: User;
}

const initialState = {
  message: "",
  success: false,
};

// Tombol Submit dengan status pending
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

export default function EditAkunButton({ user }: EditAkunButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(updateUserAction, initialState);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
         setToast({ message: "Data akun berhasil diperbarui!", type: "success" });
         setTimeout(() => setIsOpen(false), 1000);
      } else {
         setToast({ message: state.message, type: "error" });
      }
    }
  }, [state]);


  return (
    <>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Akun"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaUserEdit />
                <h2 className="text-lg font-bold">Edit Data Staff</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">

              <form action={formAction} className="space-y-4">
                <input type="hidden" name="id" value={user.id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user.name}
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Kedinasan
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      readOnly
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed"
                      title="Email tidak dapat diubah"
                    />
                    <p className="text-xs text-gray-400 mt-1">*Email tidak dapat diubah</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jabatan / Role
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        defaultValue={user.role === "admin" ? "Admin" : "Staff Gudang"} // Sesuaikan value dengan backend
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                      >
                        <option value="Staff Gudang">Staff Gudang</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru (Opsional)
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Kosongkan jika tetap"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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