"use client";

import { PencilSimple, Trash, Trophy } from "@phosphor-icons/react";
import { useState } from "react";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
  DashboardModal,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSetupPrompt,
  dashboardToast,
  ds,
} from "@/components/dashboard/ui";
import { MOCK_REWARDS } from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

export default function RewardsPage() {
  const loyaltyEnabled = useDashboardSettingsStore(
    (state) => state.features.loyalty,
  );
  const [rewards, setRewards] = useState(MOCK_REWARDS);
  const [isCreatingReward, setIsCreatingReward] = useState(false);
  const [editingReward, setEditingReward] = useState<
    (typeof MOCK_REWARDS)[0] | null
  >(null);

  const toggle = (id: string) =>
    setRewards((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isAvailable: !r.isAvailable } : r,
      ),
    );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    setRewards((current) => [
      ...current,
      {
        id: `reward-${Date.now()}`,
        restaurantId: "rest-001",
        name: String(form.get("name") || "New reward"),
        pointsRequired: Number(form.get("points")) || 100,
        rewardType: String(form.get("type") || "free_item") as
          | "free_item"
          | "discount_percent",
        rewardValue: Number(form.get("value")) || 0,
        isAvailable: true,
      },
    ]);
    setIsCreatingReward(false);
    dashboardToast("Reward created");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    const form = new FormData(e.currentTarget as HTMLFormElement);
    setRewards((current) =>
      current.map((reward) =>
        reward.id === editingReward.id
          ? {
              ...reward,
              name: String(form.get("name") || reward.name),
              pointsRequired:
                Number(form.get("points")) || reward.pointsRequired,
              rewardType: String(form.get("type") || reward.rewardType) as
                | "free_item"
                | "discount_percent",
              rewardValue: Number(form.get("value")) || reward.rewardValue,
            }
          : reward,
      ),
    );
    setEditingReward(null);
    dashboardToast("Reward updated");
  };

  const active = rewards.filter((r) => r.isAvailable);
  const inactive = rewards.filter((r) => !r.isAvailable);

  if (!loyaltyEnabled) {
    return (
      <DashboardSetupPrompt
        title="Loyalty is not enabled"
        description="Enable loyalty before creating rewards or customer point rules."
        featureLabel="loyalty"
        icon={Trophy}
      />
    );
  }

  return (
    <div className={ds.page}>
      <DashboardPageHeader
        title="Loyalty Rewards"
        description="Configure what customers can redeem their points for."
        actions={
          <DashboardButton onClick={() => setIsCreatingReward(true)}>
            + Create reward
          </DashboardButton>
        }
      />

      {/* Active Rewards */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
          Active
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {active.length === 0 && (
            <div className="h-24 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                No active rewards. Create one above.
              </p>
            </div>
          )}
          {active.map((reward) => (
            <div
              key={reward.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{reward.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {reward.pointsRequired} pts required ·{" "}
                  {reward.rewardType === "free_item"
                    ? `Free item (₦${reward.rewardValue.toLocaleString()})`
                    : `${reward.rewardValue}% discount`}
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  42 redeemed
                </span>
                <button
                  type="button"
                  onClick={() => toggle(reward.id)}
                  className={ds.btn.tab}
                >
                  Deactivate
                </button>
                <button
                  type="button"
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Inactive
          </p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 opacity-60">
            {inactive.map((reward) => (
              <div
                key={reward.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-gray-500">{reward.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reward.pointsRequired} pts · Deactivated
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => toggle(reward.id)}
                    className={ds.btn.tab}
                  >
                    Reactivate
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Reward Modal */}
      <DashboardModal
        open={isCreatingReward}
        onOpenChange={setIsCreatingReward}
        title="Create reward"
        description="Add a new reward for your customers to redeem."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <DashboardField id="create-reward-name" label="Reward name">
            <DashboardInput
              id="create-reward-name"
              required
              name="name"
              type="text"
              placeholder="e.g. Free Drink"
            />
          </DashboardField>
          <DashboardField id="create-reward-points" label="Points required">
            <DashboardInput
              id="create-reward-points"
              required
              name="points"
              type="number"
              placeholder="e.g. 100"
            />
          </DashboardField>
          <DashboardField id="create-reward-type" label="Reward type">
            <DashboardSelect id="create-reward-type" name="type">
              <option value="free_item">Free Item</option>
              <option value="discount_percent">Discount</option>
            </DashboardSelect>
          </DashboardField>
          <DashboardField id="create-reward-value" label="Value (₦ or %)">
            <DashboardInput
              id="create-reward-value"
              required
              name="value"
              type="number"
              placeholder="e.g. 1500"
            />
          </DashboardField>
          <div className={ds.form.actions}>
            <DashboardButton
              variant="ghost"
              onClick={() => setIsCreatingReward(false)}
            >
              Cancel
            </DashboardButton>
            <DashboardButton type="submit">Create reward</DashboardButton>
          </div>
        </form>
      </DashboardModal>

      {/* Edit Reward Modal */}
      <DashboardModal
        open={!!editingReward}
        onOpenChange={(open) => !open && setEditingReward(null)}
        title="Edit reward"
        description="Update the details for this reward."
      >
        {editingReward && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <DashboardField id="edit-reward-name" label="Reward name">
              <DashboardInput
                id="edit-reward-name"
                required
                name="name"
                type="text"
                defaultValue={editingReward.name}
              />
            </DashboardField>
            <DashboardField id="edit-reward-points" label="Points required">
              <DashboardInput
                id="edit-reward-points"
                required
                name="points"
                type="number"
                defaultValue={editingReward.pointsRequired}
              />
            </DashboardField>
            <DashboardField id="edit-reward-type" label="Reward type">
              <DashboardSelect
                id="edit-reward-type"
                name="type"
                defaultValue={editingReward.rewardType}
              >
                <option value="free_item">Free Item</option>
                <option value="discount_percent">Discount</option>
              </DashboardSelect>
            </DashboardField>
            <DashboardField id="edit-reward-value" label="Value (₦ or %)">
              <DashboardInput
                id="edit-reward-value"
                required
                name="value"
                type="number"
                defaultValue={editingReward.rewardValue}
              />
            </DashboardField>
            <div className={ds.form.actions}>
              <DashboardButton
                variant="ghost"
                onClick={() => setEditingReward(null)}
              >
                Cancel
              </DashboardButton>
              <DashboardButton type="submit">Save changes</DashboardButton>
            </div>
          </form>
        )}
      </DashboardModal>
    </div>
  );
}
