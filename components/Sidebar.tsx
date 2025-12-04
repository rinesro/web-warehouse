"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTimes } from "react-icons/fa";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  user?: {
    name?: string | null;
    role?: string | null;
  };
}

const Sidebar = ({
  isMobileOpen = false,
  onMobileClose,
  user,
}: SidebarProps) => {
  const pathname = usePathname();
  const [openManajemen, setOpenManajemen] = useState(false);
  const [openLaporan, setOpenLaporan] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState("");

  useEffect(() => {
    if (pathname === "/admin/dashboard") {
      setActiveMenu("dashboard");
      setActiveSubMenu("");
    } else if (pathname.includes("/data-barang")) {
      setActiveMenu("manajemen");
      setActiveSubMenu("data_barang");
      setOpenManajemen(true);
    } else if (pathname.includes("/barang-masuk")) {
      setActiveMenu("manajemen");
      setActiveSubMenu("barang_masuk");
      setOpenManajemen(true);
    } else if (pathname.includes("/barang-keluar")) {
      setActiveMenu("manajemen");
      setActiveSubMenu("barang_keluar");
      setOpenManajemen(true);
    } else if (pathname.includes("/pinjam-barang")) {
      setActiveMenu("pinjam");
      setActiveSubMenu("");
    } else if (pathname.includes("/manajemen-akun")) {
      setActiveMenu("manajemenAkun");
      setActiveSubMenu("");
    } else if (pathname.includes("/laporan-stok")) {
      setActiveMenu("laporan");
      setActiveSubMenu("laporan_stok");
      setOpenLaporan(true);
    } else if (pathname.includes("/laporan-barang-masuk")) {
      setActiveMenu("laporan");
      setActiveSubMenu("Laporan_barang_masuk");
      setOpenLaporan(true);
    } else if (pathname.includes("/laporan-barang-keluar")) {
      setActiveMenu("laporan");
      setActiveSubMenu("laporan_barang_keluar");
      setOpenLaporan(true);
    }
  }, [pathname]);

  const isManajemenActive = activeSubMenu !== "" && activeMenu === "manajemen";
  const isLaporanActive = activeSubMenu !== "" && activeMenu === "laporan";

  const isManajemenParentActive =
    activeMenu === "manajemen" && activeSubMenu === "";
  const isLaporanParentActive =
    activeMenu === "laporan" && activeSubMenu === "";

  type MenuType =
    | "dashboard"
    | "manajemen"
    | "pinjam"
    | "manajemenAkun"
    | "laporan";

  const baseClass =
    "py-4 px-4 cursor-pointer flex items-center gap-3 rounded-lg transition-all duration-300";
  const inactiveClass = "text-gray-700 hover:bg-gray-100";
  const activeClass = "bg-[#1E88E5] text-white shadow-lg";

  // Fungsi menu
  const handleMenuClick = (menuName: MenuType) => {
    setActiveMenu(menuName);

    if (collapsed) setCollapsed(false);

    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      <div
        className={`
            fixed inset-y-0 left-0 z-50 h-full bg-white shadow-2xl transition-transform duration-300
            md:static md:translate-x-0
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            ${collapsed ? "md:w-20" : "md:w-72"}
            w-64
        `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-5 w-full bg-[#1E88E5] shadow-lg">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-white">
              Gudang Kelurahan
            </h2>
          )}

          <button
            className="text-sm px-4 py-1 rounded text-white hidden md:block"
            onClick={() => {
              setCollapsed(!collapsed);
              setOpenManajemen(false);
              setOpenLaporan(false);
            }}
          >
            <img
              src={collapsed ? "/three_dot_icon.png" : "/hamburger_icon.png"}
              alt="menu"
              className="w-6 h-6"
            />
          </button>

          {/* Tombol untuk tampilan mobile */}
          <button className="text-white md:hidden" onClick={onMobileClose}>
            <FaTimes size={24} />
          </button>
        </div>

        <div
          className={`mt-4 mx-3 flex items-center gap-3 p-2 rounded transition-all duration-300 border-b-2 border-gray-300
                ${collapsed ? "justify-center h-28" : "h-30"}`}
        >
          <img
            src={
              collapsed
                ? "/logo_kelurahan_icon.png"
                : "/logo_kelurahan_expand.png"
            }
            alt="logo kelurahan"
            className={` object-cover transition-all duration-300
                ${collapsed ? "w-13 h-16" : ""}`}
          />
        </div>

        <div className="flex-1 mt-4 space-y-0 overflow-auto m-3">
          <Link href="/admin/dashboard">
            <div
              onClick={() => handleMenuClick("dashboard")}
              className={`${baseClass} ${
                activeMenu === "dashboard" ? activeClass : inactiveClass
              } 
                        ${collapsed ? "justify-center" : ""} mb-3 `}
            >
              <img
                src={
                  activeMenu === "dashboard"
                    ? "/dashboard_white_icon.png"
                    : "/dashboard_icon.png"
                }
                alt="dashboard"
                className="w-5 h-5"
              />

              {!collapsed && "Dashboard"}
            </div>
          </Link>

          <div
            onClick={() => {
              handleMenuClick("manajemen");
              setActiveSubMenu("");
              setOpenManajemen(!openManajemen);
            }}
            className={`${baseClass} 
                                ${
                                  isManajemenActive
                                    ? activeClass // biru ketika submenu dipilih
                                    : isManajemenParentActive
                                    ? "bg-gray-200 text-gray-700" // abu-abu ketika induk diklik saja
                                    : inactiveClass
                                } 
                                ${collapsed ? "justify-center" : ""} mb-3 `}
          >
            <img
              src={
                isManajemenActive
                  ? "/barang_white_icon.png"
                  : "/barang_icon.png"
              }
              alt="manajemen barang"
              className="w-5 h-5"
            />

            {!collapsed && "Manajemen Barang"}

            {!collapsed && (
              <img
                src={
                  isManajemenActive
                    ? "/up_icon.png" // putih saat submenu dipilih
                    : "/up_default_icon.png" // abu-abu default
                }
                className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                  openManajemen ? "rotate-0" : "rotate-180"
                }`}
                alt="dropdown"
              />
            )}
          </div>

          {!collapsed && openManajemen && (
            <div className="ml-7 space-y-2">
              <Link href="/admin/dashboard/data-barang">
                <div
                  onClick={() => {
                    setActiveMenu("manajemen");
                    setActiveSubMenu("data_barang");
                    if (onMobileClose) onMobileClose();
                  }}
                  className={`p-2 flex rounded cursor-pointer 
                            ${
                              activeSubMenu === "data_barang"
                                ? "bg-gray-200 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                >
                  <img src="/dot_default.png" className="my-auto mr-3" />
                  Data Barang
                </div>
              </Link>

              <Link href="/admin/dashboard/barang-masuk">
                <div
                  onClick={() => {
                    setActiveMenu("manajemen");
                    setActiveSubMenu("barang_masuk");
                    if (onMobileClose) onMobileClose();
                  }}
                  className={`p-2 flex rounded cursor-pointer 
                            ${
                              activeSubMenu === "barang_masuk"
                                ? "bg-gray-200 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                >
                  <img src="/dot_default.png" className="my-auto mr-3" />
                  Barang Masuk
                </div>
              </Link>

              <Link href="/admin/dashboard/barang-keluar">
                <div
                  onClick={() => {
                    setActiveMenu("manajemen");
                    setActiveSubMenu("barang_keluar");
                    if (onMobileClose) onMobileClose();
                  }}
                  className={`p-2 flex rounded cursor-pointer 
                            ${
                              activeSubMenu === "barang_keluar"
                                ? "bg-gray-200 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                >
                  <img src="/dot_default.png" className="my-auto mr-3" />
                  Barang Keluar
                </div>
              </Link>
            </div>
          )}

          <Link href="/admin/dashboard/pinjam-barang">
            <div
              onClick={() => handleMenuClick("pinjam")}
              className={`${baseClass} ${
                activeMenu === "pinjam" ? activeClass : inactiveClass
              }
                        ${collapsed ? "justify-center" : ""} mb-3 `}
            >
              <img
                src={
                  activeMenu === "pinjam"
                    ? "/pinjam_white_icon.png"
                    : "/pinjam_icon.png"
                }
                alt="pinjam barang"
                className="w-5 h-5"
              />

              {!collapsed && "Pinjam Barang"}
            </div>
          </Link>

          {/* MENAJEMEN AKUN */}
          {/* MENAJEMEN AKUN - Hanya untuk ADMIN */}
          {user?.role === "admin" && (
            <Link href="/admin/dashboard/manajemen-akun">
              <div
                onClick={() => handleMenuClick("manajemenAkun")}
                className={`${baseClass} ${
                  activeMenu === "manajemenAkun" ? activeClass : inactiveClass
                }
                        ${collapsed ? "justify-center" : ""} mb-3 `}
              >
                <img
                  src={
                    activeMenu === "manajemenAkun"
                      ? "/m_akun_white_icon.png"
                      : "/m_akun_icon.png"
                  }
                  alt="manajemen akun"
                  className="w-5 h-5"
                />

                {!collapsed && "Manajemen Akun"}
              </div>
            </Link>
          )}

          {/* LAPORAN */}
          <div
            onClick={() => {
              handleMenuClick("laporan");
              setActiveSubMenu("");
              setOpenLaporan(!openLaporan);
            }}
            className={`${baseClass}
                                ${
                                  isLaporanActive
                                    ? activeClass
                                    : isLaporanParentActive
                                    ? "bg-gray-200 text-gray-700"
                                    : inactiveClass
                                }
                                ${collapsed ? "justify-center" : ""} mb-3 `}
          >
            <img
              src={
                isLaporanActive
                  ? "/laporan_white_icon.png"
                  : "/laporan_icon.png"
              }
              alt="laporan"
              className="w-5 h-5"
            />

            {!collapsed && "Laporan"}

            {!collapsed && (
              <img
                src={isLaporanActive ? "/up_icon.png" : "/up_default_icon.png"}
                className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                  openLaporan ? "rotate-0" : "rotate-180"
                }`}
                alt="dropdown"
              />
            )}
          </div>

          {/* SUBMENU LAPORAN */}
          {!collapsed && openLaporan && (
            <div className="ml-7 space-y-2">
              <Link href="/admin/dashboard/laporan/laporan-stok">
                <div
                  onClick={() => {
                    setActiveMenu("laporan");
                    setActiveSubMenu("laporan_stok");
                    if (onMobileClose) onMobileClose();
                  }}
                  className={`p-2 flex rounded cursor-pointer 
                            ${
                              activeSubMenu === "laporan_stok"
                                ? "bg-gray-200 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                >
                  <img src="/dot_default.png" className="my-auto mr-3" />
                  Laporan Stok
                </div>
              </Link>

              <Link href="/admin/dashboard/laporan/laporan-barang-masuk">
                <div
                  onClick={() => {
                    setActiveMenu("laporan");
                    setActiveSubMenu("Laporan_barang_masuk");
                    if (onMobileClose) onMobileClose();
                  }}
                  className={`p-2 flex rounded cursor-pointer 
                            ${
                              activeSubMenu === "Laporan_barang_masuk"
                                ? "bg-gray-200 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                >
                  <img src="/dot_default.png" className="my-auto mr-3" />
                  Laporan Barang Masuk
                </div>
              </Link>

              <Link href="/admin/dashboard/laporan/laporan-barang-keluar">
                <div
                  onClick={() => {
                    setActiveMenu("laporan");
                    setActiveSubMenu("laporan_barang_keluar");
                    if (onMobileClose) onMobileClose();
                  }}
                  className={`p-2 flex rounded cursor-pointer 
                            ${
                              activeSubMenu === "laporan_barang_keluar"
                                ? "bg-gray-200 font-bold"
                                : "hover:bg-gray-100"
                            }`}
                >
                  <img src="/dot_default.png" className="my-auto mr-3" />
                  Laporan Barang Keluar
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
