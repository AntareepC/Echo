"use client"

import { useMemo, useRef, useState } from "react"
import type { GraphNode } from "@/lib/types"

interface PackageSearchProps {
  nodes: GraphNode[]
  onAnalyze: (id: string) => void
  disabled?: boolean
}

export function PackageSearch({ nodes, onAnalyze, disabled }: PackageSearchProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return nodes
      .filter((n) => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
      .slice(0, 8)
  }, [nodes, query])

  const pick = (id: string, label: string) => {
    setQuery(label)
    setOpen(false)
    onAnalyze(id)
  }

  const analyze = () => {
    const q = query.trim().toLowerCase()
    if (!q) return
    const exact = nodes.find((n) => n.name.toLowerCase() === q || n.id.toLowerCase() === q)
    const target = exact ?? matches[0]
    if (target) pick(target.id, target.name)
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
            <SearchIcon />
          </span>
          <input
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setActiveIndex(0)
            }}
            onFocus={() => query && setOpen(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 120)
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, matches.length - 1))
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === "Enter") {
                e.preventDefault()
                const m = matches[activeIndex]
                if (m) pick(m.id, m.name)
                else analyze()
              }
            }}
            placeholder="Search a package"
            spellCheck={false}
            aria-label="Search a package"
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={analyze}
          disabled={disabled || !query.trim()}
          className="shrink-0 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze
        </button>
      </div>

      {open && matches.length > 0 && (
        <ul
          className="absolute z-40 mt-1.5 max-h-72 w-full overflow-y-auto rounded-lg border border-white/10 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-md"
          onMouseDown={(e) => {
            // keep focus so the click registers before blur closes the list
            e.preventDefault()
            if (blurTimer.current) clearTimeout(blurTimer.current)
          }}
        >
          {matches.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => pick(m.id, m.name)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left transition-colors ${
                  i === activeIndex ? "bg-blue-500/15" : "hover:bg-white/5"
                }`}
              >
                <span className="truncate text-sm text-slate-100">{m.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-slate-500">v{m.version}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
