"use client";

import { DashboardTable } from "@/components/DashboardTable";

interface RecentDataProps {
  data: any[];
}

export default function RecentData({ data }: RecentDataProps) {
  const columns = [
    {
      header: "No",
      cell: (_: any, index: number) => index + 1,
    },
    {
      header: "Nama Barang",
      accessorKey: "data_barang" as const,
      cell: (item: any) => item.data_barang?.nama_barang || "-",
    },
    {
      header: "Peminjam",
      accessorKey: "nama_peminjam" as const,
    },
    {
      header: "Tanggal Pinjam",
      accessorKey: "tanggal_peminjaman" as const,
      cell: (item: any) =>
        item.tanggal_peminjaman
          ? new Date(item.tanggal_peminjaman).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "Status",
      accessorKey: "status_peminjaman" as const,
      cell: (item: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status_peminjaman === "Dikembalikan"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {item.status_peminjaman}
        </span>
      ),
    },
  ];

  return (
    <DashboardTable
      title="Recent Data"
      icon="/recent_logo.png"
      columns={columns}
      data={data}
      lastUpdate={`Terakhir update: ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`}
      filterKey="status_peminjaman"
      filterOptions={["Dipinjam", "Dikembalikan"]}
    />
  );
}
