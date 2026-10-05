import { useCallback, useEffect, useState } from "react";
import { api, type Shop, type User } from "../api";
import { useToast } from "../context/ToastContext";
import { UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ShopsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);

  // Load users and shops
  const loadData = useCallback(() => {
    // Fetch shops list for dropdown selection
    api<{ shops: Shop[] } | Shop[]>("/shops")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.shops;
        setShops(data || []);
      })
      .catch((err) => showToast(err.message || "Failed to load shops", "error"));
  }, [showToast]);

  useEffect(loadData, [loadData]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Header & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-sello-blue flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Shops</h2>
            <p className="text-xs text-gray-500 font-medium">Manage shop details</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/shops/add-shop")}
          className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          Add Shop
        </button>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f4fa] text-gray-700 text-xs font-extrabold border-b border-gray-100">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {shops.length > 0 ? (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {shop.imageUrl ? (
                          <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={16} className="text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{shop.name}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{shop.location}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-50 text-sello-blue font-bold text-xs rounded-full uppercase tracking-wide">
                        {shop.type}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm font-medium">
                    No staff accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}