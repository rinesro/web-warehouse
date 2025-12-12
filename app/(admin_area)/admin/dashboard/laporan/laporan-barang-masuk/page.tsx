import React from "react";
import {
  fetchDataBarangMasuk,
  fetchTotalBarangMasukCount,
  fetchTotalBarangMasukPages,
} from "@/data/barang-masuk";
import PageHeader from "@/components/PageHeader";
import IncomingGoodsFilter from "@/components/IncomingGoodsFilter";
import IncomingGoodsTableClient from "@/components/IncomingGoodsTableClient";
import { FaBoxOpen } from "react-icons/fa";

const LaporanBarangMasukPage = async (props: {
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

  const data = await fetchDataBarangMasuk(
    query,
    currentPage,
    startDate,
    endDate,
    sort
  );
  const totalPages = await fetchTotalBarangMasukPages(
    query,
    startDate,
    endDate
  );
  const totalItems = await fetchTotalBarangMasukCount(
    query,
    startDate,
    endDate
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Barang Masuk"
        description="Laporan riwayat barang masuk gudang"
        icon={<FaBoxOpen size={24} />}
      />

      <IncomingGoodsFilter />

      <div className="mt-8">
        <IncomingGoodsTableClient
          data={data}
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default LaporanBarangMasukPage;
