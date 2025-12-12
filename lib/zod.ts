import { object, string } from "zod";

export const SignInSchema = object({
  email: string().email("Email tidak valid"),
  password: string()
    .min(8, "Password minimal 8 karakter ")
    .max(32, "Password maksimal 32 karakter "),
});

export const RegisterSchema = object({
  name: string().min(1, "Nama harus diisi"),
  email: string().email("Email tidak valid"),
  password: string()
    .min(8, "Password minimal 8 karakter ")
    .max(32, "Password maksimal 32 karakter "),
  confirm_password: string()
    .min(8, "Password  minimal 8 karakter ")
    .max(32, "Password maksimal 32 karakter "),
}).refine((data) => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Password dan konfirmasi password tidak sesuai",
});

export const CreateItemSchema = object({
  nama_barang: string().min(1, "Nama barang harus diisi"),
  stok_barang: string()
    .min(1, "Stok barang harus diisi")
    .refine((val) => !isNaN(Number(val)), "Stok harus berupa angka")
    .refine((val) => Number(val) >= 0, "Stok tidak boleh kurang dari 0"),
  satuan_barang: string().min(1, "Satuan barang harus diisi"),
});

export const AddStockSchema = object({
  id_barang: string().min(1, "Barang harus dipilih"),
  jumlah_barang: string()
    .min(1, "Jumlah barang harus diisi")
    .refine((val) => !isNaN(Number(val)), "Jumlah harus berupa angka")
    .refine((val) => Number(val) > 0, "Jumlah harus lebih dari 0"),
});

export const CreateUserSchema = object({
  name: string().min(1, "Nama harus diisi"),
  email: string().email("Email tidak valid"),
  password: string()
    .min(6, "Password minimal 6 karakter")
    .max(32, "Password maksimal 32 karakter"),
  role: string().min(1, "Role harus dipilih"),
});
export const UpdateUserSchema = object({
  id: string().min(1, "ID user harus ada"),
  name: string().min(1, "Nama harus diisi"),
  role: string().min(1, "Role harus dipilih"),
  password: string()
    .min(6, "Password minimal 6 karakter")
    .max(32, "Password maksimal 32 karakter")
    .optional()
    .or(string().length(0)), // Allow empty string to mean "no change"
});
