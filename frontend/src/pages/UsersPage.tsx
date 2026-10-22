import { useCallback, useEffect, useState } from "react";
import { api, apiUrl, type User } from "../api";
import { useToast } from "../context/ToastContext";
import { PencilIcon, TrashIcon, User2, UserPlus, Users, Search, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EditUserModal from "../components/EditUserModal";

export default function UsersPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role">("name");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAction = async () => {
    if (!itemToDeleteId) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        apiUrl(`/auth/users/${itemToDeleteId}/delete`),
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to delete item");

      showToast("Successfully deleted user", "success");
      setDeleteModalOpen(false);
      setItemToDeleteId(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Error performing deletion", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadData = useCallback(() => {
    api<{ users: User[] } | User[]>("/auth/users")
      .then((d) => {
        const data = Array.isArray(d) ? d : d?.users;
        setUsers(data || []);
      })
      .catch((err) =>
        showToast(err.message || "Failed to load users", "error"),
      );
  }, [showToast]);

  useEffect(loadData, [loadData]);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
    if (sortBy === "role") return a.role.localeCompare(b.role);
    return 0;
  });

  return (
    <div className="flex flex-col gap-6 p-6 relative">
      {/* Top Header & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-sello-blue flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              User Accounts
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Manage cashiers, managers, and system administrators
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/users/add-user")}
          className="bg-sello-blue text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 text-sm flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          Add Staff Account
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#e5edfa] border border-transparent focus:bg-white focus:border-sello-blue outline-none rounded-full py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-500 font-medium transition-all"
          />
        </div>

        <div className="relative">
          <div
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 bg-[#e5edfa] hover:bg-blue-100/70 text-gray-700 px-4 py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer select-none"
          >
            <ArrowUpDown size={16} className="text-gray-500" />
            <span>Sort: {sortBy === "name" ? "Name" : "Role"}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-30">
              {[
                { id: "name", label: "Name (A-Z)" },
                { id: "role", label: "System Role" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id as any);
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between hover:bg-blue-50 text-gray-700 transition-colors cursor-pointer"
                >
                  {option.label}
                  {sortBy === option.id && <Check size={14} className="text-sello-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f4fa] text-gray-700 text-xs font-extrabold border-b border-gray-100">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Assigned Shop</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {u.imageUrl ? (
                          <img
                            src={u.imageUrl}
                            alt={u.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User2 size={16} className="text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-gray-900">
                        {u.fullName}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {u.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-50 text-sello-blue font-bold text-xs rounded-full uppercase tracking-wide">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">
                      {u.shop?.name || "Global / Unassigned"}
                    </td>
                    <td className="py-4 px-6">
                      {user?.id !== u.id && (
                        <span className="flex gap-8 justify-end mr-10">
                          <button
                            className="hover:cursor-pointer"
                            onClick={() => {
                              setEditUserModalOpen(true);
                              setSelectedUser(u);
                            }}
                          >
                            <PencilIcon className="text-sello-blue" />
                          </button>
                          <button
                            className="hover:cursor-pointer"
                            onClick={() => {
                              setItemToDeleteId(u.id);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <TrashIcon className="text-red-500" />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-400 text-sm font-medium"
                  >
                    No staff accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editUserModalOpen && (
        <EditUserModal
          user={selectedUser}
          isOpen={editUserModalOpen}
          onClose={() => {
            setEditUserModalOpen(false);
            setSelectedUser(null);
          }}
          onEditComplete={() => {
            loadData();
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          title="Delete User"
          message="Are you sure you want to deactivate or remove this user?"
          confirmText="Yes, Delete"
          loading={isDeleting}
          onClose={() => {
            setDeleteModalOpen(false);
            setItemToDeleteId(null);
          }}
          onConfirm={handleDeleteAction}
        />
      )}
    </div>
  );
}