"use server";

import {
  RegisterSchema,
  SignInSchema,
  CreateItemSchema,
  AddStockSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "./zod";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcrypt-ts";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";

// Ini function untuk handle loginnya.
export const signInAction = async (prevState: unknown, formData: FormData) => {
  const validateFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validateFields.data;

  try {
    // Ini function dari next-auth untuk handle login.
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/dashboard",
    });
  } catch (error) {
    // Ini function dari next-auth untuk handle error.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email atau Password salah!" };
        default:
          return { message: "Terjadi kesalahan pada server." };
      }
    }
    throw error;
  }
};

// Ini function untuk handle register.
export const signUpAction = async (prevState: unknown, formData: FormData) => {
  const validateFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
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
    };
  }

  redirect("/login");
};

export const logoutAction = async () => {
  await signOut({ redirectTo: "/login" });
};

export const createItemAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const validateFields = CreateItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    };
  }

  const { nama_barang, stok_barang, satuan_barang } = validateFields.data;

  // Map "periode" radio button to is_stock_bulanan
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
  try {
    await prisma.$transaction(async (tx) => {
      const newItem = await tx.data_barang.create({
        data: {
          nama_barang,
          stok_barang: stokAwal,
          satuan_barang,
          is_stock_bulanan,
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
    };
  }

  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Barang berhasil ditambahkan!", success: true };
};

export const updateItemAction = async (
  id_barang: number,
  prevState: unknown,
  formData: FormData
) => {
  const validateFields = CreateItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    };
  }

  const { nama_barang, stok_barang, satuan_barang } = validateFields.data;
  const is_stock_bulanan = formData.get("is_stock_bulanan") === "on";

  try {
    await prisma.data_barang.update({
      where: { id_barang },
      data: {
        nama_barang,
        stok_barang: Number(stok_barang),
        satuan_barang,
        is_stock_bulanan,
      },
    });
  } catch (error) {
    return {
      message: "Gagal mengupdate barang!",
    };
  }

  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-masuk");  
  revalidatePath("/admin/dashboard/barang-keluar"); 
  revalidatePath("/admin/dashboard/pinjam-barang");
  return { message: "Barang berhasil diupdate!", success: true };
};

export const deleteItemAction = async (id_barang: number) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.data_barang_masuk.deleteMany({
        where: { id_barang },
      });

      await tx.data_barang_keluar.deleteMany({
        where: { id_barang },
      });

      await tx.peminjaman.deleteMany({
        where: { id_barang },
      });
      await tx.data_barang.delete({
        where: { id_barang },
      });
    });

    revalidatePath("/admin/dashboard/data-barang");
    return { message: "Barang beserta seluruh riwayatnya berhasil dihapus!", success: true };
  } catch (error: any) {
    console.error("Error deleting item:", error);
    return {
      message: "Gagal menghapus barang! Terjadi kesalahan sistem.",
      success: false,
    };
  }
};
export const addStockAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const validateFields = AddStockSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    };
  }

  const { id_barang, jumlah_barang } = validateFields.data;
  const jumlah = Number(jumlah_barang);
  const id = Number(id_barang);
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;
  let sumberFinal = "Penambahan Stok"; // Default fallback
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian (${keteranganSumber})` : "Pemberian";
  } else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `Lainnya (${keteranganSumber})` : "Lainnya";
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update stock in Data_barang
      await tx.data_barang.update({
        where: { id_barang: id },
        data: {
          stok_barang: {
            increment: jumlah,
          },
        },
      });

      // 2. Create record in Data_barang_masuk
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

    // Jika status belum dikembalikan, kembalikan stok dulu
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
      // Jika sudah dikembalikan, langsung hapus aja (stok aman)
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
    // Check stock first
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

    // Transaction: Create Peminjaman & Update Stock
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
    // 1. Get the loan details first to know how much to return
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

    // 2. Transaction: Update status & Restore stock
    await prisma.$transaction(async (tx) => {
      // Update status
      await tx.peminjaman.update({
        where: { id_peminjaman },
        data: {
          status_peminjaman: "Dikembalikan",
          // Optional: You might want to track return date here if you add a field for it
        },
      });

      // Restore stock
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
          tanggal_masuk: new Date(), // Tanggal hari ini
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

export const updateBarangMasukAction = async (
  id_barang_masuk: number,
  prevState: unknown,
  formData: FormData
) => {
  const jumlah_baru = Number(formData.get("jumlah_barang"));

  if (jumlah_baru <= 0) {
    return { message: "Jumlah barang harus lebih dari 0!", success: false };
  }

  try {
    const barangMasuk = await prisma.data_barang_masuk.findUnique({
      where: { id_barang_masuk },
    });

    if (!barangMasuk) {
      return { message: "Data barang masuk tidak ditemukan!", success: false };
    }

    const selisih = jumlah_baru - barangMasuk.jumlah_barang;

    // Check if stock is sufficient for reduction
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
      // Update Barang Masuk
      await tx.data_barang_masuk.update({
        where: { id_barang_masuk },
        data: { jumlah_barang: jumlah_baru },
      });

      // Update Stock
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

export const deleteBarangMasukAction = async (id_barang_masuk: number) => {
  try {
    const barangMasuk = await prisma.data_barang_masuk.findUnique({
      where: { id_barang_masuk },
    });

    if (!barangMasuk) {
      return { message: "Data barang masuk tidak ditemukan!", success: false };
    }

    // Check if stock is sufficient for deletion
    const barang = await prisma.data_barang.findUnique({
      where: { id_barang: barangMasuk.id_barang },
    });

    if (!barang || barang.stok_barang < barangMasuk.jumlah_barang) {
      return {
        message:
          "Gagal hapus! harap hapus dihalaman data barang ( jika data barang ingin dihapus).",
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
    console.error("Error deleting barang masuk:", error);
    return { message: "Gagal menghapus data barang masuk!", success: false };
  }

  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data barang masuk berhasil dihapus!", success: true };
};

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
      message: "Data tidak valid! Periksa kembali inputan anda.",
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

export const updateUserAction = async (prevState: any, formData: FormData) => {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  const validateFields = UpdateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data tidak valid! Periksa kembali inputan anda.",
      error: validateFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { id, name, role: roleInput, password } = validateFields.data;

  let role: "user" | "admin" = "user";
  if (roleInput === "Admin") {
    role = "admin";
  } else if (roleInput === "Staff Gudang") {
    role = "user";
  }

  const updateData: any = {
    name,
    role,
  };

  if (password && password.length >= 6) {
    updateData.password = hashSync(password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      message: "Gagal mengupdate user! Terjadi kesalahan server.",
      success: false,
    };
  }

  revalidatePath("/admin/dashboard/manajemen-akun");
  return { message: "User berhasil diupdate!", success: true };
};
