"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
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
      <main className="mx-auto max-w-[1400px] px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
        <div className="flex flex-col gap-12">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Echo security intelligence</p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
              See the risk hiding in your dependency graph.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
              Map open source dependencies, surface vulnerable package hubs, and simulate compromise propagation before it becomes an incident.
            </p>
            <button
              type="button"
              onClick={() => router.push("/analyze")}
              className="mt-8 inline-flex items-center rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#070b17]"
            >
              Start Analyzing
              <span className="ml-2" aria-hidden>→</span>
            </button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <section className="relative mt-16 border-t border-white/10 pt-8" aria-labelledby="about-project">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">About this project</p>
              <div className="mt-3 max-w-3xl">
                <h2 id="about-project" className="text-xl font-semibold text-slate-100">Understanding the ripple effect</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Echo maps the open-source dependency graph behind real software projects, starting with VS Code&apos;s own 1,436-package dependency tree. It cross-references every package against known vulnerability databases (OSV.dev), then goes beyond simple CVE scoring: using graph analysis, Echo identifies which packages are structurally critical - sitting at the center of many dependency paths - regardless of whether they currently have a known vulnerability. When you simulate a compromise on any package, Echo traces the full blast radius through the dependency graph, showing exactly which downstream packages would be affected, how many steps away they are, and which fixes should be prioritized first. Built for the &apos;Open Source Supply Chain: The Ripple Effect&apos; hackathon track on Industry, Innovation and Infrastructure.
                </p>
              </div>
              <div className="relative mt-10 w-full max-w-[220px] lg:absolute lg:right-2 lg:top-10 lg:mt-0 lg:max-w-[250px]">
                <div className="absolute inset-8 rounded-full bg-violet-600/25 blur-3xl" aria-hidden="true" />
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chaos-logo.png-hFRqyxUI2mcLMjTmEH1GsGL1qtVPPn.jpeg"
                  alt="CHAOS.js neon purple and blue logo"
                  className="relative h-auto w-full rounded-2xl object-contain drop-shadow-[0_0_28px_rgba(139,92,246,0.65)]"
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 py-8 text-xs text-slate-500 sm:px-6">
        Made by Team Chaos.js
      </footer>
    </div>
  )
}
