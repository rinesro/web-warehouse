import React from "react";
import ManajemenAkunClient from "@/components/ManajemenAkunClient";
import { fetchUsers, fetchTotalUsers, fetchUsersPages } from "@/data/user";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ManajemenAkunPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.query || "";
  const currentPage = Number(params.page) || 1;
  const sort = params.sort || "";
  const itemsPerPage = 5;

  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const data = await fetchUsers(query, currentPage, itemsPerPage, sort);
  const totalPages = await fetchUsersPages(query, itemsPerPage);
  const totalItems = await fetchTotalUsers(query);

  // Map data
  const formattedData = data.map((user) => ({
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  return (
    <ManajemenAkunClient
      data={formattedData}
      totalPages={totalPages}
      totalItems={totalItems}
    />
  );
}
