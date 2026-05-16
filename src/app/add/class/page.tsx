"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import Select from "react-select";
import { toast } from "react-toastify";
import { Pencil, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClassPage() {
  const [className, setClassName] = useState("");
  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [levelCode, setLevelCode] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolLevels, setSchoolLevels] = useState<any[]>([]);
  const [newClasses, setNewClasses] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const [isNewClass, setIsNewClass] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  useEffect(() => {
    fetch("/api/teachers", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          console.log(res)
          router.push('/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setTeachers(data.teachers || []);
      })
      .catch((err) => {
        console.error("Error fetching teachers:", err);
      });

    fetch(`/api/levels`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          console.log(res)
          router.push('/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setSchoolLevels(data || []);
      })
      .catch((err) => console.error("Error fetching levels:", err));

    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`/api/classes`, { credentials: "include" });
      const data = await res.json();
      setNewClasses(data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const handleAddClass = async () => {
    if (!className || teacherIds.length === 0 || !levelCode) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          teachers: teacherIds,
          levelCode,

        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error adding class");
      } else {
        toast.success("Class added successfully!");
        resetForm();
        await fetchClasses();
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Error adding class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = async () => {
    if (!className || teacherIds.length === 0 || !levelCode || !selectedClassId) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          name: className,
          teachers: teacherIds,
        }),
      });
      console.log({
        classId: selectedClassId,
        name: className,
        teachers: teacherIds,
      })
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error updating class");
      } else {
        toast.success("Class updated successfully!");
        resetForm();
        await fetchClasses();
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Error updating class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/classes?classId=${classToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error deleting class");
        setShowDeleteModal(false);

      } else {
        toast.success("Class deleted successfully!");
        setShowDeleteModal(false);
        setClassToDelete(null);
        await fetchClasses();
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Error deleting class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacherToExisting = async () => {
    if (!selectedClassId || teacherIds.length === 0) {
      toast.error("Please select a class and at least one teacher");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/classes`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          teachers: teacherIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error adding teachers to class");
      } else {
        toast.success(data.message);
        resetForm();
        await fetchClasses();
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error("Error adding teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditClass = (cls: any) => {
    setIsEditing(true);
    setIsNewClass(true);
    setSelectedClassId(cls._id);
    setClassName(cls.name);
    setLevelCode(cls.level);
    setTeacherIds(cls.teachers?.map((t: any) => t._id || t) || []);
  };

  const startDeleteClass = (cls: any) => {
    setClassToDelete(cls);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setClassName("");
    setTeacherIds([]);
    setLevelCode("");
    setSelectedClassId("");
    setIsEditing(false);
  };

  const filteredClasses =
    selectedFilter === "All"
      ? newClasses
      : newClasses.filter((cls) => cls.level === selectedFilter);

  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: t.name,
  }));

  const classOptions = newClasses.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.level})`,
  }));

  const selectedTeacherValues = teacherOptions.filter((t) =>
    teacherIds.includes(t.value)
  );

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Section */}
        <div className="flex-1">
          {/* Toggle Button */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => {
                setIsNewClass(true);
                resetForm();
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${isNewClass
                ? "bg-white text-gray-900 shadow"
                : "bg-transparent text-gray-600"
                }`}
            >
              {isEditing ? "Edit Class" : "Add New Class"}
            </button>
            <button
              onClick={() => {
                setIsNewClass(false);
                resetForm();
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${!isNewClass
                ? "bg-white text-gray-900 shadow"
                : "bg-transparent text-gray-600"
                }`}
            >
              Add to Existing Class
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              {isEditing
                ? "Edit Class"
                : isNewClass
                  ? "Add New Class"
                  : "Add Teachers to Existing Class"}
            </h1>
            {isEditing && (
              <button
                onClick={resetForm}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X size={16} />
                Cancel Edit
              </button>
            )}
          </div>

          {/* Conditional Rendering based on toggle */}
          {isNewClass ? (
            <>
              {/* Add/Edit Class Form */}
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0046D2]"
                />
                {!isEditing && <select
                  value={levelCode}
                  onChange={(e) => setLevelCode(e.target.value)}
                  className="px-4 py-2 border rounded-md text-sm w-40 focus:outline-none focus:ring-2 focus:ring-[#0046D2]"
                >
                  <option disabled value="">
                    Select Level
                  </option>
                  {Array.isArray(schoolLevels) && schoolLevels.map((lvl) => (
                    <option key={lvl._id} value={lvl.customName}>
                      {lvl.customName}
                    </option>
                  ))}
                </select>}
              </div>

              <div className="mb-4">
                <Select
                  options={teacherOptions}
                  onChange={(selected) => {
                    const ids = selected ? selected.map((item) => item.value) : [];
                    setTeacherIds(ids);
                  }}
                  value={selectedTeacherValues}
                  placeholder="Select teachers..."
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={isEditing ? handleEditClass : handleAddClass}
                  disabled={loading}
                  className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003399] transition-colors"
                >
                  {loading
                    ? isEditing
                      ? "Updating..."
                      : "Adding..."
                    : isEditing
                      ? "Update Class"
                      : "Add Class"}
                </button>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Add Teachers to Existing Class Form */}
              <div className="mb-4">
                <Select
                  options={classOptions}
                  onChange={(selected) => {
                    setSelectedClassId(selected?.value || "");
                    setTeacherIds([]);
                  }}
                  value={classOptions.find((c) => c.value === selectedClassId) || null}
                  placeholder="Select existing class..."
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="mb-4">
                <Select
                  options={teacherOptions}
                  onChange={(selected) => {
                    const ids = selected ? selected.map((item) => item.value) : [];
                    setTeacherIds(ids);
                  }}
                  value={selectedTeacherValues}
                  placeholder="Select teachers to add..."
                  isMulti
                  isClearable
                  closeMenuOnSelect={false}
                  className="text-sm"
                  classNamePrefix="react-select"
                  isDisabled={!selectedClassId}
                />
              </div>

              <button
                onClick={handleAddTeacherToExisting}
                disabled={loading || !selectedClassId}
                className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003399] transition-colors"
              >
                {loading ? "Adding..." : "Add Teachers to Class"}
              </button>
            </>
          )}
        </div>

        {/* Right Section - Class List */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">
            Classes ({filteredClasses.length})
          </h2>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedFilter === "All"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              All
            </button>
            {Array.isArray(schoolLevels) && schoolLevels.map((lvl) => (
              <button
                key={lvl._id}
                onClick={() => setSelectedFilter(lvl.customName)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedFilter === lvl.customName
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                {lvl.customName}
              </button>
            ))}
          </div>

          {/* Class List */}
          <div className="space-y-2 pt-2 max-h-[500px] overflow-y-auto">
            {filteredClasses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No classes found
              </p>
            ) : (
              filteredClasses.map((cls) => (
                <div
                  key={cls._id}
                  className={`w-full flex justify-between items-center px-4 py-2 border rounded-full text-sm font-medium transition-all ${isEditing && selectedClassId === cls._id
                    ? "border-[#0046D2] bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                    }`}
                >
                  <div className="flex-1 truncate">
                    <span className="text-base font-bold text-gray-800">
                      {cls.name}
                    </span>
                    <span className="ml-2 text-gray-600">({cls.level})</span>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => startEditClass(cls)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Edit class"
                    >
                      <Pencil
                        className="cursor-pointer text-gray-600 hover:text-[#0046D2]"
                        size={18}
                      />
                    </button>
                    <button
                      onClick={() => startDeleteClass(cls)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete class"
                    >
                      <Trash
                        className="cursor-pointer text-gray-600 hover:text-red-600"
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0   bg-black opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Class
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{classToDelete?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setClassToDelete(null);
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
