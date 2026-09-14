"use client"

import { useEffect, useState } from "react"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  const [spotlight, setSpotlight] = useState({ x: "50%", y: "20%", active: false })

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setSpotlight({
        x: `${event.clientX}px`,
        y: `${event.clientY}px`,
        active: true,
      })
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  return (
    <div
      className="min-h-dvh bg-[#070b17] text-slate-100"
      style={{
        backgroundImage: `radial-gradient(circle at ${spotlight.x} ${spotlight.y}, rgba(139,92,246,0.12), transparent 22%), radial-gradient(circle at 15% 0%, rgba(139,92,246,0.12), transparent 45%), radial-gradient(circle at 85% 10%, rgba(99,102,241,0.08), transparent 40%), linear-gradient(rgba(255,255,255,${spotlight.active ? "0.035" : "0"}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${spotlight.active ? "0.035" : "0"}) 1px, transparent 1px)`,
        backgroundSize: "auto, auto, auto, 46px 46px, 46px 46px",
        backgroundAttachment: "fixed",
      }}
    >
      <section className="mx-auto max-w-[1400px] px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Echo security intelligence</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
            See the risk hiding in your dependency graph.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
            Map open source dependencies, surface vulnerable package hubs, and simulate compromise propagation before it becomes an incident.
          </p>
          <a
            href="#analyzer"
            className="mt-8 inline-flex items-center rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#070b17]"
          >
            Start Analyzing
            <span className="ml-2" aria-hidden>→</span>
          </a>
        </div>
      </section>

      <div id="analyzer">
        <Dashboard />
      </div>

      <footer className="mx-auto max-w-[1400px] px-4 py-8 text-xs text-slate-500 sm:px-6">
        Echo - Risk in Reserve · Open source supply chain visibility
      </footer>
    </div>
  )
}
