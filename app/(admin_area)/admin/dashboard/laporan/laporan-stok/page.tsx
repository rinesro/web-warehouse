import React from "react";
import { FaFileAlt } from "react-icons/fa";
import {
  fetchDataBarang,
  fetchTotalBarang,
  fetchDataBarangPages,
} from "@/data/barang";
import StockFilter from "@/components/StockFilter";
import StockTableClient from "@/components/StockTableClient";
import PageHeader from "@/components/PageHeader";

const LaporanStokPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    sort?: string;
    filter?: string;
  }>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const sort = params?.sort || "";
  const filter = params?.filter || "";

  const totalPages = await fetchDataBarangPages(query, filter);
  const totalItems = await fetchTotalBarang(query, filter);
  const rawData = await fetchDataBarang(query, currentPage, sort, filter);

  // Serialize data
  const data = rawData.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Stok"
        description="Laporan stok barang gudang kelurahan"
        icon={<FaFileAlt size={24} />}
      />

      <StockFilter />

      <div className="mt-8">
        <StockTableClient
          data={data}
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default LaporanStokPage;
