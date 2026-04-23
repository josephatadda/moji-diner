import Link from "next/link";
import { CookingPot, DeviceMobile, ChartBar, LockKey } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-8">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-200 text-white">
          <span className="text-2xl"><CookingPot weight="bold" /></span>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Moji</h1>
          <p className="text-gray-500 mt-1">Scan. Order. Pay. Done.</p>
        </div>
      </div>

      {/* Quick navigation for prototype */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-4">
          Frontend Prototype Preview
        </p>

        <Link href="/mama-put-kitchen/t/1" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors text-orange-600 group-hover:text-white">
            <span className="text-lg"><DeviceMobile weight="fill" /></span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Diner Menu Experience</p>
            <p className="text-xs text-gray-400">QR → Browse → Order → Pay</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-orange-400 transition-colors">→</span>
        </Link>

        <Link href="/dashboard" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors text-blue-600 group-hover:text-white">
            <span className="text-lg"><ChartBar weight="fill" /></span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Restaurant Dashboard</p>
            <p className="text-xs text-gray-400">Menu · Orders · Tables · Analytics</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
        </Link>

        <Link href="/login" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-700 transition-colors text-gray-500 group-hover:text-white">
            <span className="text-lg"><LockKey weight="fill" /></span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Auth & Onboarding</p>
            <p className="text-xs text-gray-400">Signup → Login → Wizard</p>
          </div>
          <span className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Frontend prototype — backend integration coming next
      </p>
    </div>
  );
}
