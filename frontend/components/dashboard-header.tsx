"use client"

import { useState } from "react"

interface DashboardHeaderProps {
  apiBase: string
  onApiBaseChange: (value: string) => void
  connected: boolean
}

export function DashboardHeader({ apiBase, onApiBaseChange, connected }: DashboardHeaderProps) {
  const [draft, setDraft] = useState(apiBase)
  const [editing, setEditing] = useState(false)

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/40 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-blue-500/30">
          <ShieldIcon />
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-100">Echo - Risk in Reserve</span>
      </div>

      <div className="flex items-center gap-3">
        {editing ? (
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault()
              onApiBaseChange(draft.trim())
              setEditing(false)
            }}
          >
            <input
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              aria-label="API base URL"
              className="w-48 rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 font-mono text-[11px] text-slate-100 focus:border-blue-500/60 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-blue-500"
            >
              Connect
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(apiBase)
              setEditing(true)
            }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 transition-colors hover:bg-white/5"
            title={`API: ${apiBase} — click to change`}
          >
            <span className="relative flex h-2 w-2">
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-green-400" : "bg-red-500"}`}
              />
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              {connected ? "Backend Connected" : "Backend Offline"}
            </span>
          </button>
        )}
      </div>
    </header>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
