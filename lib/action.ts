"use server";

import {
  RegisterSchema,
  SignInSchema,
  CreateItemSchema,
  AddStockSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "./zod";
import { prisma } from "./prisma";
import { hashSync } from "bcrypt-ts";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut, auth } from "@/auth"; 
import { AuthError } from "next-auth";
import { z } from "zod"; 

// --- TYPE DEFINITION (Agar Sinkron dengan Client) ---
export type State = {
  message: string;
  error?: Record<string, string[]>; // Ini yang bikin error sebelumnya (kurang properti ini)
  success: boolean;
};

// --- LOGIN & REGISTER ---

export const signInAction = async (prevState: unknown, formData: FormData) => {
  const validateFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Input tidak valid",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { email, password } = validateFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email atau Password salah!", success: false };
        default:
          return { message: "Terjadi kesalahan pada server.", success: false };
      }
    }
    throw error;
  }
  return { message: "Login Berhasil", success: true };
};

export const signUpAction = async (prevState: unknown, formData: FormData) => {
  const validateFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Validasi Gagal",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { name, email, password } = validateFields.data;
  const hashedPassword = hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: "user",
      },
    });
  } catch (error) {
    return {
      message: "Tidak dapat membuat akun!",
      success: false
    };
  }

  redirect("/login");
};

export const logoutAction = async () => {
  await signOut({ redirectTo: "/login" });
};

// --- CRUD BARANG ---

export const createItemAction = async (
  prevState: unknown,
  formData: FormData
): Promise<State> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Anda harus login untuk melakukan ini!", success: false };
  }
  const userId = session.user.id;

  const validateFields = CreateItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data barang tidak valid",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { nama_barang, stok_barang, satuan_barang } = validateFields.data;

  const existingItem = await prisma.data_barang.findFirst({
    where: {
      nama_barang: {
        equals: nama_barang,
        mode: "insensitive", // Biar "Kursi" == "kursi"
      },
      isDeleted: false, // Hanya cek barang yang aktif (tidak dihapus)
    },
  });

  if (existingItem) {
    return {
      message: "Gagal! Barang dengan nama tersebut sudah ada.",
      error: { nama_barang: ["Barang sudah ada, nama barang tidak boleh sama"] }, 
      success: false
    };
  }
  const periode = formData.get("periode");
  const is_stock_bulanan = periode === "Unreguler";
  const stokAwal = Number(stok_barang);
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;
  
  let sumberFinal = "Stok Awal";
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian (${keteranganSumber})` : "Pemberian";
  }
  else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `${keteranganSumber}` : "Lainnya";
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingSatuan = await tx.satuan.findUnique({
        where: { nama: satuan_barang }
      });

      if (!existingSatuan) {
        await tx.satuan.create({
          data: { nama: satuan_barang }
        });
      }

      const newItem = await tx.data_barang.create({
        data: {
          nama_barang,
          stok_barang: stokAwal,
          satuan_barang, 
          is_stock_bulanan,
          createdById: userId,
          updatedById: userId,
        },
      });

      if (stokAwal > 0) {
        await tx.data_barang_masuk.create({
          data: {
            id_barang: newItem.id_barang,
            jumlah_barang: stokAwal,
            tanggal_masuk: new Date(),
            sumber_barang: sumberFinal,
          },
        });
      }
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      message: "Gagal menambahkan barang!",
      success: false
    };
  }

  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Barang berhasil ditambahkan!", success: true };
};

export const updateItemAction = async (
  id_barang: number,
  prevState: unknown,
  formData: FormData
): Promise<State> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized", success: false };
  }
  const userId = session.user.id;

  const validateFields = CreateItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data tidak valid",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { nama_barang, stok_barang, satuan_barang } = validateFields.data;
  const is_stock_bulanan = formData.get("is_stock_bulanan") === "on";

  const existingItem = await prisma.data_barang.findFirst({
    where: {
      nama_barang: {
        equals: nama_barang,
        mode: "insensitive",
      },
      isDeleted: false,
      NOT: {
        id_barang: id_barang 
      }
    },
  });

  if (existingItem) {
    return {
      message: "Gagal update! Nama barang sudah digunakan.",
      error: { nama_barang: ["Nama barang tidak boleh sama"] },
      success: false
    };
  }

  try {
    await prisma.data_barang.update({
      where: { id_barang },
      data: {
        nama_barang,
        stok_barang: Number(stok_barang),
        satuan_barang,
        is_stock_bulanan,
        updatedById: userId,
      },
    });
  } catch (error) {
    return {
      message: "Gagal mengupdate barang!",
      success: false
    };
  }

  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-masuk");  
  revalidatePath("/admin/dashboard/barang-keluar"); 
  revalidatePath("/admin/dashboard/pinjam-barang");
  return { message: "Barang berhasil diupdate!", success: true };
};

export const deleteItemAction = async (id_barang: number) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized", success: false };
  }
  const userId = session.user.id;

  try {
    await prisma.data_barang.update({
      where: { id_barang },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: userId,
      },
    });

    revalidatePath("/admin/dashboard/data-barang");
    return { message: "Barang berhasil dihapus (arsip)!", success: true };
  } catch (error: any) {
    console.error("Error deleting item:", error);
    return {
      message: "Gagal menghapus barang! Terjadi kesalahan sistem.",
      success: false,
    };
  }
};

// --- STOCK, PEMINJAMAN, USER ---

export const addStockAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const validateFields = AddStockSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Input stok tidak valid",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { id_barang, jumlah_barang } = validateFields.data;
  const jumlah = Number(jumlah_barang);
  const id = Number(id_barang);
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;
  let sumberFinal = "Penambahan Stok"; 
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian (${keteranganSumber})` : "Pemberian";
  } else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `${keteranganSumber}` : "Lainnya";
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.data_barang.update({
        where: { id_barang: id },
        data: {
          stok_barang: {
            increment: jumlah,
          },
        },
      });

      await tx.data_barang_masuk.create({
        data: {
          id_barang: id,
          jumlah_barang: jumlah,
          sumber_barang: sumberFinal,
          tanggal_masuk: new Date(),
        },
      });
    });
  } catch (error) {
    return {
      message: "Gagal menambahkan stok!",
      success: false
    };
  }

  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Stok berhasil ditambahkan!", success: true };
};

