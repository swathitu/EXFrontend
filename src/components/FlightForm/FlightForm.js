import React, { useState } from "react";
import "./FlightForm.css";

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
  <div className={`form-group ${className}`}>
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
  className = "",
}) => (
  <div className={`form-group ${className}`}>
    {label && <label>{label}</label>}
    <select name={name} value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// --- FlightForm Component ---
const FlightForm = ({ onDataChange }) => {
  const cityOptions = [
    { value: "", label: "Select City" },
    { value: "Amery", label: "Amery, U.S.A" },
    { value: "Alpha", label: "Alpha, Australia" },
    { value: "Aiken", label: "Aiken, U.S.A" },
    { value: "El Arish", label: "El Arish, Egypt" },
    { value: "Alderney", label: "Alderney, Guernsey" },
    { value: "Afutara", label: "Afutara, Solomon Islands" },
    { value: "Zabol", label: "Zabol, Iran" },
    { value: "Ampara", label: "Ampara, SriLanka" },
    { value: "Alpe D Huez", label: "Alpe D Huez, France" },
    { value: "Aleneva", label: "Aleneva, U.S.A" },
    { value: "Augusta", label: "Augusta, U.S.A" },
    { value: "Afyon", label: "Afyon, Turkey" },
    { value: "Abilene", label: "Abilene, U.S.A" },
    { value: "Amman", label: "Amman, Jordan" },
    { value: "Anderson", label: "Anderson, U.S.A" },
    { value: "Allakaket", label: "Allakaket, U.S.A" },
    { value: "San Rafael", label: "San Rafael, Argentina" },
    { value: "Atlantic City", label: "Atlantic City, U.S.A" },
    { value: "Andes", label: "Andes, Colombia" },
    { value: "Allentown", label: "Allentown, U.S.A" },
    { value: "Adrian", label: "Adrian, U.S.A" },
    { value: "Al-Baha", label: "Al-Baha, Saudi Arabia" },
    { value: "Aranuka", label: "Aranuka, Kiribati" },
    { value: "Agadir", label: "Agadir, Morocco" },
    { value: "St Andrews", label: "St Andrews, United Kingdom" },
    { value: "Algeciras", label: "Algeciras, Spain" },
    { value: "Pittsburgh", label: "Pittsburgh, U.S.A" },
    { value: "Agri", label: "Agri, Turkey" },
    { value: "Aiome", label: "Aiome, Papua New Guinea" },
    { value: "Acapulco", label: "Acapulco, Mexico" },
    { value: "Adana", label: "Adana, Turkey" },
    { value: "Adelaide", label: "Adelaide, Australia" },
    { value: "Al Ghaydah", label: "Al Ghaydah, Yemen" },
    { value: "Acarigua", label: "Acarigua, Venezuela" },
    { value: "Sabzevar", label: "Sabzevar, Iran" },
    { value: "Arandis", label: "Arandis, Namibia" },
    { value: "Aioun El Atrouss", label: "Aioun El Atrouss, Mauritania" },
    { value: "Anaco", label: "Anaco, Venezuela" },
    { value: "Wageningen", label: "Wageningen, Suriname" },
    { value: "Kagua", label: "Kagua, Papua New Guinea" },
    { value: "Albuquerque", label: "Albuquerque, U.S.A" },
    { value: "Assis", label: "Assis, Brazil" },
    { value: "Atkamba", label: "Atkamba, Papua New Guinea" },
    { value: "Aalesund", label: "Aalesund, Norway" },
    { value: "Ahe", label: "Ahe, French Polynesia" },
    { value: "Abreojos", label: "Abreojos, Mexico" },
    { value: "Bellaire", label: "Bellaire, U.S.A" },
    { value: "Arrecife", label: "Arrecife, Spain" },
    { value: "Aguascalientes", label: "Aguascalientes, Mexico" },
    { value: "Ahuas", label: "Ahuas, Honduras" },
    { value: "Dallas", label: "Dallas, U.S.A" },
    { value: "Athens", label: "Athens, U.S.A" },
    { value: "Herlong", label: "Herlong, U.S.A" },
    { value: "Yalinga", label: "Yalinga, Central African Republic" },
    { value: "Awaradam", label: "Awaradam, Suriname" },
    { value: "Anggi", label: "Anggi, Indonesia" },
    { value: "Andamooka", label: "Andamooka, Australia" },
    { value: "Acuna", label: "Acuna, Mexico" },
    { value: "Waco", label: "Waco, U.S.A" },
    { value: "Adareil", label: "Adareil, South Sudan" },
    { value: "Aek Godang", label: "Aek Godang, Indonesia" },
    { value: "Atambua", label: "Atambua, Indonesia" },
    { value: "Accra", label: "Accra, Ghana" },
    { value: "Kodiak", label: "Kodiak, U.S.A" },
    { value: "Arcata", label: "Arcata, U.S.A" },
    { value: "Abemama Atoll", label: "Abemama Atoll, Kiribati" },
    { value: "Tasiilaq", label: "Tasiilaq, Greenland" },
    { value: "Mala Mala", label: "Mala Mala, South Africa" },
    { value: "Asau", label: "Asau, Samoa" },
    { value: "Agatti Island", label: "Agatti Island, India" },
    { value: "Alldays", label: "Alldays, South Africa" },
    { value: "Abau", label: "Abau, Papua New Guinea" },
    { value: "Izmir", label: "Izmir, Turkey" },
    { value: "Anaa", label: "Anaa, French Polynesia" },
    { value: "Alisabieh", label: "Alisabieh, Djibouti" },
    { value: "Surallah", label: "Surallah, Philippines" },
    { value: "Abingdon", label: "Abingdon, Australia" },
    { value: "Aldan", label: "Aldan, Russia" },
    { value: "San Andres Island", label: "San Andres Island, Colombia" },
    { value: "Afore", label: "Afore, Papua New Guinea" },
    { value: "Bamaga", label: "Bamaga, Australia" },
    { value: "Ajaccio", label: "Ajaccio, France" },
    { value: "Arraias", label: "Arraias, Brazil" },
    { value: "Sochi", label: "Sochi, Russia" },
    { value: "Ai-ais", label: "Ai-ais, Namibia" },
    { value: "Abakan", label: "Abakan, Russia" },
    { value: "Abu Simbel", label: "Abu Simbel, Egypt" },
    { value: "Adampur", label: "Adampur, India" },
    { value: "Aberdeen", label: "Aberdeen, United Kingdom" },
    { value: "Araracuara", label: "Araracuara, Colombia" },
    { value: "Ampara", label: "Ampara, SriLanka" },
    { value: "Aberdeen", label: "Aberdeen, U.S.A" },
    { value: "Albany", label: "Albany, U.S.A" },
    { value: "Altay", label: "Altay, China" },
    { value: "Abbottabad", label: "Abbottabad, Pakistan" },
    { value: "Aripuana", label: "Aripuana, Brazil" },
    { value: "Camp Springs", label: "Camp Springs, U.S.A" },
    { value: "Wainwright", label: "Wainwright, U.S.A" },
    { value: "Amalfi", label: "Amalfi, Colombia" },
    { value: "Baise", label: "Baise, China" },
    { value: "Aracaju", label: "Aracaju, Brazil" },
    { value: "Arvidsjaur", label: "Arvidsjaur, Sweden" },
    { value: "Anapa", label: "Anapa, Russia" },
    { value: "Angoram", label: "Angoram, Papua New Guinea" },
    { value: "Angoon", label: "Angoon, U.S.A" },
    { value: "Andakombe", label: "Andakombe, Papua New Guinea" },
    { value: "Araak", label: "Araak, Iran" },
    { value: "Atlantic", label: "Atlantic, U.S.A" },
    { value: "Albert Lea", label: "Albert Lea, U.S.A" },
    { value: "Zarafshan", label: "Zarafshan, Uzbekistan" },
    { value: "Abidjan", label: "Abidjan, Ivory Coast" },
    { value: "Akjoujt", label: "Akjoujt, Mauritania" },
    { value: "Aden", label: "Aden, Yemen" },
    { value: "Amahai", label: "Amahai, Indonesia" },
    { value: "Aalborg", label: "Aalborg, Denmark" },
    { value: "Agen", label: "Agen, France" },
    { value: "Achinsk", label: "Achinsk, Russia" },
    { value: "Aiambak", label: "Aiambak, Papua New Guinea" },
    { value: "Alliance", label: "Alliance, U.S.A" },
    { value: "Anjouan", label: "Anjouan, Comoros" },
    { value: "Andrews", label: "Andrews, U.S.A" },
    { value: "Akureyri", label: "Akureyri, Iceland" },
    { value: "Aguni", label: "Aguni, Japan" },
    { value: "Al Hoceima", label: "Al Hoceima, Morocco" },
    { value: "Aarhus", label: "Aarhus, Denmark" },
    { value: "Aggeneys", label: "Aggeneys, South Africa" },
    { value: "Alghero", label: "Alghero, Italy" },
    { value: "Annaba", label: "Annaba, Algeria" },
    { value: "Nantucket", label: "Nantucket, U.S.A" },
    { value: "Adak Island", label: "Adak Island, U.S.A" },
    { value: "Alta Floresta", label: "Alta Floresta, Brazil" },
    { value: "Kaiser", label: "Kaiser, U.S.A" },
    { value: "Arorae Island", label: "Arorae Island, Kiribati" },
    { value: "Arapoti", label: "Arapoti, Brazil" },
    { value: "Port Alfred", label: "Port Alfred, South Africa" },
    { value: "Atiu Island", label: "Atiu Island, Cook Islands" },
    { value: "Ciudad Del Este", label: "Ciudad Del Este, Paraguay" },
    { value: "Aboisso", label: "Aboisso, Ivory Coast" },
    { value: "Ailigandi", label: "Ailigandi, Panama" },
    { value: "Abuja", label: "Abuja, Nigeria" },
    { value: "Ambatolahy", label: "Ambatolahy, Madagascar" },
    { value: "Alexandria", label: "Alexandria, U.S.A" },
    { value: "Aachen", label: "Aachen, Germany" },
    { value: "Acandi", label: "Acandi, Colombia" },
    { value: "Agra", label: "Agra, India" },
    { value: "Abha", label: "Abha, Saudi Arabia" },
    { value: "Angelholm", label: "Angelholm, Sweden" },
    { value: "Jaffrey", label: "Jaffrey, U.S.A" },
    { value: "Anuradhapura", label: "Anuradhapura, SriLanka" },
    { value: "Airok", label: "Airok, MarshallIslands" },
    { value: "Saih Rawl", label: "Saih Rawl, Oman" },
    { value: "Magnolia", label: "Magnolia, U.S.A" },
    { value: "Okinawa", label: "Okinawa, Japan" },
    { value: "Addis Ababa", label: "Addis Ababa, Ethiopia" },
    { value: "Ailuk Island", label: "Ailuk Island, MarshallIslands" },
    { value: "Arica", label: "Arica, Colombia" },
    { value: "Quetzaltenango", label: "Quetzaltenango, Guatemala" },
    { value: "Xingyi", label: "Xingyi, China" },
    { value: "Ashland", label: "Ashland, U.S.A" },
    { value: "Aseki", label: "Aseki, Papua New Guinea" },
    { value: "Sahand", label: "Sahand, Iran" },
    { value: "Araxa", label: "Araxa, Brazil" },
    { value: "Aitutaki", label: "Aitutaki, Cook Islands" },
    { value: "Kabri Dar", label: "Kabri Dar, Ethiopia" },
    { value: "Aguaclara", label: "Aguaclara, Colombia" },
    { value: "Ardmore", label: "Ardmore, U.S.A" },
    { value: "Arapahoe", label: "Arapahoe, U.S.A" },
    { value: "Munich", label: "Munich, Germany" },
    { value: "Albacete", label: "Albacete, Spain" },
    { value: "Aizawl", label: "Aizawl, India" },
    { value: "Aishalton", label: "Aishalton, Guyana" },
    { value: "Al Ain", label: "Al Ain, United Arab Emirates" },
    { value: "Adiyaman", label: "Adiyaman, Turkey" },
    { value: "Ardmore", label: "Ardmore, U.S.A" },
    { value: "Buenos Aires", label: "Buenos Aires, Argentina" },
    { value: "Wanigela", label: "Wanigela, Papua New Guinea" },
    { value: "Agnew", label: "Agnew, Australia" },
    { value: "Albury", label: "Albury, Australia" },
    { value: "Abu Musa", label: "Abu Musa, Iran" },
    { value: "Ambler", label: "Ambler, U.S.A" },
    { value: "Albina", label: "Albina, Suriname" },
    { value: "Abaiang", label: "Abaiang, Kiribati" },
    { value: "Malaga", label: "Malaga, Spain" },
    { value: "Abéché", label: "Abéché, Chad" },
    { value: "Afton", label: "Afton, U.S.A" },
    { value: "Arrabury", label: "Arrabury, Australia" },
    { value: "Apalapsili", label: "Apalapsili, Indonesia" },
    { value: "Asaba", label: "Asaba, Nigeria" },
    { value: "Colorado Springs", label: "Colorado Springs, U.S.A" },
    { value: "Sakaka Al Jouf", label: "Sakaka Al Jouf, Saudi Arabia" },
    { value: "Abadan", label: "Abadan, Iran" },
    { value: "Altenrhein", label: "Altenrhein, Switzerland" },
    { value: "Apalachicola", label: "Apalachicola, U.S.A" },
    { value: "Ada", label: "Ada, U.S.A" },
    { value: "Ardabil", label: "Ardabil, Iran" },
    { value: "Dallas", label: "Dallas, U.S.A" },
    { value: "Aliceville", label: "Aliceville, U.S.A" },
    { value: "Wangerooge", label: "Wangerooge, Germany" },
    { value: "Achutupo", label: "Achutupo, Panama" },
    { value: "Anita Bay", label: "Anita Bay, U.S.A" },
  ];
  const seatPreferenceOptions = [
    { value: "", label: "Seat preference" },
    { value: "window", label: "Window" },
    { value: "aisle", label: "Aisle" },
    { value: "middle", label: "Middle" },
  ];
  const mealPreferenceOptions = [
    { value: "", label: "Meal preference" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "nonVegetarian", label: "Non-Vegetarian" },
    { value: "vegan", label: "Vegan" },
  ];
  const flightPreferenceOptions = [
    { value: "", label: "Select Class" },
    { value: "economy", label: "Economy" },
    { value: "first", label: "First" },
    { value: "premium", label: "Premium" },
    { value: "business", label: "Business" },
  ];
  const timePreferenceOptions = [
    { value: "", label: "Select" },
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
  ];

  const [flightSegments, setFlightSegments] = useState([
    {
      tripType: "oneWay",
      seatPreference: "",
      mealPreference: "",
      departFrom: "",
      arriveAt: "",
      departureDate: "",
      returnDate: "",
      description: "",
      timePreference: "",
      flightPreferences: "",
    },
  ]);

  const handleSegmentChange = (e, index) => {
    const { name, value } = e.target;
    const newSegments = [...flightSegments];
    newSegments[index][name] = value;
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const handleTripTypeChange = (e) => {
    const { value } = e.target;
    if (value === "multiCity") {
      const newSegments = flightSegments.map((segment) => ({
        ...segment,
        tripType: "multiCity",
      }));
      setFlightSegments(newSegments);
      onDataChange(newSegments);
    } else if (value === "oneWay") {
      const newSegments = [
        { ...flightSegments[0], tripType: "oneWay", returnDate: "" },
      ];
      setFlightSegments(newSegments);
      onDataChange(newSegments);
    } else if (value === "roundTrip") {
      const newSegments = [{ ...flightSegments[0], tripType: "roundTrip" }];
      setFlightSegments(newSegments);
      onDataChange(newSegments);
    }
  };

  const handleAddSegment = () => {
    setFlightSegments([
      ...flightSegments,
      {
        tripType: "multiCity",
        seatPreference: "",
        mealPreference: "",
        departFrom: "",
        arriveAt: "",
        departureDate: "",
        description: "",
        timePreference: "",
        flightPreferences: "",
      },
    ]);
  };

  const handleRemoveSegment = (index) => {
    const newSegments = flightSegments.filter((_, i) => i !== index);
    setFlightSegments(newSegments);
    onDataChange(newSegments);
  };

  const tripType = flightSegments[0]?.tripType || "oneWay";

  return (
    <section className="travel-mode-section">
      <h3>Flight Details ✈️</h3>
      <div className="flight-options-header">
        <div className="radio-group-horizontal">
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={tripType === "oneWay"}
              onChange={handleTripTypeChange}
            />{" "}
            One Way
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={tripType === "roundTrip"}
              onChange={handleTripTypeChange}
            />{" "}
            Round Trip
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="multiCity"
              checked={tripType === "multiCity"}
              onChange={handleTripTypeChange}
            />{" "}
            Multi-city
          </label>
        </div>
        <div className="preference-dropdowns">
          <LabeledDropdown
            name="seatPreference"
            value={flightSegments[0]?.seatPreference}
            onChange={(e) => handleSegmentChange(e, 0)}
            options={seatPreferenceOptions}
            className="inline-dropdown"
          />
          <LabeledDropdown
            name="mealPreference"
            value={flightSegments[0]?.mealPreference}
            onChange={(e) => handleSegmentChange(e, 0)}
            options={mealPreferenceOptions}
            className="inline-dropdown"
          />
        </div>
      </div>

      {flightSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="flight-segment-headers">
            <span className="required">DEPART FROM *</span>
            <span className="required">ARRIVE AT *</span>
            <span className="required">DEPARTURE DATE *</span>
            {tripType === "roundTrip" && (
              <span className="required">RETURN DATE *</span>
            )}
            <span>DESCRIPTION</span>
          </div>
          <div className="flight-segment-row">
            <LabeledDropdown
              name="departFrom"
              value={segment.departFrom}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select"
            />
            <LabeledDropdown
              name="arriveAt"
              value={segment.arriveAt}
              onChange={(e) => handleSegmentChange(e, index)}
              options={cityOptions}
              required={true}
              className="city-select"
            />
            <LabeledInput
              type="date"
              name="departureDate"
              value={segment.departureDate}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="eg: 31 Jan 2025"
              required={true}
              className="date-input"
            />
            {tripType === "roundTrip" && (
              <LabeledInput
                type="date"
                name="returnDate"
                value={segment.returnDate}
                onChange={(e) => handleSegmentChange(e, index)}
                placeholder="eg: 05 Feb 2025"
                required={true}
                className="date-input"
              />
            )}
            <LabeledInput
              type="text"
              name="description"
              value={segment.description}
              onChange={(e) => handleSegmentChange(e, index)}
              placeholder="Description"
              className="description-input"
            />
            {flightSegments.length > 1 && (
              <button
                type="button"
                className="delete-row-btn"
                onClick={() => handleRemoveSegment(index)}
              >
                🗑️
              </button>
            )}
          </div>
          <div className="flight-bottom-preferences">
            <span className="time-pref-label">Time Preference :</span>
            <LabeledDropdown
              name="timePreference"
              value={flightSegments[0]?.timePreference}
              onChange={(e) => handleSegmentChange(e, 0)}
              options={timePreferenceOptions}
              className="inline-dropdown"
            />
            <span className="time-pref-label">Flight Preference :</span>
            <LabeledDropdown
              name="flightPreferences"
              value={flightSegments[0]?.flightPreferences}
              onChange={(e) => handleSegmentChange(e, 0)}
              options={flightPreferenceOptions}
              className="inline-dropdown"
            />
          </div>
        </React.Fragment>
      ))}

      {tripType === "multiCity" && (
        <div className="add-flight-btn-container">
          <button
            type="button"
            onClick={handleAddSegment}
            className="add-flight-btn"
          >
            + Add Another Flight
          </button>
        </div>
      )}
    </section>
  );
};

export default FlightForm;
