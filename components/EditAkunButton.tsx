"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateUserAction } from "@/lib/action";
import { FaEdit, FaCaretDown, FaUserEdit, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import Toast from "@/components/toast";

// Definisi Tipe State
interface ActionState {
  message: string;
  error?:Record<string, string[]>;
  success: boolean;
}

interface User { 
  id: string; 
  name: string; 
  email: string; 
  role: string; 
}

interface EditAkunButtonProps { 
  user: User; 
}

const initialState: ActionState = { 
  message: "", 
  error: {}, 
  success: false 
};

export default function EditAkunButton({ user }: EditAkunButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password
  const [isPending, startTransition] = useTransition();
  
  const [state, formAction] = useActionState(updateUserAction, initialState);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Handle Respon Server
  useEffect(() => {
    if (state?.success) {
      setToast({ message: "Data akun berhasil diperbarui!", type: "success" });
      const timer = setTimeout(() => {
        setIsOpen(false);
        setShowPassword(false); // Reset password visibility
      }, 500);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaUserEdit />
                <h2 className="text-lg font-bold">Edit Data Staff</h2>
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
                <input type="hidden" name="id" value={user.id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="name" 
                      defaultValue={user.name} 
                      required 
                      className={`w-full border ${state?.error?.name ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {state?.error?.name && <p className="text-red-500 text-xs mt-1">{state.error.name}</p>}
                  </div>

                  {/* Email (Read Only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Kedinasan</label>
                    <input 
                      type="email" 
                      name="email" 
                      defaultValue={user.email} 
                      required
                      className={`w-full border ${state?.error?.email ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {state?.error?.email && (
                       <p className="text-red-500 text-xs mt-1">{state.error.email[0]}</p>
                    )}
                  </div>
                  {/* Jabatan / Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan / Role</label>
                    <div className="relative">
                      {/* PENTING: Value harus match dengan logika di action.ts ("Admin" atau "Staff Gudang") */}
                      <select 
                        name="role" 
                        defaultValue={user.role === "admin" ? "Admin" : "Staff Gudang"} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Staff Gudang">Staff Gudang</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>
                  
                  {/* Password Baru dengan Toggle Show/Hide */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru (Opsional)</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Kosongkan jika tetap" 
                        className={`w-full border ${state?.error?.password ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none"
                        tabIndex={-1} 
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    {/* Pesan Error */}
                    {state?.error?.password && (
                      <div className="text-red-500 text-xs mt-1 flex flex-col">
                        {state.error.password.map((err, idx) => (
                          <span key={idx}>• {err}</span>
                        ))}
                      </div>
                    )}
                    
                    {/* Helper Text Standar Keamanan */}
                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                      *Jika diubah: Min 8 kar, Huruf Besar, Kecil, Angka, & Simbol.
                    </p>
                  </div>
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