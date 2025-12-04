"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type State = {
  message?: string | null;
  error?: {
    [key: string]: string[];
  };
  success?: boolean;
};

export async function updatePeminjaman(
  id_peminjaman: number,
  prevState: State,
  formData: FormData
): Promise<State> {
  const nomor_ktp = formData.get("nomor_ktp") as string;
  const kategori_peminjam = formData.get("kategori_peminjam") as string;
  const nama_peminjam = formData.get("nama_peminjam") as string;
  const no_telp = formData.get("no_telp") as string;
  const alamat = formData.get("alamat") as string;
  const barang_id = formData.get("barang_id") as string;
  const jumlah = formData.get("jumlah") as string;
  const tanggal_pinjam = formData.get("tanggal_pinjam") as string;

  if (
    !nomor_ktp ||
    !nama_peminjam ||
    !barang_id ||
    !jumlah ||
    !tanggal_pinjam
  ) {
    return { message: "Mohon lengkapi semua data!", success: false };
  }

  if (nomor_ktp.length !== 16) {
    return { message: "Nomor KTP harus 16 digit!", success: false };
  }

  if (no_telp.length < 10) {
    return { message: "Nomor telepon minimal 10 digit!", success: false };
  }

  const jumlahInt = parseInt(jumlah);
  const barangIdInt = parseInt(barang_id);

  try {
    const oldRecord = await prisma.peminjaman.findUnique({
      where: { id_peminjaman },
    });

    if (!oldRecord) {
      return { message: "Data peminjaman tidak ditemukan!", success: false };
    }

    // Cek jika barang berubah
    if (oldRecord.id_barang !== barangIdInt) {
      // 1. Kembalikan stok barang lama
      // 2. Cek stok barang baru
      // 3. Update

      const newBarang = await prisma.data_barang.findUnique({
        where: { id_barang: barangIdInt },
      });

      if (!newBarang) {
        return { message: "Barang baru tidak ditemukan!", success: false };
      }

      if (newBarang.stok_barang < jumlahInt) {
        return {
          message: `Stok barang baru tidak cukup! Sisa: ${newBarang.stok_barang}`,
          success: false,
        };
      }

      await prisma.$transaction([
        // Kembalikan stok lama
        prisma.data_barang.update({
          where: { id_barang: oldRecord.id_barang },
          data: { stok_barang: { increment: oldRecord.jumlah_peminjaman } },
        }),
        // Kurangi stok baru
        prisma.data_barang.update({
          where: { id_barang: barangIdInt },
          data: { stok_barang: { decrement: jumlahInt } },
        }),
        // Update peminjaman
        prisma.peminjaman.update({
          where: { id_peminjaman },
          data: {
            nomor_ktp,
            kategori_peminjam,
            nama_peminjam,
            no_telepon: no_telp,
            alamat,
            id_barang: barangIdInt,
            jumlah_peminjaman: jumlahInt,
            tanggal_peminjaman: new Date(tanggal_pinjam),
          },
        }),
      ]);
    } else {
      // Barang sama, cek selisih jumlah
      const diff = jumlahInt - oldRecord.jumlah_peminjaman;

      if (diff > 0) {
        // Jumlah pinjam bertambah, cek stok cukup gak
        const barang = await prisma.data_barang.findUnique({
          where: { id_barang: barangIdInt },
        });
        if (!barang || barang.stok_barang < diff) {
          return {
            message: `Stok tidak cukup untuk penambahan! Sisa: ${
              barang?.stok_barang || 0
            }`,
            success: false,
          };
        }
      }

      await prisma.$transaction([
        // Update stok (kurangi dengan selisih)
        // Jika diff positif (pinjam nambah), stok berkurang (decrement positif)
        // Jika diff negatif (pinjam berkurang), stok bertambah (decrement negatif = increment)
        prisma.data_barang.update({
          where: { id_barang: barangIdInt },
          data: { stok_barang: { decrement: diff } },
        }),
        // Update peminjaman
        prisma.peminjaman.update({
          where: { id_peminjaman },
          data: {
            nomor_ktp,
            kategori_peminjam,
            nama_peminjam,
            no_telepon: no_telp,
            alamat,
            id_barang: barangIdInt,
            jumlah_peminjaman: jumlahInt,
            tanggal_peminjaman: new Date(tanggal_pinjam),
          },
        }),
      ]);
    }
  } catch (error) {
    console.error("Error updating peminjaman:", error);
    return { message: "Gagal mengupdate peminjaman!", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  return { message: "Berhasil update", success: true };
}
