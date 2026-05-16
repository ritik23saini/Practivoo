"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

type Category = {
  _id: string;
  name: string;
  subcategories: string[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<{ name: string; subcategories: string[] }>({
    name: "",
    subcategories: [""],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/admin/categories", { credentials: "include" });
    const json = await res.json();
    if (json.success) setCategories(json.data);
  }

  function handleFormChange(index: number, value: string) {
    const subs = [...form.subcategories];
    subs[index] = value;
    setForm({ ...form, subcategories: subs });
  }

  function addSubCategory() {
    setForm({ ...form, subcategories: [...form.subcategories, ""] });
  }

  function removeSubCategory(index: number) {
    const subs = form.subcategories.filter((_, i) => i !== index);
    setForm({ ...form, subcategories: subs });
  }

  async function handleSubmit() {
    const method = isEditing ? "PUT" : "POST";
    const body = isEditing ? { ...form, id: selectedCategory?._id } : form;

    const res = await fetch("/api/admin/categories", {
      method,
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fetchCategories();
      setShowForm(false);
      setIsEditing(false);
      setForm({ name: "", subcategories: [""] });
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category._id }),
    });
    const data = (await res.json())
    toast.error(data.message, { autoClose: 4000 })
    fetchCategories();
  }

  function handleEdit(category: Category) {
    setSelectedCategory(category);
    setForm({ name: category.name, subcategories: category.subcategories });
    setIsEditing(true);
    setShowForm(true);
  }

  return (
    <div className="flex p-6 gap-6">
      {/* Left Panel */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📂 Categories</h2>
          <button
            className="bg-white text-sm border border-black px-3 py-1 rounded-md hover:bg-black hover:text-white"
            onClick={() => {
              setForm({ name: "", subcategories: [""] });
              setShowForm(true);
              setIsEditing(false);
            }}
          >
            <PlusCircle size={18} className="inline-block mr-1" /> Add New Category
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <div key={cat._id} className="bg-white border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div className="font-semibold">
                  {idx + 1}. {cat.name}
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(cat)}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {cat.subcategories?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {cat.subcategories.map((sub, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      {showForm && (
        <div className="w-80 bg-white rounded-md shadow-md p-5">
          <h3 className="text-lg font-semibold mb-3">
            {isEditing ? "Edit Category" : "Add Category"}
          </h3>
          <input
            type="text"
            placeholder="Name"
            className="w-full border px-3 py-2 rounded mb-4"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="space-y-2">
            {form.subcategories.map((sub, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Sub-category ${index + 1}`}
                  className="flex-1 border px-2 py-1 rounded"
                  value={sub}
                  onChange={(e) => handleFormChange(index, e.target.value)}
                />
                <button onClick={() => removeSubCategory(index)}>❌</button>
              </div>
            ))}
          </div>

          <button onClick={addSubCategory} className="mt-3 text-sm text-blue-600">
            + Add Sub-category
          </button>

          <div className="mt-5 flex justify-end gap-3">
            <button
              className="px-4 py-1 border border-gray-400 rounded"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-black text-white px-4 py-1 rounded"
              onClick={handleSubmit}
            >
              {isEditing ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}