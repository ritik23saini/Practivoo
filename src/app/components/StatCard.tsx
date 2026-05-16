import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

interface StatCardProps {
  title: string;
  count: number;
  member: string;
  icon: React.ReactNode;
}
export default function StatCard({ member, title, count, icon }: StatCardProps) {
  const router = useRouter();
  return (
    <div className=" bg-white rounded-[20px] p-5 shadow-md w-full">
      {/* Icon and Title */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="bg-[#F1F3FB] p-2 rounded-full text-blue-600 text-base flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm text-gray-800 font-medium">{title}</p>
      </div>

      {/* Count and Arrow */}
      <div  onClick={() => router.push(`/${member}`)} className="cursor-pointer flex items-center justify-between px-4 py-2 border border-blue-500 rounded-xl">
        <span className="text-blue-700 font-semibold text-base">{count}</span>
        <FiArrowRight className="text-blue-600 text-sm" />
      </div>
    </div>
  );
}