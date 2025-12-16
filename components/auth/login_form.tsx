"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationCircle 
} from "react-icons/fa"; // Tambahkan icon Exclamation
import { signInAction } from "@/lib/action";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-[15px] bg-[#0d47a1] text-white rounded-[5px] text-[18px] font-bold cursor-pointer hover:bg-[#002171] transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        "Log in"
      )}
    </button>
  );
};

export default function LoginForm() {
  // Menggunakan state dari server action
  const [state, formAction] = useActionState(signInAction, null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen w-full font-[Segoe UI,Tahoma,Geneva,Verdana,sans-serif]">
      {/* PANEL KIRI - Tetap Sama */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-[#fffdfd] p-5 text-center relative z-10">
        <div className="mb-5 w-[150px]">
          <Image
            src="/logo_kelurahan_icon.png"
            alt="Logo"
            width={150}
            height={150}
            priority
            className="max-w-full h-auto"
          />
        </div>
        <div className="text-[#333]">
          <h2 className="text-2xl font-semibold tracking-wider mb-1">GUDANG</h2>
          <h2 className="text-2xl font-semibold tracking-wider">
            KELURAHAN GEDONG
          </h2>
        </div>
      </div>

      {/* PANEL KANAN */}
      <div className="flex flex-1 justify-center items-center bg-[#1e88e5] p-5 min-h-screen w-full relative z-10">
        <div className="w-[80%] max-w-[400px] text-white">
          
          {/* Judul Mobile & Desktop - Tetap Sama */}
          <div className="block md:hidden text-center mb-10 font-semibold">
            <Image
              src="/logo_kelurahan_icon.png"
              alt="Logo Mobile"
              width={60}
              height={60}
              className="mx-auto mb-2 h-[60px] w-auto"
            />
            GUDANG
            <br />
            KELURAHAN GEDONG
          </div>
          <h2 className="hidden md:block text-center mb-10 text-[32px]">
            Log in
          </h2>

          {/* Alert Error Box (Global Message) - Diperbagus */}
          {state?.message && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-200/50 rounded-lg flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
               <FaExclamationCircle className="text-red-200 text-xl min-w-[20px]" />
               <p className="text-white font-medium text-sm text-left leading-tight">
                 {state.message}
               </p>
            </div>
          )}

          <form action={formAction} noValidate> 
            {/* noValidate ditambahkan agar browser tidak override validasi kita */}

            {/* --- INPUT EMAIL --- */}
            <div 
              className={`relative mb-1 bg-white rounded-[5px] h-[55px] group shadow-sm transition-all duration-300
              ${state?.error?.email ? "ring-2 ring-red-400 bg-red-50" : "focus-within:ring-2 focus-within:ring-[#64b5f6]"}`}
            >
              <FaEnvelope 
                className={`absolute left-[15px] top-1/2 -translate-y-1/2 text-[18px] z-10 pointer-events-none transition-colors
                ${state?.error?.email ? "text-red-400" : "text-[#888] group-focus-within:text-[#1e88e5]"}`} 
              />

              <input
                type="email"
                name="email"
                className="peer w-full h-full pl-[45px] pr-5 pt-5 pb-1 rounded-[5px] outline-none text-[#333] bg-transparent text-[16px] relative z-0 transition-all placeholder-transparent"
                placeholder="Email"
                // required dihapus
              />

              <label
                className={`absolute left-[45px] top-1/2 -translate-y-1/2 text-[16px] transition-all duration-200 pointer-events-none z-10 
                peer-focus:top-3 peer-focus:text-[11px] peer-focus:font-bold
                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:font-bold
                ${state?.error?.email ? "text-red-400 peer-focus:text-red-500 peer-not-placeholder-shown:text-red-500" : "text-[#888] peer-focus:text-[#1e88e5] peer-not-placeholder-shown:text-[#1e88e5]"}`}
              >
                Email
              </label>
            </div>
            
            {/* Error Message Email */}
            <div className="min-h-[24px] mb-4">
              {state?.error?.email && (
                <div className="flex items-center gap-1.5 text-red-100 text-sm animate-[slideDown_0.2s_ease-out] ml-1">
                  <FaExclamationCircle className="text-xs" />
                  <span>{state.error.email}</span>
                </div>
              )}
            </div>

            {/* --- INPUT PASSWORD --- */}
            <div 
              className={`relative mb-1 bg-white rounded-[5px] h-[55px] group shadow-sm transition-all duration-300
              ${state?.error?.password ? "ring-2 ring-red-400 bg-red-50" : "focus-within:ring-2 focus-within:ring-[#64b5f6]"}`}
            >
              <FaLock 
                className={`absolute left-[15px] top-1/2 -translate-y-1/2 text-[18px] z-10 pointer-events-none transition-colors
                ${state?.error?.password ? "text-red-400" : "text-[#888] group-focus-within:text-[#1e88e5]"}`} 
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="peer w-full h-full pl-[45px] pr-[45px] pt-5 pb-1 rounded-[5px] outline-none text-[#333] bg-transparent text-[16px] relative z-0 transition-all placeholder-transparent"
                placeholder="Password"
                // required dihapus
              />

              <label
                className={`absolute left-[45px] top-1/2 -translate-y-1/2 text-[16px] transition-all duration-200 pointer-events-none z-10
                peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-[#1e88e5] peer-focus:font-bold
                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:text-[#1e88e5] peer-not-placeholder-shown:font-bold
                ${state?.error?.password ? "text-red-400 peer-focus:text-red-500 peer-not-placeholder-shown:text-red-500" : "text-[#888] peer-focus:text-[#1e88e5] peer-not-placeholder-shown:text-[#1e88e5]"}`}
              >
                Password
              </label>

              <button
                type="button"
                onClick={togglePassword}
                className={`absolute right-[15px] top-1/2 -translate-y-1/2 text-[16px] outline-none cursor-pointer transition-colors
                ${state?.error?.password ? "text-red-400 hover:text-red-600" : "text-[#333] hover:text-[#1e88e5]"}`}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Error Message Password */}
            <div className="min-h-[24px] mb-4">
              {state?.error?.password && (
                <div className="flex items-center gap-1.5 text-red-100 text-sm animate-[slideDown_0.2s_ease-out] ml-1">
                  <FaExclamationCircle className="text-xs" />
                  <span>{state.error.password}</span>
                </div>
              )}
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}