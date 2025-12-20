import { object, string } from "zod";

const passwordValidation = string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf Besar")
  .regex(/[a-z]/, "Harus mengandung minimal 1 huruf Kecil")
  .regex(/[0-9]/, "Harus mengandung minimal 1 Angka")
  .regex(/[\W_]/, "Harus mengandung minimal 1 Simbol (!@#$...)");

export const SignInSchema = object({
  email: string().email("Email tidak valid"),
  password: string()
    .min(8, "Password minimal 8 karakter ")
    .max(32, "Password maksimal 32 karakter "),
});

const emailValidation = string()
  .min(1, "Email harus diisi")
  .email("Format email tidak valid (harus mengandung @ dan domain)")
  .refine((val) => {
    return val.includes(".") && val.lastIndexOf(".") > val.indexOf("@");
  }, "Email harus memiliki domain yang valid (contoh: .com, .co.id)");

export const RegisterSchema = object({
  name: string().min(1, "Nama harus diisi"),
  email: emailValidation,
  password: passwordValidation,
  confirm_password: string().min(1, "Konfirmasi password harus diisi"),
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
  email: emailValidation,
  password: passwordValidation, 
  role: string().min(1, "Role harus dipilih"),
});

export const UpdateUserSchema = object({
  id: string().min(1, "ID user harus ada"),
  name: string().min(1, "Nama harus diisi"),
  email: emailValidation, 
  role: string().min(1, "Role harus dipilih"),
  password: string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const isStrong =
        val.length >= 8 &&
        /[A-Z]/.test(val) &&
        /[a-z]/.test(val) &&
        /[0-9]/.test(val) &&
        /[\W_]/.test(val);
      return isStrong;
    }, "Password baru harus: Min 8 kar, Ada Huruf Besar, Kecil, Angka & Simbol"),
});