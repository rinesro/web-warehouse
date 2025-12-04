import React from "react";
import { fetchAllBarang } from "@/data/barang";
import FormBarangKeluarClient from "@/components/FormBarangKeluarClient";

export default async function AddBarangKeluarPage() {
  const items = await fetchAllBarang();

  return <FormBarangKeluarClient items={items} />;
}
