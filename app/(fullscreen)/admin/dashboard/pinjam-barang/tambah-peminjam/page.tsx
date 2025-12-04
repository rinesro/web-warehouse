import React from "react";
import { prisma } from "@/lib/prisma";
import FormTambahPeminjaman from "@/components/FormTambahPeminjaman";

export default async function TambahPeminjamanPage() {
  const barangList = await prisma.data_barang.findMany({
    select: {
      id_barang: true,
      nama_barang: true,
      stok_barang: true,
    },
    orderBy: {
      nama_barang: "asc",
    },
  });

  return <FormTambahPeminjaman barangList={barangList} />;
}
