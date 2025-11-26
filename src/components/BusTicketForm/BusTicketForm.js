import React, { useState, useEffect } from "react";
import "./BusTicketForm.css";

const cityOptions = [
  { cityCode: "", cityName: "Select City" },
  { cityCode: "NYC", cityName: "New York" },
  { cityCode: "LON", cityName: "London" },
  { cityCode: "PAR", cityName: "Paris" },
  { cityCode: "DXB", cityName: "Dubai" },
  { cityCode: "TYO", cityName: "Tokyo" },
];

// Helper to match Backend City Name to Dropdown Code
const getCityCodeByName = (name) => {
  if (!name) return "";
  const found = cityOptions.find((c) => c.cityName === name);
  return found ? found.cityCode : "";
};

const BusTicketForm = ({ Bus, onClose }) => {
  const [bookingId, setBookingId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [amountCurrency, setAmountCurrency] = useState("INR");
  const [amountValue, setAmountValue] = useState("");
  const [isRefundable, setIsRefundable] = useState(false);
  const [notes, setNotes] = useState("");
  const [createExpense, setCreateExpense] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  
  // Other Charges State
  const [showOtherCharges, setShowOtherCharges] = useState(false);
  const [otherChargesValue, setOtherChargesValue] = useState(""); 

  const [itineraryRows, setItineraryRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch currency list
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

  // ---------------------------------------------------------
  // CORE LOGIC: Initialize Form Data (Request vs Selected Option)
  // ---------------------------------------------------------
  useEffect(() => {
    if (Bus && Object.keys(Bus).length > 0) {
      const status = (Bus.Option_Status || "").toLowerCase();
      const rowId = Bus.rowId || Bus.ROWID;

      // 1. IF STATUS IS SELECTED: Fetch data from Backend
      if (status === 'selected' || status === 'booking pending') {
        setIsLoadingDetails(true);
        
        fetch(`/server/trip_options_forms?rowId=${rowId}&requestType=bus`)
          .then((res) => res.json())
          .then((result) => {
            if (result.status === "success" && result.data && result.data.length > 0) {
              
              // Find selected option or default to first
              const selectedOpt = result.data.find(opt => 
                (opt.Option_Status || "").toLowerCase() === 'selected'
              ) || result.data[0];

              // Populate Amount
              setAmountValue(selectedOpt.Amount || "");
              setAmountCurrency(selectedOpt.Currency_id || "INR");
              setIsRefundable(selectedOpt.Refund_Type === "Refundable");
              setNotes(selectedOpt.Notes || "");

              // Populate Itinerary Row
              const newItineraryRow = {
                id: Date.now(),
                carrierName: selectedOpt.Merchant_Name || "",
                busNumber: "", 
                departDate: selectedOpt.BUS_DEP_DATE || "",
                departTime: selectedOpt.BUS_DEP_TIME || "",
                arriveDate: selectedOpt.BUS_ARR_DATE || "",
                arriveTime: selectedOpt.BUS_ARR_TIME || "",
                // Convert City Names back to Codes
                depCity: getCityCodeByName(selectedOpt.BUS_DEP_CITY),
                arrCity: getCityCodeByName(selectedOpt.BUS_ARR_CITY),
              };
              setItineraryRows([newItineraryRow]);

            } else {
              loadRequestData();
            }
          })
          .catch((err) => {
            console.error("Error fetching selected option:", err);
            loadRequestData(); 
          })
          .finally(() => {
            setIsLoadingDetails(false);
          });

      } else {
        // 2. IF STATUS IS NOT SELECTED: Load Request Data
        loadRequestData();
      }
    } else {
      setItineraryRows([]);
      setAmountValue("");
      setAmountCurrency("INR");
    }
  }, [Bus]);

  const loadRequestData = () => {
    const newItineraryRow = {
      id: Date.now(),
      carrierName: Bus.Merchant_Name || "",
      busNumber: "", 
      departDate: Bus.BUS_DEP_DATE || "",
      departTime: Bus.BUS_DEP_TIME || "",
      arriveDate: Bus.BUS_ARR_DATE || "",
      arriveTime: Bus.BUS_ARR_TIME || "",
      depCity: Bus.BUS_DEP_CITY || "",
      arrCity: Bus.BUS_ARR_CITY || "",
    };

    setItineraryRows([newItineraryRow]);
    setAmountValue(Bus.Amount || "");
    setAmountCurrency(Bus.Currency_id || "INR");
  };

  // ---------------------------------------------------------
  // Form Helpers
  // ---------------------------------------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date)) return dateStr;
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Renamed/Standardized function for displaying city
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

  const onSaveAndSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      requestType: "bus",
      tripId: Bus?.TRIP_ID || Bus?.item?.TRIP_ID,
      rowId: Bus?.ROWID || Bus?.item?.ROWID,
      agentId: Bus?.AGENT_ID || Bus?.item?.AGENT_ID,
      agentName: Bus?.AGENT_NAME || Bus?.item?.AGENT_NAME,
      agentEmail: Bus?.AGENT_EMAIL || Bus?.item?.AGENT_EMAIL,
      bookingId,
      bookingDate,
      amount: { currency: amountCurrency, value: amountValue },
      otherCharges: showOtherCharges ? { currency: amountCurrency, value: otherChargesValue } : null,
      isRefundable,
      notes,
      createExpense,
      itinerary: itineraryRows,
    };

    try {
        const response = await fetch("/server/trip_ticket/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Bus Ticket saved successfully!");
            onClose(); 
        } else {
            alert("Failed to save ticket: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error saving ticket:", error);
        alert("Error saving ticket. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="ticket-page">
      <div className="ticket-toolbar">
        <span className="toolbar-title">Add Bus Ticket</span>
        <button className="toolbar-close" onClick={onClose}>✕</button>
      </div>

      {isLoadingDetails ? (
         <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
           <div className="ze-loader" style={{margin:'0 auto 10px'}}></div>
           Loading option details...
         </div>
      ) : (
        <div className="ticket-content">
          <section className="attachment-panel">
            <div className="attachment-dropzone">
              <button className="drop-icon">⤒</button>
              <p className="drop-hint">Attach documents from computer</p>
            </div>
          </section>

          <section className="ticket-form">
            <div className="route-summary">
              {/* FIXED: Uses getCityDisplay instead of getCityNameCode */}
              <span className="city">{itineraryRows.length > 0 ? getCityDisplay(itineraryRows[0].depCity) : ""}</span>
              <span className="separator">➜</span>
              <span className="city">{itineraryRows.length > 0 ? getCityDisplay(itineraryRows[itineraryRows.length - 1].arrCity) : ""}</span>
            </div>

            <div className="two-col">
              <div className="form-field">
                <label>Booking ID <span className="req">*</span></label>
                <input type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="Enter Booking ID" />
              </div>
              <div className="form-field">
                <label>Booking Date <span className="req">*</span></label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
            </div>

            <div className="amount-row">
              <div className="form-field currency-field">
                <label>Amount <span className="req">*</span></label>
                <div className="amount-inputs">
                  <select value={amountCurrency} onChange={(e) => setAmountCurrency(e.target.value)}>
                    {currencyList.length > 0 ? currencyList.map((c) => <option key={c.Code} value={c.Code}>{c.Name} ({c.Code})</option>) : <option value="INR">INR</option>}
                  </select>
                  <input type="number" step="0.01" value={amountValue} onChange={(e) => setAmountValue(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="checkbox-field">
                <input id="refundable" type="checkbox" checked={isRefundable} onChange={(e) => setIsRefundable(e.target.checked)} />
                <label htmlFor="refundable">Refundable</label>
              </div>
            </div>

            <div className="checkbox-field" style={{ marginBottom: "16px" }}>
                <input id="otherCharges" type="checkbox" checked={showOtherCharges} onChange={() => setShowOtherCharges((v) => !v)} />
                <label htmlFor="otherCharges">Other Charges</label>
            </div>
            
            {showOtherCharges && (
                <div className="amount-row" style={{ marginBottom: "16px", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <div className="form-field" style={{ width: '100%' }}>
                    <label>Other Charges Amount</label>
                    <input type="number" step="0.01" placeholder="0.00" value={otherChargesValue} onChange={(e) => setOtherChargesValue(e.target.value)} />
                </div>
                </div>
            )}

            <div className="form-field">
              <label>Notes</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." />
            </div>

            <div className="section-header"><span>Update Itinerary</span></div>

            <div className="itinerary-section">
              {itineraryRows.map((row) => (
                <div className="form-ticket" key={row.id}>
                  <div className="field">
                    <label>Carrier Name *</label>
                    <input type="text" value={row.carrierName} onChange={(e) => updateRow(row.id, "carrierName", e.target.value)} placeholder="Enter carrier name" />
                  </div>
                  <div className="field">
                    <label>Bus Number</label>
                    <input type="text" value={row.busNumber} onChange={(e) => updateRow(row.id, "busNumber", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Departure Date & Time *</label>
                    <div className="date-time">
                      <input type="date" value={row.departDate} onChange={(e) => updateRow(row.id, "departDate", e.target.value)} />
                      <input type="time" value={row.departTime} onChange={(e) => updateRow(row.id, "departTime", e.target.value)} />
                    </div>
                    <select required value={row.depCity} onChange={(e) => updateRow(row.id, "depCity", e.target.value)}>{renderCityOptions()}</select>
                  </div>
                  <div className="field">
                    <label>Arrival Date & Time *</label>
                    <div className="date-time">
                      <input type="date" value={row.arriveDate} onChange={(e) => updateRow(row.id, "arriveDate", e.target.value)} />
                      <input type="time" value={row.arriveTime} onChange={(e) => updateRow(row.id, "arriveTime", e.target.value)} />
                    </div>
                    <select value={row.arrCity} onChange={(e) => updateRow(row.id, "arrCity", e.target.value)}>{renderCityOptions()}</select>
                  </div>
                  {itineraryRows.length > 1 && <button type="button" className="delete-icon" onClick={() => removeRow(row.id)}>🗑</button>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="form-actions" style={{ marginTop: "20px" }}>
        <button className="primary" onClick={onSaveAndSubmit} disabled={isSubmitting || isLoadingDetails}>
          {isSubmitting ? "Saving..." : "Save and Submit"}
        </button>
        <button className="ghost" onClick={(e) => { e.preventDefault(); onClose(); }}>Cancel</button>
      </div>
    </div>
  );
};

export default BusTicketForm;