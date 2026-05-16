"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { IoChevronBackSharp } from "react-icons/io5";
import { PiGenderIntersex } from "react-icons/pi";
import { LiaBusinessTimeSolid } from "react-icons/lia";

export default function EditProfile({
  onBack,
  user,
  levels = [],
  onSave,
}: {
  onBack: () => void;
  user: any;
  levels?: { customName:string; _id: string }[];
  onSave?: (updatedUser: any) => void;
}) {
  const rawPath = usePathname();
  const pathname = rawPath ?? ""; 
  const isTeacher = pathname.includes("teacher");
  const isStudent = pathname.includes("student");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    gender: user?.gender || "",
    level: user?.level || "",
    yoe: user?.yoe || "",
    email: user?.email || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    else console.log("Saving user:", formData);
    onBack();
  };
  return (
    
    <div className="bg-white w-full max-w-sm p-6 rounded-2xl space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-black font-semibold text-lg mb-4">
        <button onClick={onBack} className="text-xl text-black">
          <IoChevronBackSharp />
        </button>
        <h2>Edit Profile</h2>
      </div>

      <div className="space-y-4">
        {/* Teacher Fields */}
        {isTeacher && (
          <>
            <InputField
              icon={<FiUser />}
              label="Name"
              value={formData.name}
              onChange={(val) => handleChange("name", val)}
            />
            <InputField
              icon={<PiGenderIntersex />}
              label="Gender"
              value={formData.gender}
              onChange={(val) => handleChange("gender", val)}
            />
          </>
        )}

        {/* Student Fields */}
        {isStudent && (
          <>
            <InputField
              icon={<FiUser />}
              label="Name"
              value={formData.name}
              onChange={(val) => handleChange("name", val)}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
              <select
                value={formData.level}
                onChange={(e) => handleChange("level", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-[0.6rem] text-sm text-gray-800 bg-white outline-none"
              >
                {levels.map((lvl) => (
                  <option key={lvl.customName} value={lvl.customName}>
                    {lvl.customName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* YOE */}
        {isTeacher && (
          <InputField
            icon={<LiaBusinessTimeSolid />}
            label="YOE"
            value={formData.yoe}
            onChange={(val) => handleChange("yoe", val)}
          />
        )}

        {/* Email */}
        <InputField
          icon={<FiMail />}
          label="E-Mail"
          type="email"
          value={formData.email}
          onChange={(val) => handleChange("email", val)}
        />

      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          className="w-full bg-[#EDF1FF] text-black py-3 rounded-full font-semibold text-sm hover:bg-[#dce4ff] transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <div className="flex items-center border border-black rounded-xl px-4 py-2">
        <div className="text-gray-600 mr-2">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none text-sm bg-transparent text-black"
        />
      </div>
    </div>
  );
}