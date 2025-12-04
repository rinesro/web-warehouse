"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Column } from "@/components/Table";
import { FaUserPlus, FaUsersCog } from "react-icons/fa";
import DeleteModal from "@/components/DeleteModal";
import { deleteUser } from "@/actions/user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ManajemenAkunClientProps {
  data: User[];
  totalPages: number;
  totalItems: number;
}

export default function ManajemenAkunClient({
  data,
  totalPages,
  totalItems,
}: ManajemenAkunClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<User>[] = [
    {
      header: "No",
      cell: (_, index) => (
        <span className="font-semibold text-gray-600">
          {(currentPage - 1) * 5 + index + 1}
        </span>
      ),
    },
    { header: "Nama Lengkap", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Role / Jabatan",
      accessorKey: "role",
      cell: (item) => {
        const isAdmin = item.role.toLowerCase() === "admin";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              isAdmin
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isAdmin ? "Admin" : "Staff Gudang"}
          </span>
        );
      },
    },
  ];

  const handleAdd = () => {
    router.push("/admin/dashboard/manajemen-akun/add");
  };

  const handleEdit = (user: User) => {
    router.push(`/admin/dashboard/manajemen-akun/edit/${user.id}`);
  };

  const onClickDeleteIcon = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);

    try {
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        alert(result.message);
        router.refresh(); // Refresh data table
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Terjadi kesalahan saat menghapus user");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
            <FaUsersCog size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Akun</h1>
            <p className="text-gray-500 text-sm">
              Kelola data pengguna sistem gudang kelurahan
            </p>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
        >
          <FaUserPlus />
          Tambah Staff
        </button>
      </div>

      <Table<User>
        title="Data Akun Staff"
        data={data}
        columns={columns}
        onEdit={handleEdit}
        onDelete={onClickDeleteIcon}
        searchPlaceholder="Cari nama atau email..."
        itemsPage={5}
        entryLabel="staff"
        totalPages={totalPages}
        totalItems={totalItems}
        sortOptions={[
          { label: "Nama (A-Z)", value: "name-asc" },
          { label: "Nama (Z-A)", value: "name-desc" },
          { label: "Role (A-Z)", value: "role-asc" },
        ]}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Akun Pengguna"
        itemName={selectedUser?.name}
        message="Apakah Anda yakin ingin menghapus akun ini? Pengguna tidak akan bisa login lagi ke dalam sistem."
      />
    </div>
  );
}
