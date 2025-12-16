import React from "react";
import BarangKeluarClient from "@/components/BarangKeluarClient";
import {
  fetchDataBarangKeluar,
  fetchTotalBarangKeluarPages,
  fetchTotalBarangKeluarCount,
} from "@/data/barangKeluar";

import { fetchAllBarang } from "@/data/barang";

// Perbarui interface agar mencakup properti createdAt dan updatedAt
// yang Anda akses di fungsi .map().
interface BarangKeluarRaw {
  id: number;
  tanggal_keluar: Date; // Asumsi ini adalah objek Date dari database
  jumlah_keluar: number;
  barang: {
    nama_barang: string;
    satuan_barang: string;
  };
  nama_penerima: string;
  createdAt: Date; // Ditambahkan
  updatedAt: Date; // Ditambahkan
}

// Definisikan tipe untuk data yang sudah di-serialize (stringified Date)
interface BarangKeluarSerialized extends Omit<BarangKeluarRaw, 'tanggal_keluar' | 'createdAt' | 'updatedAt'> {
    tanggal_keluar: string;
    createdAt: string;
    updatedAt: string;
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
  
  // Asumsikan fetchDataBarangKeluar mengembalikan BarangKeluarRaw[]
  const rawData: BarangKeluarRaw[] = await fetchDataBarangKeluar(query, currentPage, "", "", sort);
  
  const items = await fetchAllBarang();

  // Serialize data
  // Memberikan tipe BarangKeluarRaw pada 'item' untuk menghilangkan error 'implicitly has an 'any' type'.
  const data: BarangKeluarSerialized[] = rawData.map((item: BarangKeluarRaw) => ({
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
