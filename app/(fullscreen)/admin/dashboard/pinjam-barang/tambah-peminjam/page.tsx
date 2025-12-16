import React from "react";
import FormTambahPeminjaman from "@/components/FormTambahPeminjaman";
import { fetchAllBarang } from "@/data/barang";

export default async function TambahPeminjamanPage() {
  const barangList = await fetchAllBarang();
  
  return <FormTambahPeminjaman barangList={barangList} />;
}