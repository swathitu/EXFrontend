import React, { useState, useEffect } from "react";
import "./HotelOptionForm.css";

const initialOption = () => ({
  optionId: null,
  hotelName: "",
  hotelAddress: "",
  city: "",
  arrDate: "",
  arrTime: "",
  depDate: "",
  depTime: "",
  notes: "",
  amount: "",
  currency: "INR",
  isRefundable: false,
  starRating: "",
  roomType: "",
  breakfastComplimentary: false,
  acAvailable: false,
  wifiAvailable: false,
  wifiType: "free", // default WiFi option when wifiAvailable=true
});


const cityOptions = [
  { cityCode: "", cityName: "Select City" },
  { cityCode: "NYC", cityName: "New York" },
  { cityCode: "LON", cityName: "London" },
  { cityCode: "PAR", cityName: "Paris" },
  { cityCode: "DXB", cityName: "Dubai" },
  { cityCode: "TYO", cityName: "Tokyo" },
];

const getCityCodeByName = (name) => {
  if (!name) return "";
  const found = cityOptions.find((c) => c.cityName === name);
  return found ? found.cityCode : ""; 
};
const starRatings = [
  { value: "", label: "Select Star Rating" },
  { value: "5 Star", label: "5 Star" },
  { value: "4 Star", label: "4 Star" },
  { value: "3 Star", label: "3 Star" },
  { value: "2 Star", label: "2 Star" },
  { value: "1 Star", label: "1 Star" },
];

const roomTypes = [
  { value: "", label: "Select Room Type" },
  { value: "Queen", label: "Queen" },
  { value: "King", label: "King" },
  { value: "Double", label: "Double" },
  { value: "Twin", label: "Twin" },
  { value: "Suite", label: "Suite" },
];