export const deletePeminjamanAction = async (id_peminjaman: number) => {
  try {
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id_peminjaman },
    });

    if (!peminjaman) {
      return { message: "Data peminjaman tidak ditemukan!", success: false };
    }

    if (peminjaman.status_peminjaman !== "Dikembalikan") {
      await prisma.$transaction([
        prisma.data_barang.update({
          where: { id_barang: peminjaman.id_barang },
          data: {
            stok_barang: {
              increment: peminjaman.jumlah_peminjaman,
            },
          },
        }),
        prisma.peminjaman.delete({
          where: { id_peminjaman },
        }),
      ]);
    } else {
      await prisma.peminjaman.delete({
        where: { id_peminjaman },
      });
    }
  } catch (error) {
    console.error("Error deleting peminjaman:", error);
    return {
      message: "Gagal menghapus data peminjaman!",
      success: false,
    };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data peminjaman berhasil dihapus!", success: true };
};

export const createPeminjamanAction = async (
  prevState: any,
  formData: FormData
) => {
  // Validasi Manual karena schema peminjaman belum ada di zod.ts user
  const nomor_ktp = formData.get("nomor_ktp") as string;
  const nama_peminjam = formData.get("nama_peminjam") as string;
  const barang_id = formData.get("barang_id") as string;
  const jumlah = formData.get("jumlah") as string;
  const tanggal_pinjam = formData.get("tanggal_pinjam") as string;

  const errors: Record<string, string[]> = {};
  if (!nomor_ktp || nomor_ktp.length !== 16) errors.nomor_ktp = ["Nomor KTP harus 16 digit"];
  if (!nama_peminjam) errors.nama_peminjam = ["Nama peminjam wajib diisi"];
  if (!jumlah || Number(jumlah) <= 0) errors.jumlah = ["Jumlah harus lebih dari 0"];
  if (!tanggal_pinjam) errors.tanggal_pinjam = ["Tanggal wajib diisi"];

  if (Object.keys(errors).length > 0) {
     return { message: "Data tidak valid", error: errors, success: false };
  }

  // Lanjutkan proses jika valid...
  const kategori_peminjam = formData.get("kategori_peminjam") as string;
  const no_telp = formData.get("no_telp") as string;
  const alamat = formData.get("alamat") as string;
  const jumlahInt = parseInt(jumlah);
  const barangIdInt = parseInt(barang_id);

  try {
    const barang = await prisma.data_barang.findUnique({
      where: { id_barang: barangIdInt },
    });

    if (!barang) {
      return { message: "Barang tidak ditemukan!", success: false };
    }

    if (barang.stok_barang < jumlahInt) {
      return {
        message: `Stok tidak cukup! Sisa stok: ${barang.stok_barang}`,
        success: false,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.peminjaman.create({
        data: {
          nomor_ktp,
          kategori_peminjam,
          nama_peminjam,
          no_telepon: no_telp,
          alamat,
          id_barang: barangIdInt,
          jumlah_peminjaman: jumlahInt,
          tanggal_peminjaman: new Date(tanggal_pinjam),
          status_peminjaman: "Belum Dikembalikan",
        },
      });

      await tx.data_barang.update({
        where: { id_barang: barangIdInt },
        data: {
          stok_barang: {
            decrement: jumlahInt,
          },
        },
      });
      await tx.data_barang_keluar.create({
        data: {
          id_barang: barangIdInt,
          jumlah_keluar: jumlahInt,
          tanggal_keluar: new Date(tanggal_pinjam),
          keterangan: `Dipinjam oleh ${nama_peminjam} (${kategori_peminjam})`,
        },
      });
    });
  } catch (error) {
    console.error("Error creating peminjaman:", error);
    return { message: "Gagal membuat peminjaman!", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-keluar");
  return { message: "Peminjaman berhasil dibuat!", success: true };
};

export const returnPeminjamanAction = async (id_peminjaman: number) => {
  try {
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id_peminjaman },
    });

    if (!peminjaman) {
      return { message: "Data peminjaman tidak ditemukan!", success: false };
    }

    if (peminjaman.status_peminjaman === "Dikembalikan") {
      return {
        message: "Barang sudah dikembalikan sebelumnya!",
        success: false,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.peminjaman.update({
        where: { id_peminjaman },
        data: {
          status_peminjaman: "Dikembalikan",
        },
      });

      await tx.data_barang.update({
        where: { id_barang: peminjaman.id_barang },
        data: {
          stok_barang: {
            increment: peminjaman.jumlah_peminjaman,
          },
        },
      });
      await tx.data_barang_masuk.create({
        data: {
          id_barang: peminjaman.id_barang,
          jumlah_barang: peminjaman.jumlah_peminjaman,
          tanggal_masuk: new Date(),
          sumber_barang: `Pengembalian barang oleh ${peminjaman.nama_peminjam}`,
        },
      });
    });
  } catch (error) {
    console.error("Error returning peminjaman:", error);
    return { message: "Gagal mengembalikan barang!", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-masuk");
  return { message: "Barang berhasil dikembalikan!", success: true };
};

// --- UPDATE USER ACTION ---
export const createUserAction = async (prevState: any, formData: FormData) => {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  const validateFields = CreateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data tidak valid!",
      error: validateFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, email, password, role: roleInput } = validateFields.data;

  let role: "user" | "admin" = "user";
  if (roleInput === "Admin") {
    role = "admin";
  } else if (roleInput === "Staff Gudang") {
    role = "user";
  }

  const hashedPassword = hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return {
        message: "Email sudah terdaftar! Gunakan email lain.",
        success: false,
      };
    }
    return {
      message: "Gagal membuat user! Terjadi kesalahan server.",
      success: false,
    };
  }

  revalidatePath("/admin/dashboard/manajemen-akun");
  return { message: "User berhasil dibuat!", success: true };
};

