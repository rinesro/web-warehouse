"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFileExcel } from "react-icons/fa";

const OutgoingGoodsFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const handleFilter = () => {
    let start = startDate;
    let end = endDate;

    // Tukar otomatis jika tanggal awal lebih besar dari tanggal akhir
    if (start && end && new Date(start) > new Date(end)) {
      [start, end] = [end, start];
      setStartDate(start);
      setEndDate(end);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (start) {
      params.set("startDate", start);
    } else {
      params.delete("startDate");
    }

    if (end) {
      params.set("endDate", end);
    } else {
      params.delete("endDate");
    }

    // Reset halaman ke 1 saat melakukan filtering
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    let start = startDate;
    let end = endDate;

    // Tukar otomatis jika tanggal awal lebih besar dari tanggal akhir
    if (start && end && new Date(start) > new Date(end)) {
      [start, end] = [end, start];
      setStartDate(start);
      setEndDate(end);
    }

    const params = new URLSearchParams();
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);

    const url = `/api/export/laporan-barang-keluar?${params.toString()}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-[#1E88E5] p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-white mb-4">
        Filter Data Barang Keluar
      </h2>
      <div className="bg-white h-0.5 w-full mb-6"></div>

      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-white mb-2">
            Tanggal Awal
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-900 transition-all"
          />
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-white mb-2">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-900 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleFilter}
            className="w-full sm:w-auto px-6 py-3 bg-white text-[#1E88E5] font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-md active:scale-95 transform duration-100"
          >
            Tampilkan
          </button>
          <button
            onClick={handleExport}
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

export default OutgoingGoodsFilter;
