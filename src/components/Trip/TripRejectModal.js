import React, { useEffect, useRef, useState } from "react";

import "./TripRejectModal.css";
 
/**

* Props:

*  - open: boolean

*  - onClose: () => void

*  - onSubmit: (reason: string) => void

*/

export default function TripRejectModal({ open, onClose, onSubmit }) {

  const [reason, setReason] = useState("");

  const dialogRef = useRef(null);
 
  // Focus textarea on open

  useEffect(() => {

    if (open) {

      setTimeout(() => dialogRef.current?.querySelector("textarea")?.focus(), 0);

    } else {

      setReason("");

    }

  }, [open]);
 
  // Close on ESC, confirm on Ctrl/Cmd+Enter

  useEffect(() => {

    if (!open) return;

    const onKey = (e) => {

      if (e.key === "Escape") onClose?.();

      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && reason.trim()) {

        onSubmit?.(reason.trim());

      }

    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);

  }, [open, reason, onClose, onSubmit]);
 
  if (!open) return null;
 
  const confirm = () => {

    if (!reason.trim()) return;

    onSubmit?.(reason.trim());

  };
 
  return (
<div className="trm-overlay" role="dialog" aria-modal="true" aria-labelledby="trm-title">

      {/* click outside to close */}
<div className="trm-backdrop" onClick={onClose} />
<div ref={dialogRef} className="trm-modal" role="document">
<div className="trm-header">
<h3 id="trm-title">Reject Trip</h3>
<button className="trm-x" aria-label="Close" onClick={onClose}>×</button>
</div>
 
        <div className="trm-body">
<p className="trm-desc">Please specify an appropriate reason for rejection.</p>
<textarea

            className="trm-textarea"

            rows={6}

            placeholder="Type your reason…"

            value={reason}

            onChange={(e) => setReason(e.target.value)}

          />
<div className="trm-hint">You can press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to confirm.</div>
</div>
 
        <div className="trm-footer">
<button className="trm-btn secondary" onClick={onClose}>Cancel</button>
<button

            className="trm-btn primary"

            onClick={confirm}

            disabled={!reason.trim()}

            title={!reason.trim() ? "Reason is required" : "Confirm"}
>

            Confirm
</button>
</div>
</div>
</div>

  );

}

 