"use client";

import DashboardLayout from "../components/DashboardLayout";
import {
  FiChevronRight,
  FiHelpCircle,
  FiInfo,
  FiLock,
  FiShield,
} from "react-icons/fi";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">Settings</h1>

        {/* More Info & Support */}
        <div className="border-t border-gray-300 pt-4 space-y-4">
          <h2 className="text-sm font-semibold underline underline-offset-2 text-gray-700">
            More Information & Support
          </h2>

          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <FiHelpCircle /> Help
            </div>
            <FiChevronRight />
          </div>

          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <FiInfo /> About
            </div>
            <FiChevronRight />
          </div>
        </div>

        {/* Account Settings */}
        <div className="border-t border-gray-300 pt-4 space-y-4">
          <h2 className="text-sm font-semibold underline underline-offset-2 text-gray-700">
            Account settings
          </h2>

          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <FiLock /> Password & Settings
            </div>
            <FiChevronRight />
          </div>

          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
            <div className="flex items-center gap-3 text-sm text-gray-800">
              <FiShield /> Privacy Center
            </div>
            <FiChevronRight />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}