"use client";

import { useState, useEffect } from "react";
import { FiChevronRight, FiShield, FiEye, FiEyeOff } from "react-icons/fi";

interface AdminDetails {
  email: string;
}

interface ApiResponse {
  admin?: AdminDetails;
  message?: string;
  error?: string;
}

interface FormData {
  newEmail: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPasswords {
  new: boolean;
  confirm: boolean;
}

interface Message {
  type: "success" | "error" | "";
  text: string;
}

export default function SettingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });
  const [userDetails, setUserDetails] = useState<AdminDetails & { maskedEmail: string }>({
    email: "",
    maskedEmail: "",
  });

  // Fetch admin details on mount - matches your GET /api/admin/settings
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data: ApiResponse = await response.json();

        if (response.ok && data.admin) {
          const maskedEmail = `${data.admin.email.split("@")[0].slice(0, 3)}****@${data.admin.email.split("@")[1]}`;
          setUserDetails({
            email: data.admin.email,
            maskedEmail,
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin details", error);
      }
    };
    fetchAdminDetails();
  }, []);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Client-side validation matching your API
    if (formData.newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.newEmail) || formData.newEmail.length > 50) {
        setMessage({ type: "error", text: "Invalid email format or too long (max 50 chars)" });
        setLoading(false);
        return;
      }
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match" });
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
        setMessage({ type: "error", text: "Password must be 8-16 characters" });
        setLoading(false);
        return;
      }
    }

    try {
      const updateData: Record<string, string> = {};

      if (formData.newEmail) {
        updateData.newEmail = formData.newEmail;
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: "error", text: "No changes to update" });
        setLoading(false);
        return;
      }

      // Matches your PATCH /api/admin/settings exactly
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Admin updated successfully!" });
        setShowForm(false);
        setFormData({
          newEmail: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswords({ new: false, confirm: false });

        // Refresh user details from response
        if (data.admin) {
          const maskedEmail = `${data.admin.email.split("@")[0].slice(0, 3)}****@${data.admin.email.split("@")[1]}`;
          setUserDetails(prev => ({
            ...prev,
            email: data.admin!.email,
            maskedEmail,
          }));
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update admin" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Settings</h1>

      {/* Account Settings */}
      <div className="border-t border-gray-300 pt-4 space-y-6">
        <h2 className="text-sm font-semibold underline underline-offset-2 text-gray-700">
          Admin Account
        </h2>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-3 rounded-md text-sm ${message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Admin Update Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiShield className="text-gray-600" />
              <h3 className="text-base font-medium text-gray-800">
                {!showForm ? "Admin Details" : "Update Admin"}
              </h3>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                Update
                <FiChevronRight className="text-xs" />
              </button>
            )}
          </div>

          {!showForm ? (
            <div className="space-y-4">
              <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded-md">
                Email: {userDetails.maskedEmail}
              </div>
              <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded-md">
                Password: *********
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              {/* Email Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email (leave blank to keep current)
                </label>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    Current: {userDetails.maskedEmail}
                  </div>
                  <input
                    type="email"
                    placeholder="Enter new email "
                    value={formData.newEmail}
                    onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="New password (8-16 characters)"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      minLength={8}
                      maxLength={16}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      minLength={8}
                      maxLength={16}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Leave blank to keep current password (8-16 chars)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      newEmail: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setShowPasswords({ new: false, confirm: false });
                    setMessage({ type: "", text: "" });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Updating..." : "Update Admin"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}