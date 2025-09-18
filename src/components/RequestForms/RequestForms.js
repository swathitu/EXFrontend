import React, { useState } from "react";
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
  const [tripStartDate, setTripStartDate] = useState("");
  const [tripEndDate, setTripEndDate] = useState("");
  const [activity, setActivity] = useState("");
  const [donor, setDonor] = useState("");
  const [conditionArea, setConditionArea] = useState("");
  const [location, setLocation] = useState("");
  const [branch, setBranch] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [visaRequired, setVisaRequired] = useState("no");
  const [activeTravelModes, setActiveTravelModes] = useState([]);
  const [flightFormData, setFlightFormData] = useState([]);
  const [hotelFormData, setHotelFormData] = useState([]);
  const [carFormData, setCarFormData] = useState([]);
  const [busFormData, setBusFormData] = useState([]);
  const [trainFormData, setTrainFormData] = useState([]);

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
      tripStartDate,
      tripEndDate,
      activity,
      donor,
      conditionArea,
      location,
      branch,
      bookingType,
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

  const bookingTypeOptions = [
    { value: "", label: "Select Booking Type" },
    { value: "self booking", label: "Self Booking" },
    { value: "vendor booking", label: "Vendor Booking" },
  ];

  const activityOptions = [
    { value: "", label: "Select Activity" },
    {
      value: "1-Framework designing and Content creation",
      label: "1-Framework designing and Content creation",
    },
    {
      value: "2. Tool Development",
      label: "2. Tool Development",
    },
    {
      value: "3-Needs finding",
      label: "3-Needs finding",
    },
    {
      value: "4. Remote Engagement Service",
      label: "4. Remote Engagement Service",
    },
    {
      value: "5-Monitoring",
      label: "5-Monitoring",
    },
    {
      value: "6-Research",
      label: "6-Research",
    },
    {
      value: "7.1-RMM-Advocacy",
      label: "7.1-RMM-Advocacy",
    },
    {
      value: "7.2-RMM-Collaboration",
      label: "7.2-RMM-Collaboration",
    },
    {
      value: "7.3-RMM-Administrative management",
      label: "7.3-RMM-Administrative management",
    },
    {
      value: "8.Platform Development & Managment",
      label: "8.Platform Development & Managment",
    },
    {
      value: "9.Training design and delivery",
      label: "9.Training design and delivery",
    },
    {
      value: "10.1-Bundled ToT- Master trainers",
      label: "10.1-Bundled ToT- Master trainers",
    },
    {
      value: "10.2-Non-bundled ToTs-Master Trainers",
      label: "10.2-Non-bundled ToTs-Master Trainers",
    },
    {
      value: "10.3-Booster/ Refresher Training",
      label: "10.3-Booster/ Refresher Training",
    },
    {
      value: "10.4-Medical Officer training",
      label: "10.4-Medical Officer training",
    },
    {
      value: "10.5-District level training",
      label: "10.5-District level training",
    },
    {
      value: "10.6-Facility Launch",
      label: "10.6-Facility Launch",
    },
    {
      value: "10.7-Supportive Supervision",
      label: "10.7-Supportive Supervision",
    },
    {
      value: "10.8-Partnership Visits",
      label: "10.8-Partnership Visits",
    },
    {
      value: "11.Country Support",
      label: "11.Country Support",
    },
    {
      value: "12.1-Strategic Global Development-Advocacy",
      label: "12.1-Strategic Global Development-Advocacy",
    },
    {
      value: "12.2-Strategic Global Development-Collaboration",
      label: "12.2-Strategic Global Development-Collaboration",
    },
    {
      value: "13.Design research on caregiving",
      label: "13.Design research on caregiving",
    },
    {
      value: "14.Evaluation",
      label: "14.Evaluation",
    },
    {
      value: "15.Fundraising & Development",
      label: "15.Fundraising & Development",
    },
    {
      value: "16.Communications & Brand",
      label: "16.Communications & Brand",
    },
    {
      value: "17.1-Strategic Global Develpment-Advocacy",
      label: "17.1-Strategic Global Develpment-Advocacy",
    },
    {
      value: "17.2-Strategic Global Develpment-Collaboration",
      label: "17.2-Strategic Global Develpment-Collaboration",
    },
    {
      value: "18.Global Support",
      label: "18.Global Support",
    },
    {
      value: "19.1-Coordination of on-ground trainings (TOTs)",
      label: "19.1-Coordination of on-ground trainings (TOTs)",
    },
    {
      value: "19.2-On-ground supervision and engagement",
      label: "19.2-On-ground supervision and engagement",
    },
    {
      value: "20.Knowledge sharing and dissemination",
      label: "20.Knowledge sharing and dissemination",
    },
    {
      value: "21-.Payroll & Benefits",
      label: "21-.Payroll & Benefits",
    },
    {
      value: "22.Program Immersion",
      label: "22.Program Immersion",
    },
    {
      value: "Testing and prototyping",
      label: "Testing and prototyping",
    },
  ];

  const donorOptions = [
    { value: "", label: "Select Donor" },
    { value: "NH-Agency Fund-2024", label: "NH-Agency Fund-2024" },
    { value: "NH-Mcgovern Fund-2024", label: "NH-Mcgovern Fund-2024" },
    { value: "NH-Noora Health-2023", label: "NH-Noora Health-2023" },
  ];

  const conditionAreaOptions = [
    { value: "", label: "Select Condition Area" },
    { value: "Maternal & Newborn Care", label: "Maternal & Newborn Care" },
    { value: "Tuberculosis Care", label: "Tuberculosis Care" },
    {
      value: "General Medical & Surgical Care",
      label: "General Medical & Surgical Care",
    },
    {
      value: "Oncology Care",
      label: "Oncology Care",
    },
    {
      value: "Cardiac Care",
      label: "Cardiac Care",
    },
    {
      value: "Covid-19 Care",
      label: "Covid-19 Care",
    },
    {
      value: "Others",
      label: "Others",
    },
  ];

  const locationOptions = [
    { value: "", label: "Select Location" },
    { value: "India", label: "India" },
    { value: "India KA", label: "India KA" },
    { value: "India MH", label: "India MH" },
    { value: "India OR", label: "India OR" },
    { value: "India PB", label: "India PB" },
    { value: "India HR", label: "India HR" },
    { value: "India AP", label: "India AP" },
    { value: "India MP", label: "India MP" },
    { value: "India HP", label: "India HP" },
    { value: "India TN", label: "India TN" },
    { value: "Indonesia", label: "Indonesia" },
    { value: "Bangladesh", label: "Bangladesh" },
    { value: "Nepal", label: "Nepal" },
    { value: "USA", label: "USA" },
    { value: "Other Country", label: "Other Country" },
  ];

  const branchOptions = [
    { value: "", label: "Select Branch" },
    { value: "1.IN-PDD-HCOMM", label: "1.IN-PDD-HCOMM" },
    { value: "1.IN-PDD-MED", label: "1.IN-PDD-MED" },
    { value: "2.IN-PDD-CDES", label: "2.IN-PDD-CDES" },
    { value: "2.IN-PDD-FILM", label: "2.IN-PDD-FILM" },
    { value: "2.SP-PDD", label: "2.SP-PDD" },
    { value: "2.SP-PDD-CONTENT", label: "2.SP-PDD-CONTENT" },
    { value: "2.SP-PDD-DESIGN", label: "2.SP-PDD-DESIGN" },
    { value: "2.SP-PDD-FILM", label: "2.SP-PDD-FILM" },
    { value: "3.IN-PDD-SSDES", label: "3.IN-PDD-SSDES" },
    { value: "4.IN-PDD-PRODMNGT", label: "4.IN-PDD-PRODMNGT" },
    { value: "5.IN-M&E-MONITORING", label: "5.IN-M&E-MONITORING" },
    { value: "6.IN-M&E-EVAL", label: "6.IN-M&E-EVAL" },
    { value: "7.IN-RMM", label: "7.IN-RMM" },
    { value: "7.SP-RMM", label: "7.SP-RMM" },
    { value: "8.SP-PLATFORMS", label: "8.SP-PLATFORMS" },
    {
      value: "8.SP-PLATFORMS-ENG/SOFT DEV",
      label: "8.SP-PLATFORMS-ENG/SOFT DEV",
    },
    { value: "8.SP-PLATFORMS-PRODMNGT", label: "8.SP-PLATFORMS-PRODMNGT" },
    { value: "9.SP-TRNG", label: "9.SP-TRNG" },
    { value: "11.IN-OPS-ADMIN", label: "11.IN-OPS-ADMIN" },
    { value: "11.IN-OPS-FIN", label: "11.IN-OPS-FIN" },
    { value: "11.IN-OPS-P&C", label: "11.IN-OPS-P&C" },
    { value: "12.SP-HS & GHS", label: "12.SP-HS & GHS" },
    { value: "13.ER-LAB", label: "13.ER-LAB" },
    { value: "14.ER-EVAL", label: "14.ER-EVAL" },
    { value: "15.ER-FMGT", label: "15.ER-FMGT" },
    { value: "16.ER-COMM", label: "16.ER-COMM" },
    { value: "17.SH-EXP", label: "17.SH-EXP" },
    { value: "18.SH-ADMIN", label: "18.SH-ADMIN" },
    { value: "18.SH-FIN", label: "18.SH-FIN" },
    { value: "18.SH-P&C", label: "18.SH-P&C" },
    { value: "19.SP-PDEL-IMP", label: "19.SP-PDEL-IMP" },
    { value: "20.SP-D&R", label: "20.SP-D&R" },
    { value: "20.SP-L&S", label: "20.SP-L&S" },
    { value: "IN-M&E-FIELD OPS", label: "IN-M&E-FIELD OPS" },
    { value: "IN-OPS-IT", label: "IN-OPS-IT" },
    { value: "IN-PDD-TECH OPS", label: "IN-PDD-TECH OPS" },
    { value: "IN-PDD-VD & ILLST", label: "IN-PDD-VD & ILLST" },
    { value: "SP-PDD-SSDES", label: "SP-PDD-SSDES" },
  ];

  const countriesOptions = [
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
            <LabeledInput
              label="Trip Start Date *"
              type="date"
              name="tripStartDate"
              value={tripStartDate}
              onChange={(e) => setTripStartDate(e.target.value)}
              placeholder="eg: 31 January 2025"
              required
            />
            <LabeledInput
              label="Trip End Date *"
              type="date"
              name="tripEndDate"
              value={tripEndDate}
              onChange={(e) => setTripEndDate(e.target.value)}
              placeholder="eg: 31 January 2025"
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Activity"
              name="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              options={activityOptions}
              required
            />
            <LabeledDropdown
              label="Donor"
              name="donor"
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              options={donorOptions}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Condition Area"
              name="conditionArea"
              value={conditionArea}
              onChange={(e) => setConditionArea(e.target.value)}
              options={conditionAreaOptions}
              required
            />
            <LabeledDropdown
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={locationOptions}
              required
            />
          </div>

          <div className="form-row">
            <LabeledDropdown
              label="Branch"
              name="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={branchOptions}
              required
            />
            <LabeledDropdown
              label="Booking Type"
              name="bookingType"
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              options={bookingTypeOptions}
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