export const updateUserAction = async (prevState: any, formData: FormData): Promise<State> => {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized", error: {} };
  }
  
  const validateFields = UpdateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Validasi Gagal",
      error: validateFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { id, name, email, role: roleInput, password } = validateFields.data;

  let role: "user" | "admin" = "user";
  if (roleInput === "Admin") {
    role = "admin";
  } else if (roleInput === "Staff Gudang") {
    role = "user";
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: id
        }
      }
    });

    if (existingUser) {
      return {
        message: "Gagal! Email tersebut sudah digunakan akun lain.",
        error: { email: ["Email sudah terdaftar"] }, 
        success: false
      };
    }

    const updateData: any = {
      name,
      email, 
      role,
    };

    if (password && password.length >= 8) { 
      updateData.password = hashSync(password, 10);
    }

    // 3. Eksekusi Update
    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (password && password.length >= 8) {
      await prisma.user.update({
        where: { id },
        data: { tokenVersion: { increment: 1 } },
      });
    }

  } catch (error) {
    console.error("Error updating user:", error);
    return {
      message: "Gagal mengupdate user!",
      success: false,
    };
  }

  revalidatePath("/admin/dashboard/manajemen-akun");
  return { message: "User berhasil diupdate!", success: true };
};

export const getDaftarSatuan = async () => {
  try {
    const data = await prisma.satuan.findMany({
      orderBy: { nama: 'asc' }
    });
    return data;
  } catch (error) {
    return [];
  }
};

