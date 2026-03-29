"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Deep navy base */}
      <div className="absolute inset-0" style={{ background: "#0a0f1e" }} />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(79,136,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(79,136,255,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated grid — moving downward */}
      <div
        className="absolute inset-0 opacity-[0.025] animate-grid"
        style={{
          backgroundImage:
            "linear-gradient(rgba(79,136,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,136,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Large blue orb — top-left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full animate-float-orb"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Smaller accent orb — bottom-right */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full animate-float-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(99,156,255,0.16) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Subtle center glow behind card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  )
}
