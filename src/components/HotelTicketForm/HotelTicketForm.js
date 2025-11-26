import React, { useState, useEffect } from "react";
import "./HotelTicketForm.css";

const cityOptions = [
  { cityCode: "", cityName: "Select City" },
  { cityCode: "NYC", cityName: "New York" },
  { cityCode: "LON", cityName: "London" },
  { cityCode: "PAR", cityName: "Paris" },
  { cityCode: "DXB", cityName: "Dubai" },
  { cityCode: "TYO", cityName: "Tokyo" },
];

const starRatings = [
  { value: "", label: "Select Star Rating" },
  { value: "1", label: "1 Star" },
  { value: "2", label: "2 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "5", label: "5 Stars" },
];

const roomTypes = [
  { value: "", label: "Select Room Type" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
];

const HotelTicketForm = ({ Hotel, onClose }) => {
  // Form state
  const [bookingId, setBookingId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [amountCurrency, setAmountCurrency] = useState("INR");
  const [amountValue, setAmountValue] = useState("");
  const [isRefundable, setIsRefundable] = useState(false);
  const [notes, setNotes] = useState("");
  const [createExpense, setCreateExpense] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [itineraryRows, setItineraryRows] = useState([]);
  const [showOtherCharges, setShowOtherCharges] = useState(false);
  const [otherChargesCurrency, setOtherChargesCurrency] = useState("INR");
  const [otherChargesAmount, setOtherChargesAmount] = useState("");
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    // Fetch currency data once
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("/server/get_currencyMaster/currency");
        const data = await res.json();
        setCurrencyList(data);
      } catch (err) {
        console.error("Error fetching currencies:", err);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (Hotel && Object.keys(Hotel).length > 0) {
      // Map hotel data fields into form state
      const newRow = {
        id: Hotel.ROWID || Date.now(),
        hotelName: Hotel.Hotel_Address || "",
        hotelAddress: Hotel.Hotel_Address || "",
        city: Hotel.HOTEL_DEP_CITY || "",
        arrDate: Hotel.HOTEL_ARR_DATE || "",
        arrTime: Hotel.HOTEL_ARR_TIME || "",
        depDate: Hotel.HOTEL_DEP_DATE || "",
        depTime: Hotel.HOTEL_DEP_TIME || "",
        starRating: Hotel.Hotel_Class ? Hotel.Hotel_Class.split(" ")[0] : "",
        roomType: Hotel.Room_Type || "",
        breakfastComplimentary: Hotel.Is_Breakfast_Complimentary === "true",
        acAvailable: Hotel.Is_AC_Available === "true",
        wifiAvailable: Hotel.Wifi_Availablity === "true",
        wifiType: Hotel.WiFi_Type || "",
      };
      setItineraryRows([newRow]);

      setAmountValue(Hotel.Amount || "");
      setAmountCurrency(Hotel.Currency_id || "INR");

      setBookingId("");
      setBookingDate("");
      setNotes(Hotel.Notes || "");
      setIsRefundable(Hotel.Refund_Type === "Refundable");
    } else {
      // Reset form if no Hotel data
      setItineraryRows([]);
      setAmountValue("");
      setAmountCurrency("INR");
      setBookingId("");
      setBookingDate("");
      setNotes("");
      setIsRefundable(false);
    }
  }, [Hotel]);

  const getCityNameCode = (code) => {
    const city = cityOptions.find((c) => c.cityCode === code);
    return city ? `${city.cityName} (${city.cityCode})` : code || "";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const updateRow = (id, field, value) => {
    setItineraryRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id) => {
    setItineraryRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setAttachments((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        url: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = null;
  };

  const removeAttachment = (idToRemove) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== idToRemove)
    );
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
      otherCharges: showOtherCharges
        ? {
            currency: otherChargesCurrency,
            amount: otherChargesAmount,
          }
        : null,
      attachments: attachments.map((attachment) => ({
        name: attachment.file.name,
        type: attachment.file.type,
        size: attachment.file.size,
      })),
    };
    console.log("Submitting Ticket:", payload);
    alert("Ticket submitted (mock)!");
  };

  return (
    <div className="ticket-page">
      <div className="ticket-toolbar">
        <span className="toolbar-title">Add Hotel Ticket</span>
        <button className="toolbar-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="ticket-content">
        <section className="attachment-panel" aria-label="Attach documents">
          {attachments.length === 0 && (
            <div className="attachment-dropzone">
              <input
                type="file"
                id="file-upload"
                style={{ display: "none" }}
                onChange={handleFileChange}
                multiple
                accept="image/*, application/pdf"
              />
              <label htmlFor="file-upload" className="drop-icon-label">
                Add docus
              </label>
              <p className="drop-hint">Attach documents from computer</p>
            </div>
          )}

          <div className="attachments-list">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-preview">
                <button
                  className="remove-attachment-btn"
                  onClick={() => removeAttachment(attachment.id)}
                  aria-label={`Remove ${attachment.file.name}`}
                >
                  ✕
                </button>

                {attachment.file.type.startsWith("image/") ? (
                  <img
                    src={attachment.url}
                    alt={attachment.file.name}
                    className="attachment-image"
                  />
                ) : (
                  <span role="img" aria-label="document" className="attachment-icon">
                    📄
                  </span>
                )}

                <p className="attachment-filename">{attachment.file.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ticket-form">
          <div className="route-summary">
            <span className="city">
              {itineraryRows.length > 0 ? getCityNameCode(itineraryRows[0].city) : ""}
            </span>
            <span className="separator">➜</span>
            <span className="city">
              {itineraryRows.length > 0
                ? getCityNameCode(itineraryRows[itineraryRows.length - 1].city)
                : ""}
            </span>
            <span className="route-sub">
              {itineraryRows.length > 0 ? formatDate(itineraryRows[0].arrDate) : ""}
            </span>
          </div>

          {/* Booking ID & Booking Date */}
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

          {/* Amount & Refundable */}
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

          {/* Other Charges */}
          <div className="checkbox-field">
            <input
              id="otherCharges"
              type="checkbox"
              checked={showOtherCharges}
              onChange={() => setShowOtherCharges((v) => !v)}
            />
            <label htmlFor="otherCharges">Other Charges</label>
          </div>

          {showOtherCharges && (
            <div className="amount-row">
              <div className="form-field currency-field">
                <label>
                  Amount <span className="req">*</span>
                </label>
                <div className="amount-inputs">
                  <select
                    aria-label="Currency"
                    value={otherChargesCurrency}
                    onChange={(e) => setOtherChargesCurrency(e.target.value)}
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
                    value={otherChargesAmount}
                    onChange={(e) => setOtherChargesAmount(e.target.value)}
                  />
                </div>
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

          {/* Update Itinerary Section Header */}
          <div className="section-header">Update Itinerary</div>

          {/* First row hotel fields */}
          <div className="form-row">
            <div className="field">
              <label>Hotel Name *</label>
              <input
                type="text"
                placeholder="Enter hotel name"
                value={itineraryRows[0]?.hotelName || ""}
                onChange={(e) =>
                  updateRow(itineraryRows[0].id, "hotelName", e.target.value)
                }
                required
              />
            </div>

            <div className="field">
              <label>Hotel Address</label>
              <input
                type="text"
                placeholder="Max 250 characters"
                value={itineraryRows[0]?.hotelAddress || ""}
                onChange={(e) =>
                  updateRow(itineraryRows[0].id, "hotelAddress", e.target.value)
                }
                maxLength={250}
              />
            </div>

            <div className="field">
              <label>Location *</label>
              <select
                value={itineraryRows[0]?.city || ""}
                onChange={(e) =>
                  updateRow(itineraryRows[0].id, "city", e.target.value)
                }
                required
              >
                {renderCityOptions()}
              </select>
            </div>

            <div className="field">
              <label>Check-in Date & Time *</label>
              <div className="date-time">
                <input
                  type="date"
                  value={itineraryRows[0]?.arrDate || ""}
                  onChange={(e) =>
                    updateRow(itineraryRows[0].id, "arrDate", e.target.value)
                  }
                  required
                />
                <input
                  type="time"
                  value={itineraryRows[0]?.arrTime || ""}
                  onChange={(e) =>
                    updateRow(itineraryRows[0].id, "arrTime", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Check-out Date & Time *</label>
              <div className="date-time">
                <input
                  type="date"
                  value={itineraryRows[0]?.depDate || ""}
                  onChange={(e) =>
                    updateRow(itineraryRows[0].id, "depDate", e.target.value)
                  }
                  required
                />
                <input
                  type="time"
                  value={itineraryRows[0]?.depTime || ""}
                  onChange={(e) =>
                    updateRow(itineraryRows[0].id, "depTime", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Second row extras */}
          <div className="extra-details">
            <div className="field">
              <label>Star Rating</label>
              <select
                value={itineraryRows[0]?.starRating || ""}
                onChange={(e) =>
                  updateRow(itineraryRows[0].id, "starRating", e.target.value)
                }
              >
                {starRatings.map((sr) => (
                  <option value={sr.value} key={sr.value}>
                    {sr.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Room Type</label>
              <select
                value={itineraryRows[0]?.roomType || ""}
                onChange={(e) =>
                  updateRow(itineraryRows[0].id, "roomType", e.target.value)
                }
              >
                {roomTypes.map((rt) => (
                  <option value={rt.value} key={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={!!itineraryRows[0]?.breakfastComplimentary}
                  onChange={(e) =>
                    updateRow(
                      itineraryRows[0].id,
                      "breakfastComplimentary",
                      e.target.checked
                    )
                  }
                />{" "}
                Breakfast Complimentary
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={!!itineraryRows[0]?.acAvailable}
                  onChange={(e) =>
                    updateRow(itineraryRows[0].id, "acAvailable", e.target.checked)
                  }
                />{" "}
                A/C Available
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={!!itineraryRows[0]?.wifiAvailable}
                  onChange={(e) => {
                    updateRow(itineraryRows[0].id, "wifiAvailable", e.target.checked);
                    if (!e.target.checked) {
                      updateRow(itineraryRows[0].id, "wifiType", "");
                    } else {
                      updateRow(itineraryRows[0].id, "wifiType", "free");
                    }
                  }}
                />{" "}
                WiFi Available
              </label>
              {itineraryRows[0]?.wifiAvailable && (
                <div
                  className="wifi-options"
                  style={{ marginTop: "8px", paddingLeft: "0px", display: "flex" }}
                >
                  <label>
                    <input
                      type="radio"
                      name={`wifiType-${itineraryRows[0].id}`}
                      value="free"
                      checked={itineraryRows[0].wifiType === "free"}
                      onChange={(e) =>
                        updateRow(itineraryRows[0].id, "wifiType", e.target.value)
                      }
                    />{" "}
                    Free
                  </label>
                  <label style={{ marginLeft: "10px" }}>
                    <input
                      type="radio"
                      name={`wifiType-${itineraryRows[0].id}`}
                      value="paid"
                      checked={itineraryRows[0].wifiType === "paid"}
                      onChange={(e) =>
                        updateRow(itineraryRows[0].id, "wifiType", e.target.value)
                      }
                    />{" "}
                    Paid
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Remove row button if multiple rows */}
          {itineraryRows.length > 1 && (
            <button
              type="button"
              className="delete-icon"
              onClick={() => removeRow(itineraryRows[0].id)}
              aria-label="Remove row"
              title="Remove"
            >
              🗑
            </button>
          )}
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
            alert("Cancelled (mock).");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};





export default HotelTicketForm;
