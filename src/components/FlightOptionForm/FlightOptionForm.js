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

// Helper: Convert DB City Name -> UI City Code
const getCityCodeByName = (name) => {
  if (!name) return "";
  const found = cityOptions.find((c) => c.cityName === name);
  return found ? found.cityCode : ""; 
};

// Helper: Generate a random ID for frontend grouping of NEW options
const generateOptionId = () => {
  return Number(Date.now().toString() + Math.floor(Math.random() * 1000).toString());
};

const FlightOptionForm = ({ flight, onClose, onSave, requestType = "flight" }) => {
  
  // 1. Initial State Generators
  const createEmptyFlightRow = () => ({
    rowId: null, // Database ROWID for this specific leg (for updates)
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
    preferredTime: "", 
  });

  const createEmptyOption = () => ({
    optionId: generateOptionId(), // Temporary Grouping ID
    flightRows: [createEmptyFlightRow()],
    amount: "",
    currency: "INR",
    isRefundable: false,
    notes: "",
  });

  // 2. State Variables
  const [options, setOptions] = useState([createEmptyOption()]);
  const [currencyList, setCurrencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Fetch Currencies
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

  // 4. FETCH & GROUP DATA (Edit Mode) OR PRE-FILL (Add Mode)
  useEffect(() => {
    const status = (flight?.Option_Status || "").toLowerCase();
    const isEditMode = status.includes("added") || status.includes("option");

    console.log("Flight Form - Status:", status, "RowID:", flight?.rowId);

    if (isEditMode && flight?.rowId) {
      // --- SCENARIO A: EDIT MODE (Fetch from DB) ---
      const fetchExistingOptions = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/server/trip_options_forms?rowId=${flight.rowId}&requestType=flight`
          );

          if (!response.ok) throw new Error("Failed to fetch options");

          const result = await response.json();

          if (result.status === "success" && result.data && result.data.length > 0) {
            
            // 1. Sort by Creation Time (Oldest First) to keep Option 1 as Option 1
            const sortedRows = result.data.sort((a, b) => 
                new Date(a.CREATEDTIME) - new Date(b.CREATEDTIME)
            );

            // 2. Grouping Logic (Flattened Rows -> Option Cards)
            const groupedData = {};

            sortedRows.forEach((dbItem) => {
              // Use Option_Id from DB. Fallback to temp ID if missing.
              const groupKey = dbItem.Option_Id || generateOptionId();

              if (!groupedData[groupKey]) {
                groupedData[groupKey] = {
                  optionId: groupKey,
                  amount: dbItem.Amount,
                  currency: dbItem.Currency_id,
                  isRefundable: dbItem.Refund_Type === "Refundable",
                  notes: dbItem.Notes,
                  flightRows: [],
                };
              }

              groupedData[groupKey].flightRows.push({
                rowId: dbItem.ROWID, // Capture DB ID for Update
                carrierName: dbItem.Merchant_Name,
                flightNumber: dbItem.Flight_Number,

                depDate: dbItem.FLIGHT_DEP_DATE,
                depTime: dbItem.FLIGHT_DEP_TIME,
                depCity: getCityCodeByName(dbItem.FLIGHT_DEP_CITY),

                arrDate: dbItem.FLIGHT_ARR_DATE,
                arrTime: dbItem.FLIGHT_ARR_TIME,
                arrCity: getCityCodeByName(dbItem.FLIGHT_ARR_CITY),

                baggageDetails: dbItem.Baggage_Details,
                flightClass: dbItem.Flight_Class,
              });
            });

            setOptions(Object.values(groupedData));
          }
        } catch (error) {
          console.error("Error loading flight options:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchExistingOptions();
      
    } else if (!isEditMode && flight) {
      // --- SCENARIO B: ADD MODE (Pre-fill from Request) ---
      
      const originCode = getCityCodeByName(flight.depCity) || flight.depCity || "";
      const destCode = getCityCodeByName(flight.arrCity) || flight.arrCity || "";
      
      const rawClass = flight.seatPref || flight.SEAT_PREF || "";
      const normalizedClass = rawClass.toLowerCase();

      setOptions([
        {
          ...createEmptyOption(),
          flightRows: [
            {
              ...createEmptyFlightRow(),
              depDate: flight.FLIGHT_DEP_DATE || "", 
              depTime: flight.FLIGHT_DEP_TIME || "",
              arrDate: flight.FLIGHT_ARR_DATE || "",
              arrTime: flight.FLIGHT_ARR_TIME || "",
              depCity: originCode,
              arrCity: destCode,
              flightClass: normalizedClass,
            },
          ],
        },
      ]);
    }
  }, [flight]);

  // 5. Handlers for Form Updates
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

  const addNewOptionCard = () => {
    setOptions([...options, createEmptyOption()]);
  };

  const deleteOptionCard = (optionIndex) => {
    if (options.length === 1) return;
    const newOptions = options.filter((_, i) => i !== optionIndex);
    setOptions(newOptions);
  };

  // Helper for Saving
  const getFullCityInfo = (code) => {
    return cityOptions.find(city => city.cityCode === code) || { cityCode: "", cityName: "", airportName: "" };
  };
  const getCityDisplay = (code) => {
    if (!code) return "Not selected"; 
    const opt = cityOptions.find((c) => c.cityCode === code);
    return opt && opt.cityName ? `${opt.cityName} (${opt.cityCode})` : "N/A";
  };

  const renderCityOptions = () =>
    cityOptions.map((opt) => (
      <option key={opt.cityCode} value={opt.cityCode}>
        {opt.cityName} - {opt.cityCode}
      </option>
    ));

  // 6. Save Handler
  const handleSave = async () => {
    const optionsWithFullCities = options.map(option => ({
      ...option,
      // Pass the Option Group ID (backend uses this to group rows)
      optionId: option.optionId, 

      flightRows: option.flightRows.map(row => ({
        ...row,
        // Pass the Leg ID (backend uses this to UPDATE specific rows)
        rowId: row.rowId, 
        depCity: getFullCityInfo(row.depCity),
        arrCity: getFullCityInfo(row.arrCity),
      })),
    }));

    const payload = {
      tripId: flight?.TRIP_ID,
      rowId: flight?.rowId,
      agentId: flight?.AGENT_ID,
      agentName: flight?.AGENT_NAME,
      agentEmail: flight?.AGENT_EMAIL,
      requestType: requestType,
      options: optionsWithFullCities,
    };

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
      if (onSave) onSave(responseData);
      
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  return (
    <div className="trip-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <span className="icon-plane"><i className="fas fa-plane" /></span>
          <h3 className="h3-h" style={{ border: "none" }}>
             {isLoading ? "Loading Options..." : (flight?.Option_Status ? "Edit Trip Options" : "Add Trip Options")}
          </h3>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="trip-info">
        <h4>
          {getCityDisplay(options[0]?.flightRows[0]?.depCity)}
          {" "} ➡{" "}
          {getCityDisplay(options[0]?.flightRows[0]?.arrCity)}
        </h4>
        <p>
          {options[0]?.flightRows[0]?.depDate}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>Loading existing options...</div>
      ) : (
        <>
            {options.map((option, optionIndex) => {
                // CHECK: Does this card come from the DB? 
                // (If the first flight row has a rowId, it's an existing record)
                const isExistingCard = option.flightRows.length > 0 && option.flightRows[0].rowId;

                return (
                <div className="option-card" key={optionIndex}>
                    {/* Hidden Option Group ID */}
                    <input type="hidden" value={option.optionId || ""} />

                    <div className="option-header">
                        <h4>Option {optionIndex + 1}</h4>
                        {/* MODIFIED: Only show delete if it's a NEW card and we have more than 1 card */}
                        {!isExistingCard && options.length > 1 && (
                            <button className="delete-icon" onClick={() => deleteOptionCard(optionIndex)}>
                                🗑
                            </button>
                        )}
                    </div>

                    {option.flightRows.map((row, rowIndex) => (
                        <div className="option-grid" key={rowIndex}>
                        
                        {/* Hidden Leg ID */}
                        <input type="hidden" value={row.rowId || ""} />

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

                        {/* MODIFIED: Only show delete for NEW legs (no rowId) and if there's more than 1 leg */}
                        {!row.rowId && option.flightRows.length > 1 && (
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

                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop:'15px' }}>
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
            );
            })}

            <button className="btn-primary" onClick={addNewOptionCard}>
                Add New Option
            </button>
        </>
      )}

      <div className="footer">
        <button className="btn-primary" onClick={handleSave} disabled={isLoading}>Save and Send</button>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FlightOptionForm;