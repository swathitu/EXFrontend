import React, { useState, useEffect } from "react";
import "./TrainSelectionOptions.css";

const TrainSelectionOptions = ({ train, tripId, tripType = "Train", onClose, onConfirmSuccess }) => {
  console.log("TrainSelectionOptions props:", { train, tripId, tripType });
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedOptionData, setSelectedOptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
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

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    let start = startH * 60 + startM;
    let end = endH * 60 + endM;
    if (end < start) end += 24 * 60;
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
          let lowestAmount = null;
          data.data.forEach((item) => {
            const amt = parseFloat(item.Amount);
            if (lowestAmount === null || amt < lowestAmount) lowestAmount = amt;
          });

          const mappedOptions = data.data.map((item, index) => {
            const amountNum = parseFloat(item.Amount);
            const duration = calculateDuration(item.TRAIN_DEP_TIME, item.TRAIN_ARR_TIME);
            return {
              id: item.ROWID || index,
              rowId: item.ROWID,
              tripId: item.Trip_ID,
              tripLineItemId: item.Trip_Line_Item_ID,
              trainName: item.Merchant_Name,
              departureDate: item.TRAIN_DEP_DATE,
              departureTime: item.TRAIN_DEP_TIME,
              departureLocation: item.TRAIN_DEP_CITY,
              arrivalDate: item.TRAIN_ARR_DATE,
              arrivalTime: item.TRAIN_ARR_TIME,
              arrivalLocation: item.TRAIN_ARR_CITY,
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
          setError(data.message || "Failed to fetch train options");
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
      alert("Please select a train option before confirming.");
      return;
    }
    const payload = {
      tripId: selectedOptionData.tripId,
      rowId: selectedOptionData.rowId,
      tripLineItemId: selectedOptionData.tripLineItemId,
      type: tripType,
    };
    console.log("Confirm button clicked. Payload to send:", payload);

    setLoadingConfirm(true);

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
          alert("Train option confirmed successfully.");
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
      })
      .finally(() => setLoadingConfirm(false));
  };

  if (loading) return <div className="bus-container">Loading options…</div>;
  if (error) return <div className="bus-container error">{error}</div>;

  return (
    <div className="bus-container">
      <div className="hotel-header">
        <div>
          <h3 className="hotel-h3">{train?.from?.cityName || "Train"}</h3>
          <p>{formatDate(train?.date?.split(" To ")[0])}</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <h4 className="select-title">
        Select an Option <span className="info-icon">ⓘ</span>
      </h4>

      {/* Table Header */}
      <div
        className="table-header2"
        style={{ opacity: loadingConfirm ? 0.5 : 1, pointerEvents: loadingConfirm ? "none" : "auto" }}
      >
        <div className="col bus-name">TRAIN NAME</div>
        <div className="col departure">DEPARTURE</div>
        <div className="col arrival">ARRIVAL</div>
        <div className="col duration">DURATION</div>
        <div className="col notes">NOTES</div>
        <div className="col price"></div>
      </div>

      {/* Options */}
      <div
        className="options-list"
        style={{ opacity: loadingConfirm ? 0.5 : 1, pointerEvents: loadingConfirm ? "none" : "auto" }}
      >
        {options.map((option, index) => (
          <div key={option.id} className={`option-card1 ${selectedOption === index ? "selected" : ""}`}>
            <div className="col bus-name">
              <input type="radio" checked={selectedOption === index} onChange={() => handleOptionSelect(index)} />
              <div className="bus-details">
                <h5>{option.trainName}</h5>
              </div>
            </div>

            <div className="col departure">
              <div>{formatDate(option.departureDate)}</div>
              <div className="time">({option.departureTime})</div>
              <div className="location">{option.departureLocation}</div>
            </div>

            <div className="col arrival">
              <div>{formatDate(option.arrivalDate)}</div>
              <div className="time">({option.arrivalTime})</div>
              <div className="location">{option.arrivalLocation}</div>
            </div>

            <div className="col duration">{option.duration}</div>

            <div className="col notes">{option.notes}</div>

            <div className="col price">
              <h4>{option.price}</h4>
              <p>{option.refundable ? "(Refundable)" : "(Non Refundable)"}</p>
              {option.tag && <span className="tag">{option.tag}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="footer-bus"
        style={{ opacity: loadingConfirm ? 0.5 : 1, pointerEvents: loadingConfirm ? "none" : "auto" }}
      >
        <button className="confirm-btn" onClick={handleConfirm} disabled={loadingConfirm}>
          {loadingConfirm ? "Confirming..." : "Confirm Selection"}
        </button>
        <button className="cancel-btn" onClick={onClose} disabled={loadingConfirm}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrainSelectionOptions;
