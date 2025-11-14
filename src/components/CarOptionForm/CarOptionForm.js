import React, { useState, useEffect } from "react";
import "./CarOptionForm.css";

const cityOptions = [
  { cityCode: "", cityName: "Select City", airportName: "" },
  { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
  { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
  { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
  { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
  { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
];

const carTypes = [
  { value: "", label: "Select Car Type" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "luxury", label: "Luxury" },
  { value: "van", label: "Van" },
];





const initialOption = () => ({
  carName: "",
  depDate: "",
  depTime: "",
  arrDate: "",
  arrTime: "",
  depCity: "",
  arrCity: "",
  carType: "",
  amount: "",
  currency: "INR",
  isRefundable: false,
  notes: "",
});

const CarOptionCard = ({ index, option, onChange, onRemove, currencyList }) => {
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
        <span
          className="delete-icon"
          onClick={() => onRemove(index)}
          role="button"
          aria-label="Remove option"
        >
          🗑
        </span>
      </div>

      <div className="option-grid">
        <div className="field">
          <label>Car Name *</label>
          <input
            type="text"
            value={option.carName}
            placeholder="Enter car name"
            onChange={(e) => onChange(index, "carName", e.target.value)}
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

        <div className="field">
          <label>Car Type</label>
          <select
            value={option.carType}
            onChange={(e) => onChange(index, "carType", e.target.value)}
          >
            {carTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
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

const CarOptionForm = ({ car, onClose, onSave }) => {
  const initialFromCar = () => {
    const origin = car?.CAR_DEP_CITY || "";
    const dest = car?.CAR_ARR_CITY || "";
    const depDate = car?.CAR_DEP_DATE || "";
    const depTime = car?.CAR_DEP_TIME || "";
    const arrDate = car?.CAR_ARR_DATE || "";
    const arrTime = car?.CAR_ARR_TIME || "";

    return {
      carName: "",
      depCity: origin,
      arrCity: dest,
      depDate,
      depTime,
      arrDate,
      arrTime,
      carType: "",
      amount: "",
      currency: "INR",
      isRefundable: false,
      notes: "",
    };
  };

  const [currencyList, setCurrencyList] = useState([]);
  const [options, setOptions] = useState([initialFromCar()]);

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
    setOptions((prev) => [...prev, initialFromCar()]);
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
    cityOptions.find(c => c.cityCode === code) || { cityCode: "", cityName: "", airportName: "" };

  const payloadOptions = options.map(opt => ({
    ...opt,
    depCityDetail: getCityFullInfo(opt.depCity),  // full object with cityName etc.
    arrCityDetail: getCityFullInfo(opt.arrCity),
  }));

  const handleSave = async () => {
    const getCityFullInfo = (code) =>
      cityOptions.find((c) => c.cityCode === code) || { cityCode: "", cityName: "", airportName: "" };

    const fullOptions = options.map((opt) => ({
      ...opt,
      depCityName: getCityFullInfo(opt.depCity).cityName,
      arrCityName: getCityFullInfo(opt.arrCity).cityName,
    }));

    const payload = {
      tripId: car?.TRIP_ID,
      rowId: car?.ROWID,
      agentId: car?.AGENT_ID,
      agentName: car?.AGENT_NAME,
      agentEmail: car?.AGENT_EMAIL,
      requestType: "car",
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
      if (onSave) onSave(responseData);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };


  return (
    <div className="car-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <span className="icon-plane">
            <i className="fas fa-car" />
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
          {(cityOptions.find((c) => c.cityCode === options[0]?.depCity)?.cityName || "")} ➡{" "}
          {(cityOptions.find((c) => c.cityCode === options[0]?.arrCity)?.cityName || "")}
        </h4>
        <p>{options[0]?.depDate || ""} ({options[0]?.depTime || ""}) - {options[0]?.arrDate || ""} ({options[0]?.arrTime || ""})</p>
      </div>

      {/* Option Cards */}
      {options.map((opt, idx) => (
        <CarOptionCard
          key={idx}
          index={idx}
          option={opt}
          onChange={updateOption}
          onRemove={removeOption}
          currencyList={currencyList}
        />
      ))}

      {/* Add New Option */}
      <div className=" add-option btn-primary" onClick={addOption}>
        + Add New Option
      </div>

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

export default CarOptionForm;
