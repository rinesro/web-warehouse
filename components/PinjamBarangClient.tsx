"use client";

import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, Column } from "@/components/Table";
import { FaPlus, FaHandshake, FaEdit } from "react-icons/fa";
import DeletePeminjamanButton from "@/components/DeletePeminjamanButton";
import ReturnPeminjamanButton from "@/components/ReturnPeminjamanButton";

// Interface yang sesuai dengan Data Server (dari Prisma)
interface Peminjaman_with_relation {
  id_peminjaman: number;
  id_barang: number;
  nomor_ktp: string;
  nama_peminjam: string;
  kategori_peminjam: string;
  no_telepon: string;
  jumlah_peminjaman: number;
  status_peminjaman: string;
  tanggal_peminjaman: string | null;
  data_barang: {
    nama_barang: string;
    satuan_barang: string;
  };
}

// Interface untuk UI (sesuai dengan kolom file "copy" user)
interface PeminjamanUI {
  id: number;
  nomor_ktp: string;
  nama_peminjam: string;
  kategori: string;
  nama_barang: string;
  tanggal_pinjam: string;
  jumlah: number;
  status: string;
}

interface PinjamBarangClientProps {
  data: Peminjaman_with_relation[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function PinjamBarangClient({
  data,
  totalPages,
  currentPage,
  totalItems,
}: PinjamBarangClientProps) {
  const router = useRouter();

  // Mapping data server ke data UI
  const uiData = useMemo<PeminjamanUI[]>(
    () =>
      data.map((item) => ({
        id: item.id_peminjaman,
        nomor_ktp: item.nomor_ktp,
        nama_peminjam: item.nama_peminjam,
        kategori: item.kategori_peminjam,
        nama_barang: item.data_barang.nama_barang,
        tanggal_pinjam: item.tanggal_peminjaman
          ? new Date(item.tanggal_peminjaman).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "-",
        jumlah: item.jumlah_peminjaman,
        status: item.status_peminjaman,
      })),
    [data]
  );

  const handleEdit = useCallback(
    (item: PeminjamanUI) => {
      router.push(`/admin/dashboard/pinjam-barang/update-peminjam/${item.id}`);
    },
    [router]
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
      { header: "Nama Barang", accessorKey: "nama_barang" },
      { header: "Tgl Pinjam", accessorKey: "tanggal_pinjam" },
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
            <button
              onClick={() => handleEdit(item)}
              className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
              title="Edit Data"
            >
              <FaEdit size={16} />
            </button>
            <DeletePeminjamanButton
              id={item.id}
              nama_peminjam={item.nama_peminjam}
              nama_barang={item.nama_barang}
            />
          </div>
        ),
      },
    ],
    [currentPage, handleEdit]
  );

  const handleTambah = () => {
    router.push("/admin/dashboard/pinjam-barang/tambah-peminjam");
  };

  const sortOptions = useMemo(
    () => [
      { label: "Terbaru", value: "date-desc" },
      { label: "Terlama", value: "date-asc" },
      { label: "Status", value: "status-asc" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
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
