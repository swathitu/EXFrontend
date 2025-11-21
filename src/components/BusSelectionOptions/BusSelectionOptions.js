import React, { useState, useEffect } from "react";
import "./BusSelectionOptions.css";

const BusSelectionOptions = ({ bus, tripId, tripType = "Bus", onClose, onConfirmSuccess }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedOptionData, setSelectedOptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const dateObj = new Date(isoDateStr);
    if (isNaN(dateObj)) return isoDateStr;
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to calculate duration between two time strings (HH:mm format)
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    let start = startH * 60 + startM;
    let end = endH * 60 + endM;
    if (end < start) end += 24 * 60; // handle next day arrival
    const diff = end - start;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h${m > 0 ? " " + m + "m" : ""}`;
  };

  useEffect(() => {
    if (!tripId || !tripType) return;
    setLoading(true);
    setError("");

    const apiUrl = `/server/trip_options_crud?tripId=${tripId}&type=${tripType}`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          // Find lowest price to assign LOW-FARE tag
          let lowestAmount = null;
          data.data.forEach((item) => {
            const amt = parseFloat(item.Amount);
            if (lowestAmount === null || amt < lowestAmount) lowestAmount = amt;
          });

          // Map API data to bus options
          const mappedOptions = data.data.map((item, index) => {
            const amountNum = parseFloat(item.Amount);
            const duration = calculateDuration(item.BUS_DEP_TIME, item.BUS_ARR_TIME);
            return {
              id: item.ROWID || index,
              rowId: item.ROWID,
              tripId: item.Trip_ID,
              tripLineItemId: item.Trip_Line_Item_ID,
              busName: item.Merchant_Name,
              departureDate: item.BUS_DEP_DATE,
              departureTime: item.BUS_DEP_TIME,
              departureLocation: item.BUS_DEP_CITY,
              arrivalDate: item.BUS_ARR_DATE,
              arrivalTime: item.BUS_ARR_TIME,
              arrivalLocation: item.BUS_ARR_CITY,
              duration,
              notes: item.Notes || "-",
              price: `${item.Currency_id} ${item.Amount}`,
              refundable: item.Refund_Type === "Refundable",
              tag: amountNum === lowestAmount ? "LOW-FARE" : null,
            };
          });

          setOptions(mappedOptions);
          setSelectedOption(0);
          setSelectedOptionData(mappedOptions[0] || null);
        } else {
          setError(data.message || "Failed to fetch bus options");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId, tripType]);

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    setSelectedOptionData(options[index]);
    console.log("Option selected:", options[index]);
  };

  const handleConfirm = () => {
    if (!selectedOptionData) {
      alert("Please select a bus option before confirming.");
      return;
    }
    const payload = {
      tripId: selectedOptionData.tripId,
      rowId: selectedOptionData.rowId,
      tripLineItemId: selectedOptionData.tripLineItemId,
      type: tripType,
    };
    console.log("Confirm button clicked. Payload to send:", payload);

    fetch("/server/trip_option_selects/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          alert("Bus option confirmed successfully.");
          if (onConfirmSuccess) {
            onConfirmSuccess(); // Notify parent to refresh data
          }
          onClose();
        } else {
          alert(`Failed to confirm selection: ${data.message || "Unknown error"}`);
        }
      })
      .catch((err) => {
        console.error("Error confirming option selection:", err);
        alert(`Error confirming selection: ${err.message}`);
      });
  };


  if (loading) return <div className="bus-container">Loading options…</div>;
  if (error) return <div className="bus-container error">{error}</div>;

  return (
    <div className="bus-container">
      {/* Header */}
      <div className="hotel-header">
        <div>
          <h3 className="hotel-h3">{bus?.from?.cityName || "Car Rental"}</h3>
          <p>
            {formatDate(bus?.date?.split(" To ")[0])}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <h4 className="select-title">
        Select an Option <span className="info-icon">ⓘ</span>
      </h4>

      {/* Table Header */}
      <div className="table-header2">
        <div className="col bus-name">BUS NAME</div>
        <div className="col departure">DEPARTURE</div>
        <div className="col arrival">ARRIVAL</div>
        <div className="col duration">DURATION</div>
        <div className="col notes">NOTES</div>
        <div className="col price"></div>
      </div>

      {/* Options */}
      <div className="options-list">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`option-card1 ${selectedOption === index ? "selected" : ""}`}
          >
            {/* BUS NAME */}
            <div className="col bus-name">
              <input
                type="radio"
                checked={selectedOption === index}
                onChange={() => handleOptionSelect(index)}
              />
              <div className="bus-details">
                <h5>{option.busName}</h5>
              </div>
            </div>

            {/* DEPARTURE */}
            <div className="col departure">
              <div>{formatDate(option.departureDate)}</div>
              <div className="time">({option.departureTime})</div>
              <div className="location">{option.departureLocation}</div>
            </div>

            {/* ARRIVAL */}
            <div className="col arrival">
              <div>{formatDate(option.arrivalDate)}</div>
              <div className="time">({option.arrivalTime})</div>
              <div className="location">{option.arrivalLocation}</div>
            </div>

            {/* DURATION */}
            <div className="col duration">{option.duration}</div>

            {/* NOTES */}
            <div className="col notes">{option.notes}</div>

            {/* PRICE */}
            <div className="col price">
              <h4>{option.price}</h4>
              <p>{option.refundable ? "(Refundable)" : "(Non Refundable)"}</p>
              {option.tag && <span className="tag">{option.tag}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="footer-bus">
        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Selection
        </button>
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BusSelectionOptions;
