"use client";

const steps = [
  {
    number: "01",
    title: "Connect Your Data",
    description:
      "Integrate with your existing payment systems and data sources in minutes.",
  },
  {
    number: "02",
    title: "AI Learns Patterns",
    description:
      "Our AI analyzes your historical data to understand normal revenue patterns.",
  },
  {
    number: "03",
    title: "Get Instant Alerts",
    description:
      "Receive real-time notifications when anomalies are detected in your revenue.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-[#0a0f1e] py-24">
      {/* Section divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Get started in three simple steps
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[#2E86DE]/30 to-transparent md:block" />

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="relative text-center">
                  {/* Number badge */}
                  <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2E86DE]/20 to-[#2E86DE]/5" />
                    <span className="relative text-2xl font-bold text-[#2E86DE]">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-white/60">{step.description}</p>

                  {/* Arrow indicator for desktop */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-10 hidden h-2 w-2 rotate-45 border-r-2 border-t-2 border-[#2E86DE]/50 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
