import React, { useState, useEffect } from "react";
import "./TrainTicketForm.css"; 

const cityOptions = [
  { cityCode: "", cityName: "Select City" },
  { cityCode: "NDLS", cityName: "New Delhi" },
  { cityCode: "BCT", cityName: "Mumbai Central" },
  { cityCode: "HWH", cityName: "Howrah" },
  { cityCode: "MAS", cityName: "Chennai Central" },
  { cityCode: "SBC", cityName: "Bangalore City" },
  { cityCode: "HYB", cityName: "Hyderabad" },
  { cityCode: "ADI", cityName: "Ahmedabad" },
];

const TrainTicketForm = ({ Train, onClose }) => {
  console.log('Train Data:', Train);

  const [bookingId, setBookingId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  
  // Main Amount
  const [amountCurrency, setAmountCurrency] = useState("INR");
  const [amountValue, setAmountValue] = useState("");
  
  // Refundable
  const [isRefundable, setIsRefundable] = useState(false);

  // Other Charges State
  const [showOtherCharges, setShowOtherCharges] = useState(false);
  const [otherChargesValue, setOtherChargesValue] = useState(""); // Removed otherChargesCurrency state

  const [notes, setNotes] = useState("");
  const [createExpense, setCreateExpense] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);

  const [itineraryRows, setItineraryRows] = useState([]);

  // Fetch currency list from API
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/server/get_currencyMaster/currency');
        const data = await response.json();
        setCurrencyList(data);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    fetchCurrencies();
  }, []);

  // Initialize itineraryRows state when Train prop changes
  useEffect(() => {
    if (Train && Object.keys(Train).length > 0) {
      const newItineraryRow = {
        id: Train.ROWID || Date.now(),
        carrierName: Train.Merchant_Name || "Indian Railways", 
        trainNumber: "", 
        departDate: Train.TRAIN_DEP_DATE || "",
        departTime: Train.TRAIN_DEP_TIME || "",
        arriveDate: Train.TRAIN_ARR_DATE || "",
        arriveTime: Train.TRAIN_ARR_TIME || "",
        depCity: Train.TRAIN_DEP_CITY || "",
        arrCity: Train.TRAIN_ARR_CITY || "",
      };

      setItineraryRows([newItineraryRow]);

      setAmountValue(Train.Amount || "");
      setAmountCurrency(Train.Currency_id || "INR");
    } else {
      setItineraryRows([]);
      setAmountValue("");
      setAmountCurrency("INR");
    }
  }, [Train]);

  const getCityNameCode = (cityCode) => {
    const city = cityOptions.find((c) => c.cityCode === cityCode);
    return city ? `${city.cityName} (${city.cityCode})` : cityCode || "";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date)) return dateStr;
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCityDisplay = (cityCode) => {
    const city = cityOptions.find((c) => c.cityCode === cityCode);
    return city ? `${city.cityName} (${city.cityCode})` : cityCode;
  };

  const updateRow = (id, field, value) => {
    setItineraryRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id) => {
    setItineraryRows((prev) => prev.filter((row) => row.id !== id));
  };

  const renderCityOptions = () =>
    cityOptions.map(({ cityCode, cityName }) => (
      <option key={cityCode} value={cityCode}>
        {cityName}
      </option>
    ));

  const onSaveAndSubmit = (e) => {
    e.preventDefault();

    const payload = {
      bookingId,
      bookingDate,
      amount: { currency: amountCurrency, value: amountValue },
      // Use main currency for other charges since selector was removed
      otherCharges: showOtherCharges ? { currency: amountCurrency, value: otherChargesValue } : null,
      isRefundable,
      notes,
      createExpense,
      itinerary: itineraryRows,
    };

    console.log("Submitting Train Ticket:", payload);
    alert("Train Ticket submitted successfully!");
    onClose(); 
  };

  return (
    <div className="ticket-page">
      <div className="ticket-toolbar">
        <span className="toolbar-title">Add Train Ticket</span>
        <button className="toolbar-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="ticket-content">
        {/* LEFT: Attachment dropzone */}
        <section className="attachment-panel" aria-label="Attach documents">
          <div className="attachment-dropzone">
            <button className="drop-icon" aria-label="Attach">
              ⤒
            </button>
            <p className="drop-hint">Attach documents from computer</p>
          </div>
        </section>

        {/* RIGHT: Form */}
        <section className="ticket-form">
          <div className="route-summary">
            <span className="city">
              {itineraryRows.length > 0 ? getCityNameCode(itineraryRows[0].depCity) : ""}
            </span>
            <span className="separator">➜</span>
            <span className="city">
              {itineraryRows.length > 0
                ? getCityNameCode(itineraryRows[itineraryRows.length - 1].arrCity)
                : ""}
            </span>
            <span className="route-sub">
              {itineraryRows.length > 0 ? formatDate(itineraryRows[0].departDate) : ""}
            </span>
          </div>

          {/* Booking details */}
          <div className="two-col">
            <div className="form-field">
              <label htmlFor="bookingId">
                Booking ID <span className="req">*</span>
              </label>
              <input
                id="bookingId"
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter PNR / Booking ID"
              />
            </div>

            <div className="form-field">
              <label htmlFor="bookingDate">
                Booking Date <span className="req">*</span>
              </label>
              <input
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
          </div>

          {/* Amount + Refundable */}
          <div className="amount-row">
            <div className="form-field currency-field">
              <label>
                Amount <span className="req">*</span>
              </label>
              <div className="amount-inputs">
                <select
                  aria-label="Currency"
                  value={amountCurrency}
                  onChange={(e) => setAmountCurrency(e.target.value)}
                >
                  {currencyList.length > 0 ? (
                    currencyList.map((currency) => (
                      <option key={currency.Code} value={currency.Code}>
                        {currency.Name} ({currency.Code})
                      </option>
                    ))
                  ) : (
                    <option value="INR">INR</option>
                  )}
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value)}
                />
              </div>
            </div>

            <div className="checkbox-field">
              <input
                id="refundable"
                type="checkbox"
                checked={isRefundable}
                onChange={(e) => setIsRefundable(e.target.checked)}
              />
              <label htmlFor="refundable">Refundable</label>
            </div>
          </div>

          {/* Other Charges Toggle */}
          <div className="checkbox-field" style={{ marginBottom: "16px" }}>
            <input
              id="otherCharges"
              type="checkbox"
              checked={showOtherCharges}
              onChange={() => setShowOtherCharges((v) => !v)}
            />
            <label htmlFor="otherCharges">Other Charges</label>
          </div>

          {/* Conditional Rendering for Other Charges Inputs - NO CURRENCY SELECTOR */}
          {showOtherCharges && (
            <div className="amount-row" style={{ marginBottom: "16px", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
              <div className="form-field" style={{ width: '100%' }}>
                <label>Other Charges Amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0.00"
                    value={otherChargesValue}
                    onChange={(e) => setOtherChargesValue(e.target.value)}
                  />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Create an expense */}
          <div className="checkbox-field">
            <input
              id="createExpense"
              type="checkbox"
              checked={createExpense}
              onChange={(e) => setCreateExpense(e.target.checked)}
            />
            <label htmlFor="createExpense">Create an expense for this ticket</label>
          </div>

          {/* Update Itinerary */}
          <div className="section-header">
            <span>Update Itinerary</span>
          </div>

          <div className="itinerary-section">
            {itineraryRows.map((row) => (
              <div className="form-ticket" key={row.id}>
                <input type="hidden" value={row.rowId || ""} />

                <div className="field">
                  <label>Carrier Name *</label>
                  <input
                    type="text"
                    value={row.carrierName}
                    onChange={(e) => updateRow(row.id, "carrierName", e.target.value)}
                    placeholder="e.g. Indian Railways"
                  />
                </div>

                <div className="field">
                  <label>Train Number</label>
                  <input
                    type="text"
                    value={row.trainNumber}
                    onChange={(e) => updateRow(row.id, "trainNumber", e.target.value)}
                    placeholder="e.g. 12002"
                  />
                </div>

                <div className="field">
                  <label>Departure Date & Time *</label>
                  <div className="date-time">
                    <input
                      type="date"
                      value={row.departDate}
                      onChange={(e) => updateRow(row.id, "departDate", e.target.value)}
                    />
                    <input
                      type="time"
                      value={row.departTime}
                      onChange={(e) => updateRow(row.id, "departTime", e.target.value)}
                    />
                  </div>
                  <select
                    required
                    value={row.depCity}
                    onChange={(e) => updateRow(row.id, "depCity", e.target.value)}
                  >
                    {renderCityOptions()}
                  </select>
                  <p className="location">Depart from: {getCityDisplay(row.depCity)}</p>
                </div>

                <div className="field">
                  <label>Arrival Date & Time *</label>
                  <div className="date-time">
                    <input
                      type="date"
                      value={row.arriveDate}
                      onChange={(e) => updateRow(row.id, "arriveDate", e.target.value)}
                    />
                    <input
                      type="time"
                      value={row.arriveTime}
                      onChange={(e) => updateRow(row.id, "arriveTime", e.target.value)}
                    />
                  </div>
                  <select
                    value={row.arrCity}
                    onChange={(e) => updateRow(row.id, "arrCity", e.target.value)}
                  >
                    {renderCityOptions()}
                  </select>
                  <p className="location">Arrive at: {getCityDisplay(row.arrCity)}</p>
                </div>

                {itineraryRows.length > 1 && (
                  <button
                    type="button"
                    className="delete-icon"
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove row"
                    title="Remove"
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="form-actions" style={{ marginTop: "20px" }}>
        <button className="primary" onClick={onSaveAndSubmit}>
          Save and Submit
        </button>
        <button
          className="ghost"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrainTicketForm;
