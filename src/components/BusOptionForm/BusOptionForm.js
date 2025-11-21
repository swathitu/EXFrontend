import React, { useState, useEffect } from "react";
import "./BusOptionForm.css";

const cityOptions = [
  { cityCode: "", cityName: "Select City", airportName: "" },
  { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
  { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
  { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
  { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
  { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
];

const getCityCodeByName = (name) => {
  if (!name) return "";
  const found = cityOptions.find((c) => c.cityName === name);
  return found ? found.cityCode : "";
};

const initialOption = () => ({
  optionId: null,
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

const BusOptionCard = ({ index, option, onChange, onRemove, currencyList }) => {
  const renderCityOptions = () =>
    cityOptions.map((opt) => (
      <option key={opt.cityCode} value={opt.cityCode}>
        {opt.cityName} - {opt.cityCode}
      </option>
    ));

  return (
    <div className="option-card">
      <div className="option-header">
        <h4>Option {index + 1}</h4>
        {!option.optionId && (
          <span
            className="delete-icon"
            onClick={() => onRemove(index)}
            role="button"
            aria-label="Remove option"
          >
            🗑
          </span>
        )}
      </div>

      <div className="option-grid">
        <div className="field">
          <label>Carrier Name *</label>
          <input
            type="text"
            value={option.carrierName}
            onChange={(e) => onChange(index, "carrierName", e.target.value)}
            placeholder="Enter carrier name"
          />
        </div>

        <div className="field">
          <label>Departure City *</label>
          <select
            value={option.depCity}
            onChange={(e) => onChange(index, "depCity", e.target.value)}
          >
            {renderCityOptions()}
          </select>
        </div>

        <div className="field">
          <label>Arrival City *</label>
          <select
            value={option.arrCity}
            onChange={(e) => onChange(index, "arrCity", e.target.value)}
          >
            {renderCityOptions()}
          </select>
        </div>

        <div className="field">
          <label>Departure Date & Time *</label>
          <div className="date-time">
            <input
              type="date"
              value={option.depDate}
              onChange={(e) => onChange(index, "depDate", e.target.value)}
            />
            <input
              type="time"
              value={option.depTime}
              onChange={(e) => onChange(index, "depTime", e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Arrival Date & Time *</label>
          <div className="date-time">
            <input
              type="date"
              value={option.arrDate}
              onChange={(e) => onChange(index, "arrDate", e.target.value)}
            />
            <input
              type="time"
              value={option.arrTime}
              onChange={(e) => onChange(index, "arrTime", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="amount-section">
          <label>Amount *</label>
          <select
            value={option.currency}
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
            value={option.amount}
            onChange={(e) => onChange(index, "amount", e.target.value)}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={option.isRefundable}
              onChange={(e) => onChange(index, "isRefundable", e.target.checked)}
            />{" "}
            Is Refundable
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          Add Notes
          <textarea
            value={option.notes}
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

const BusOptionForm = ({ bus, onClose, onSave }) => {
  const initialFromTrain = () => {
    const origin = bus?.BUS_DEP_CITY || bus?.item?.BUS_DEP_CITY || "";
    const dest = bus?.BUS_ARR_CITY || bus?.item?.BUS_ARR_CITY || "";
    const depDate = bus?.BUS_DEP_DATE || bus?.item?.BUS_DEP_DATE || "";
    const depTime = bus?.BUS_DEP_TIME || bus?.item?.BUS_DEP_TIME || "";
    const arrDate = bus?.BUS_ARR_DATE || bus?.item?.BUS_ARR_DATE || "";
    const arrTime = bus?.BUS_ARR_TIME || bus?.item?.BUS_ARR_TIME || "";

    return {
      carrierName: "",
      depCity: origin,
      arrCity: dest,
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

  useEffect(() => {
    console.log("Bus prop in BusOptionForm:", bus);

    // Support Option_Status on bus or bus.item
    const optionStatus = (
      bus?.Option_Status ||
      bus?.item?.Option_Status ||
      ""
    ).toLowerCase();
    console.log("Option_Status in Bus prop:", optionStatus);

    const isEditMode = optionStatus.includes("added") || optionStatus.includes("option");

    // Check rowId presence flexibly
    const rowId = bus?.rowId || bus?.item?.rowId || bus?.ROWID || bus?.item?.ROWID;

    if (isEditMode && rowId) {
      const fetchExistingOptions = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/server/trip_options_forms?rowId=${rowId}&requestType=bus`
          );

          if (!response.ok) throw new Error("Failed to fetch options");

          const result = await response.json();

          if (result.status === "success" && result.data && result.data.length > 0) {
            // --- MAP DB COLUMNS TO UI STATE ---
            const mappedOptions = result.data.map((dbItem) => ({
              optionId: dbItem.ROWID,
              carrierName: dbItem.Merchant_Name,
              depCity: getCityCodeByName(dbItem.BUS_DEP_CITY),
              arrCity: getCityCodeByName(dbItem.BUS_ARR_CITY),
              depDate: dbItem.BUS_DEP_DATE,
              depTime: dbItem.BUS_DEP_TIME,
              arrDate: dbItem.BUS_ARR_DATE,
              arrTime: dbItem.BUS_ARR_TIME,
              amount: dbItem.Amount,
              currency: dbItem.Currency_id,
              isRefundable: dbItem.Refund_Type === "Refundable",
              notes: dbItem.Notes,
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
  }, [bus]);

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

  const getCityFullInfo = (code) =>
    cityOptions.find((c) => c.cityCode === code) || {
      cityCode: "",
      cityName: "",
      airportName: "",
    };

  const payloadOptions = options.map((opt) => ({
    ...opt,
    depCityDetail: getCityFullInfo(opt.depCity), // full object with cityName etc.
    arrCityDetail: getCityFullInfo(opt.arrCity),
  }));

  // New: Send payload to the API endpoint on save
  const handleSave = async () => {
    const getCityFullInfo = (code) =>
      cityOptions.find((c) => c.cityCode === code) || {
        cityCode: "",
        cityName: "",
        airportName: "",
      };

    const fullOptions = options.map((opt) => ({
      ...opt,
      optionId: opt.optionId,
      depCityName: getCityFullInfo(opt.depCity).cityName,
      arrCityName: getCityFullInfo(opt.arrCity).cityName,
    }));

    const payload = {
      tripId: bus?.TRIP_ID || bus?.item?.TRIP_ID,
      rowId: bus?.ROWID || bus?.item?.ROWID,
      agentId: bus?.AGENT_ID || bus?.item?.AGENT_ID,
      agentName: bus?.AGENT_NAME || bus?.item?.AGENT_NAME,
      agentEmail: bus?.AGENT_EMAIL || bus?.item?.AGENT_EMAIL,
      requestType: "bus",
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
      console.log("Server response:", responseData);

      if (onSave) {
        onSave(responseData);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to save data:", error);
      // Handle error UI feedback if needed
    }
  };

  return (
    <div className="carrier-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <span className="icon-plane">
            <i className="fas fa-bus" />
          </span>
          <h3 className="h3-h" style={{ border: "none" }}>
            Add Trip Options
          </h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Trip Info */}
      <div className="trip-info">
        <h4>
          {(cityOptions.find((c) => c.cityCode === options[0]?.depCity)?.cityName ||
            "")}{" "}
          ➡{" "}
          {(cityOptions.find((c) => c.cityCode === options[0]?.arrCity)?.cityName || "")}
        </h4>
        <p>{options[0]?.depDate || ""}</p>
      </div>

      {/* Option Cards */}
      {options.map((opt, idx) => (
        <BusOptionCard
          key={idx}
          index={idx}
          option={opt}
          onChange={updateOption}
          onRemove={removeOption}
          currencyList={currencyList}
        />
      ))}

      {/* Add New Option */}
      <button className="add-option-btn btn-primary " onClick={addOption}>
        Add New Option
      </button>

      {/* Footer */}
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

export default BusOptionForm;
