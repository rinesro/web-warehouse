import React from "react";
import BarangKeluarClient from "@/components/BarangKeluarClient";
import {
  fetchDataBarangKeluar,
  fetchTotalBarangKeluarPages,
  fetchTotalBarangKeluarCount,
} from "@/data/barangKeluar";

import { fetchAllBarang } from "@/data/barang";

interface BarangKeluar {
    id: number;
    tanggal_keluar: Date; 
    jumlah_keluar: number;
    barang: {
        nama_barang: string;
        satuan_barang: string;
    };
    nama_penerima: string;
}
const BarangKeluarPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; sort?: string }>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const sort = params?.sort || "";

  const totalPages = await fetchTotalBarangKeluarPages(query, "", "");
  const totalItems = await fetchTotalBarangKeluarCount(query, "", "");
  const rawData = await fetchDataBarangKeluar(query, currentPage, "", "", sort);
  const items = await fetchAllBarang();

  // Serialize data
  const data = rawData.map((item) => ({ // <-- Menggunakan rawData, BUKAN recentKeluar
    ...item,
    tanggal_keluar: item.tanggal_keluar.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <BarangKeluarClient
      data={data}
      totalPages={totalPages}
      currentPage={currentPage}
      totalItems={totalItems}
      items={items}
    />
  );
};

export default BarangKeluarPage;
