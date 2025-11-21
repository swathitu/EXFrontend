import React, { useState, useEffect } from "react";
import "./CarSelectionOptions.css";

const CarSelectionOptions = ({ car, tripId, tripType = "Car", onClose, onConfirmSuccess }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedOptionData, setSelectedOptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format date utility
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
          // Optional: determine lowest price for tag
          let lowestAmount = null;
          data.data.forEach((item) => {
            const amt = parseFloat(item.Amount);
            if (lowestAmount === null || amt < lowestAmount) lowestAmount = amt;
          });

          // Map API data to option format
          const mappedOptions = data.data.map((item, index) => {
            const amountNum = parseFloat(item.Amount);
            return {
              id: item.ROWID || index,
              rowId: item.ROWID,
              tripId: item.Trip_ID,
              tripLineItemId: item.Trip_Line_Item_ID,
              carName: item.Merchant_Name,
              pickUpDate: item.CAR_DEP_DATE,
              pickUpTime: item.CAR_DEP_TIME,
              pickUpLocation: item.CAR_DEP_CITY,
              dropOffDate: item.CAR_ARR_DATE,
              dropOffTime: item.CAR_ARR_TIME,
              dropOffLocation: item.CAR_ARR_CITY,
              carType: item.CAR_TYPE,
              notes: item.Notes,
              price: `${item.Currency_id} ${item.Amount}`,
              refundable: item.Refund_Type === "Refundable",
              tag: amountNum === lowestAmount ? "LOW-FARE" : null,
            };
          });

          setOptions(mappedOptions);
          setSelectedOption(0);
          setSelectedOptionData(mappedOptions[0] || null);
        } else {
          setError(data.message || "Failed to fetch car options");
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
      console.log("No option selected");
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
          alert("Option selection confirmed successfully.");
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


  if (loading) return <div className="car-container">Loading options…</div>;
  if (error) return <div className="car-container error">{error}</div>;

  return (
    <div className="car-container">
      {/* Header */}
      <div className="hotel-header">
        <div>
          <h3 className="hotel-h3">{car?.from?.cityName || "Car Rental"}</h3>
          <p>
            {formatDate(car?.date?.split(" To ")[0])} to{" "}
            {formatDate(car?.date?.split(" To ")[1])}
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
      <div className="table-header">
        <div className="col car-name">CAR NAME</div>
        <div className="col pick-up">PICK-UP</div>
        <div className="col drop-off">DROP-OFF</div>
        <div className="col car-type">CAR TYPE</div>
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
            {/* CAR NAME */}
            <div className="col car-name">
              <input
                type="radio"
                checked={selectedOption === index}
                onChange={() => handleOptionSelect(index)}
              />
              <div className="car-details">
                <h5>{option.carName}</h5>
              </div>
            </div>

            {/* PICK-UP */}
            <div className="col pick-up">
              <div>{formatDate(option.pickUpDate)}</div>
              <div className="time">({option.pickUpTime})</div>
              <div className="location">{option.pickUpLocation}</div>
            </div>

            {/* DROP-OFF */}
            <div className="col drop-off">
              <div>{formatDate(option.dropOffDate)}</div>
              <div className="time">({option.dropOffTime})</div>
              <div className="location">{option.dropOffLocation}</div>
            </div>

            {/* CAR TYPE */}
            <div className="col car-type">{option.carType}</div>

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
      <div className="footer-car">
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

export default CarSelectionOptions;
