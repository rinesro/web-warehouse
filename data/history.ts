import { prisma } from "@/lib/prisma";

export async function fetchRecentHistory() {
  const barangMasuk = await prisma.data_barang_masuk.findMany({
    take: 5,
    orderBy: {
      tanggal_masuk: "desc",
    },
    include: {
      data_barang: true,
    },
  });

  const barangKeluar = await prisma.data_barang_keluar.findMany({
    take: 5,
    orderBy: {
      tanggal_keluar: "desc",
    },
    include: {
      data_barang: true,
    },
  });

  const formattedMasuk = barangMasuk.map((item) => ({
    id: `in-${item.id_barang_masuk}`,
    nama_barang: item.data_barang.nama_barang,
    tanggal_peminjaman: item.tanggal_masuk, 
    jumlah: item.jumlah_barang,
    status_peminjaman: "Masuk", 
    nama_peminjam: item.sumber_barang, 
  }));

  const formattedKeluar = barangKeluar.map((item) => ({
    id: `out-${item.id_barang_keluar}`,
    nama_barang: item.data_barang.nama_barang,
    tanggal_peminjaman: item.tanggal_keluar,
    jumlah: item.jumlah_keluar,
    status_peminjaman: "Keluar", 
    nama_peminjam: item.keterangan, 
  }));

  const combinedData = [...formattedMasuk, ...formattedKeluar];
  combinedData.sort((a, b) => b.tanggal_peminjaman.getTime() - a.tanggal_peminjaman.getTime());

  return combinedData.slice(0, 10);
}