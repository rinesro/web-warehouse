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
import { createUserAction } from "@/lib/action";

const initialState = {
  message: "",
  success: false,
};

export default function FormTambahAkun() {
  const router = useRouter();
  const [state, formAction, isPendingAction] = useActionState(
    createUserAction,
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
      title="Tambah Staff Baru"
      description="Lengkapi data di bawah ini untuk mendaftarkan pengguna baru ke sistem gudang."
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        handleSubmit(formData);
      }}
      isLoading={isPending}
      backLink="/admin/dashboard/manajemen-akun"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <FormInput
          name="name"
          label="Nama Lengkap"
          placeholder="Contoh: Budi Santoso"
          icon={FaUser}
          required
        />

        <FormInput
          name="email"
          label="Email Kedinasan"
          type="email"
          placeholder="email@kelurahan.go.id"
          icon={FaEnvelope}
          required
        />

        <FormSelect name="role" label="Jabatan / Role" icon={FaBriefcase}>
          <option value="Staff Gudang">Staff Gudang</option>
          <option value="Admin">Admin</option>
        </FormSelect>

        <FormInput
          name="password"
          label="Password Awal"
          type="password"
          placeholder="Minimal 6 karakter"
          icon={FaLock}
          required
        />
      </div>
    </FormPageLayout>
  );
}
