import { useState, useEffect } from "react";
import { amplienceStatus } from "../api";

/**
 * Thin status bar that shows Amplience connection mode.
 * Green = live, Yellow = mock mode.
 */
export default function AmplienceStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    amplienceStatus()
      .then(setStatus)
      .catch(() => setStatus({ mode: "error", message: "Could not reach backend" }));
  }, []);

  if (!status) return null;

  const isLive  = status.mode === "live";
  const isError = status.mode === "error";

  return (
    <div className={`w-full text-center py-1.5 text-[10px] font-mono font-medium tracking-widest uppercase border-b
      ${isLive  ? "bg-[#0a1a12] border-[#10b981]/20 text-[#34d399]"  : ""}
      ${isError ? "bg-[#1a0810] border-[#b85450]/20 text-[#fb7185]"  : ""}
      ${!isLive && !isError ? "bg-[#0d0f1a] border-[#6366f1]/15 text-[#4a4d70]" : ""}
    `}>
      <span className="mr-2">{isLive ? "🟢" : isError ? "🔴" : "🟡"}</span>
      Amplience —{" "}
      {isLive
        ? `Connected · Hub: ${status.hubId}`
        : isError
        ? status.message
        : "Mock mode · Add credentials to .env to go live"}
    </div>
  );
}
