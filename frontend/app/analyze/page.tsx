import { Dashboard } from "@/components/dashboard"

export default function AnalyzePage() {
  return (
    <div
      className="min-h-dvh bg-[#070b17] text-slate-100"
      style={{
        backgroundImage: "radial-gradient(circle at 15% 0%, rgba(139,92,246,0.12), transparent 45%), radial-gradient(circle at 85% 10%, rgba(99,102,241,0.08), transparent 40%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "auto, auto, 46px 46px, 46px 46px",
        backgroundAttachment: "fixed",
      }}
    >
      <Dashboard />
      <footer className="mx-auto max-w-[1400px] px-4 py-8 text-xs text-slate-500 sm:px-6">
        Made by Team Chaos.js
      </footer>
    </div>
  )
}