export const saveSatuanAction = async (nama: string) => {
  try {
    const existing = await prisma.satuan.findUnique({
      where: { nama },
    });

    if (existing) {
      return { success: false, message: "Satuan sudah ada!" };
    }

    await prisma.satuan.create({
      data: { nama },
    });

    return { success: true, message: "Satuan berhasil disimpan" };
  } catch (error) {
    return { success: false, message: "Gagal menyimpan satuan" };
  }
};

export const deleteSatuanAction = async (nama: string) => {
  try {
    const barangCount = await prisma.data_barang.count({
      where: { satuan_barang: nama },
    });

    if (barangCount > 0) {
      return { 
        success: false, 
        message: `Gagal! Satuan "${nama}" sedang dipakai oleh ${barangCount} barang.` 
      };
    }

    await prisma.satuan.delete({
      where: { nama },
    });

    return { success: true, message: "Satuan berhasil dihapus" };
  } catch (error) {
    if ((error as any).code === 'P2025') {
       return { success: true }; 
    }
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
};

// --- UPDATE BARANG MASUK & KELUAR ---

export const updateBarangMasukAction = async (
  id_barang_masuk: number,
  prevState: unknown,
  formData: FormData
): Promise<State> => {
  const jumlah_baru = Number(formData.get("jumlah_barang"));
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;

  // Validasi Manual
  const errors: Record<string, string[]> = {};
  if (jumlah_baru <= 0) errors.jumlah_barang = ["Jumlah harus lebih dari 0"];
  if (!sumberInput) errors.sumber_barang = ["Sumber wajib dipilih"];

  if (Object.keys(errors).length > 0) {
     return { message: "Data tidak valid", error: errors, success: false };
  }

  let sumberFinal = "Stok Awal"; 
  
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian (${keteranganSumber})` : "Pemberian";
  } else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `${keteranganSumber}` : "Lainnya";
  } else {
    sumberFinal = keteranganSumber || sumberInput || "Lainnya";
  }

  try {
    const barangMasuk = await prisma.data_barang_masuk.findUnique({
      where: { id_barang_masuk },
    });

    if (!barangMasuk) {
      return { message: "Data barang masuk tidak ditemukan!", success: false };
    }

    const selisih = jumlah_baru - barangMasuk.jumlah_barang;

    if (selisih < 0) {
      const barang = await prisma.data_barang.findUnique({
        where: { id_barang: barangMasuk.id_barang },
      });

      if (!barang || barang.stok_barang + selisih < 0) {
        return {
          message:
            "Gagal update! Stok di gudang tidak mencukupi untuk pengurangan ini.",
          success: false,
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.data_barang_masuk.update({
        where: { id_barang_masuk },
        data: { 
          jumlah_barang: jumlah_baru,
          sumber_barang: sumberFinal
        },
      });

      await tx.data_barang.update({
        where: { id_barang: barangMasuk.id_barang },
        data: {
          stok_barang: {
            increment: selisih,
          },
        },
      });
    });
  } catch (error) {
    console.error("Error updating barang masuk:", error);
    return { message: "Gagal mengupdate data barang masuk!", success: false };
  }

  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data barang masuk berhasil diupdate!", success: true };
};

export const updateBarangKeluarAction = async (
  id_barang_keluar: number,
  prevState: unknown,
  formData: FormData
): Promise<State> => {
  
  // Validasi Input Manual
  const id_barang_baru = parseInt(formData.get("id_barang") as string);
  const tanggal_keluar = formData.get("tanggal_keluar") as string;
  const jumlah_baru = parseInt(formData.get("jumlah_keluar") as string);
  const keterangan = formData.get("keterangan") as string;
  const detailKeterangan = formData.get("detail_keterangan") as string;

  const errors: Record<string, string[]> = {};
  if (!id_barang_baru) errors.id_barang = ["Barang wajib dipilih"];
  if (!tanggal_keluar) errors.tanggal_keluar = ["Tanggal wajib diisi"];
  if (!jumlah_baru || jumlah_baru <= 0) errors.jumlah_keluar = ["Jumlah harus > 0"];
  if (!keterangan) errors.keterangan = ["Keterangan wajib dipilih"];

  if (Object.keys(errors).length > 0) {
    return { message: "Lengkapi data dengan benar", error: errors, success: false };
  }

  // Logika Penggabungan String Keterangan
  let keteranganFinal = keterangan;
  if (keterangan === "Diberikan") {
    keteranganFinal = detailKeterangan ? `Diberikan (${detailKeterangan})` : "Diberikan";
  } else if (keterangan === "Lainnya") {
    keteranganFinal = detailKeterangan ? `Lainnya (${detailKeterangan})` : "Lainnya";
  }

  try {
    // 1. Ambil Data Lama sebelum diupdate
    const dataLama = await prisma.data_barang_keluar.findUnique({
      where: { id_barang_keluar },
    });

    if (!dataLama) {
      return { message: "Data tidak ditemukan", success: false };
    }

    const id_barang_lama = dataLama.id_barang;
    const jumlah_lama = dataLama.jumlah_keluar;

    // 2. Cek apakah Barang Berubah?
    if (id_barang_lama !== id_barang_baru) {
      // --- SKENARIO GANTI BARANG ---
      
      // Cek stok barang baru dulu, cukup gak?
      const barangBaru = await prisma.data_barang.findUnique({ where: { id_barang: id_barang_baru }});
      if (!barangBaru || barangBaru.stok_barang < jumlah_baru) {
          return { 
            message: `Gagal: Stok barang pengganti tidak cukup (Sisa: ${barangBaru?.stok_barang || 0})`, 
            success: false 
          };
      }

      await prisma.$transaction(async (tx) => {
        // A. Kembalikan stok ke barang lama
        await tx.data_barang.update({
          where: { id_barang: id_barang_lama },
          data: { stok_barang: { increment: jumlah_lama } }
        });

        // B. Kurangi stok dari barang baru
        await tx.data_barang.update({
          where: { id_barang: id_barang_baru },
          data: { stok_barang: { decrement: jumlah_baru } }
        });

        // C. Update data transaksi
        await tx.data_barang_keluar.update({
          where: { id_barang_keluar },
          data: {
            id_barang: id_barang_baru,
            tanggal_keluar: new Date(tanggal_keluar),
            jumlah_keluar: jumlah_baru,
            keterangan: keteranganFinal, 
          },
        });
      });

    } else {
      // --- SKENARIO BARANG SAMA (Hanya Update Jumlah/Info Lain) ---
      
      const selisih = jumlah_baru - jumlah_lama;

      // Jika jumlah bertambah, cek stok gudang lagi
      if (selisih > 0) {
          const barangGudang = await prisma.data_barang.findUnique({ where: { id_barang: id_barang_baru }});
          if (!barangGudang || barangGudang.stok_barang < selisih) {
              return { message: "Gagal update: Stok gudang tidak cukup untuk penambahan ini", success: false };
          }
      }

      await prisma.$transaction(async (tx) => {
        // Update transaksi
        await tx.data_barang_keluar.update({
          where: { id_barang_keluar },
          data: {
            tanggal_keluar: new Date(tanggal_keluar),
            jumlah_keluar: jumlah_baru,
            keterangan: keteranganFinal, 
          },
        });

        // Update stok sesuai selisih (jika selisih 0, tidak perlu update stok)
        if (selisih !== 0) {
          await tx.data_barang.update({
            where: { id_barang: id_barang_baru },
            data: {
              stok_barang: { decrement: selisih }, // decrement positif = kurangi stok, decrement negatif = tambah stok
            },
          });
        }
      });
    }

    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/data-barang");
    
    return { message: "Berhasil update data barang keluar", success: true }; 

  } catch (error) {
    console.error("Error update barang keluar:", error);
    return { message: "Gagal memperbarui data", success: false };
  }
};

export const deleteBarangMasukAction = async (id_barang_masuk: number) => {
  try {
    const barangMasuk = await prisma.data_barang_masuk.findUnique({
      where: { id_barang_masuk },
    });

    if (!barangMasuk) {
      return { message: "Data barang masuk tidak ditemukan!", success: false };
    }

    const barang = await prisma.data_barang.findUnique({
      where: { id_barang: barangMasuk.id_barang },
    });

    if (!barang || barang.stok_barang < barangMasuk.jumlah_barang) {
      return {
        message:
          "Gagal hapus! Stok gudang kurang dari jumlah barang masuk ini.",
        success: false,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.data_barang_masuk.delete({
        where: { id_barang_masuk },
      });

      await tx.data_barang.update({
        where: { id_barang: barangMasuk.id_barang },
        data: {
          stok_barang: {
            decrement: barangMasuk.jumlah_barang,
          },
        },
      });
    });
  } catch (error) {
    return { message: "Gagal menghapus data!", success: false };
  }

  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data barang masuk berhasil dihapus!", success: true };
};

export const updatePeminjamanAction = async (
  id_peminjaman: number,
  prevState: unknown,
  formData: FormData
): Promise<State> => {
  // 1. Ambil Data dari Form
  const nama_peminjam = formData.get("nama_peminjam") as string;
  const kategori_peminjam = formData.get("kategori_peminjam") as string;
  const no_telepon = formData.get("no_telepon") as string;
  const alamat = formData.get("alamat") as string;
  const tanggal_pinjam_str = formData.get("tanggal_peminjaman") as string;
  
  // Konversi jumlah ke number
  const jumlah_baru = parseInt(formData.get("jumlah_peminjaman") as string);

  // 2. Validasi Manual Sederhana
  const errors: Record<string, string[]> = {};
  if (!nama_peminjam) errors.nama_peminjam = ["Nama peminjam wajib diisi"];
  if (!no_telepon) errors.no_telepon = ["Nomor telepon wajib diisi"];
  if (!alamat) errors.alamat = ["Alamat wajib diisi"];
  if (!tanggal_pinjam_str) errors.tanggal_peminjaman = ["Tanggal wajib diisi"];
  if (isNaN(jumlah_baru) || jumlah_baru <= 0) errors.jumlah_peminjaman = ["Jumlah harus lebih dari 0"];

  if (Object.keys(errors).length > 0) {
    return { message: "Data tidak valid", error: errors, success: false };
  }

  try {
    // 3. Ambil data peminjaman lama untuk cek stok
    const dataLama = await prisma.peminjaman.findUnique({
      where: { id_peminjaman },
      include: { data_barang: true }
    });

    if (!dataLama) return { message: "Data tidak ditemukan", success: false };

    // 4. Hitung selisih jumlah jika ada perubahan
    const selisih = jumlah_baru - dataLama.jumlah_peminjaman;

    // Jika jumlah pinjam bertambah, cek apakah stok gudang cukup
    if (selisih > 0) {
      if (dataLama.data_barang.stok_barang < selisih) {
        return { 
          message: `Gagal: Stok gudang tidak cukup. Sisa stok: ${dataLama.data_barang.stok_barang}`, 
          success: false 
        };
      }
    }

    // 5. Update Database Transaction
    await prisma.$transaction(async (tx) => {
      // Update data peminjaman
      await tx.peminjaman.update({
        where: { id_peminjaman },
        data: {
          nama_peminjam,
          kategori_peminjam,
          no_telepon,
          alamat,
          jumlah_peminjaman: jumlah_baru,
          tanggal_peminjaman: new Date(tanggal_pinjam_str),
        },
      });

      // Update stok barang sesuai selisih
      if (selisih !== 0) {
        await tx.data_barang.update({
          where: { id_barang: dataLama.id_barang },
          data: {
            stok_barang: {
              decrement: selisih, 
            },
          },
        });
      }
    });

  } catch (error) {
    console.error("Error update peminjaman:", error);
    return { message: "Gagal memperbarui data peminjaman", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data peminjaman berhasil diperbarui!", success: true };
};