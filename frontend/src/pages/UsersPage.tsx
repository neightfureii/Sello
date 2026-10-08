import { useCallback, useEffect, useState } from "react";
import { api, apiUrl, type User } from "../api";
import { useToast } from "../context/ToastContext";
import { PencilIcon, TrashIcon, User2, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import EditUserModal from "../components/EditUserModal";

export default function UsersPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // delete item
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

      showToast("Successfully deleted item", "success");
      setDeleteModalOpen(false);
      setItemToDeleteId(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Error performing deletion", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Load users
  const loadData = useCallback(() => {
    // Fetch users list
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

  return (
    <div className="flex flex-col gap-6 p-6">
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
              {users.length > 0 ? (
                users.map((u) => (
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
                          disabled={user?.id == u.id}
                        >
                          <TrashIcon
                            className={`${user?.id == u.id ? "text-gray-200" : "text-red-500"}`}
                          />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
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
