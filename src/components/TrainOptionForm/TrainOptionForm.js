import React, { useState, useEffect } from "react";
import "./TrainOptionForm.css";

const cityOptions = [
  { cityCode: "", cityName: "Select City", airportName: "" },
  { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
  { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
  { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
  { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
  { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
];

// Helper: Convert DB City Name (e.g., "New York") -> UI City Code (e.g., "NYC")
const getCityCodeByName = (name) => {
  if (!name) return "";
  const found = cityOptions.find((c) => c.cityName === name);
  return found ? found.cityCode : ""; 
};

const initialOption = () => ({
  optionId: null, // Important for updates
  carrierName: "",
  depDate: "",
  depTime: "",
  arrDate: "",
  arrTime: "",
  depCity: "",
  arrCity: "",
  amount: "",
  currency: "INR",
  isRefundable: false,
  notes: "",
});

const TrainOptionCard = ({ index, option, onChange, onRemove, currencyList }) => {
  const renderCityOptions = () =>
    cityOptions.map((opt) => (
      <option key={opt.cityCode} value={opt.cityCode}>
        {opt.cityName} - {opt.cityCode}
      </option>
    ));

  return (
    <div className="option-card">
      {/* Hidden ID Field */}
      <input type="hidden" value={option.optionId || ""} />

      <div className="option-header">
        <h4>Option {index + 1}</h4>
        {!option.optionId && (
          <span className="delete-icon" onClick={() => onRemove(index)} role="button" aria-label="Remove option">
            🗑
          </span>
        )}
      </div>

      <div className="option-grid">
        <div className="field">
          <label>Carrier Name *</label>
          <input
            type="text"
            value={option.carrierName || ""}
            onChange={(e) => onChange(index, "carrierName", e.target.value)}
            placeholder="Enter carrier name"
          />
        </div>

        <div className="field">
          <label>Departure City *</label>
          <select value={option.depCity || ""} onChange={(e) => onChange(index, "depCity", e.target.value)}>
            {renderCityOptions()}
          </select>
        </div>

        <div className="field">
          <label>Arrival City *</label>
          <select value={option.arrCity || ""} onChange={(e) => onChange(index, "arrCity", e.target.value)}>
            {renderCityOptions()}
          </select>
        </div>

        <div className="field">
          <label>Departure Date & Time *</label>
          <div className="date-time">
            <input type="date" value={option.depDate || ""} onChange={(e) => onChange(index, "depDate", e.target.value)} />
            <input type="time" value={option.depTime || ""} onChange={(e) => onChange(index, "depTime", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Arrival Date & Time *</label>
          <div className="date-time">
            <input type="date" value={option.arrDate || ""} onChange={(e) => onChange(index, "arrDate", e.target.value)} />
            <input type="time" value={option.arrTime || ""} onChange={(e) => onChange(index, "arrTime", e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="amount-section">
          <label>Amount *</label>
          <select
            value={option.currency || "INR"}
            onChange={(e) => onChange(index, "currency", e.target.value)}
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
            value={option.amount || ""}
            onChange={(e) => onChange(index, "amount", e.target.value)}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={option.isRefundable || false}
              onChange={(e) => onChange(index, "isRefundable", e.target.checked)}
            />{" "}
            Is Refundable
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          Add Notes
          <textarea
            value={option.notes || ""}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            rows={2}
            placeholder="Enter notes here"
            style={{ width: "231px", height: "25px" }}
          />
        </div>
      </div>
    </div>
  );
};

const TrainOptionForm = ({ train, onClose, onSave }) => {
  // Default initialization for "Add Mode"
  const initialFromTrain = () => {
    const origin = train?.TRAIN_DEP_CITY || "";
    const dest = train?.TRAIN_ARR_CITY || "";
    const depDate = train?.TRAIN_DEP_DATE || "";
    const depTime = train?.TRAIN_DEP_TIME || "";
    const arrDate = train?.TRAIN_ARR_DATE || "";
    const arrTime = train?.TRAIN_ARR_TIME || "";

    return {
      optionId: null,
      carrierName: "",
      depCity: getCityCodeByName(origin) || origin, // Try to match name to code
      arrCity: getCityCodeByName(dest) || dest,
      depDate,
      depTime,
      arrDate,
      arrTime,
      amount: "",
      currency: "INR",
      isRefundable: false,
      notes: "",
    };
  };

  const [currencyList, setCurrencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([initialFromTrain()]);

  // 1. Fetch Currencies
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

  // 2. FETCH EXISTING OPTIONS (EDIT MODE)
  useEffect(() => {
   
    const status = (train?.Option_Status || "").toLowerCase();
    const isEditMode = status.includes("added") || status.includes("option");

    console.log("Train Form - Status:", status, "RowID:", train?.rowId);

    if (isEditMode && train?.rowId) {
      const fetchExistingOptions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/server/trip_options_forms?rowId=${train.rowId}&requestType=train`);
            
            if (!response.ok) throw new Error("Failed to fetch options");
            
            const result = await response.json();
            console.log("Train Options Fetched:", result);
            
            if (result.status === 'success' && result.data && result.data.length > 0) {
                
                // --- MAP DB COLUMNS TO UI STATE ---
                const mappedOptions = result.data.map(dbItem => ({
                    optionId: dbItem.ROWID,
                    carrierName: dbItem.Merchant_Name,
                    
                    depCity: getCityCodeByName(dbItem.TRAIN_DEP_CITY), 
                    arrCity: getCityCodeByName(dbItem.TRAIN_ARR_CITY),
                    
                    depDate: dbItem.TRAIN_DEP_DATE,
                    depTime: dbItem.TRAIN_DEP_TIME,
                    arrDate: dbItem.TRAIN_ARR_DATE,
                    arrTime: dbItem.TRAIN_ARR_TIME,
                    
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
  }, [train]);


  const addOption = () => {
    setOptions((prev) => [...prev, initialFromTrain()]);
  };

  const updateOption = (index, field, value) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper to get full city info for saving
  const getCityFullInfo = (code) =>
    cityOptions.find((c) => c.cityCode === code) || { cityCode: "", cityName: "", airportName: "" };

  const handleSave = async () => {
    const fullOptions = options.map((opt) => ({
      ...opt,
      optionId: opt.optionId, // Pass ID back for update
      depCityName: getCityFullInfo(opt.depCity).cityName,
      arrCityName: getCityFullInfo(opt.arrCity).cityName,
    }));
    
    const payload = {
      tripId: train?.TRIP_ID,
      rowId: train?.ROWID,
      agentId: train?.AGENT_ID,
      agentName: train?.AGENT_NAME,
      agentEmail: train?.AGENT_EMAIL,
      requestType: "train",
      options: fullOptions,
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
        throw new Error(`Server error: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      if (onSave) {
        onSave(responseData);
      }
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  return (
    <div className="carrier-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <span className="icon-plane">
            <i className="fas fa-train" />
          </span>
          {/* Dynamic Header Title */}
          <h3 className="h3-h" style={{ border: "none" }}>
            {isLoading ? "Loading Options..." : (train?.Option_Status ? "Edit Trip Options" : "Add Trip Options")}
          </h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Trip Info */}
      <div className="trip-info">
        <h4>
          {(cityOptions.find((c) => c.cityCode === options[0]?.depCity)?.cityName || options[0]?.depCity || "")} ➡{" "}
          {(cityOptions.find((c) => c.cityCode === options[0]?.arrCity)?.cityName || options[0]?.arrCity || "")}
        </h4>
        <p>{options[0]?.depDate || ""} ({options[0]?.depTime || ""})</p>
      </div>

      {/* LOADING UI (This was missing in your code) */}
      {isLoading ? (
         <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>Loading existing options...</div>
      ) : (
        <>
          {options.map((opt, idx) => (
            <TrainOptionCard
              key={idx}
              index={idx}
              option={opt}
              onChange={updateOption}
              onRemove={removeOption}
              currencyList={currencyList}
            />
          ))}

          {/* Add New Option */}
          <div className="add-option btn-primary" onClick={addOption} style={{marginBottom: '16px', cursor: 'pointer', textAlign: 'center'}}>
            + Add New Option
          </div>
        </>
      )}

      {/* Footer */}
      <div className="footer">
        <button className="btn-primary" onClick={handleSave} disabled={isLoading}>
          Save and Send
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrainOptionForm;