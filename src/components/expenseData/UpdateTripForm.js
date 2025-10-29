import React, { useMemo, useState, useEffect } from "react";

import "./UpdateTripForm.css";

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path

      fillRule="evenodd"

      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"

      clipRule="evenodd"

    />
  </svg>

);

export default function UpdateTripForm({ subRowId = "", tripType = "", onClose, onSuccess, defaultValues }) {

  // Visible inputs

  const [vendorName, setVendorName] = useState("");

  const [billDate, setBillDate] = useState("");       // YYYY-MM-DD

  const [billNumber, setBillNumber] = useState("");

  const [amount, setAmount] = useState("");           // keep as string in input; send as int

  const [typeOfBook, setTypeOfBook] = useState("");   // "Credit" | "Debit"

  useEffect(() => {
  console.log("Update form defaultValues:", defaultValues); // Add this to debug

  if (!defaultValues) {
    setVendorName("");
    setBillDate("");
    setBillNumber("");
    setAmount("");
    setTypeOfBook("");
    return;
  }
  setVendorName(defaultValues.vendorName || "");
  setBillDate(defaultValues.BillDate || defaultValues.billDate || "");
  setBillNumber(defaultValues.BillNumber || defaultValues.billNumber || "");
  setAmount(
    defaultValues.Amount !== undefined 
      ? String(defaultValues.Amount) 
      : (defaultValues.amount !== undefined ? String(defaultValues.amount) : "")
  );
  setTypeOfBook(defaultValues.TypeOfBook || defaultValues.typeOfBook || "");
}, [defaultValues, subRowId]);


  // UX

  const [submitting, setSubmitting] = useState(false);

  const [err, setErr] = useState("");

  const [ok, setOk] = useState(false);

  // If parent opens for another row quickly, nothing to sync visibly since ROWID is hidden,

  // but we can reset form fields if you want; leaving as-is to preserve user input.

  useEffect(() => {

    // no-op for now

  }, [subRowId]);

  // Hidden status logic (do NOT display hint):

  const status = useMemo(() => {

    const hasAll =

      String(vendorName).trim() &&

      String(billDate).trim() &&

      String(billNumber).trim() &&

      String(amount).trim() &&

      String(typeOfBook).trim();

    return hasAll ? "completed" : "pending";

  }, [vendorName, billDate, billNumber, amount, typeOfBook]);

  const onSubmit = async (e) => {

    e.preventDefault();

    setErr("");

    setOk(false);

    // Parse Amount as integer (not string)

    const parsedAmount = Number.parseInt(String(amount).trim(), 10);

    if (!Number.isFinite(parsedAmount)) {

      setErr("Amount must be a valid integer.");

      return;

    }

    const payload = {

      ROWID: String(subRowId || ""),      // hidden

      tripType: String(tripType || ""),   // hidden

      vendorName,

      BillDate: billDate,

      BillNumber: billNumber,

      Amount: parsedAmount,               // INT, not string

      TypeOfBook: typeOfBook,

      status,                             // hidden/auto

    };

    try {

      setSubmitting(true);

      const res = await fetch(`/server/fields_updateZoho/`, {

        method: "PUT", // <-- per your requirement

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setOk(true);
      onSuccess?.();
      onClose?.();

    } catch (e) {

      setErr(String(e?.message || e));

    } finally {

      setSubmitting(false);

    }

  };

  return (
    <div className="form-overlay">
      <div className="form-container1">
        <header className="form-header">
          <h2>Update Trip Details</h2>
          <button className="btn-icon close-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <form className="trip-update-form" onSubmit={onSubmit}>

          {/* Hidden fields */}
          <input type="hidden" name="ROWID" value={subRowId || ""} />
          <input type="hidden" name="tripType" value={tripType || ""} />
          <input type="hidden" name="status" value={status} />

          {/* Remove the read-only Trip Type and the status hint per request */}

          <div className="form-group">
            <label htmlFor="vendorName">Vendor Name</label>
            <input

              type="text"

              id="vendorName"

              value={vendorName}

              onChange={(e) => setVendorName(e.target.value)}

              placeholder="Ex:United Airlines"

              required

            />
          </div>

          <div className="form-group">
            <label htmlFor="billDate">Bill Date</label>
            <input

              type="date"

              id="billDate"

              value={billDate}

              onChange={(e) => setBillDate(e.target.value)}

              required

            />
          </div>

          <div className="form-group">
            <label htmlFor="billNumber">Bill Number</label>
            <input

              type="text"

              id="billNumber"

              value={billNumber}

              onChange={(e) => setBillNumber(e.target.value)}

              placeholder="Ex:123DGT68"

              required

            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input

              type="number"

              id="amount"

              value={amount}

              onChange={(e) => setAmount(e.target.value)}

              min="0"

              step="1"            // integer only

              placeholder="Ex:200"

              required

            />
          </div>

          <div className="form-group">
            <label htmlFor="typeOfBook">Type Of Booking</label>
            <select

              id="typeOfBook"

              value={typeOfBook}

              onChange={(e) => setTypeOfBook(e.target.value)}

              required
            >
              <option value="" disabled>Select type</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Travel Agent">Travel Agent</option>
            </select>
          </div>

          {err && <div className="form-error" style={{ color: "#b91c1c" }}>Error: {err}</div>}

          {ok && <div className="form-ok" style={{ color: "#065f46" }}>Updated successfully.</div>}

          <footer className="form-footer">
            <button className="btn btn-primary" type="submit" disabled={submitting}>

              {submitting ? "Updating..." : "Update"}
            </button>
            <button className="btn btn-default" type="button" onClick={onClose}>

              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>

  );

}

