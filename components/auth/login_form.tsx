"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { signInAction } from "@/lib/action";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-[15px] bg-[#0d47a1] text-white rounded-[5px] text-[18px] font-bold cursor-pointer hover:bg-[#002171] transition-colors shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "Loading..." : "Log in"}
    </button>
  );
};

export default function LoginForm() {
  const [state, formAction] = useActionState(signInAction, null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen w-full font-[Segoe UI,Tahoma,Geneva,Verdana,sans-serif]">
      {/* PANEL KIRI */}
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
          {/* Judul Untuk Mobile */}
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

          {/* Judul  Untuk Desktop */}
          <h2 className="hidden md:block text-center mb-10 text-[32px]">
            Log in
          </h2>

          {/* Alert Error Box */}
          {state?.message && (
            <div className="bg-[#ffebee] text-[#c62828] p-3 rounded border border-[#ef9a9a] mb-5 text-sm flex items-center gap-2 animate-pulse shadow-sm">
              <span className="font-bold text-lg">!</span> {state.message}
            </div>
          )}

          <form action={formAction}>
            {/* INPUT EMAIL */}
            <div className="relative mb-5 bg-white rounded-[5px] h-[55px] group shadow-sm">
              {/* Icon Amplop */}
              <FaEnvelope className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#888] text-[18px] z-10 pointer-events-none group-focus-within:text-[#1e88e5]" />

              {/* Input Field */}
              <input
                type="email"
                name="email"
                className="peer w-full h-full pl-[45px] pr-5 pt-5 pb-1 rounded-[5px] outline-none text-[#333] bg-transparent text-[16px] relative z-0 transition-all placeholder-transparent"
                placeholder="Email"
                required
              />

              {/* Floating Label (Efek Naik Turun) */}
              <label
                className="absolute left-[45px] top-1/2 -translate-y-1/2 text-[#888] text-[16px] transition-all duration-200 pointer-events-none z-10 
                peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-[#1e88e5] peer-focus:font-bold
                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:text-[#1e88e5] peer-not-placeholder-shown:font-bold"
              >
                Email
              </label>
            </div>
            {state?.error?.email && (
              <div className="text-red-200 text-sm mb-4 mt-[-15px]">
                {state.error.email}
              </div>
            )}

            {/* INPUT PASSWORD */}
            <div className="relative mb-5 bg-white rounded-[5px] h-[55px] group shadow-sm">
              {/* Icon Gembok */}
              <FaLock className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#888] text-[18px] z-10 pointer-events-none group-focus-within:text-[#1e88e5]" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="peer w-full h-full pl-[45px] pr-[45px] pt-5 pb-1 rounded-[5px] outline-none text-[#333] bg-transparent text-[16px] relative z-0 transition-all placeholder-transparent"
                placeholder="Password"
                required
              />

              <label
                className="absolute left-[45px] top-1/2 -translate-y-1/2 text-[#888] text-[16px] transition-all duration-200 pointer-events-none z-10
                peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-[#1e88e5] peer-focus:font-bold
                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:text-[#1e88e5] peer-not-placeholder-shown:font-bold"
              >
                Password
              </label>

              {/* Tombol Mata Toggle */}
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#333] text-[16px] outline-none cursor-pointer hover:text-[#1e88e5] transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {state?.error?.password && (
              <div className="text-red-200 text-sm mb-4 mt-[-15px]">
                {state.error.password}
              </div>
            )}

            {/* Tombol Login */}
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
