import { Plus, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { MOCK_LOYALTY_PROFILES } from "@/lib/mockData";
import { ds, t } from "@/lib/design-tokens";

export const metadata = { title: "Loyalty" };

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className={ds.metric.card}>
      <p className={ds.metric.label}>{label}</p>
      <p className={`${ds.metric.value} tabular-nums`}>{value}</p>
      <p className={ds.metric.sub}>{sub}</p>
    </div>
  );
}

export default function LoyaltyOverviewPage() {
  const tiers = [
    { label: "Bronze", members: 180, pct: 77, color: "bg-orange-400" },
    { label: "Silver", members:  42, pct: 18, color: "bg-gray-400"   },
    { label: "Gold",   members:  12, pct:  5, color: "bg-yellow-400" },
  ];

  return (
    <div className={ds.page}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={t.h1}>Loyalty</h1>
          <p className={`${t.body} mt-1`}>Reward regulars and grow your customer base</p>
        </div>
        <Link href="/dashboard/loyalty/rewards" className={`${ds.btn.primary} self-start sm:self-auto`}>
          <Plus size={15} weight="bold" />
          New reward
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <MetricCard label="Total members"          value="234"    sub="+12 this week" />
        <MetricCard label="Orders with loyalty"    value="67%"    sub="avg. across all orders" />
        <MetricCard label="Points in circulation"  value="12,450" sub="active rewards liability" />
      </div>

      {/* Two-up cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Tier breakdown */}
        <div className={ds.card.base}>
          <div className={ds.card.header}>
            <h2 className={t.h4}>Tier breakdown</h2>
          </div>
          <div className={`${ds.card.body} space-y-4`}>
            {tiers.map((tier) => (
              <div key={tier.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-900">{tier.label}</span>
                  <span className={t.meta}>{tier.members} members · {tier.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${tier.color}`} style={{ width: `${tier.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className={ds.card.base}>
          <div className={ds.card.header}>
            <h2 className={t.h4}>Recent activity</h2>
            <Link href="/dashboard/loyalty/customers" className={ds.btn.link}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className={ds.card.divider}>
            {MOCK_LOYALTY_PROFILES.map((profile) => (
              <div key={profile.phone} className={ds.card.row}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{profile.phone}</p>
                  <p className={`${t.meta} mt-0.5`}>Earned 46 pts · Order #4821</p>
                </div>
                <span className={`${ds.badge.base} ${ds.badge.green}`}>+46 pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/dashboard/loyalty/customers", label: "Customer list", desc: "View profiles and visit history" },
          { href: "/dashboard/loyalty/rewards",   label: "Rewards",       desc: "Configure prizes and discounts" },
          { href: "/dashboard/loyalty/settings",  label: "Settings",      desc: "Adjust earning rate and tiers" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${ds.card.base} p-4 hover:border-orange-200 transition-all flex items-center justify-between group`}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className={`${t.meta} mt-0.5`}>{item.desc}</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
