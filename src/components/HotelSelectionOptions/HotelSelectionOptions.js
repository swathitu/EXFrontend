import React, { useState, useEffect } from "react";
import "./HotelSelectionOptions.css";
import { FaBed, FaWifi } from "react-icons/fa";
import { MdOutlineAcUnit, MdFreeBreakfast } from "react-icons/md";

const HotelSelectionOptions = ({ hotel, tripId, onClose, onConfirmSuccess }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedOptionData, setSelectedOptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleAddressIndex, setVisibleAddressIndex] = useState(null);

  const formatDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const dateObj = new Date(isoDateStr);
    if (isNaN(dateObj)) return isoDateStr;
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const tripType = hotel?.type || "Hotel";

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
            return {
              id: item.ROWID || index,
              rowId: item.ROWID,
              tripId: item.Trip_ID,
              tripLineItemId: item.Trip_Line_Item_ID,
              hotelName: item.Merchant_Name,
              rating: item.Hotel_Class,
              checkIn: item.HOTEL_DEP_DATE,
              checkOut: item.HOTEL_ARR_DATE,
              checkInTime: item.HOTEL_DEP_TIME,
              checkOutTime: item.HOTEL_ARR_TIME,
              roomType: item.Room_Type,
              notes: item.Notes,
              price: `${item.Currency_id} ${item.Amount}`,
              refundable: item.Refund_Type === "Refundable",
              tag: amountNum === lowestAmount ? "LOW-FARE" : null,
              wifiType: item.WiFi_Type,
              wifiAvailable: item.Wifi_Availablity === "true",
              acAvailable: item.Is_AC_Available === "true",
              breakfastComplimentary: item.Is_Breakfast_Complimentary === "true",
              hotelAddress: item.Hotel_Address,
            };
          });
          setOptions(mappedOptions);
          setSelectedOption(0);
          setSelectedOptionData(mappedOptions[0] || null);
        } else {
          setError(data.message || "Failed to fetch hotel options");
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


  if (loading) return <div className="hotel-container">Loading options…</div>;
  if (error) return <div className="hotel-container error">{error}</div>;

  return (
    <div className="hotel-container">
      <div className="hotel-header">
        <div>
          <h3 className="hotel-h3">{hotel?.from?.cityName || "Hotel"}</h3>
          <p>
            {formatDate(hotel?.date?.split(" To ")[0])} to{" "}
            {formatDate(hotel?.date?.split(" To ")[1])}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <h4 className="select-title">
        Select an Option <span className="info-icon">ⓘ</span>
      </h4>

      <div className="table-header">
        <div className="col hotel-name">HOTEL NAME</div>
        <div className="col check-in">CHECK-IN</div>
        <div className="col check-out">CHECK-OUT</div>
        <div className="col room-type">ROOM TYPE</div>
        <div className="col notes">NOTES</div>
        <div className="col price"></div>
      </div>

      <div className="options-list">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`option-card1 ${selectedOption === index ? "selected" : ""
              }`}
          >
            <div className="col hotel-name">
              <input
                type="radio"
                checked={selectedOption === index}
                onChange={() => handleOptionSelect(index)}
              />
              <div className="hotel-details">
                <h5>{option.hotelName}</h5>
                <span className="rating">{option.rating}</span>
                <div
                  className="view-address"
                  onClick={() =>
                    setVisibleAddressIndex(
                      visibleAddressIndex === index ? null : index
                    )
                  }
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "blue",
                    userSelect: "none",
                  }}
                >
                  Address
                </div>
                {visibleAddressIndex === index && (
                  <div
                    className="address-text"
                    style={{ marginTop: "4px", whiteSpace: "pre-wrap" }}
                  >
                    {option.hotelAddress}
                  </div>
                )}
              </div>
            </div>

            <div className="col check-in">
              <div>{formatDate(option.checkIn)}</div>
              <div className="time">{option.checkInTime}</div>
            </div>

            <div className="col check-out">
              <div>{formatDate(option.checkOut)}</div>
              <div className="time">{option.checkOutTime}</div>
            </div>

            <div className="col room-type">
              <div>{option.roomType}</div>
              <div className="icons">
                <FaBed />
                {option.acAvailable && <MdOutlineAcUnit />}
                {option.wifiAvailable && <FaWifi />}
                {option.breakfastComplimentary && (
                  <MdFreeBreakfast
                    className="breakfast-icon"
                    title="Breakfast Included"
                    aria-label="breakfast"
                  />
                )}
              </div>
            </div>

            <div className="col notes">{option.notes}</div>

            <div className="col price">
              <h4>{option.price}</h4>
              <p>{option.refundable ? "(Refundable)" : "(Non Refundable)"}</p>
              {option.tag && <span className="tag">{option.tag}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-hotel">
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

export default HotelSelectionOptions;
