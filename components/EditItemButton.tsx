"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateItemAction } from "@/lib/action";
import { useFormStatus } from "react-dom";
import { FaEdit } from "react-icons/fa";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
    >
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  );
};

interface EditItemProps {
  item: {
    id_barang: number;
    nama_barang: string;
    stok_barang: number;
    satuan_barang: string;
    is_stock_bulanan: boolean;
  };
}

export default function EditItemButton({ item }: EditItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateItemWithId = updateItemAction.bind(null, item.id_barang);
  const [state, formAction] = useActionState(updateItemWithId, null);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Barang"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h2 className="text-lg font-bold">Edit Barang</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {state?.message && !state.success && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                  {state.message}
                </div>
              )}

              <form action={formAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    name="nama_barang"
                    defaultValue={item.nama_barang}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {state?.error?.nama_barang && (
                    <p className="text-red-500 text-xs mt-1">
                      {state.error.nama_barang}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      name="stok_barang"
                      defaultValue={item.stok_barang}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {state?.error?.stok_barang && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.stok_barang}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      name="satuan_barang"
                      defaultValue={item.satuan_barang}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {state?.error?.satuan_barang && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.satuan_barang}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    name="is_stock_bulanan"
                    id="edit_is_stock_bulanan"
                    defaultChecked={item.is_stock_bulanan}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="edit_is_stock_bulanan"
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Stok Bulanan (Barang Habis Pakai)
                  </label>
                </div>

                <div className="pt-2">
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
