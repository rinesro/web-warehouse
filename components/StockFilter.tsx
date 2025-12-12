"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFileExcel } from "react-icons/fa";

const StockFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterStok, setFilterStok] = useState(
    searchParams.get("filter") || ""
  );

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterStok) {
      params.set("filter", filterStok);
    } else {
      params.delete("filter");
    }
    // Reset halaman ke 1 saat melakukan filtering
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-[#1E88E5] p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-white mb-4">
        Filter Data Stok
      </h2>
      <div className="bg-white h-0.5 w-full mb-6"></div>

      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-white mb-2">
            Stok *
          </label>
          <select
            value={filterStok}
            onChange={(e) => setFilterStok(e.target.value)}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all ${
              filterStok === "" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            <option value="" className="text-gray-400">
              --Pilih Kategori Stok--
            </option>
            <option value="semua" className="text-gray-900">
              Tampilkan Semua
            </option>
            <option value="rendah" className="text-gray-900">
              Stok Rendah (≤ 5)
            </option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleFilter}
            className="w-full sm:w-auto px-6 py-3 bg-white text-[#1E88E5] font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-md active:scale-95 transform duration-100"
          >
            Tampilkan
          </button>
          <button
            onClick={() => {
              const url = `/api/export/laporan-stok?filter=${filterStok}`;
              window.open(url, "_blank");
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white text-[#1E88E5] font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2 active:scale-95 transform duration-100"
          >
            <FaFileExcel size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockFilter;
