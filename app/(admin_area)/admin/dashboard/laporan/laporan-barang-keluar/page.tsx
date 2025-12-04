import React from "react";
import {
  fetchDataBarangKeluar,
  fetchTotalBarangKeluarCount,
  fetchTotalBarangKeluarPages,
} from "@/data/barangKeluar";
import PageHeader from "@/components/PageHeader";
import OutgoingGoodsFilter from "@/components/OutgoingGoodsFilter";
import OutgoingGoodsTableClient from "@/components/OutgoingGoodsTableClient";
import { FaBoxOpen } from "react-icons/fa";
import Image from "next/image";

const LaporanBarangKeluarPage = async (props: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams.query || "";
  const currentPage = Number(searchParams.page) || 1;
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const sort = searchParams.sort || "";

  const data = await fetchDataBarangKeluar(
    query,
    currentPage,
    startDate,
    endDate,
    sort
  );
  const totalPages = await fetchTotalBarangKeluarPages(
    query,
    startDate,
    endDate
  );
  const totalItems = await fetchTotalBarangKeluarCount(
    query,
    startDate,
    endDate
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Laporan Barang Keluar"
        description="Laporan riwayat barang keluar gudang"
        icon={
          <Image
            src="/barang_keluar_white_icon.png"
            width={24}
            height={24}
            alt="Barang Keluar Icon"
          />
        }
      />

      {/* Filter Section */}
      <OutgoingGoodsFilter />

      {/* Table Section */}
      <div className="mt-8">
        <OutgoingGoodsTableClient
          data={data}
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default LaporanBarangKeluarPage;
