"use client";

import { useState } from "react";
import { CaretLeft, PencilSimple, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { MOCK_REWARDS } from "@/lib/mockData";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ds, t } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const [rewards, setRewards] = useState(MOCK_REWARDS);
  const [isCreatingReward, setIsCreatingReward] = useState(false);
  const [editingReward, setEditingReward] = useState<typeof MOCK_REWARDS[0] | null>(null);

  const toggle = (id: string) =>
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, isAvailable: !r.isAvailable } : r)));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingReward(false);
    // Real implementation would add to rewards list
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditingReward(null);
    // Real implementation would update reward in list
  };

  const active   = rewards.filter((r) => r.isAvailable);
  const inactive = rewards.filter((r) => !r.isAvailable);

  return (
    <div className={ds.page}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/loyalty" className={ds.btn.icon}>
            <CaretLeft size={16} />
          </Link>
          <div>
            <h1 className={t.h1}>Loyalty Rewards</h1>
            <p className={`${t.body} mt-1`}>Configure what customers can redeem their points for</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreatingReward(true)}
          className={`${ds.btn.primary} self-start sm:self-auto`}
        >
          + Create Reward
        </button>
      </div>

      {/* Active Rewards */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Active</p>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {active.length === 0 && (
            <div className="h-24 flex items-center justify-center">
              <p className="text-sm text-gray-400">No active rewards. Create one above.</p>
            </div>
          )}
          {active.map((reward) => (
            <div key={reward.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">{reward.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {reward.pointsRequired} pts required ·{" "}
                  {reward.rewardType === "free_item" ? `Free item (₦${reward.rewardValue.toLocaleString()})` : `${reward.rewardValue}% discount`}
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  42 redeemed
                </span>
                <button
                  onClick={() => toggle(reward.id)}
                  className={ds.btn.tab}
                >
                  Deactivate
                </button>
                <button 
                  onClick={() => setEditingReward(reward)}
                  className={ds.btn.icon}
                >
                  <PencilSimple size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inactive Rewards */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Inactive</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 opacity-60">
            {inactive.map((reward) => (
              <div key={reward.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-gray-500">{reward.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reward.pointsRequired} pts · Deactivated
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => toggle(reward.id)}
                    className={ds.btn.tab}
                  >
                    Reactivate
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Reward Modal */}
      <ResponsiveDialog
        open={isCreatingReward}
        onOpenChange={setIsCreatingReward}
        title="Create Reward"
        description="Add a new reward for your customers to redeem."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 px-1 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Reward Name</label>
            <input required type="text" placeholder="e.g. Free Drink" className={ds.input.base} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Points Required</label>
            <input required type="number" placeholder="e.g. 100" className={ds.input.base} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Reward Type</label>
            <select className={ds.input.base}>
              <option value="free_item">Free Item</option>
              <option value="discount">Discount</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Value (₦ or %)</label>
            <input required type="number" placeholder="e.g. 1500" className={ds.input.base} />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreatingReward(false)} className={ds.btn.ghost}>Cancel</button>
            <button type="submit" className={ds.btn.primary}>Create Reward</button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* Edit Reward Modal */}
      <ResponsiveDialog
        open={!!editingReward}
        onOpenChange={(open) => !open && setEditingReward(null)}
        title="Edit Reward"
        description="Update the details for this reward."
      >
        {editingReward && (
          <form onSubmit={handleEditSubmit} className="space-y-4 px-1 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Reward Name</label>
              <input required type="text" defaultValue={editingReward.name} className={ds.input.base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Points Required</label>
              <input required type="number" defaultValue={editingReward.pointsRequired} className={ds.input.base} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Reward Type</label>
              <select defaultValue={editingReward.rewardType} className={ds.input.base}>
                <option value="free_item">Free Item</option>
                <option value="discount">Discount</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Value (₦ or %)</label>
              <input required type="number" defaultValue={editingReward.rewardValue} className={ds.input.base} />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingReward(null)} className={ds.btn.ghost}>Cancel</button>
              <button type="submit" className={ds.btn.primary}>Save Changes</button>
            </div>
          </form>
        )}
      </ResponsiveDialog>
    </div>
  );
}
