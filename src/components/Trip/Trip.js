import React, { useState } from 'react';
import TripView from '../TripView/TripView';
import RequestForms from '../RequestForms/RequestForms';
import "./Trip.css";

// Define the RequestForms component directly in this file
const RequestForm = ({ onClose }) => (
  <div className="form-modal-overlay">
    <div className="form-modal-content">
      <button onClick={onClose} className="close-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h2>New Trip Request</h2>
      <RequestForms />
      <button className='cancel-btn' onClick={onClose}>Cancel</button>
    </div>
  </div>
);



function Trip() {
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  return (
    <>
     
      <div className="Trip-container">
        <h1>Trip Page</h1>
        <div className='trip-button'>
          <button onClick={openForm} className="main-button">
          + New Trip
        </button>
        </div>
       
        {showForm ? (
          <RequestForm onClose={closeForm} />
        ) : (
          <TripView />
        )}
      </div>
    </>
  );
}

export default Trip;
