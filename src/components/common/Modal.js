import React, { useEffect } from "react";
 
export default function Modal({ title, onClose, children, width = 720 }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);
 
  return (
<div className="modal-backdrop" onClick={onClose}>
<div
        className="modal-card"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
>
<div className="modal-header">
<h3>{title}</h3>
<button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
</div>
<div className="modal-body">{children}</div>
</div>
</div>
  );
}