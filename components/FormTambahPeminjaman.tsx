"use client";

import React, {
  useState,
  useActionState,
  useEffect,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import FormPageLayout, {
  FormInput,
  FormSelect,
} from "@/components/FormPageLayout";
import {
  FaIdCard,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaCalendarAlt,
  FaSortNumericUp,
} from "react-icons/fa";
import { createPeminjamanAction } from "@/lib/action";
import { updatePeminjaman, State } from "@/actions/peminjaman";

interface FormTambahPeminjamanProps {
  barangList: {
    id_barang: number;
    nama_barang: string;
    stok_barang: number;
  }[];
  initialData?: {
    id_peminjaman: number;
    nomor_ktp: string;
    kategori_peminjam: string;
    nama_peminjam: string;
    no_telepon: string;
    alamat: string;
    id_barang: number;
    jumlah_peminjaman: number;
    tanggal_peminjaman: string;
  };
  isEdit?: boolean;
}

const initialState: State = {
  message: "",
  success: false,
};

export default function FormTambahPeminjaman({
  barangList,
  initialData,
  isEdit = false,
}: FormTambahPeminjamanProps) {
  const router = useRouter();

  // Determine which action to use
  const actionToUse: (state: State, formData: FormData) => Promise<State> =
    isEdit
      ? updatePeminjaman.bind(null, initialData?.id_peminjaman || 0)
      : (createPeminjamanAction as any);

  const [state, formAction, isPending] = useActionState(
    actionToUse,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin/dashboard/pinjam-barang");
    } else if (state.message) {
      alert(state.message);
    }
  }, [state, router]);

  const [formData, setFormData] = useState({
    nomor_ktp: initialData?.nomor_ktp || "",
    kategori_peminjam: initialData?.kategori_peminjam || "Warga",
    nama_peminjam: initialData?.nama_peminjam || "",
    no_telp: initialData?.no_telepon || "",
    alamat: initialData?.alamat || "",
    barang_id: initialData?.id_barang.toString() || "",
    jumlah: initialData?.jumlah_peminjaman.toString() || "",
    tanggal_pinjam: initialData?.tanggal_peminjaman
      ? new Date(initialData.tanggal_peminjaman).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  return (
    <FormPageLayout
      title={isEdit ? "Edit Peminjaman Barang" : "Form Peminjaman Barang"}
      description={
        isEdit
          ? "Perbarui data peminjam dan barang yang dipinjam."
          : "Isi data peminjam dan barang yang akan dipinjam."
      }
      onSubmit={(e) => {
        e.preventDefault();
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataObj.append(key, value);
        });
        startTransition(() => {
          formAction(formDataObj);
        });
      }}
      isLoading={isPending}
      backLink="/admin/dashboard/pinjam-barang"
      buttonText={isEdit ? "Simpan Perubahan" : "Simpan Data"}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* DATA PEMINJAM  */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <FaUser className="text-blue-500" /> Data Peminjam
          </h3>
        </div>

        {/* Nomor KTP (Primary Key) */}
        <FormInput
          label="Nomor KTP (NIK)"
          name="nomor_ktp"
          type="text"
          placeholder="16 Digit NIK"
          value={formData.nomor_ktp}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val) && val.length <= 16) {
              setFormData({ ...formData, nomor_ktp: val });
            }
          }}
          icon={FaIdCard}
          required
          minLength={16}
          maxLength={16}
          pattern="\d{16}"
          title="NIK harus 16 digit angka"
        />

        {/* Kategori Peminjam (Enum) */}
        <FormSelect
          label="Kategori Peminjam"
          name="kategori_peminjam"
          value={formData.kategori_peminjam}
          onChange={(e) =>
            setFormData({ ...formData, kategori_peminjam: e.target.value })
          }
          icon={FaUser}
          required
        >
          <option value="Warga">Warga</option>
          <option value="Pihak Kelurahan">Pihak Kelurahan</option>
        </FormSelect>

        {/* Nama Peminjam */}
        <FormInput
          label="Nama Lengkap Peminjam"
          name="nama_peminjam"
          placeholder="Contoh: Budi Santoso"
          value={formData.nama_peminjam}
          onChange={(e) =>
            setFormData({ ...formData, nama_peminjam: e.target.value })
          }
          icon={FaUser}
          required
        />

        {/* No Telp */}
        <FormInput
          label="Nomor Telepon / WA"
          name="no_telp"
          type="tel"
          placeholder="0812xxxx"
          value={formData.no_telp}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              setFormData({ ...formData, no_telp: val });
            }
          }}
          icon={FaPhone}
          required
          minLength={10}
          maxLength={15}
          title="Nomor telepon minimal 10 digit angka"
        />

        {/* Alamat */}
        <div className="md:col-span-2">
          <FormInput
            label="Alamat Domisili"
            name="alamat"
            placeholder="Masukkan alamat lengkap..."
            value={formData.alamat}
            onChange={(e) =>
              setFormData({ ...formData, alamat: e.target.value })
            }
            icon={FaMapMarkerAlt}
            required
          />
        </div>

        {/*  DATA BARANG PINJAMAN */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <FaBoxOpen className="text-blue-500" /> Detail Peminjaman
          </h3>
        </div>

        <FormSelect
          label="Pilih Barang"
          name="barang_id"
          value={formData.barang_id}
          onChange={(e) =>
            setFormData({ ...formData, barang_id: e.target.value })
          }
          icon={FaBoxOpen}
          required
        >
          <option value="">-- Pilih Barang Inventaris --</option>
          {barangList.map((item) => (
            <option
              key={item.id_barang}
              value={item.id_barang}
              disabled={item.stok_barang === 0}
            >
              {item.nama_barang} (Stok: {item.stok_barang})
            </option>
          ))}
        </FormSelect>

        <FormInput
          label="Jumlah Barang"
          name="jumlah"
          type="number"
          placeholder="0"
          value={formData.jumlah}
          onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
          icon={FaSortNumericUp}
          required
          min={1}
          max={
            barangList.find((b) => b.id_barang === parseInt(formData.barang_id))
              ?.stok_barang || undefined
          }
        />

        {/* Tanggal Pinjam */}
        <div className="md:col-span-2">
          <FormInput
            label="Tanggal Peminjaman"
            name="tanggal_pinjam"
            type="date"
            value={formData.tanggal_pinjam}
            onChange={(e) =>
              setFormData({ ...formData, tanggal_pinjam: e.target.value })
            }
            icon={FaCalendarAlt}
            required
          />
        </div>
      </div>
    </FormPageLayout>
  );
}
