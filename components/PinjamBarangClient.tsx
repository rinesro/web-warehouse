"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, Column } from "@/components/Table";
import { FaPlus, FaHandshake } from "react-icons/fa";
import DeletePeminjamanButton from "@/components/DeletePeminjamanButton";
import ReturnPeminjamanButton from "@/components/ReturnPeminjamanButton";
import EditPeminjamanButton from "./EditPeminjamanButton";

interface Peminjaman_with_relation {
  id_peminjaman: number;
  id_barang: number;
  nomor_ktp: string;
  nama_peminjam: string;
  kategori_peminjam: string;
  no_telepon: string;
  alamat: string; 
  jumlah_peminjaman: number;
  status_peminjaman: string;
  tanggal_peminjaman: string | null;
  data_barang: {
    nama_barang: string;
    satuan_barang: string;
  };
}


interface PeminjamanUI {
  id: number;
  nomor_ktp: string;
  nama_peminjam: string;
  kategori: string;
  id_barang: number;
  nama_barang: string;
  tanggal_pinjam: string; 
  display_tanggal: string; 
  jumlah: number;
  status: string;
  no_telepon: string;
  alamat: string;
}

interface ItemBarang {
    id_barang: number;
    nama_barang: string;
    stok_barang: number;
    satuan_barang: string;
}

interface PinjamBarangClientProps {
  data: Peminjaman_with_relation[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  items: ItemBarang[]; 
}

export default function PinjamBarangClient({
  data,
  totalPages,
  currentPage,
  totalItems,
  items,
}: PinjamBarangClientProps) {
  const router = useRouter();

  const uiData = useMemo<PeminjamanUI[]>(
    () =>
      data.map((item) => ({
        id: item.id_peminjaman,
        nomor_ktp: item.nomor_ktp,
        nama_peminjam: item.nama_peminjam,
        kategori: item.kategori_peminjam,
        id_barang: item.id_barang,
        nama_barang: item.data_barang.nama_barang,
        tanggal_pinjam: item.tanggal_peminjaman ? item.tanggal_peminjaman.toString() : "",
        display_tanggal: item.tanggal_peminjaman
          ? new Date(item.tanggal_peminjaman).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
        jumlah: item.jumlah_peminjaman,
        status: item.status_peminjaman,
        no_telepon: item.no_telepon,
        alamat: item.alamat || "",
      })),
    [data]
  );

  const columns = useMemo<Column<PeminjamanUI>[]>(
    () => [
      {
        header: "No",
        cell: (_: PeminjamanUI, index: number) =>
          (currentPage - 1) * 10 + index + 1,
      },
      { header: "No. KTP", accessorKey: "nomor_ktp" },
      { header: "Peminjam", accessorKey: "nama_peminjam" },
      { header: "Kategori", accessorKey: "kategori" },
      { header: "Barang", accessorKey: "nama_barang" },
      { header: "Tgl Pinjam", accessorKey: "display_tanggal" },
      { header: "Jml", accessorKey: "jumlah" },
      {
        header: "Status",
        accessorKey: "status",
        cell: (item) => (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              item.status === "Dikembalikan"
                ? "text-green-600 bg-green-50"
                : "text-orange-600 bg-orange-50"
            }`}
          >
            {item.status}
          </span>
        ),
      },
      {
        header: "Aksi",
        cell: (item) => (
          <div className="flex gap-2">
            {item.status !== "Dikembalikan" && (
              <ReturnPeminjamanButton
                id={item.id}
                nama_peminjam={item.nama_peminjam}
                nama_barang={item.nama_barang}
              />
            )}
            
            {/* Ganti tombol edit lama dengan tombol popup baru */}
            <EditPeminjamanButton item={item} barangList={items} />

            <DeletePeminjamanButton
              id={item.id}
              nama_peminjam={item.nama_peminjam}
              nama_barang={item.nama_barang}
            />
          </div>
        ),
      },
    ],
    [currentPage, items]
  );

  const handleTambah = () => {
    router.push("/admin/dashboard/pinjam-barang/tambah-peminjam");
  };

  const sortOptions = [
    { label: "Terbaru", value: "date-desc" },
    { label: "Terlama", value: "date-asc" },
    { label: "Status", value: "status-asc" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
            <FaHandshake size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pinjam Barang</h1>
            <p className="text-gray-500 text-sm">
              Kelola data peminjaman barang inventaris
            </p>
          </div>
        </div>

        <button
          onClick={handleTambah}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <FaPlus /> Buat Peminjaman
        </button>
      </div>

      <Table
        columns={columns}
        data={uiData}
        title="Daftar Peminjaman"
        sortOptions={sortOptions}
        itemsPage={10}
        entryLabel="peminjaman"
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
}