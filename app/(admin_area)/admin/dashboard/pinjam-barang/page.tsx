import React from "react";
import {
  fetchDataPeminjaman,
  fetchTotalPeminjamanPages,
  fetchTotalPeminjamanCount,
} from "@/data/peminjaman";
import PinjamBarangClient from "@/components/PinjamBarangClient";

const PinjamBarangPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; sort?: string }>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const sort = params?.sort || "";

  const totalPages = await fetchTotalPeminjamanPages(query);
  const totalItems = await fetchTotalPeminjamanCount(query);
  const rawData = await fetchDataPeminjaman(query, currentPage, sort);

  // Serialize data
  const data = rawData.map((item) => ({
    ...item,
    tanggal_peminjaman: item.tanggal_peminjaman
      ? item.tanggal_peminjaman.toISOString()
      : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    data_barang: {
      nama_barang: item.data_barang.nama_barang,
      satuan_barang: item.data_barang.satuan_barang,
    },
  }));

  return (
    <PinjamBarangClient
      data={data}
      totalPages={totalPages}
      currentPage={currentPage}
      totalItems={totalItems}
    />
  );
};

export default PinjamBarangPage;
