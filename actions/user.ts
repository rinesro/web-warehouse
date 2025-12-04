"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";

export async function deleteUser(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  try {
    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false, message: "User tidak ditemukan" };
    }

    // Hapus user
    await prisma.user.delete({
      where: { id },
    });

    // Revalidate halaman manajemen akun
    revalidatePath("/admin/dashboard/manajemen-akun");

    return { success: true, message: "User berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Gagal menghapus user" };
  }
}
