import React, { useState } from 'react';
import TripView from '../TripView/TripView';
import RequestForms from '../RequestForms/RequestForms';
import "./Trip.css";

const RequestForm = ({ tripId, onClose }) => (
  <div className="form-modal-overlay">
    <div className="form-modal-content">
      <button onClick={onClose} className="close-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h2>{tripId ? 'Edit Trip Request' : 'New Trip Request'}</h2>
      <RequestForms tripId={tripId} onFormClose={onClose} />
    </div>
  </div>
);

function Trip() {
  const [showForm, setShowForm] = React.useState(false);
  const [editTripId, setEditTripId] = React.useState(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const openForm = () => {
    setEditTripId(null);
    setShowForm(true);
    setIsDetailOpen(false);  // ensure detail closed if form opens
  };

  const openFormWithId = (tripId) => {
    setEditTripId(tripId);
    setShowForm(true);
    setIsDetailOpen(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTripId(null);
  };

  // Called when detail view opens/closes
  const handleDetailOpen = () => {
    setIsDetailOpen(true);
    setShowForm(false);  // close form if detail opens
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
  };

  return (
    <div className="Trip-container">

      {/* Hide button if form or detail is open */}
      {!(showForm || isDetailOpen) && (
        <div className="trip-button">
          <button onClick={openForm} className="main-button">
            + New Trip
          </button>
        </div>
      )}

      {showForm ? (
        <RequestForm tripId={editTripId} onClose={closeForm} onFormClose={closeForm} />
      ) : (
        <TripView
          onOpenForm={openFormWithId}
          onOpenDetail={handleDetailOpen}
          onCloseDetail={handleDetailClose}
        />
      )}
    </div>
  );
}


export default Trip;
