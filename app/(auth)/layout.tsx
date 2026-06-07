export const metadata = { title: "Welcome to Moji" };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden border-r border-gray-100 bg-white px-10 py-10 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white">
              M
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Moji</p>
              <p className="text-xs text-gray-400">Restaurant control panel</p>
            </div>
          </div>

          <div className="mt-auto space-y-8">
            <div>
              <p className="text-4xl font-bold tracking-tight text-gray-900">
                Run the floor, menu, and payments from one place.
              </p>
              <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
                Start with menu management, then enable orders, tables, loyalty,
                analytics, staff, and payments when your restaurant is ready.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["Menu-first setup", "Publish and update diner-facing items."],
                ["Optional modules", "Switch features on as operations grow."],
                [
                  "Local dashboard preview",
                  "Review changes before diners see them.",
                ],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white">
                M
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Moji</p>
                <p className="text-xs text-gray-400">
                  Restaurant control panel
                </p>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
