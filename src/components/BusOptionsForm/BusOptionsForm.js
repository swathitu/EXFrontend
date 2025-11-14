import React, { useState, useEffect } from 'react';
import './BusOptionsForm.css';

// --- Icons ---
const CloseIcon = () => (<svg viewBox="0 0 512 512" style={{ width: '20px', height: '20px' }}><path d="m285.7 256 198-198c8.2-8.2 8.2-21.5 0-29.7s-21.5-8.2-29.7 0l-198 198-198-198c-8.2-8.2-21.5-8.2-29.7 0s-8.2 21.5 0 29.7l198 198-198 198c-8.2 8.2-8.2 21.5 0 29.7 4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2l198-198 198 198c4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2c8.2-8.2 8.2-21.5 0-29.7L285.7 256z" /></svg>);
const TrashIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>);
const PlusIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M8 0a1 1 0 011 1v6h6a1 1 0 110 2H9v6a1 1 0 11-2 0V9H1a1 1 0 110-2h6V1a1 1 0 011-1z"/></svg>);
const NotesIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '14px', height: '14px' }}><path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/><path d="M5.5 7a.5.5 0 000 1h5a.5.5 0 000-1h-5z"/></svg>);
const CalendarIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/></svg>);
const TimeIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M8 3.5a.5.5 0 00-1 0V9a.5.5 0 00.252.434l3.5 2a.5.5 0 00.496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 108 0a8 8 0 000 16zm7-8A7 7 0 111 8a7 7 0 0114 0z"/></svg>);
const CaretIcon = () => (<svg viewBox="0 0 16 16" fill="currentColor" style={{ width: '12px', height: '12px' }}><path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z"/></svg>);


// --- Helper to get YYYY-MM-DD from various date strings ---
const getISODate = (dateStr) => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    } catch (e) {
        return "";
    }
};


