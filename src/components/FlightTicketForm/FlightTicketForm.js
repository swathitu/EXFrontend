import React, { useState, useEffect } from "react";
import "./FlightTicketForm.css";
 
const currencies = ["INR", "USD", "EUR"];
 
const cityOptions = [
  { cityCode: "", cityName: "Select City", airportName: "" },
  { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
  { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
  { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
  { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
  { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
];
 
const FlightTicketForm = ({ flight = [], onClose }) => {
  // If passed a single object, wrap it in array
  const flightsArray = Array.isArray(flight) ? flight : [flight];
 
  // Initialize itinerary rows from flights prop, mapping flight objects to form rows
  const mapFlightToItineraryRow = (fl) => ({
    id: fl.ROWID || Date.now() + Math.random(),
    carrierName: fl.Merchant_Name || "",
    flightNumber: fl.Flight_Number || "",
    departDate: fl.FLIGHT_DEP_DATE || "",
    departTime: fl.FLIGHT_DEP_TIME || "",
    arriveDate: fl.FLIGHT_ARR_DATE || "",
    arriveTime: fl.FLIGHT_ARR_TIME || "",
    baggageDetails: fl.Baggage_Details || "",
    travelClass: fl.Flight_Class || "",
    depCity: cityOptions.find((c) => c.airportName === fl.DEP_AIRPORT_NAME)?.cityCode || "",
    arrCity: cityOptions.find((c) => c.airportName === fl.ARR_AIRPORT_NAME)?.cityCode || "",
  });
 
  // Form state
  const [bookingId, setBookingId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [amountCurrency, setAmountCurrency] = useState("INR");
  const [amountValue, setAmountValue] = useState("");
  const [isRefundable, setIsRefundable] = useState(false);
  const [notes, setNotes] = useState("");
  const [createExpense, setCreateExpense] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
 
  // Itinerary rows initialized from flight prop
  const [itineraryRows, setItineraryRows] = useState([]);
 
 
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
 
  useEffect(() => {
    if (flightsArray.length > 0) {
      const initRows = flightsArray.map(mapFlightToItineraryRow);
      setItineraryRows(initRows);
 
      // If sum of amounts available, set amountValue and currency (assuming uniform)
      const totalAmount = flightsArray.reduce(
        (sum, f) => sum + Number(f.Amount || 0),
        0
      );
      if (totalAmount > 0) {
        setAmountValue(totalAmount.toString());
        setAmountCurrency(flightsArray[0].Currency_id || "INR");
      }
    }
  }, [flight]);
 
  const getCityNameCode = (cityCode) => {
    const city = cityOptions.find((c) => c.cityCode === cityCode);
    return city ? `${city.cityName} (${city.cityCode})` : cityCode || "";
  };
 
  // Utility to format date (can customize as needed)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date)) return dateStr; // fallback if invalid date string
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
 
  // Utility to get city display with code and airport name
  const getCityDisplay = (cityCode) => {
    const city = cityOptions.find((c) => c.cityCode === cityCode);
    return city ? `${city.cityName} (${city.cityCode}) - ${city.airportName}` : cityCode;
  };
 
  // Handlers for itinerary rows
  const addItineraryRow = () => {
    setItineraryRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        carrierName: "",
        flightNumber: "",
        departDate: "",
        departTime: "",
        arriveDate: "",
        arriveTime: "",
        baggageDetails: "",
        travelClass: "",
        depCity: "",
        arrCity: "",
      },
    ]);
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
      isRefundable,
      notes,
      createExpense,
      itinerary: itineraryRows,
    };
 
    console.log("Submitting Ticket:", payload);
    alert("Ticket submitted (mock)!");
  };
 
  return (
    <div className="ticket-page">
      <div className="ticket-toolbar">
        <span className="toolbar-title">Add Ticket</span>
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
              {itineraryRows.length > 0
                ? formatDate(itineraryRows[0].departDate)
                : ""}
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
                placeholder="Enter Booking ID"
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
                    currencyList.map(curr => (
                      <option key={curr.Code} value={curr.Code}>
                        {curr.Name} ({curr.Code})
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
 
          <div className="checkbox-field">
            <input
              id="otherCharges"
              type="checkbox"
              checked={showOtherCharges}
              onChange={() => setShowOtherCharges((v) => !v)}
            />
            <label htmlFor="otherCharges">Other Charges</label>
          </div>
 
          {/* Notes */}
          {/* <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div> */}
 
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
 
          {/* Itinerary rows grid */}
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
                    placeholder="Enter carrier name"
                  />
                </div>
 
                <div className="field">
                  <label>Flight Number</label>
                  <input
                    type="text"
                    value={row.flightNumber}
                    onChange={(e) => updateRow(row.id, "flightNumber", e.target.value)}
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
 
                <div className="field">
                  <label>Baggage Details</label>
                  <input
                    type="text"
                    placeholder="Max 250 characters"
                    value={row.baggageDetails}
                    onChange={(e) => updateRow(row.id, "baggageDetails", e.target.value)}
                  />
                </div>
 
                <div className="field">
                  <label>Class</label>
                  <select
                    value={row.travelClass}
                    onChange={(e) => updateRow(row.id, "travelClass", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                    <option value="premium economy">Premium Economy</option>
                  </select>
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
 
            <button
              type="button"
              className="link-btn"
              onClick={addItineraryRow}
              style={{ marginTop: "12px" }}
            >
              + Add Flight
            </button>
          </div>
        </section>
      </div>
 
      {/* Footer actions */}
      <div className="form-actions" style={{ marginTop: "20px" }}>
        <button className="primary" onClick={onSaveAndSubmit}>
          Save and Submit
        </button>
        <button
          className="ghost"
          onClick={(e) => {
            e.preventDefault();
            alert("Cancelled (mock).");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
 
export default FlightTicketForm;
 
 
