"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { Table, Column } from "@/components/Table";
import EditBarangKeluarButton from "./EditBarangKeluarButton";
import DeleteBarangKeluarButton from "./DeleteBarangKeluarButton";
import PageHeader from "@/components/PageHeader";

interface BarangKeluarWithRelation {
  id_barang_keluar: number;
  id_barang: number;
  tanggal_keluar: string;
  jumlah_keluar: number;
  keterangan: string;
  data_barang: {
    nama_barang: string;
    satuan_barang: string;
  };
}

interface BarangKeluarClientProps {
  data: BarangKeluarWithRelation[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  items: {
    id_barang: number;
    nama_barang: string;
    satuan_barang: string;
  }[];
}

const BarangKeluarClient = ({
  data,
  totalPages,
  currentPage,
  totalItems,
  items,
}: BarangKeluarClientProps) => {
  const router = useRouter();

  const columns: Column<BarangKeluarWithRelation>[] = [
    {
      header: "No",
      cell: (_: BarangKeluarWithRelation, index: number) =>
        (currentPage - 1) * 7 + index + 1,
    },
    {
      header: "Nama Barang",
      accessorKey: "data_barang",
      cell: (item) => item.data_barang.nama_barang,
    },
    {
      header: "Tanggal Keluar",
      accessorKey: "tanggal_keluar",
      cell: (item) =>
        new Date(item.tanggal_keluar).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    },
    {
      header: "Keterangan",
      accessorKey: "keterangan",
    },
    {
      header: "Jumlah",
      accessorKey: "jumlah_keluar",
      cell: (item) => `${item.jumlah_keluar} ${item.data_barang.satuan_barang}`,
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2 justify-end">
          <EditBarangKeluarButton item={item} items={items} />
          <DeleteBarangKeluarButton
            id={item.id_barang_keluar}
            nama_barang={item.data_barang.nama_barang}
          />
        </div>
      ),
    },
  ];

  const sortOptions = [
    { label: "Tanggal Terbaru", value: "tanggal-desc" },
    { label: "Tanggal Terlama", value: "tanggal-asc" },
    { label: "Nama A-Z", value: "nama-asc" },
    { label: "Nama Z-A", value: "nama-desc" },
    { label: "Jumlah Terbanyak", value: "jumlah-desc" },
    { label: "Jumlah Sedikit", value: "jumlah-asc" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barang Keluar"
        description="Kelola data barang keluar gudang kelurahan"
        icon={
          <Image
            src="/barang_keluar_white_icon.png"
            width={24}
            height={24}
            alt="Barang Keluar Icon"
          />
        }
        actionButton={
          <div className="relative">
            <button
              onClick={() => router.push("/admin/dashboard/barang-keluar/add")}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              <FaPlus />
              <span>Input Data</span>
            </button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={data}
        title="Data Barang Keluar"
        sortOptions={sortOptions}
        itemsPage={7}
        entryLabel="barang keluar"
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
};

export default BarangKeluarClient;
