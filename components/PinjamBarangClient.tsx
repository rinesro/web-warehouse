"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Column } from "@/components/Table";
import { FaPlus, FaHandshake } from "react-icons/fa";
import DeletePeminjamanButton from "@/components/DeletePeminjamanButton";
import ReturnPeminjamanButton from "@/components/ReturnPeminjamanButton";
import EditPeminjamanButton from "@/components/EditPeminjamanButton"; 

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
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "date-desc";


  const formattedData = useMemo<PeminjamanUI[]>(() => {
    return data.map((item) => {
      let dateObj: Date | null = null;
      if (item.tanggal_peminjaman) {
        dateObj = new Date(item.tanggal_peminjaman);
      }

      return {
        id: item.id_peminjaman,
        nomor_ktp: item.nomor_ktp,
        nama_peminjam: item.nama_peminjam,
        kategori: item.kategori_peminjam,
        id_barang: item.id_barang,
        nama_barang: item.data_barang.nama_barang,
        tanggal_pinjam: dateObj ? dateObj.toISOString() : "", 
        display_tanggal: dateObj
          ? dateObj.toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
        jumlah: item.jumlah_peminjaman,
        status: item.status_peminjaman,
        no_telepon: item.no_telepon,
        alamat: item.alamat || "",
      };
    });
  }, [data]);

  const sortedData = useMemo(() => {
    const sorted = [...formattedData];

    return sorted.sort((a, b) => {
      if (currentSort.includes("date")) {
        const dateA = a.tanggal_pinjam ? new Date(a.tanggal_pinjam).getTime() : 0;
        const dateB = b.tanggal_pinjam ? new Date(b.tanggal_pinjam).getTime() : 0;

        if (currentSort === "date-desc") return dateB - dateA;
        if (currentSort === "date-asc") return dateA - dateB;
      }

      if (currentSort === "status-asc") {
        if (a.status === b.status) return 0;
        return a.status === "Belum Dikembalikan" ? -1 : 1;
      }

      if (currentSort === "name-asc") {
        return a.nama_peminjam.localeCompare(b.nama_peminjam);
      }
      if (currentSort === "name-desc") {
        return b.nama_peminjam.localeCompare(a.nama_peminjam);
      }

      return 0;
    });
  }, [formattedData, currentSort]);

  const columns = useMemo<Column<PeminjamanUI>[]>(
    () => [
      {
        header: "No",
        cell: (_: PeminjamanUI, index: number) =>
          (currentPage - 1) * 10 + index + 1,
      },
      { header: "No. KTP", accessorKey: "nomor_ktp" },
      { header: "Peminjam", accessorKey: "nama_peminjam" },
      {
        header: "Kategori",
        accessorKey: "kategori",
        cell: (item) => (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full border ${
              item.kategori === "Warga"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {item.kategori}
          </span>
        ),
      },
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
            <EditPeminjamanButton item={item as any} barangList={items} />
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

  const sortOptionsList = [
    { label: "Tanggal Terbaru", value: "date-desc" },
    { label: "Tanggal Terlama", value: "date-asc" },
    { label: "Status", value: "status-asc" },
    { label: "Nama (A-Z)", value: "name-asc" },
    { label: "Nama (Z-A)", value: "name-desc" },
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
        data={sortedData}
        title="Daftar Peminjaman"
        sortOptions={sortOptionsList}
        itemsPage={10}
        entryLabel="peminjaman"
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
}