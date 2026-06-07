"use client";

import { Plus, Users } from "@phosphor-icons/react";
import { useState } from "react";
import {
  DashboardButton,
  DashboardConfirmDialog,
  DashboardField,
  DashboardInput,
  DashboardModal,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSetupPrompt,
  DashboardStatusBadge,
  DashboardTable,
  dashboardToast,
  ds,
  t,
} from "@/components/dashboard/ui";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

const MOCK_STAFF = [
  { id: "1", name: "Emeka Okon", role: "manager", pin: "****", isActive: true },
  { id: "2", name: "Aisha Bello", role: "staff", pin: "****", isActive: true },
  {
    id: "3",
    name: "Chidi Nwosu",
    role: "kitchen",
    pin: "****",
    isActive: true,
  },
  {
    id: "4",
    name: "Yetunde Adeyemi",
    role: "staff",
    pin: "****",
    isActive: false,
  },
];

const ROLE_BADGE: Record<string, { bg: string; text: string; label: string }> =
  {
    manager: { bg: "bg-purple-100", text: "text-purple-700", label: "Manager" },
    staff: { bg: "bg-blue-100", text: "text-blue-700", label: "Staff" },
    kitchen: { bg: "bg-orange-100", text: "text-orange-700", label: "Kitchen" },
  };

export default function StaffPage() {
  const staffEnabled = useDashboardSettingsStore(
    (state) => state.features.staff,
  );
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [deactivatingStaffId, setDeactivatingStaffId] = useState<string | null>(
    null,
  );

  const active = staff.filter((s) => s.isActive);
  const inactive = staff.filter((s) => !s.isActive);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    setStaff((current) => [
      ...current,
      {
        id: `staff-${Date.now()}`,
        name: String(form.get("name") || "New staff member"),
        role: String(form.get("role") || "staff"),
        pin: "****",
        isActive: true,
      },
    ]);
    setIsAddingStaff(false);
    dashboardToast("Staff member added");
  };

  if (!staffEnabled) {
    return (
      <DashboardSetupPrompt
        title="Staff access is off"
        description="Enable staff access when managers, kitchen teams, or cashiers need their own dashboard PINs."
        featureLabel="staff access"
        icon={Users}
      />
    );
  }

  return (
    <div className={ds.page}>
      <DashboardPageHeader
        title="Staff"
        description="Manage team access, roles, and PIN codes."
        actions={
          <DashboardButton onClick={() => setIsAddingStaff(true)}>
            <Plus size={16} weight="bold" />
            Add staff member
          </DashboardButton>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Total</p>
          <p className={ds.metric.value}>{staff.length}</p>
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

      <DashboardTable
        className="mb-4"
        rows={active}
        getRowKey={(member) => member.id}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (member) => (
              <div className="flex items-center gap-3">
                <div className={ds.avatar.md}>{member.name.charAt(0)}</div>
                <p className={t.bodyStrong}>{member.name}</p>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (member) => (
              <DashboardStatusBadge
                tone={
                  member.role === "manager"
                    ? "purple"
                    : member.role === "kitchen"
                      ? "orange"
                      : "blue"
                }
              >
                {ROLE_BADGE[member.role].label}
              </DashboardStatusBadge>
            ),
          },
          {
            key: "pin",
            header: "PIN",
            render: () => <span className={t.mono}>● ● ● ●</span>,
          },
          {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            className: "text-right",
            render: (member) => (
              <div className="flex justify-end gap-2">
                <DashboardButton
                  variant="ghost"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    dashboardToast(
                      "PIN editing is mocked in this preview",
                      "info",
                    )
                  }
                >
                  Edit PIN
                </DashboardButton>
                <DashboardButton
                  variant="ghost"
                  className="h-8 px-3 text-xs text-red-500 hover:text-red-600"
                  onClick={() => setDeactivatingStaffId(member.id)}
                >
                  Deactivate
                </DashboardButton>
              </div>
            ),
          },
        ]}
      />

      {/* Inactive staff */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Inactive
          </p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 opacity-60">
            {inactive.map((member) => {
              const badge = ROLE_BADGE[member.role];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-500 text-sm">
                        {member.name}
                      </p>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text} mt-0.5`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <DashboardButton
                    variant="ghost"
                    onClick={() => {
                      setStaff((current) =>
                        current.map((staffMember) =>
                          staffMember.id === member.id
                            ? { ...staffMember, isActive: true }
                            : staffMember,
                        ),
                      );
                      dashboardToast("Staff member reactivated");
                    }}
                  >
                    Reactivate
                  </DashboardButton>
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
          Staff can access the dashboard at{" "}
          <span className="font-mono font-bold">/staff-login</span> using the
          restaurant slug and their 4-digit PIN. No email required.
        </p>
      </div>

      {/* Add Staff Modal */}
      <DashboardModal
        open={isAddingStaff}
        onOpenChange={setIsAddingStaff}
        title="Add staff member"
        description="Create a new staff profile with a login PIN."
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4">
          <DashboardField id="staff-name" label="Full name">
            <DashboardInput
              id="staff-name"
              required
              name="name"
              type="text"
              placeholder="e.g. John Doe"
            />
          </DashboardField>
          <DashboardField id="staff-role" label="Role">
            <DashboardSelect id="staff-role" name="role">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="kitchen">Kitchen</option>
            </DashboardSelect>
          </DashboardField>
          <DashboardField id="staff-pin" label="4-digit PIN">
            <DashboardInput
              id="staff-pin"
              required
              name="pin"
              type="text"
              maxLength={4}
              placeholder="e.g. 1234"
            />
          </DashboardField>
          <div className={ds.form.actions}>
            <DashboardButton
              variant="ghost"
              onClick={() => setIsAddingStaff(false)}
            >
              Cancel
            </DashboardButton>
            <DashboardButton type="submit">Save staff</DashboardButton>
          </div>
        </form>
      </DashboardModal>

      <DashboardConfirmDialog
        open={!!deactivatingStaffId}
        onOpenChange={(open) => !open && setDeactivatingStaffId(null)}
        title="Deactivate staff member?"
        description="This person will no longer be able to access the dashboard with their PIN."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => {
          setStaff((current) =>
            current.map((staffMember) =>
              staffMember.id === deactivatingStaffId
                ? { ...staffMember, isActive: false }
                : staffMember,
            ),
          );
          setDeactivatingStaffId(null);
          dashboardToast("Staff member deactivated");
        }}
      />
    </div>
  );
}
