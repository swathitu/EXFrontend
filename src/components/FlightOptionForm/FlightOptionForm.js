import React, { useState, useEffect } from "react";
import "./FlightOptionForm.css";

const cityOptions = [
  { cityCode: "", cityName: "Select City", airportName: "" },
  { cityCode: "NYC", cityName: "New York", airportName: "JFK" },
  { cityCode: "LON", cityName: "London", airportName: "Heathrow" },
  { cityCode: "PAR", cityName: "Paris", airportName: "CDG" },
  { cityCode: "DXB", cityName: "Dubai", airportName: "DXB" },
  { cityCode: "TYO", cityName: "Tokyo", airportName: "NRT" },
];

const FlightOptionForm = ({ flight, onClose, onSave, requestType = "flight" }) => {
  const createEmptyFlightRow = () => ({
    carrierName: "",
    flightNumber: "",
    depDate: "",
    depTime: "",
    arrDate: "",
    arrTime: "",
    baggageDetails: "",
    flightClass: "",
    depCity: "",
    arrCity: "",
    preferredTime: "", // Store preferred time
  });

  const generateOptionId = () => {
    return Number(Date.now().toString() + Math.floor(Math.random() * 1000).toString());
  };

  const createEmptyOption = () => ({
    optionId: generateOptionId(),
    flightRows: [createEmptyFlightRow()],
    amount: "",
    currency: "INR",
    isRefundable: false,
    notes: "",
  });



  const [options, setOptions] = useState([createEmptyOption()]);
  const [currencyList, setCurrencyList] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");


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
    if (flight) {
      setOptions([
        {
          optionId: generateOptionId(),
          flightRows: [
            {
              carrierName: flight.carrierName || "",
              flightNumber: flight.flightNumber || "",
              depDate: flight.FLIGHT_DEP_DATE || "",
              depTime: flight.FLIGHT_DEP_TIME || "",
              arrDate: flight.FLIGHT_ARR_DATE || "",
              arrTime: flight.FLIGHT_ARR_TIME || "",
              baggageDetails: flight.baggageDetails || "",
              flightClass: flight.FLIGHT_DEP_PREF || "",
              depCity: flight.DEP_CITY_CODE || "",
              arrCity: flight.ARR_CITY_CODE || "",
              preferredTime: flight.FLIGHT_DEP_TIME || "", // Set preferred time
            },
          ],
          amount: "",
          currency: "INR",
          isRefundable: false,
          notes: "",
        },
      ]);
    }
  }, [flight]);



  const handleFlightRowChange = (optionIndex, rowIndex, field, value) => {
    const newOptions = [...options];
    newOptions[optionIndex].flightRows[rowIndex][field] = value;
    setOptions(newOptions);
  };

  const addFlightRow = (optionIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].flightRows.push(createEmptyFlightRow());
    setOptions(newOptions);
  };

  const deleteFlightRow = (optionIndex, rowIndex) => {
    const newOptions = [...options];
    if (newOptions[optionIndex].flightRows.length > 1) {
      newOptions[optionIndex].flightRows.splice(rowIndex, 1);
      setOptions(newOptions);
    }
  };

  const handleAmountChange = (optionIndex, field, value) => {
    const newOptions = [...options];
    newOptions[optionIndex][field] = value;
    setOptions(newOptions);
  };


  const getFullCityInfo = (code) => {
    return cityOptions.find(city => city.cityCode === code) || { cityCode: "", cityName: "", airportName: "" };
  };



  const addNewOptionCard = () => {
    setOptions([...options, createEmptyOption()]);
  };


  const deleteOptionCard = (optionIndex) => {
    if (options.length === 1) return;
    const newOptions = options.filter((_, i) => i !== optionIndex);
    setOptions(newOptions);
  };

  const handleSave = async () => {
    const optionsWithFullCities = options.map(option => ({
      ...option,
      flightRows: option.flightRows.map(row => ({
        ...row,
        optionId: option.optionId,
        depCity: getFullCityInfo(row.depCity),
        arrCity: getFullCityInfo(row.arrCity),
      })),
    }));

    const payload = {
      tripId: flight.TRIP_ID,
      rowId: flight.ROWID,
      agentId: flight.AGENT_ID,
      agentName: flight.AGENT_NAME,
      agentEmail: flight.AGENT_EMAIL,
      requestType: requestType,
      options: optionsWithFullCities,
    };

    console.log("Saving data:", payload);

    try {
      const response = await fetch('/server/trip_options_forms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const responseData = await response.json();

      console.log('Server response:', responseData);

      // Optionally, you can inform the user of success or close the modal
      if (onSave) {
        onSave(payload); // Or pass responseData as needed
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      // Optionally, show error message to the user here
    }
  };





  // Helper for rendering city select options
  const renderCityOptions = () =>
    cityOptions.map((opt) => (
      <option key={opt.cityCode} value={opt.cityCode}>
        {opt.cityName} - {opt.cityCode}
      </option>
    ));


  // Helper to get city + airport string from value
  const getCityDisplay = (code) => {
    if (!code) return "Not selected"; // or "N/A", or ""
    const opt = cityOptions.find((c) => c.cityCode === code);
    return opt && opt.cityName ? `${opt.cityName} (${opt.cityCode})` : "N/A";
  };




  return (
    <div className="trip-container">
      <div className="header">
        <div className="header-left">
          <span className="icon-plane"><i className="fas fa-plane" /></span>
          <h3 className="h3-h" style={{ border: "none" }}>Add Trip Options</h3>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="trip-info">
        <h4>
          {getCityDisplay(options[0].flightRows[0].depCity)}
          {" "} ➡{" "}
          {getCityDisplay(options[0].flightRows[0].arrCity)}
        </h4>


        <p>
          {options[0].flightRows[0].depDate}{" "}
          <span className="preferred-time">(Preferred Time: {options[0].flightRows[0].preferredTime})</span>
        </p>

      </div>

      {options.map((option, optionIndex) => (
        <div className="option-card" key={optionIndex}>
          <div className="option-header">
            <h4>Option {optionIndex + 1}</h4>
            {optionIndex > 0 && (
              <button className="delete-icon" onClick={() => deleteOptionCard(optionIndex)}>
                🗑
              </button>
            )}
          </div>

          {option.flightRows.map((row, rowIndex) => (
            <div className="option-grid" key={rowIndex}>
              <div className="field">
                <label>Carrier Name *</label>
                <input
                  type="text"
                  value={row.carrierName}
                  onChange={e => handleFlightRowChange(optionIndex, rowIndex, "carrierName", e.target.value)}
                  placeholder="Enter carrier name"
                />
              </div>

              <div className="field">
                <label>Flight Number</label>
                <input
                  type="text"
                  value={row.flightNumber}
                  onChange={e => handleFlightRowChange(optionIndex, rowIndex, "flightNumber", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Departure Date & Time *</label>
                <div className="date-time">
                  <input
                    type="date"
                    value={row.depDate}
                    onChange={e => handleFlightRowChange(optionIndex, rowIndex, "depDate", e.target.value)}
                  />
                  <input
                    type="time"
                    value={row.depTime}
                    onChange={e => handleFlightRowChange(optionIndex, rowIndex, "depTime", e.target.value)}
                  />
                </div>
                <select
                  required
                  value={row.depCity}
                  onChange={e => handleFlightRowChange(optionIndex, rowIndex, "depCity", e.target.value)}
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
                    value={row.arrDate}
                    onChange={e => handleFlightRowChange(optionIndex, rowIndex, "arrDate", e.target.value)}
                  />
                  <input
                    type="time"
                    value={row.arrTime}
                    onChange={e => handleFlightRowChange(optionIndex, rowIndex, "arrTime", e.target.value)}
                  />
                </div>
                <select
                  value={row.arrCity}
                  onChange={e => handleFlightRowChange(optionIndex, rowIndex, "arrCity", e.target.value)}
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
                  onChange={e => handleFlightRowChange(optionIndex, rowIndex, "baggageDetails", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Class</label>
                <select
                  value={row.flightClass}
                  onChange={e => handleFlightRowChange(optionIndex, rowIndex, "flightClass", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First</option>
                  <option value="premium economy">Premium Economy</option>
                </select>
              </div>

              {option.flightRows.length > 1 && (
                <button
                  className="delete-icon"
                  onClick={() => deleteFlightRow(optionIndex, rowIndex)}
                >
                  🗑
                </button>
              )}
            </div>
          ))}

          <button className="add-flight btn-primary" onClick={() => addFlightRow(optionIndex)}>
            Add Flight
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label>Amount *</label>
              <select
                value={option.currency}
                onChange={e => handleAmountChange(optionIndex, "currency", e.target.value)}
              >
                {currencyList.map((currency) => (
                  <option key={currency.Code} value={currency.Code}>
                    {currency.Name} ({currency.Code})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="0.00"
                value={option.amount}
                onChange={e => handleAmountChange(optionIndex, "amount", e.target.value)}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={option.isRefundable}
                  onChange={e => handleAmountChange(optionIndex, "isRefundable", e.target.checked)}
                />
                {" "}Is Refundable
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              Add Notes
              <textarea
                value={option.notes}
                rows={2}
                onChange={e => handleAmountChange(optionIndex, "notes", e.target.value)}
                placeholder="Enter notes here"
                style={{ width: "231px", height: "25px" }}
              />
            </div>

          </div>
        </div>
      ))}

      <button className="btn-primary" onClick={addNewOptionCard}>
        Add New Option
      </button>

      <div className="footer">
        <button className="btn-primary" onClick={handleSave}>Save and Send</button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FlightOptionForm;
