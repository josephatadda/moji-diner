"use client";

import { useState } from "react";
import { Users, Plus } from "@phosphor-icons/react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

import { ds, t } from "@/lib/design-tokens";



const MOCK_STAFF = [
  { id: "1", name: "Emeka Okon",   role: "manager", pin: "****", isActive: true  },
  { id: "2", name: "Aisha Bello",  role: "staff",   pin: "****", isActive: true  },
  { id: "3", name: "Chidi Nwosu",  role: "kitchen", pin: "****", isActive: true  },
  { id: "4", name: "Yetunde Adeyemi", role: "staff", pin: "****", isActive: false },
];

const ROLE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  manager: { bg: "bg-purple-100", text: "text-purple-700", label: "Manager" },
  staff:   { bg: "bg-blue-100",   text: "text-blue-700",   label: "Staff"   },
  kitchen: { bg: "bg-orange-100", text: "text-orange-700", label: "Kitchen" },
};

export default function StaffPage() {
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const active   = MOCK_STAFF.filter((s) => s.isActive);
  const inactive = MOCK_STAFF.filter((s) => !s.isActive);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStaff(false);
  };

  return (
    <div className={ds.page}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={t.h1}>Staff</h1>
          <p className={`${t.body} mt-1`}>Manage team access and PIN codes</p>
        </div>
        <button 
          onClick={() => setIsAddingStaff(true)}
          className={`${ds.btn.primary} self-start sm:self-auto flex items-center gap-2`}
        >
          <Plus size={16} weight="bold" />
          Add Staff Member
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Total</p>
          <p className={ds.metric.value}>{MOCK_STAFF.length}</p>
        </div>
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Active</p>
          <p className={ds.metric.value}>{active.length}</p>
        </div>
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Inactive</p>
          <p className={ds.metric.value}>{inactive.length}</p>
        </div>
      </div>

      {/* Active staff */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">PIN</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-gray-100">
          {active.map((member) => {
            const badge = ROLE_BADGE[member.role];
            return (
              <div key={member.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 items-start sm:items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-none">
                    {member.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                </div>
                <div className="col-span-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-gray-400 font-mono">
                  ● ● ● ●
                </div>
                <div className="col-span-2 flex justify-start sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button className={ds.btn.tab}>Edit PIN</button>
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs font-semibold rounded-lg transition-colors">
                    Deactivate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inactive staff */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Inactive</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 opacity-60">
            {inactive.map((member) => {
              const badge = ROLE_BADGE[member.role];
              return (
                <div key={member.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-500 text-sm">{member.name}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text} mt-0.5`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <button className={ds.btn.tab}>
                    Reactivate
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Staff login info */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
        <p className="text-sm font-semibold text-orange-800">Staff Login</p>
        <p className="text-xs text-orange-600 mt-1">
          Staff can access the dashboard at <span className="font-mono font-bold">/staff-login</span> using the restaurant slug and their 4-digit PIN. No email required.
        </p>
      </div>

      {/* Add Staff Modal */}
      <ResponsiveDialog
        open={isAddingStaff}
        onOpenChange={setIsAddingStaff}
        title="Add Staff Member"
        description="Create a new staff profile with a login PIN."
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 px-1 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input required type="text" placeholder="e.g. John Doe" className={ds.input.base} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select className={ds.input.base}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">4-Digit PIN</label>
            <input required type="text" maxLength={4} placeholder="e.g. 1234" className={ds.input.base} />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingStaff(false)} className={ds.btn.ghost}>Cancel</button>
            <button type="submit" className={ds.btn.primary}>Save Staff</button>
          </div>
        </form>
      </ResponsiveDialog>
    </div>
  );
}
