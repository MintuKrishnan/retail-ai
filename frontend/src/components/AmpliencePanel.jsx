import { useState } from "react";
import { ampliencePreview, amplienceCreate, amplienceUpdate, ampliencePublish } from "../api";

/**
 * AmpliencePanel
 * Shown inside ProductModal — lets user preview, create, update and publish
 * a content item to Amplience for a given enriched product.
 *
 * If the product was already auto-pushed during ingestion (product.amplience_id is set),
 * the panel starts in "synced" mode showing the existing content item.
 *
 * States:
 *   idle        → previewing → previewed → creating → created → publishing → published
 *   synced      → updating → updated → publishing → published
 *   error       → (reset)
 */
export default function AmpliencePanel({ product }) {
  // Detect if product was already pushed to Amplience during ingestion
  const alreadySynced = !!product.amplience_id;

  const [step, setStep] = useState(alreadySynced ? "synced" : "idle");
  const [preview, setPreview]       = useState(null);
  const [contentItem, setContentItem] = useState(
    alreadySynced
      ? {
          id:      product.amplience_id,
          status:  product.amplience_status || "DRAFT",
          label:   `Product — ${product.title}`,
          _isMock: product.amplience_is_mock || false,
        }
      : null
  );
  const [error, setError] = useState(null);

  // ── STEP 1: PREVIEW ───────────────────────────────────────
  async function handlePreview() {
    setStep("previewing");
    setError(null);
    try {
      const res = await ampliencePreview(product);
      setPreview(res.preview);
      setStep("previewed");
    } catch (err) {
      setError(err.message);
      setStep("error");
    }
  }

  // ── STEP 2: CREATE (new item) ──────────────────────────────
  async function handleCreate() {
    setStep("creating");
    setError(null);
    try {
      const res = await amplienceCreate(product);
      setContentItem(res.contentItem);
      setStep("created");
    } catch (err) {
      setError(err.message);
      setStep("error");
    }
  }

  // ── STEP 2b: UPDATE (existing item) ───────────────────────
  async function handleUpdate() {
    setStep("updating");
    setError(null);
    try {
      const res = await amplienceUpdate(contentItem.id, product);
      setContentItem(res.contentItem);
      setStep("updated");
    } catch (err) {
      setError(err.message);
      setStep("error");
    }
  }

  // ── STEP 3: PUBLISH ────────────────────────────────────────
  async function handlePublish() {
    setStep("publishing");
    setError(null);
    try {
      await ampliencePublish(contentItem.id);
      setContentItem((prev) => ({ ...prev, status: "ACTIVE" }));
      setStep("published");
    } catch (err) {
      setError(err.message);
      setStep("error");
    }
  }

  function reset() {
    setStep(alreadySynced ? "synced" : "idle");
    setPreview(null);
    if (!alreadySynced) setContentItem(null);
    setError(null);
  }

  return (
    <div className="mt-4 border border-[#252845] rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#0d0f1e] border-b border-[#252845]">
        <span className="text-[#6366f1] text-base leading-none font-bold">A</span>
        <span className="font-display font-bold text-[12px] uppercase tracking-widest text-[#e0e2f8]">
          Amplience Integration
        </span>
        <StatusBadge step={step} isMock={contentItem?._isMock} />
      </div>

      {/* Body */}
      <div className="p-4 bg-[#080810] flex flex-col gap-4">

        {/* ── IDLE ── */}
        {step === "idle" && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-[#4a4d70] leading-relaxed">
              Preview the content payload, create a <strong className="text-[#7a7df0]">DRAFT</strong>{" "}
              content item in Amplience, then publish it live.
            </p>
            <button onClick={handlePreview} className={btnClass("indigo")}>
              Preview Payload
            </button>
          </div>
        )}

        {/* ── SYNCED (auto-pushed during ingestion) ── */}
        {step === "synced" && contentItem && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#818cf8]">
              <span>↑</span>
              <span>
                Auto-synced during ingestion
                {contentItem._isMock && (
                  <span className="ml-1.5 text-[#4a4d70]">(mock mode)</span>
                )}
              </span>
            </div>
            <ContentItemCard item={contentItem} />
            <div className="flex gap-2 flex-wrap">
              {contentItem.status !== "ACTIVE" && (
                <button onClick={handlePublish} className={btnClass("purple")}>
                  Publish to Amplience
                </button>
              )}
              <button onClick={handleUpdate} className={btnClass("indigo")}>
                Push Update
              </button>
            </div>
          </div>
        )}

        {/* ── PREVIEWING ── */}
        {step === "previewing" && <Spinner label="Building preview…" />}

        {/* ── PREVIEWED ── */}
        {step === "previewed" && preview && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a4d70]">
              Payload that will be sent to Amplience
            </p>
            <PreviewBlock data={preview} />
            <div className="flex gap-2">
              <button onClick={handleCreate} className={btnClass("green")}>
                Create in Amplience
              </button>
              <button onClick={reset} className={btnClass("ghost")}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── CREATING ── */}
        {step === "creating" && <Spinner label="Creating content item…" />}

        {/* ── CREATED ── */}
        {step === "created" && contentItem && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#34d399]">
              <span>✓</span>
              <span>Content item created as <strong>DRAFT</strong></span>
            </div>
            <ContentItemCard item={contentItem} />
            <button onClick={handlePublish} className={btnClass("purple")}>
              Publish to Amplience
            </button>
          </div>
        )}

        {/* ── UPDATING ── */}
        {step === "updating" && <Spinner label="Pushing update to Amplience…" />}

        {/* ── UPDATED ── */}
        {step === "updated" && contentItem && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#34d399]">
              <span>✓</span>
              <span>Content item updated — status <strong>{contentItem.status}</strong></span>
            </div>
            <ContentItemCard item={contentItem} />
            <div className="flex gap-2">
              {contentItem.status !== "ACTIVE" && (
                <button onClick={handlePublish} className={btnClass("purple")}>
                  Publish to Amplience
                </button>
              )}
              <button onClick={reset} className={btnClass("ghost")}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── PUBLISHING ── */}
        {step === "publishing" && <Spinner label="Publishing content item…" />}

        {/* ── PUBLISHED ── */}
        {step === "published" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#34d399]">
              <span>✓</span>
              <span>
                Published — status <strong>ACTIVE</strong>
                {contentItem?._isMock && (
                  <span className="ml-2 text-[#4a4d70]">(mock mode)</span>
                )}
              </span>
            </div>
            <ContentItemCard item={contentItem} />
            <button onClick={reset} className={btnClass("ghost")}>
              Back
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] text-[#fb7185] bg-[#1a0810] border border-[#b85450]/30 rounded-lg p-3">
              <strong>Error:</strong> {error}
            </div>
            <button onClick={reset} className={btnClass("ghost")}>Try again</button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatusBadge({ step, isMock }) {
  const map = {
    idle:       { label: "Ready",       color: "text-[#4a4d70] border-[#252845]" },
    synced:     { label: "Synced",      color: "text-[#818cf8] border-[#6366f1]/30" },
    previewing: { label: "Loading…",    color: "text-[#fbbf24] border-[#d6b656]/30" },
    previewed:  { label: "Previewed",   color: "text-[#fbbf24] border-[#d6b656]/30" },
    creating:   { label: "Creating…",   color: "text-[#818cf8] border-[#6366f1]/30" },
    created:    { label: "Draft",       color: "text-[#818cf8] border-[#6366f1]/30" },
    updating:   { label: "Updating…",   color: "text-[#818cf8] border-[#6366f1]/30" },
    updated:    { label: "Updated",     color: "text-[#818cf8] border-[#6366f1]/30" },
    publishing: { label: "Publishing…", color: "text-[#a78bfa] border-[#8b5cf6]/30" },
    published:  { label: "Active",      color: "text-[#34d399] border-[#10b981]/30" },
    error:      { label: "Error",       color: "text-[#fb7185] border-[#b85450]/30" },
  };
  const s = map[step] || map.idle;
  return (
    <span className={`ml-auto font-mono text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 border rounded-full ${s.color}`}>
      {isMock ? "mock · " : ""}{s.label}
    </span>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-4 h-4 border border-[#252845] border-t-[#6366f1] rounded-full animate-spin" />
      <span className="text-[11px] text-[#4a4d70]">{label}</span>
    </div>
  );
}

function PreviewBlock({ data }) {
  return (
    <pre className="text-[9.5px] leading-relaxed bg-[#0c0e1a] border border-[#1e2035] rounded-lg p-3 overflow-auto max-h-52 text-[#7dd3fc] whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function ContentItemCard({ item }) {
  return (
    <div className="bg-[#0c0e1a] border border-[#1e2035] rounded-lg p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-[#e0e2f8] truncate">{item.label}</span>
        <span className={`shrink-0 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
          item.status === "ACTIVE"
            ? "text-[#34d399] border-[#10b981]/30 bg-[#0a1a12]"
            : "text-[#818cf8] border-[#6366f1]/30 bg-[#0d0f1e]"
        }`}>
          {item.status}
        </span>
      </div>
      <div className="font-mono text-[9px] text-[#4a4d70]">
        ID: <span className="text-[#6366f1] select-all">{item.id}</span>
      </div>
      {item.createdDate && (
        <div className="text-[9px] text-[#2e3050]">
          Created: {new Date(item.createdDate).toLocaleString()}
        </div>
      )}
      {item.lastModifiedDate && !item.createdDate && (
        <div className="text-[9px] text-[#2e3050]">
          Updated: {new Date(item.lastModifiedDate).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function btnClass(variant) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-display font-semibold text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer border";
  const variants = {
    indigo: "bg-[#6366f1]/10 border-[#6366f1]/30 text-[#818cf8] hover:bg-[#6366f1]/20 hover:border-[#6366f1]/50",
    green:  "bg-[#10b981]/10 border-[#10b981]/30 text-[#34d399] hover:bg-[#10b981]/20 hover:border-[#10b981]/50",
    purple: "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#a78bfa] hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/50",
    ghost:  "bg-transparent border-[#252845] text-[#4a4d70] hover:text-[#6a6d90] hover:border-[#3a3d60]",
  };
  return `${base} ${variants[variant]}`;
}