const HotelOptions = ({ hotel, onClose, onSave, requestType = "hotel" }) => {
  console.log("hotel props", hotel);
  const arrDate = hotel?.HOTEL_ARR_DATE || "";
  const arrTime = hotel?.HOTEL_ARR_TIME || "";
  const depDate = hotel?.HOTEL_DEP_DATE || "";
  const depTime = hotel?.HOTEL_DEP_TIME || "";
  const cityArr = hotel?.HOTEL_ARR_CITY || "";

  const [currencyList, setCurrencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([
    {
      ...initialOption(),
      city: cityArr,
      arrDate: arrDate,
      arrTime: arrTime,
      depDate: depDate,
      depTime: depTime,
    },
  ]);

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("/server/get_currencyMaster/currency");
        const data = await response.json();
        setCurrencyList(data);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const status = (hotel?.Option_Status || "").toLowerCase();
    const isEditMode = status.includes("added") || status.includes("option");

    if (isEditMode && hotel?.rowId) {
      const fetchExistingOptions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/server/trip_options_forms?rowId=${hotel.rowId}&requestType=hotel`);
            
            if (!response.ok) throw new Error("Failed to fetch options");
            
            const result = await response.json();
            
            if (result.status === 'success' && result.data && result.data.length > 0) {
                
                // --- MAP DB COLUMNS TO UI STATE ---
                const mappedOptions = result.data.map(dbItem => ({
                    optionId: dbItem.ROWID,
                    hotelName: dbItem.Merchant_Name,
                    hotelAddress: dbItem.Hotel_Address,
                    
                    city: getCityCodeByName(dbItem.HOTEL_ARR_CITY),
                    
                    arrDate: dbItem.HOTEL_ARR_DATE,
                    arrTime: dbItem.HOTEL_ARR_TIME,
                    depDate: dbItem.HOTEL_DEP_DATE,
                    depTime: dbItem.HOTEL_DEP_TIME,
                    
                    starRating: dbItem.Hotel_Class,
                    roomType: dbItem.Room_Type,
                    
                    // Convert string "true"/"false" back to boolean
                    acAvailable: dbItem.Is_AC_Available === 'true',
                    wifiAvailable: dbItem.Wifi_Availablity === 'true',
                    wifiType: dbItem.WiFi_Type,
                    breakfastComplimentary: dbItem.Is_Breakfast_Complimentary === 'true',

                    amount: dbItem.Amount,
                    currency: dbItem.Currency_id,
                    isRefundable: dbItem.Refund_Type === 'Refundable',
                    notes: dbItem.Notes
                }));
                setOptions(mappedOptions);
            }
        } catch (error) {
            console.error("Error loading existing options:", error);
        } finally {
            setIsLoading(false);
        }
      };
      fetchExistingOptions();
    }
  }, [hotel]);

  const addOption = () => {
    setOptions((prev) => [...prev, initialOption()]);
  };

  const updateOption = (index, field, value) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Helper to get city name from code
    const getCityName = (code) => {
      const city = cityOptions.find((c) => c.cityCode === code);
      return city ? city.cityName : "";
    };

    // Map options to include cityName alongside cityCode
    const mappedOptions = options.map((opt) => ({
      ...opt,
      optionId: opt.optionId,
      cityName: getCityName(opt.city), // add cityName here
    }));

    const payload = {
      tripId: hotel?.TRIP_ID,
      rowId: hotel?.ROWID,
      agentId: hotel?.AGENT_ID,
      agentName: hotel?.AGENT_NAME,
      agentEmail: hotel?.AGENT_EMAIL,
      requestType: requestType,
      options: mappedOptions,
    };

    try {
      const response = await fetch("/server/trip_options_forms/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Save successful", result);

      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };


  return (
    <div className="hotel-container">
      <div className="header">
        <div className="header-left">
          <span className="icon-plane">
            <i className="fas fa-hotel" />
          </span>
          <h3 className="h3-h" style={{ border: "none" }}>
            Add Trip Options
          </h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        {/* First row: cityArr */}
        <div style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
          <p style={{ margin: 0 }}>{cityArr}</p>
        </div>
        {/* Second row: depDate+depTime and arrDate+arrTime side by side */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: '12px' }}>
          <p style={{ margin: 0 }}>
            <span>{depDate}</span> <span>{depTime}</span>
          </p>
          ➡
          <p style={{ margin: 0 }}>
            <span>{arrDate}</span> <span>{arrTime}</span>
          </p>
        </div>
      </div>

      {options.map((opt, idx) => (
        <div className="option-card" key={idx}>
          <div className="option-header">
            <h4>Option {idx + 1}</h4>
            {!opt.optionId && (
                            <span className="delete-icon" onClick={() => removeOption(idx)} role="button" aria-label="Remove option">
                            🗑
                            </span>
                        )}
          </div>

          <div className="option-grid">
            <div className="field">
              <label>Hotel Name *</label>
              <input
                type="text"
                placeholder="Enter hotel name"
                value={opt.hotelName}
                onChange={(e) => updateOption(idx, "hotelName", e.target.value)}
              />
            </div>

            <div className="field">
              <label>Hotel Address</label>
              <input
                type="text"
                placeholder="Max 250 characters"
                value={opt.hotelAddress}
                onChange={(e) => updateOption(idx, "hotelAddress", e.target.value)}
              />
            </div>

            <div className="field">
              <label>Location *</label>
              <select
                value={opt.city}
                onChange={(e) => updateOption(idx, "city", e.target.value)}
              >
                {cityOptions.map((city) => (
                  <option key={city.cityCode} value={city.cityCode}>
                    {city.cityName}
                  </option>
                ))}
              </select>
            </div>


            <div className="field">
              <label>Check-in Date & Time *</label>
              <div className="date-time">
                <input
                  type="date"
                  value={opt.arrDate}
                  onChange={(e) => updateOption(idx, "arrDate", e.target.value)}
                />
                <input
                  type="time"
                  value={opt.arrTime}
                  onChange={(e) => updateOption(idx, "arrTime", e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Check-out Date & Time *</label>
              <div className="date-time">
                <input
                  type="date"
                  value={opt.depDate}
                  onChange={(e) => updateOption(idx, "depDate", e.target.value)}
                />
                <input
                  type="time"
                  value={opt.depTime}
                  onChange={(e) => updateOption(idx, "depTime", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="extra-details">
            <div className="field">
              <label>Star Rating</label>
              <select
                value={opt.starRating}
                onChange={(e) => updateOption(idx, "starRating", e.target.value)}
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
                value={opt.roomType}
                onChange={(e) => updateOption(idx, "roomType", e.target.value)}
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
                  checked={opt.breakfastComplimentary}
                  onChange={(e) =>
                    updateOption(idx, "breakfastComplimentary", e.target.checked)
                  }
                />{" "}
                Breakfast Complimentary
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={opt.acAvailable}
                  onChange={(e) => updateOption(idx, "acAvailable", e.target.checked)}
                />{" "}
                A/C Available
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={opt.wifiAvailable}
                  onChange={(e) => {
                    updateOption(idx, "wifiAvailable", e.target.checked);
                    // If unchecking wifi, reset wifiType as empty string
                    if (!e.target.checked) {
                      updateOption(idx, "wifiType", "");
                    } else {
                      updateOption(idx, "wifiType", "free"); // default to free
                    }
                  }}
                />{" "}
                WiFi Available
              </label>
            </div>

            {/* Show WiFi options only if wifiAvailable is true */}
            {opt.wifiAvailable && (
              <div
                className="wifi-options"
                style={{ marginTop: "8px", paddingLeft: "20px" }}
              >
                <label>
                  <input
                    type="radio"
                    name={`wifiType-${idx}`}
                    value="free"
                    checked={opt.wifiType === "free"}
                    onChange={(e) => updateOption(idx, "wifiType", e.target.value)}
                  />{" "}
                  Free
                </label>
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="radio"
                    name={`wifiType-${idx}`}
                    value="paid"
                    checked={opt.wifiType === "paid"}
                    onChange={(e) => updateOption(idx, "wifiType", e.target.value)}
                  />{" "}
                  Paid
                </label>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="amount-section">
              <label>Amount *</label>
              <select
                value={opt.currency}
                onChange={(e) => updateOption(idx, "currency", e.target.value)}
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
                placeholder="0.00"
                value={opt.amount}
                onChange={(e) => updateOption(idx, "amount", e.target.value)}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={!!opt.isRefundable}
                  onChange={(e) => updateOption(idx, "isRefundable", e.target.checked)}
                />{" "}
                Is Refundable
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              Add Notes
              <textarea
                value={opt.notes}
                onChange={(e) => updateOption(idx, "notes", e.target.value)}
                rows={2}
                placeholder="Enter notes here"
                style={{ width: "231px", height: "25px" }}
              />
            </div>
          </div>
        </div>
      ))}

      <button className="btn-primary" onClick={addOption}>
        Add New option
      </button>

      <div className="footer">
        <button className="btn-primary" onClick={handleSave}>
          Save and Send
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default HotelOptions;
