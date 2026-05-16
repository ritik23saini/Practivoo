"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "react-toastify";

interface SchoolProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  endDate: string;
  startDate: string;
  maxStudent: number;
  maxTeacher: number;
  image?: string;
}

export default function Profile() {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<SchoolProfile>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchSchool = async () => {
      try {


        const response = await fetch(`/api/schools`, { credentials: "include" });
        if (!response.ok) {
          console.error("Failed to fetch school:", response.statusText);
          return;
        }
        const schoolData = await response.json();
        setSchoolProfile(schoolData);
        setEditForm({
          name: schoolData.name,
          phone: schoolData.phone,
          address: schoolData.address,
          status: schoolData.status,
          startDate: schoolData.startDate ? schoolData.startDate.slice(0, 10) : "",
          endDate: schoolData.endDate ? schoolData.endDate.slice(0, 10) : "",
          image: schoolData.image || "",
        });
      } catch (error) {
        console.log("Error fetching school:", error);
        toast.error("Failed to fetch school")
      }
    };

    fetchSchool();
  }, []);


  // Edit update function provided by user
  const handleEdit = async () => {
    if (!schoolProfile) return;
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schoolProfile._id, ...editForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setSchoolProfile(data.data);
        setEditing(false);
        toast.success('School updated');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Server error');
    }
  };

  // File upload handler from user, adapted
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (!file || !schoolProfile) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    try {
      // Upload to S3 → Get NEW URL
      const imageRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const imageData = await imageRes.json();

      if (!imageData.url) {
        throw new Error("Upload failed - no URL");
      }

      const res = await fetch('/api/admin/schools', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schoolProfile._id,
          image: imageData.url,
          ...editForm
        }),
      });

      if (res.ok && imageData.url) {
        setEditForm({ ...editForm, image: imageData.url });
        setPreviewImage(imageData.url);  // Immediately update preview with uploaded image URL
      } else {
        setPreviewImage(null);
        toast.error("Upload failed");
      }
    } catch (err) {
      setPreviewImage(null);
      toast.error("Upload failed");
    }
    finally {
      URL.revokeObjectURL(previewUrl);  // Memory cleanup
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full min-h-svh p-10 mx-auto max-w-lg">

        <div className="flex flex-col items-center mb-6">
          <img
            src={previewImage || editForm.image || schoolProfile?.image || "/user.png"}
            alt="Profile Picture"
            className="w-32 h-32 rounded-full border-4 border-[#0046D2] object-cover"
          />
          {editing && (
            <label className="mt-4 cursor-pointer text-[#0046D2] hover:underline text-sm font-medium">
              Upload New Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        <h1 className="flex text-3xl justify-center text-center py-5">Profile Details</h1>

        <div className="space-y-4">
          {/* Name */}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={editForm.name || ""}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0046D2] ${editing ? "" : "bg-gray-100 cursor-not-allowed"
                }`}
              readOnly={!editing}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={schoolProfile?.email || ""}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1">Phone</label>
            <input
              id="phone"
              type="text"
              value={editForm.phone || ""}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0046D2] ${editing ? "" : "bg-gray-100 cursor-not-allowed"
                }`}
              readOnly={!editing}
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold mb-1">Address</label>
            <input
              id="address"
              type="text"
              value={editForm.address || ""}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0046D2] ${editing ? "" : "bg-gray-100 cursor-not-allowed"
                }`}
              readOnly={!editing}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>

            <p className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${editForm.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
              {editForm.status || "Unknown"}
            </p>

          </div>

          {/* Dates */}
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-semibold mb-1">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={editForm.startDate || ""}
                //onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0046D2] ${editing ? "" : "bg-gray-100 cursor-not-allowed"
                  }`}
                readOnly
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-semibold mb-1">End Date</label>
              <input
                id="endDate"
                type="date"
                value={editForm.endDate || ""}
                //onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0046D2] ${editing ? "" : "bg-gray-100 cursor-not-allowed"
                  }`}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Edit / Save buttons */}
        {!editing ? (
          <button
            className="mt-8 w-full bg-[#0046D2] text-white py-2 rounded-lg font-semibold hover:bg-[#0033a0] transition"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleEdit}
              className="flex-1 bg-[#0046D2] text-white py-2 rounded-lg font-semibold hover:bg-[#0033a0] transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditing(false);
                // Reset form to original values on cancel
                if (schoolProfile) {
                  setEditForm({
                    name: schoolProfile.name,
                    phone: schoolProfile.phone,
                    address: schoolProfile.address,
                    status: schoolProfile.status,
                    startDate: schoolProfile.startDate.slice(0, 10),
                    endDate: schoolProfile.endDate.slice(0, 10),
                    image: schoolProfile.image || "",
                  });
                  setPreviewImage(null);
                }
              }}
              className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
