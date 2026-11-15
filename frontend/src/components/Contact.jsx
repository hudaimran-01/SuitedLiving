import { useEffect, useId, useState } from "react";

function phoneHref(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export function ContactManager({ manager }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!manager || (!manager.name && !manager.phone && !manager.email)) return null;

  return (
    <>
      <button type="button" className="button" onClick={() => setOpen(true)}>
        Contact manager
      </button>
      {open ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button type="button" className="lightbox-back" aria-label="Dismiss" onClick={() => setOpen(false)} />
          <div className="lightbox-card contact-card">
            <div className="contact-head">
              <p className="eyebrow">Listing agent</p>
              <button type="button" className="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <h3 id={titleId}>{manager.name || "Listing agent"}</h3>
            {manager.company ? <p>{manager.company}</p> : null}
            <p className="fine">
              From the CoStar listing for this home. This is the person on the record.
            </p>
            <div className="contact-actions">
              {manager.phone ? (
                <a className="button primary" href={phoneHref(manager.phone)}>
                  Call {manager.phone}
                </a>
              ) : null}
              {manager.email ? (
                <a className="button" href={`mailto:${manager.email}`}>
                  Email
                </a>
              ) : null}
            </div>
            {manager.officePhone && manager.officePhone !== manager.phone ? (
              <p className="meta">Office {manager.officePhone}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
