"use client";

const stats = [
  { value: "10K+", label: "Transactions Monitored" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Detection Time" },
];

export function Stats() {
  return (
    <section className="relative bg-[#0a0f1e] py-16">
      {/* Section divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          {/* Gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2E86DE]/5 via-transparent to-[#2E86DE]/5" />

          <div className="relative grid divide-y divide-white/5 md:grid-cols-3 md:divide-x md:divide-y-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-8 py-10 text-center"
              >
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 text-sm text-white/50 sm:text-base">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