export default function BusOptionsForm({ open, onClose, bookingData }) {
    
    // State for the form options
    const [options, setOptions] = useState([]);

    // Pre-populate the form when bookingData changes
    useEffect(() => {
        if (bookingData) {
            console.log(bookingData);
            // Pre-fill with dummy data as requested
            setOptions([
                {
                    id: 1,
                    carrier: 'Dummy Bus Service',
                    depDate: getISODate(bookingData.depDate),
                    depTime: '09:30',
                    arrDate: getISODate(bookingData.depDate),
                    arrTime: '14:45',
                    amount: '1200.00',
                    currency: 'INR',
                    isRefundable: true,
                    showNotes: false,
                    notes: ''
                }
            ]);
        }
    }, [bookingData]);


    if (!open || !bookingData) {
        return null;
    }

    // --- Form Helper Functions ---

    const handleOptionChange = (id, field, value) => {
        setOptions(prevOptions =>
            prevOptions.map(opt =>
                opt.id === id ? { ...opt, [field]: value } : opt
            )
        );
    };

    const handleAddOption = () => {
        setOptions(prevOptions => [
            ...prevOptions,
            {
                id: prevOptions.length + 1,
                carrier: '',
                depDate: getISODate(bookingData.depDate),
                depTime: '',
                arrDate: getISODate(bookingData.depDate),
                arrTime: '',
                amount: '',
                currency: 'INR',
                isRefundable: false,
                notes: '',
                showNotes: false
            }
        ]);
    };

    const handleRemoveOption = (id) => {
        setOptions(prevOptions => prevOptions.filter(opt => opt.id !== id));
    };

    const handleSave = () => {
        console.log("Saving Options:", options);
        alert("Save action not implemented yet. Check console for data.");
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="modal-header">
                    <h2 className="modal-title">Add Trip Options</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Modal Sub-Header */}
                <div className="modal-subheader">
                    <span className="route">{bookingData.depCity} &rarr; {bookingData.arrCity}</span>
                    <span className="date">{bookingData.displayDate}</span>
                </div>

                {/* Modal Body */}
                <div className="modal-body-form">
                    {options.map((opt, index) => (
                        <div className="option-card" key={opt.id}>
                            <div className="option-header">
                                <h3>Option {index + 1}</h3>
                                {options.length > 0 && ( // Show delete if at least one
                                    <button className="btn-delete-option" onClick={() => handleRemoveOption(opt.id)}>
                                        <TrashIcon />
                                    </button>
                                )}
                            </div>

                            {/* This div matches the "trip-option" class from the HTML */}
                            <div className="trip-option-form">
                                {/* --- ROW 1 (TABLE) --- */}
                                <table className="trip-options-table">
                                    <thead>
                                        <tr>
                                            <th style={{width: '33.3%'}}><span className="required">Carrier Name</span></th>
                                            <th style={{width: '33.3%'}}><span className="required">Departure Date & Time</span></th>
                                            <th style={{width: '33.3%'}}><span className="required">Arrival Date & Time</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {/* Carrier */}
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="form-control"
                                                    placeholder="Select or type to add" 
                                                    value={opt.carrier}
                                                    onChange={(e) => handleOptionChange(opt.id, 'carrier', e.target.value)}
                                                />
                                            </td>
                                            {/* Departure */}
                                            <td>
                                                <div className="date-time-cell-wrapper">
                                                    <div className="date-time-inputs">
                                                        <div className="with-date-icon">
                                                            <input 
                                                                type="date" 
                                                                className="form-control date-input"
                                                                value={opt.depDate}
                                                                onChange={(e) => handleOptionChange(opt.id, 'depDate', e.target.value)}
                                                            />
                                                            <span className="icon-wrapper"><CalendarIcon /></span>
                                                        </div>
                                                        <div className="with-time-icon">
                                                            <input 
                                                                type="time" 
                                                                className="form-control time-input"
                                                                value={opt.depTime}
                                                                onChange={(e) => handleOptionChange(opt.id, 'depTime', e.target.value)}
                                                            />
                                                            <span className="icon-wrapper"><TimeIcon /></span>
                                                        </div>
                                                    </div>
                                                    <div className="location-row">
                                                        <span>Depart from:</span>
                                                        <button className="btn-city-dropdown">
                                                            {bookingData.depCity} <CaretIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Arrival */}
                                            <td>
                                                <div className="date-time-cell-wrapper">
                                                    <div className="date-time-inputs">
                                                        <div className="with-date-icon">
                                                            <input 
                                                                type="date" 
                                                                className="form-control date-input"
                                                                value={opt.arrDate}
                                                                onChange={(e) => handleOptionChange(opt.id, 'arrDate', e.target.value)}
                                                            />
                                                            <span className="icon-wrapper"><CalendarIcon /></span>
                                                        </div>
                                                        <div className="with-time-icon">
                                                            <input 
                                                                type="time" 
                                                                className="form-control time-input"
                                                                value={opt.arrTime}
                                                                onChange={(e) => handleOptionChange(opt.id, 'arrTime', e.target.value)}
                                                            />
                                                            <span className="icon-wrapper"><TimeIcon /></span>
                                                        </div>
                                                    </div>
                                                    <div className="location-row">
                                                        <span>Arrive at:</span>
                                                        <button className="btn-city-dropdown">
                                                            {bookingData.arrCity} <CaretIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* --- ROW 2 (DIV) --- */}
                                <div className="cost-details-row">
                                    <div className="form-group-amount">
                                        <label className="required">Amount</label>
                                        <div className="amount-group">
                                            {/* This will be a dropdown */}
                                            <span>INR</span>
                                            <input 
                                                type="number" 
                                                className="form-control amount-input"
                                                placeholder="0.00"
                                                value={opt.amount}
                                                onChange={(e) => handleOptionChange(opt.id, 'amount', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group-refundable">
                                        <input 
                                            type="checkbox" 
                                            id={`refundable-${opt.id}`}
                                            checked={opt.isRefundable}
                                            onChange={(e) => handleOptionChange(opt.id, 'isRefundable', e.target.checked)}
                                        />
                                        <label htmlFor={`refundable-${opt.id}`}>Is Refundable</label>
                                    </div>
                                   <div className="form-group-notes">
                                        {!opt.showNotes ? (
                                            <a 
                                                href="#" 
                                                className="btn-add-notes" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOptionChange(opt.id, 'showNotes', true);
                                                }}
                                            >
                                                <NotesIcon /> Add Notes
                                            </a>
                                        ) : (
                                            <div className="notes-input-wrapper">
                                                <label htmlFor={`notes-${opt.id}`}>Notes</label>
                                                <input
                                                    type="text"
                                                    id={`notes-${opt.id}`}
                                                    className="form-control"
                                                    value={opt.notes}
                                                    onChange={(e) => handleOptionChange(opt.id, 'notes', e.target.value)}
                                                    placeholder="Add notes..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button className="btn-add-option" onClick={handleAddOption}>
                        <PlusIcon /> Add New Option
                    </button>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="btn-primary-green" onClick={handleSave}>
                        Save and Send
                    </button>
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}