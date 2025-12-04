"use client";
import React, { useState } from "react";
import { logoutAction } from "@/lib/action";
import { FaBars } from "react-icons/fa";

interface TopbarProps {
  user?: {
    name?: string | null;
    role?: string | null;
  };
  onMenuClick?: () => void;
}

const Topbar = ({ user, onMenuClick }: TopbarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full h-20 px-6 bg-[#0152D0] shadow-2xl flex items-center justify-between relative z-20">
      {/* Hamburger Menu (Mobile Only) */}
      <button className="text-white md:hidden mr-4" onClick={onMenuClick}>
        <FaBars size={24} />
      </button>

      <div className="flex-1"></div>
      {/* Profile + Arrow */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <img
          src="/profile_icon.png"
          alt="Profile Icon"
          className="w-10 h-10 rounded-full"
        />

        <img
          src="/up_icon.png"
          alt="Dropdown Arrow"
          className={`w-5 h-5 transition-transform ${
            open ? "rotate-0" : "rotate-180"
          }`}
        />
      </div>

      {/* Popup Menu */}
      {open && (
        <div className="absolute top-20 right-6 bg-white shadow-xl rounded-lg w-64 py-2 z-30 p-2 animate-in fade-in zoom-in duration-200">
          <div className="absolute -top-2 right-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>

          {/* Profile + Name + Role */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200">
            <img
              src="/profile_icon.png"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {user?.role || "Role"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left transition-colors rounded-md mt-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3m12 0l-4-4m4 4l-4 4m10-10v12a2 2 0 01-2 2H7"
                />
              </svg>

              <span className="text-gray-700">Logout</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Topbar;
