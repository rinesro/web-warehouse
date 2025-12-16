import React from "react";
import BarangKeluarClient from "@/components/BarangKeluarClient";
import {
  fetchDataBarangKeluar,
  fetchTotalBarangKeluarPages,
  fetchTotalBarangKeluarCount,
} from "@/data/barangKeluar";

import { fetchAllBarang } from "@/data/barang";

// Asumsikan tipe ini yang diharapkan oleh komponen klien.
// Kita harus memastikan data yang kita hasilkan SAMA persis dengan tipe ini.
// Di sini saya gabungkan tipe raw (Date) dengan tipe serialized (string)
// karena data yang dikirim ke komponen adalah yang sudah di-serialize.

interface BarangRelasiDataBarang {
    nama_barang: string;
    satuan_barang: string;
}

interface BarangKeluarWithRelation {
    // Properti yang hilang/salah nama:
    id_barang_keluar: string | number; 
    id_barang: string | number;         
    keterangan: string | null;          
    data_barang: BarangRelasiDataBarang;

    // Properti yang sudah ada (tapi sekarang bertipe string karena sudah di-serialize):
    id: number;
    jumlah_keluar: number;
    nama_penerima: string;
    tanggal_keluar: string; // Tipe string karena sudah di-toISOString()
    createdAt: string;      // Tipe string karena sudah di-toISOString()
    updatedAt: string;      // Tipe string karena sudah di-toISOString()
}

// Tipe data sebelum serialisasi (Raw Data)
interface BarangKeluarRaw {
    id: number;
    tanggal_keluar: Date; // Date object
    jumlah_keluar: number;
    nama_penerima: string;
    createdAt: Date;      // Date object
    updatedAt: Date;      // Date object
    
    // Properti yang harus ada (sama seperti di WithRelation)
    id_barang_keluar: string | number; 
    id_barang: string | number;         
    keterangan: string | null;          
    data_barang: BarangRelasiDataBarang;
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
  
  // Pastikan rawData di-cast ke tipe Raw yang benar
  const rawData: BarangKeluarRaw[] = await fetchDataBarangKeluar(query, currentPage, "", "", sort);
  
  const items = await fetchAllBarang();

  // Serialize data dan pastikan outputnya sesuai dengan BarangKeluarWithRelation
  const data: BarangKeluarWithRelation[] = rawData.map((item: BarangKeluarRaw) => ({
    // Properti-properti yang dihasilkan harus sama persis dengan WithRelation
    id_barang_keluar: item.id_barang_keluar,
    id_barang: item.id_barang,
    keterangan: item.keterangan,
    data_barang: item.data_barang, // Asumsi relasi ini sudah dimuat oleh fetchDataBarangKeluar
    
    // Properti lainnya dari item
    id: item.id,
    jumlah_keluar: item.jumlah_keluar,
    nama_penerima: item.nama_penerima,
    
    // Serialisasi Date
    tanggal_keluar: item.tanggal_keluar.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <BarangKeluarClient
      data={data} // Tipe data sekarang sudah BarangKeluarWithRelation[]
      totalPages={totalPages}
      currentPage={currentPage}
      totalItems={totalItems}
      items={items}
    />
  );
};

export default BarangKeluarPage;
