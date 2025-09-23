import React, { useState, useEffect } from "react";
import "./RequestForms.css";
import FlightForm from "../FlightForm/FlightForm";
import HotelForm from "../HotelForm/HotelForm";
import CarForm from "../CarForm/CarForm";
import BusForm from "../BusForm/BusForm";
import TrainForm from "../TrainForm/TrainForm";

// Reusable Input Component
const LabeledInput = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}) => (
  <div className={`form-group1 ${className}`}>
    {label && <label>{label}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Reusable Dropdown Component
const LabeledDropdown = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="form-group1">
    {label && <label>{label}</label>}
    <select name={name} value={value} onChange={onChange} required={required}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const LabeledDropdown1 = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="form-group2">
    {label && <label>{label}</label>}
    <select name={name} value={value} onChange={onChange} required={required}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// New reusable Radio Group Component
const LabeledRadioGroup = ({ label, name, options, value, onChange }) => (
  <div className="form-group1">
    {label && <label>{label}</label>}
    <div className="radio-group">
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);

// --- Main Form Component (RequestForm) ---
const RequestForms = () => {
  const [tripName, setTripName] = useState("");
  const [travelType, setTravelType] = useState("domestic");
  const [activity, setActivity] = useState("select Activity");
  const [donor, setDonor] = useState("select Donor");
  const [conditionArea, setConditionArea] = useState("select Condition Area");
  const [location, setLocation] = useState("select Location");
  const [branch, setBranch] = useState("select Branch");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [visaRequired, setVisaRequired] = useState("no");
  const [activeTravelModes, setActiveTravelModes] = useState([]);
  const [flightFormData, setFlightFormData] = useState([]);
  const [hotelFormData, setHotelFormData] = useState([]);
  const [carFormData, setCarFormData] = useState([]);
  const [busFormData, setBusFormData] = useState([]);
  const [trainFormData, setTrainFormData] = useState([]);
  const [apiData, setApiData] = useState({
    activities: [],
    donors: [],
    conditionAreas: [],
    locations: [],
    branches: [],
  });


  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch("/server/insertData/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const customDataArray = result.data.map(item => item.customData);
        
        const uniqueActivities = [...new Set(customDataArray.map(item => item.Activity))];
        const uniqueDonors = [...new Set(customDataArray.map(item => item.Donor))];
        const uniqueConditionAreas = [...new Set(customDataArray.map(item => item.conditionArea))];
        const uniqueLocations = [...new Set(customDataArray.map(item => item.Location))];
        const uniqueBranches = [...new Set(customDataArray.map(item => item.Branch))];

        setApiData({
          activities: uniqueActivities.map(val => ({ value: val, label: val })),
          donors: uniqueDonors.map(val => ({ value: val, label: val })),
          conditionAreas: uniqueConditionAreas.map(val => ({ value: val, label: val })),
          locations: uniqueLocations.map(val => ({ value: val, label: val })),
          branches: uniqueBranches.map(val => ({ value: val, label: val })),
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    
    fetchDropdownData();
  }, []); 

  const handleModeToggle = (mode) => {
    setActiveTravelModes((prevModes) =>
      prevModes.includes(mode)
        ? prevModes.filter((m) => m !== mode)
        : [...prevModes, mode]
    );
  };

  const handleSubmit = async (status) => {
    console.log("Form Submitted!");
    const payload = {
      tripName,
      travelType,
      donor,
      conditionArea,
      location,
      branch,
      status, // The new status field
      ...(travelType === "international" && {
        destinationCountry,
        visaRequired,
      }),
      activeTravelModes,
      flightData: activeTravelModes.includes("flight") ? flightFormData : null,
      hotelData: activeTravelModes.includes("hotel") ? hotelFormData : null,
      carData: activeTravelModes.includes("car") ? carFormData : null,
      busData: activeTravelModes.includes("bus") ? busFormData : null,
      trainData: activeTravelModes.includes("train") ? trainFormData : null,
    };

    console.log("Payload to be sent:", payload);

    try {
      const response = await fetch("/server/userForm/", {
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
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDraftSubmit = (e) => {
    e.preventDefault();
    handleSubmit("Draft");
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    handleSubmit("Submitted");
  };


  const travelTypeOptions = [
    { value: "domestic", label: "Domestic" },
    { value: "international", label: "International" },
  ];

  


  const countriesOptions = [
    {value: "", label: "Select Country" },
    { value: "AFG", label: "Afghanistan" },
    { value: "ALB", label: "Albania" },
    { value: "DZA", label: "Algeria" },
    { value: "ASM", label: "American Samoa" },
    { value: "AND", label: "Andorra" },
    { value: "AGO", label: "Angola" },
    { value: "AIA", label: "Anguilla" },
    { value: "ATA", label: "Antarctica" },
    { value: "ATG", label: "Antigua and Barbuda" },
    { value: "ARG", label: "Argentina" },
    { value: "ARM", label: "Armenia" },
    { value: "ABW", label: "Aruba" },
    { value: "AUS", label: "Australia" },
    { value: "AUT", label: "Austria" },
    { value: "AZE", label: "Azerbaijan" },
    { value: "BHS", label: "Bahamas" },
    { value: "BHR", label: "Bahrain" },
    { value: "BGD", label: "Bangladesh" },
    { value: "BRB", label: "Barbados" },
    { value: "BLR", label: "Belarus" },
    { value: "BEL", label: "Belgium" },
    { value: "BLZ", label: "Belize" },
    { value: "BEN", label: "Benin" },
    { value: "BMU", label: "Bermuda" },
    { value: "BTN", label: "Bhutan" },
    { value: "BOL", label: "Bolivia" },
    { value: "BIH", label: "Bosnia and Herzegovina" },
    { value: "BWA", label: "Botswana" },
    { value: "BRA", label: "Brazil" },
    { value: "IOT", label: "British Indian Ocean Territory" },
    { value: "VGB", label: "British Virgin Islands" },
    { value: "BRN", label: "Brunei Darussalam" },
    { value: "BGR", label: "Bulgaria" },
    { value: "BFA", label: "Burkina Faso" },
    { value: "BDI", label: "Burundi" },
    { value: "CPV", label: "Cabo Verde" },
    { value: "KHM", label: "Cambodia" },
    { value: "CMR", label: "Cameroon" },
    { value: "CAN", label: "Canada" },
    { value: "CYM", label: "Cayman Islands" },
    { value: "CAF", label: "Central African Republic" },
    { value: "TCD", label: "Chad" },
    { value: "CHL", label: "Chile" },
    { value: "CHN", label: "China" },
    { value: "COL", label: "Colombia" },
    { value: "COM", label: "Comoros" },
    { value: "COG", label: "Congo" },
    { value: "COD", label: "Congo(the Democratic Republic of the)" },
    { value: "CRI", label: "Costa Rica" },
    { value: "HRV", label: "Croatia" },
    { value: "CUB", label: "Cuba" },
    { value: "CYP", label: "Cyprus" },
    { value: "CZE", label: "Czechia" },
    { value: "DNK", label: "Denmark" },
    { value: "DJI", label: "Djibouti" },
    { value: "DMA", label: "Dominica" },
    { value: "DOM", label: "Dominican Republic" },
    { value: "ECU", label: "Ecuador" },
    { value: "EGY", label: "Egypt" },
    { value: "SLV", label: "El Salvador" },
    { value: "GNQ", label: "Equatorial Guinea" },
    { value: "ERI", label: "Eritrea" },
    { value: "EST", label: "Estonia" },
    { value: "SWZ", label: "Eswatini" },
    { value: "ETH", label: "Ethiopia" },
    { value: "FLK", label: "Falkland Island" },
    { value: "FRO", label: "Faroe Islands" },
    { value: "FJI", label: "Fiji" },
    { value: "FIN", label: "Finland" },
    { value: "FRA", label: "France" },
    { value: "GUF", label: "French Guiana" },
    { value: "PYF", label: "French Polynesia" },
    { value: "GAB", label: "Gabon" },
    { value: "GMB", label: "Gambia (the)" },
    { value: "GEO", label: "Georgia" },
    { value: "DEU", label: "Germany" },
    { value: "GHA", label: "Ghana" },
    { value: "GIB", label: "Gibraltar" },
    { value: "GRC", label: "Greece" },
    { value: "GRL", label: "Greenland" },
    { value: "GRD", label: "Grenada" },
    { value: "GLP", label: "Guadeloupe" },
    { value: "GUM", label: "Guam" },
    { value: "GTM", label: "Guatemala" },
    { value: "GGY", label: "Guernsey" },
    { value: "GIN", label: "Guinea" },
    { value: "GNB", label: "Guinea-Bissau" },
    { value: "GUY", label: "Guyana" },
    { value: "HTI", label: "Haiti" },
    { value: "VAT", label: "Holy See" },
    { value: "HND", label: "Honduras" },
    { value: "HKG", label: "Hong Kong" },
    { value: "HUN", label: "Hungary" },
    { value: "ISL", label: "Iceland" },
    { value: "IND", label: "India" },
    { value: "IDN", label: "Indonesia" },
    { value: "IRN", label: "Iran" },
    { value: "IRQ", label: "Iraq" },
    { value: "IRL", label: "Ireland" },
    { value: "IMN", label: "Isle of Man" },
    { value: "ISR", label: "Israel" },
    { value: "ITA", label: "Italy" },
    { value: "JAM", label: "Jamaica" },
    { value: "JPN", label: "Japan" },
    { value: "JEY", label: "Jersey" },
    { value: "JOR", label: "Jordan" },
    { value: "KAZ", label: "Kazakhstan" },
    { value: "KEN", label: "Kenya" },
    { value: "KIR", label: "Kiribati" },
    { value: "KOR", label: "Korea" },
    { value: "KWT", label: "Kuwait" },
    { value: "KGZ", label: "Kyrgyzstan" },
    { value: "LAO", label: "Lao People's Democratic Republic" },
    { value: "LVA", label: "Latvia" },
    { value: "LBN", label: "Lebanon" },
    { value: "LSO", label: "Lesotho" },
    { value: "LBR", label: "Liberia" },
    { value: "LBY", label: "Libya" },
    { value: "LIE", label: "Liechtenstein" },
    { value: "LTU", label: "Lithuania" },
    { value: "LUX", label: "Luxembourg" },
    { value: "MAC", label: "Macao" },
    { value: "MKD", label: "North Macedonia" },
    { value: "MDG", label: "Madagascar" },
    { value: "MWI", label: "Malawi" },
    { value: "MYS", label: "Malaysia" },
    { value: "MDV", label: "Maldives" },
    { value: "MLI", label: "Mali" },
    { value: "MLT", label: "Malta" },
    { value: "MHL", label: "Marshall Islands" },
    { value: "MTQ", label: "Martinique" },
    { value: "MRT", label: "Mauritania" },
    { value: "MUS", label: "Mauritius" },
    { value: "MYT", label: "Mayotte" },
    { value: "MEX", label: "Mexico" },
    { value: "FSM", label: "Micronesia" },
    { value: "MCO", label: "Monaco" },
    { value: "MNG", label: "Mongolia" },
    { value: "MNE", label: "Montenegro" },
    { value: "MSR", label: "Montserrat" },
    { value: "MAR", label: "Morocco" },
    { value: "MOZ", label: "Mozambique" },
    { value: "MMR", label: "Myanmar" },
    { value: "NAM", label: "Namibia" },
    { value: "NRU", label: "Nauru" },
    { value: "NPL", label: "Nepal" },
    { value: "NLD", label: "Netherlands" },
    { value: "NCL", label: "New Caledonia" },
    { value: "NZL", label: "New Zealand" },
    { value: "NIC", label: "Nicaragua" },
    { value: "NER", label: "Niger" },
    { value: "NGA", label: "Nigeria" },
    { value: "NIU", label: "Niue" },
    { value: "NFK", label: "Norfolk Island" },
    { value: "PRK", label: "Korea(the Democratic People's Republic of)" },
    { value: "OMN", label: "Oman" },
    { value: "PAK", label: "Pakistan" },
    { value: "PLW", label: "Palau" },
    { value: "PAN", label: "Panama" },
    { value: "PNG", label: "Papua New Guinea" },
    { value: "PRY", label: "Paraguay" },
    { value: "PER", label: "Peru" },
    { value: "PHL", label: "Philippines" },
    { value: "PCN", label: "Pitcairn" },
    { value: "POL", label: "Poland" },
    { value: "PRT", label: "Portugal" },
    { value: "PRI", label: "Puerto Rico" },
    { value: "QAT", label: "Qatar" },
    { value: "REU", label: "Réunion" },
    { value: "ROU", label: "Romania" },
    { value: "RUS", label: "Russian Federation" },
    { value: "RWA", label: "Rwanda" },
    { value: "SHN", label: "Saint Helena, Ascension and Tristan da Cunha" },
    { value: "KNA", label: "Saint Kitts and Nevis" },
    { value: "LCA", label: "Saint Lucia" },
    { value: "SPM", label: "Saint Pierre and Miquelon" },
    { value: "VCT", label: "Saint Vincent and the Grenadines" },
    { value: "WSM", label: "Samoa" },
    { value: "SMR", label: "San Marino" },
    { value: "STP", label: "Sao Tome and Principe" },
    { value: "SAU", label: "Saudi Arabia" },
    { value: "SEN", label: "Senegal" },
    { value: "SRB", label: "Serbia" },
    { value: "SYC", label: "Seychelles" },
    { value: "SLE", label: "Sierra Leone" },
    { value: "SGP", label: "Singapore" },
    { value: "SXM", label: "Sint Maarten" },
    { value: "SVK", label: "Slovakia" },
    { value: "SVN", label: "Slovenia" },
    { value: "SLB", label: "Solomon Islands" },
    { value: "SOM", label: "Somalia" },
    { value: "ZAF", label: "South Africa" },
    { value: "SSD", label: "South Sudan" },
    { value: "ESP", label: "Spain" },
    { value: "LKA", label: "Sri Lanka" },
    { value: "SDN", label: "Sudan" },
    { value: "SUR", label: "Suriname" },
    { value: "SWE", label: "Sweden" },
    { value: "CHE", label: "Switzerland" },
    { value: "SYR", label: "Syrian Arab Republic" },
    { value: "TWN", label: "Taiwan" },
    { value: "TJK", label: "Tajikistan" },
    { value: "TZA", label: "Tanzania, United Republic of" },
    { value: "THA", label: "Thailand" },
    { value: "TLS", label: "Timor-Leste" },
    { value: "TGO", label: "Togo" },
    { value: "TKL", label: "Tokelau" },
    { value: "TON", label: "Tonga" },
    { value: "TTO", label: "Trinidad and Tobago" },
    { value: "TUN", label: "Tunisia" },
    { value: "TUR", label: "Turkey" },
    { value: "TKM", label: "Turkmenistan" },
    { value: "TCA", label: "Turks and Caicos Islands" },
    { value: "TUV", label: "Tuvalu" },
    { value: "UGA", label: "Uganda" },
    { value: "UKR", label: "Ukraine" },
    { value: "ARE", label: "United Arab Emirates" },
    {
      value: "GBR",
      label: "United Kingdom",
    },
    { value: "UMI", label: "United States Minor Outlying Islands" },
    { value: "USA", label: "United States of America" },
    { value: "URY", label: "Uruguay" },
    { value: "UZB", label: "Uzbekistan" },
    { value: "VUT", label: "Vanuatu" },
    { value: "VEN", label: "Venezuela" },
    { value: "VNM", label: "Viet Nam" },
    { value: "VIR", label: "Virgin Islands (U.S.)" },
    { value: "WLF", label: "Wallis and Futuna" },
    { value: "ESH", label: "Western Sahara" },
    { value: "YEM", label: "Yemen" },
    { value: "ZMB", label: "Zambia" },
    { value: "ZWE", label: "Zimbabwe" },
  ];

  return (
    <div className="form-container">
      <form>
        <section className="common-details">
          <h2>Add Trip Details</h2>
          <LabeledInput
            label="Trip Name"
            type="text"
            name="tripName"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g., Business Trip to London"
            required
          />
          <LabeledRadioGroup
            label="Travel Type"
            name="travelType"
            options={travelTypeOptions}
            value={travelType}
            onChange={(e) => setTravelType(e.target.value)}
          />

          {travelType === "international" && (
            <React.Fragment>
              <LabeledDropdown
                label="Destination Country"
                name="destinationCountry"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                options={countriesOptions}
                required={true}
              />
              <LabeledRadioGroup
                label="Is Visa required?"
                name="visaRequired"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={visaRequired}
                onChange={(e) => setVisaRequired(e.target.value)}
              />
            </React.Fragment>
          )}

       

          <div className="form-row">
            <LabeledDropdown
              label="Activity"
              name="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              options={apiData.activities}
              placeholder="Select Activity"
              required
            />
            <LabeledDropdown
              label="Donor"
              name="donor"
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              options={apiData.donors}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Condition Area"
              name="conditionArea"
              value={conditionArea}
              onChange={(e) => setConditionArea(e.target.value)}
              options={apiData.conditionAreas}
              required
            />
            <LabeledDropdown
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={apiData.locations}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown1
              label="Branch"
              name="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={apiData.branches}
              className="half-width"
              required
            />
            
          </div>
        </section>

        <section className="mode-selection">
          <h2>Select Travel Modes</h2>
          <div className="checkbox-group">
            {["flight", "hotel", "car", "bus", "train"].map((mode) => (
              <label key={mode}>
                <input
                  type="checkbox"
                  checked={activeTravelModes.includes(mode)}
                  onChange={() => handleModeToggle(mode)}
                />{" "}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </label>
            ))}
          </div>
        </section>

        {activeTravelModes.includes("flight") && (
          <FlightForm onDataChange={setFlightFormData} />
        )}
        {activeTravelModes.includes("hotel") && (
          <HotelForm onDataChange={setHotelFormData} />
        )}
        {activeTravelModes.includes("car") && (
          <CarForm onDataChange={setCarFormData} />
        )}
        {activeTravelModes.includes("bus") && (
          <BusForm onDataChange={setBusFormData} />
        )}
        {activeTravelModes.includes("train") && (
          <TrainForm onDataChange={setTrainFormData} />
        )}

        <div className="button-group">
          <button
            type="button"
            onClick={handleDraftSubmit}
            className="submit-btn"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="submit-btn"
          >
            Save and Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForms;
