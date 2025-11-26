import React, { useState, useEffect } from "react";
import "./CarTicketForm.css";

const cityOptions = [
    { cityCode: "", cityName: "Select City" },
    { cityCode: "NYC", cityName: "New York" },
    { cityCode: "LON", cityName: "London" },
    { cityCode: "PAR", cityName: "Paris" },
    { cityCode: "DXB", cityName: "Dubai" },
    { cityCode: "TYO", cityName: "Tokyo" },
];

const carTypes = [
    { value: "", label: "Select Car Type" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "van", label: "Van" },
];

const CarTicketForm = ({ Car, onClose }) => {
    console.log("car", Car);
    const [bookingId, setBookingId] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [amountCurrency, setAmountCurrency] = useState("INR");
    const [amountValue, setAmountValue] = useState("");
    const [isRefundable, setIsRefundable] = useState(false);
    const [notes, setNotes] = useState("");
    const [createExpense, setCreateExpense] = useState(false);
    const [currencyList, setCurrencyList] = useState([]);
    const [showOtherCharges, setShowOtherCharges] = useState(false);
    const [otherChargesCurrency, setOtherChargesCurrency] = useState("INR");
    const [otherChargesAmount, setOtherChargesAmount] = useState("");
    const [attachments, setAttachments] = useState([]);

    const [itineraryRows, setItineraryRows] = useState([]);

    // Fetch currency list from API
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

    // Initialize itineraryRows state when Car prop changes
    useEffect(() => {
        if (Car && Object.keys(Car).length > 0) {
            const newItineraryRow = {
                id: Car.ROWID || Date.now(),
                carrierName: Car.Merchant_Name || "",
                carNumber: "", // If you have car number field, else remove
                departDate: Car.CAR_DEP_DATE || "",
                departTime: Car.CAR_DEP_TIME || "",
                arriveDate: Car.CAR_ARR_DATE || "",
                arriveTime: Car.CAR_ARR_TIME || "",
                depCity: Car.CAR_DEP_CITY || "",
                arrCity: Car.CAR_ARR_CITY || "",
                carType: Car.Car_Type || "", // New field mapped
            };

            setItineraryRows([newItineraryRow]);

            setAmountValue(Car.Amount || "");
            setAmountCurrency(Car.Currency_id || "INR");
            setBookingId("");
            setBookingDate("");
            setNotes(Car.Notes || "");
            setIsRefundable(Car.Refund_Type === "Refundable");
        } else {
            setItineraryRows([]);
            setAmountValue("");
            setAmountCurrency("INR");
            setBookingId("");
            setBookingDate("");
            setNotes("");
            setIsRefundable(false);
        }
    }, [Car]);

    const getCityDisplay = (cityCode) => {
        const city = cityOptions.find((c) => c.cityCode === cityCode);
        return city ? `${city.cityName} (${city.cityCode})` : cityCode;
    };

    const getCityNameCode = (cityCode) => {
        const city = cityOptions.find((c) => c.cityCode === cityCode);
        return city ? `${city.cityName} (${city.cityCode})` : cityCode || "";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (Number.isNaN(date)) return dateStr;
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const updateRow = (id, field, value) => {
        setItineraryRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const removeRow = (id) => {
        setItineraryRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setAttachments((prev) => [
            ...prev,
            ...newFiles.map((file) => ({
                id: Date.now() + Math.random(),
                file: file,
                url: URL.createObjectURL(file),
            })),
        ]);
        event.target.value = null;
    };

    const removeAttachment = (idToRemove) => {
        setAttachments((prev) =>
            prev.filter((attachment) => attachment.id !== idToRemove)
        );
    };

    const renderCityOptions = () =>
        cityOptions.map(({ cityCode, cityName }) => (
            <option key={cityCode} value={cityCode}>
                {cityName}
            </option>
        ));

    const onSaveAndSubmit = (e) => {
        e.preventDefault();
        const payload = {
            bookingId,
            bookingDate,
            amount: { currency: amountCurrency, value: amountValue },
            isRefundable,
            notes,
            createExpense,
            itinerary: itineraryRows,
            otherCharges: showOtherCharges
                ? { currency: otherChargesCurrency, amount: otherChargesAmount }
                : null,
            attachments: attachments.map((attachment) => ({
                name: attachment.file.name,
                type: attachment.file.type,
                size: attachment.file.size,
            })),
        };
        console.log("Submitting Ticket:", payload);
        alert("Ticket submitted (mock)!");
    };

    return (
        <div className="ticket-page">
            <div className="ticket-toolbar">
                <span className="toolbar-title">Add Car Ticket</span>
                <button className="toolbar-close" aria-label="Close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="ticket-content">
                {/* LEFT: Attachment dropzone */}
                <section className="attachment-panel" aria-label="Attach documents">
                    {attachments.length === 0 && (
                        <div className="attachment-dropzone">
                            <input
                                type="file"
                                id="file-upload"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*,application/pdf"
                            />
                            <label htmlFor="file-upload" className="drop-icon-label">
                                Add docus
                            </label>
                            <p className="drop-hint">Attach documents from computer</p>
                        </div>
                    )}

                    <div className="attachments-list">
                        {attachments.map((attachment) => (
                            <div key={attachment.id} className="attachment-preview">
                                <button
                                    className="remove-attachment-btn"
                                    onClick={() => removeAttachment(attachment.id)}
                                    aria-label={`Remove ${attachment.file.name}`}
                                >
                                    ✕
                                </button>

                                {attachment.file.type.startsWith("image/") ? (
                                    <img
                                        src={attachment.url}
                                        alt={attachment.file.name}
                                        className="attachment-image"
                                    />
                                ) : (
                                    <span
                                        role="img"
                                        aria-label="document"
                                        className="attachment-icon"
                                    >
                                        📄
                                    </span>
                                )}

                                <p className="attachment-filename">{attachment.file.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RIGHT: Form */}
                <section className="ticket-form">
                    <div className="route-summary">
                        <span className="city">
                            {itineraryRows.length > 0
                                ? getCityNameCode(itineraryRows[0].depCity)
                                : ""}
                        </span>
                        <span className="separator">➜</span>
                        <span className="city">
                            {itineraryRows.length > 0
                                ? getCityNameCode(itineraryRows[itineraryRows.length - 1].arrCity)
                                : ""}
                        </span>
                        <span className="route-sub">
                            {itineraryRows.length > 0
                                ? formatDate(itineraryRows[0].departDate)
                                : ""}
                        </span>
                    </div>

                    {/* Booking details */}
                    <div className="two-col">
                        <div className="form-field">
                            <label htmlFor="bookingId">
                                Booking ID <span className="req">*</span>
                            </label>
                            <input
                                id="bookingId"
                                type="text"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                placeholder="Enter Booking ID"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="bookingDate">
                                Booking Date <span className="req">*</span>
                            </label>
                            <input
                                id="bookingDate"
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Amount + Refundable */}
                    <div className="amount-row">
                        <div className="form-field currency-field">
                            <label>
                                Amount <span className="req">*</span>
                            </label>
                            <div className="amount-inputs">
                                <select
                                    aria-label="Currency"
                                    value={amountCurrency}
                                    onChange={(e) => setAmountCurrency(e.target.value)}
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
                                    inputMode="decimal"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amountValue}
                                    onChange={(e) => setAmountValue(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="checkbox-field">
                            <input
                                id="refundable"
                                type="checkbox"
                                checked={isRefundable}
                                onChange={(e) => setIsRefundable(e.target.checked)}
                            />
                            <label htmlFor="refundable">Refundable</label>
                        </div>
                    </div>

                    {/* Other Charges */}
                    <div className="checkbox-field">
                        <input
                            id="otherCharges"
                            type="checkbox"
                            checked={showOtherCharges}
                            onChange={() => setShowOtherCharges((v) => !v)}
                        />
                        <label htmlFor="otherCharges">Other Charges</label>
                    </div>

                    {showOtherCharges && (
                        <div className="amount-row">
                            <div className="form-field currency-field">
                                <label>
                                    Amount <span className="req">*</span>
                                </label>
                                <div className="amount-inputs">
                                    <select
                                        aria-label="Currency"
                                        value={otherChargesCurrency}
                                        onChange={(e) => setOtherChargesCurrency(e.target.value)}
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
                                        inputMode="decimal"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={otherChargesAmount}
                                        onChange={(e) => setOtherChargesAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Notes */}
                    <div className="form-field">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            rows={3}
                            placeholder="Add notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="section-header">
                        <span>Update Itinerary</span>
                    </div>

                    {/* Update Itinerary */}
                    <div className="itinerary-section">
                        {itineraryRows.map((row) => (
                            <div className="form-ticket" key={row.id}>
                                <input type="hidden" value={row.rowId || ""} />

                                <div className="field">
                                    <label>Carrier Name *</label>
                                    <input
                                        type="text"
                                        value={row.carrierName}
                                        onChange={(e) => updateRow(row.id, "carrierName", e.target.value)}
                                        placeholder="Enter carrier name"
                                    />
                                </div>



                                <div className="field">
                                    <label>Departure Date & Time *</label>
                                    <div className="date-time">
                                        <input
                                            type="date"
                                            value={row.departDate}
                                            onChange={(e) => updateRow(row.id, "departDate", e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            value={row.departTime}
                                            onChange={(e) => updateRow(row.id, "departTime", e.target.value)}
                                        />
                                    </div>
                                    <select
                                        required
                                        value={row.depCity}
                                        onChange={(e) => updateRow(row.id, "depCity", e.target.value)}
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
                                            value={row.arriveDate}
                                            onChange={(e) => updateRow(row.id, "arriveDate", e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            value={row.arriveTime}
                                            onChange={(e) => updateRow(row.id, "arriveTime", e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={row.arrCity}
                                        onChange={(e) => updateRow(row.id, "arrCity", e.target.value)}
                                    >
                                        {renderCityOptions()}
                                    </select>
                                    <p className="location">Arrive at: {getCityDisplay(row.arrCity)}</p>
                                </div>

                                <div className="field">
                                    <label>Car Type</label>
                                    <select
                                        value={row.carType || ""}
                                        onChange={(e) => updateRow(row.id, "carType", e.target.value)}
                                    >
                                        {carTypes.map((ct) => (
                                            <option key={ct.value} value={ct.value}>
                                                {ct.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {itineraryRows.length > 1 && (
                                    <button
                                        type="button"
                                        className="delete-icon"
                                        onClick={() => removeRow(row.id)}
                                        aria-label="Remove row"
                                        title="Remove"
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="form-actions" style={{ marginTop: "20px" }}>
                <button className="primary" onClick={onSaveAndSubmit}>
                    Save and Submit
                </button>
                <button
                    className="ghost"
                    onClick={(e) => {
                        e.preventDefault();
                        alert("Cancelled (mock).");
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CarTicketForm;
