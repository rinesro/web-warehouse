"use client";

import React, {
  useState,
  useEffect,
  useActionState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import FormPageLayout, {
  FormInput,
  FormSelect,
} from "@/components/FormPageLayout";
import { FaUser, FaEnvelope, FaBriefcase, FaLock } from "react-icons/fa";
import { updateUserAction } from "@/lib/action";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FormEditAkunProps {
  user: User;
}

const initialState = {
  message: "",
  success: false,
};

export default function FormEditAkun({ user }: FormEditAkunProps) {
  const router = useRouter();
  const [state, formAction, isPendingAction] = useActionState(
    updateUserAction,
    initialState
  );
  const [isPendingTransition, startTransition] = useTransition();

  const isPending = isPendingAction || isPendingTransition;

  useEffect(() => {
    if (state.success) {
      alert(state.message);
      router.push("/admin/dashboard/manajemen-akun");
    } else if (state.message) {
      alert(state.message);
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <FormPageLayout
      title="Edit Data Staff"
      description="Perbarui informasi pengguna yang terdaftar di sistem."
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        handleSubmit(formData);
      }}
      isLoading={isPending}
      backLink="/admin/dashboard/manajemen-akun"
      buttonText="Simpan Perubahan"
    >
      <input type="hidden" name="id" value={user.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <FormInput
          name="name"
          label="Nama Lengkap"
          placeholder="Contoh: Budi Santoso"
          defaultValue={user.name}
          icon={FaUser}
          required
        />

        <FormInput
          name="email"
          label="Email Kedinasan"
          type="email"
          placeholder="email@kelurahan.go.id"
          defaultValue={user.email}
          icon={FaEnvelope}
          disabled
          helperText="*Email tidak dapat diubah demi keamanan"
          helperClassName="text-red-500 font-medium"
        />

        <FormSelect
          name="role"
          label="Jabatan / Role"
          icon={FaBriefcase}
          defaultValue={user.role === "admin" ? "Admin" : "Staff Gudang"}
        >
          <option value="Staff Gudang">Staff Gudang</option>
          <option value="Admin">Admin</option>
        </FormSelect>

        <FormInput
          name="password"
          label="Password Baru (Opsional)"
          type="password"
          placeholder="Kosongkan jika tidak ingin mengubah"
          icon={FaLock}
        />
      </div>
    </FormPageLayout>
  );
}
