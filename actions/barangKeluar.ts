"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation"; // Redirect dihapus agar Toast di client bisa jalan
import { z } from "zod";

const CreateBarangKeluarSchema = z.object({
  id_barang: z.coerce.number().min(1, "Pilih barang terlebih dahulu"),
  tanggal_keluar: z.string().min(1, "Tanggal keluar wajib diisi"),
  jumlah_keluar: z.coerce.number().min(1, "Jumlah minimal 1"),
  keterangan: z.string().min(1, "Keterangan wajib dipilih"),
});

export type State = {
  error?: {
    id_barang?: string[];
    tanggal_keluar?: string[];
    jumlah_keluar?: string[];
    keterangan?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createBarangKeluar(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = CreateBarangKeluarSchema.safeParse({
    id_barang: formData.get("id_barang"),
    tanggal_keluar: formData.get("tanggal_keluar"),
    jumlah_keluar: formData.get("jumlah_keluar"),
    keterangan: formData.get("keterangan"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id_barang, tanggal_keluar, jumlah_keluar, keterangan } = validatedFields.data;

  // --- LOGIKA TAMBAHAN (Wajib Ada) ---
  // 1. Ambil detail dari form (yang kita buat di frontend tadi)
  const detailKeterangan = formData.get("detail_keterangan") as string;
  
  // 2. Gabungkan Text sesuai format yang diinginkan
  let keteranganFinal = keterangan;

  if (keterangan === "Diberikan" && detailKeterangan) {
    keteranganFinal = `Diberikan kepada: ${detailKeterangan}`;
  } else if (keterangan === "Lainnya" && detailKeterangan) {
    keteranganFinal = `Lainnya: ${detailKeterangan}`;
  }
  // ------------------------------------

  try {
    // Cek stok tersedia
    const barang = await prisma.data_barang.findUnique({
      where: { id_barang },
    });

    if (!barang) {
      return {
        message: "Barang tidak ditemukan",
      };
    }

    if (barang.stok_barang < jumlah_keluar) {
      return {
        error: {
          jumlah_keluar: ["Stok tidak mencukupi"],
        },
      };
    }

    // Transaction: Simpan Record & Update Stok
    await prisma.$transaction([
      prisma.data_barang_keluar.create({
        data: {
          id_barang,
          tanggal_keluar: new Date(tanggal_keluar),
          jumlah_keluar,
          keterangan: keteranganFinal, // <--- PENTING: Gunakan variabel yang sudah digabung
        },
      }),
      prisma.data_barang.update({
        where: { id_barang },
        data: {
          stok_barang: {
            decrement: jumlah_keluar,
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Gagal menyimpan data barang keluar",
    };
  }

  revalidatePath("/admin/dashboard/barang-keluar");
  revalidatePath("/admin/dashboard/data-barang");
  
  // Return message sukses agar Client Component bisa redirect manual + show Toast
  return { message: "Berhasil menyimpan data barang keluar!" };
}

// ... (Sisa kode updateBarangKeluar dan deleteBarangKeluar biarkan sama, atau sesuaikan logika update-nya jika perlu)

const UpdateBarangKeluarSchema = z.object({
  id_barang: z.coerce.number().min(1, "Pilih barang terlebih dahulu"),
  tanggal_keluar: z.string().min(1, "Tanggal keluar wajib diisi"),
  jumlah_keluar: z.coerce.number().min(1, "Jumlah minimal 1"),
  keterangan: z.string().min(1, "Keterangan wajib dipilih"),
});

export async function updateBarangKeluar(
  id_barang_keluar: number,
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = UpdateBarangKeluarSchema.safeParse({
    id_barang: formData.get("id_barang"),
    tanggal_keluar: formData.get("tanggal_keluar"),
    jumlah_keluar: formData.get("jumlah_keluar"),
    keterangan: formData.get("keterangan"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id_barang, tanggal_keluar, jumlah_keluar, keterangan } = validatedFields.data;

  try {
    const oldRecord = await prisma.data_barang_keluar.findUnique({
      where: { id_barang_keluar },
    });

    if (!oldRecord) {
      return { message: "Data tidak ditemukan" };
    }

    const barang = await prisma.data_barang.findUnique({
      where: { id_barang },
    });

    if (!barang) {
      return { message: "Barang tidak ditemukan" };
    }

    if (oldRecord.id_barang === id_barang) {
      const availableStock = barang.stok_barang + oldRecord.jumlah_keluar;
      if (availableStock < jumlah_keluar) {
        return { error: { jumlah_keluar: ["Stok tidak mencukupi"] } };
      }

      await prisma.$transaction([
        prisma.data_barang_keluar.update({
          where: { id_barang_keluar },
          data: {
            tanggal_keluar: new Date(tanggal_keluar),
            jumlah_keluar,
            keterangan, // Jika ingin update keterangan detail juga, tambahkan logika serupa di sini
          },
        }),
        prisma.data_barang.update({
          where: { id_barang },
          data: {
            stok_barang: {
              increment: oldRecord.jumlah_keluar - jumlah_keluar,
            },
          },
        }),
      ]);
    } else {
      // Logic ganti barang (revert stok lama, kurangi stok baru)
      await prisma.data_barang.update({
        where: { id_barang: oldRecord.id_barang },
        data: { stok_barang: { increment: oldRecord.jumlah_keluar } },
      });

      const newBarang = await prisma.data_barang.findUnique({
        where: { id_barang },
      });
      if (!newBarang || newBarang.stok_barang < jumlah_keluar) {
        throw new Error("Stok barang baru tidak mencukupi");
      }

      await prisma.$transaction([
        prisma.data_barang_keluar.update({
          where: { id_barang_keluar },
          data: {
            id_barang,
            tanggal_keluar: new Date(tanggal_keluar),
            jumlah_keluar,
            keterangan,
          },
        }),
        prisma.data_barang.update({
          where: { id_barang },
          data: { stok_barang: { decrement: jumlah_keluar } },
        }),
      ]);
    }
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Gagal mengupdate data" };
  }

  revalidatePath("/admin/dashboard/barang-keluar");
  return { message: "Berhasil update data!" };
}

export async function deleteBarangKeluar(id_barang_keluar: number) {
  try {
    const record = await prisma.data_barang_keluar.findUnique({
      where: { id_barang_keluar },
    });

    if (!record) {
      throw new Error("Data tidak ditemukan");
    }

    await prisma.$transaction([
      prisma.data_barang.update({
        where: { id_barang: record.id_barang },
        data: {
          stok_barang: {
            increment: record.jumlah_keluar,
          },
        },
      }),
      prisma.data_barang_keluar.delete({
        where: { id_barang_keluar },
      }),
    ]);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal menghapus data");
  }

  revalidatePath("/admin/dashboard/barang-keluar");
}