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
  const data = recentKeluar.map((item: BarangKeluar) => ({ 
    id: item.id,
    tanggal: item.tanggal_keluar.toISOString(),
    nama_barang: item.barang.nama_barang,
    jumlah: item.jumlah_keluar,
    satuan: item.barang.satuan_barang,
    penerima: item.nama_penerima,
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
