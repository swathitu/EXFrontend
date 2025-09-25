import React, { useState, useEffect, useRef } from "react";

const CustomData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    Activity: "",
    Donor: "",
    conditionArea: "",
    Location: "",
    Branch: "",
  });
  const [editingRowId, setEditingRowId] = useState(null);
  const [activeRowIdForActions, setActiveRowIdForActions] = useState(null);

  const API_ENDPOINT = "/server/insertData";

  // Function to fetch all data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission for POST or PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let response;
      let method;
      let payload;

      // Determine if we are updating an existing record or creating a new one
      if (editingRowId) {
        // Prepare payload for PUT request (update)
        method = "PUT";
        payload = { ...formData, ROWID: editingRowId };
      } else {
        // Prepare payload for POST request (create)
        method = "POST";
        payload = { ...formData };
      }

      response = await fetch(API_ENDPOINT, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data.");
      }
      const result = await response.json();
      if (result.status === "success") {
        await fetchData(); // Refresh the data list
        handleCancelEdit(); // Reset form after successful submission
        setShowForm(false); // Hide the form after submission
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle DELETE request
  const handleDelete = async (rowId) => {
    if (!rowId) {
      setError("Cannot delete record: ROWID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ROWID: rowId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete data.");
      }
      const result = await response.json();
      if (result.status === "success") {
        await fetchData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Set the form for editing a row and show the form
  const handleEdit = (row) => {
    // Populate form data with the selected row's custom data
    setFormData({
      Activity: row.customData.Activity || "",
      Donor: row.customData.Donor || "",
      conditionArea: row.customData.conditionArea || "",
      Location: row.customData.Location || "",
      Branch: row.customData.Branch || "",
    });
    // Set the editing status by storing the ROWID
    setEditingRowId(row.customData.ROWID);
    setShowForm(true); // Show the form for editing
    setActiveRowIdForActions(null); // Hide dropdown
  };

  // Function to cancel edit mode and clear the form
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setFormData({
      Activity: "",
      Donor: "",
      conditionArea: "",
      Location: "",
      Branch: "",
    });
  };

  // Check if at least one form field has a value
  const isFormValid = Object.values(formData).some(value => value.trim() !== '');

  // Function to toggle dropdown menu for a specific row
  const toggleDropdown = (rowId) => {
    setActiveRowIdForActions(prevId => (prevId === rowId ? null : rowId));
  };
  
  return (
    <div>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f2f5;
            color: #333;
        }

        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            min-height: 100vh;
        }

        .card {
            background: #fff;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 900px;
            box-sizing: border-box;
            margin-top: 1.5rem;
        }

        .title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a202c;
            text-align: center;
            margin-bottom: 2rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-label {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #4a5568;
        }

        .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
            background-color: #f7fafc;
            transition: all 0.2s ease-in-out;
        }

        .form-input:focus {
            outline: none;
            border-color: #4c51bf;
            box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.2);
        }
        
        .add-button-container {
            width: 100%;
            max-width: 900px;
            display: flex;
            justify-content: flex-end;
            margin-top: 1.5rem;
        }

        .add-button {
            background-color: #4c51bf;
            color: #fff;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .add-button:hover {
            background-color: #3d429a;
        }

        .button-container {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1rem;
        }

        .submit-button {
            background-color: #4c51bf;
            color: #fff;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .submit-button:hover {
            background-color: #3d429a;
        }
        
        .submit-button:disabled {
            background-color: #a0aec0;
            cursor: not-allowed;
        }

        .status-message {
            text-align: center;
            margin-top: 1rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-weight: 600;
        }

        .loading {
            background-color: #e2e8f0;
            color: #4a5568;
        }

        .error {
            background-color: #fed7d7;
            color: #c53030;
        }

        .table-container {
            overflow-x: auto;
            margin-top: 2rem;
            width: 100%;
            max-width: 900px;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 0.75rem;
            table-layout: fixed;
        }

        thead tr {
            background-color: #4c51bf;
            color: white;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        thead th {
            font-weight: 600;
            padding: 1rem;
            text-align: left;
        }

        tbody tr {
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease-in-out;
        }
        
        tbody tr:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        tbody td {
            padding: 1rem;
            word-wrap: break-word;
        }

        .no-records {
            text-align: center;
            padding: 2rem;
            color: #718096;
            font-style: italic;
        }
        
        .actions-cell {
          text-align: center;
          position: relative;
        }

        .actions-button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.5rem;
            font-weight: bold;
            color: #4a5568;
            padding: 0.25rem 0.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
        }

        .actions-button:hover {
            background-color: #e2e8f0;
        }

        .dropdown-menu {
            position: absolute;
            top: 30%;
            right: 0;
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10;
            display: flex;
            flex-direction: column;
            min-width: 120px;
            overflow: hidden;
        }

        .dropdown-item {
            padding: 0.75rem 1rem;
            cursor: pointer;
            background: none;
            border: none;
            text-align: left;
            width: 100%;
            font-size: 1rem;
            color: #4a5568;
            transition: background-color 0.2s;
        }

        .dropdown-item:hover {
            background-color: #f7fafc;
        }
        `}
      </style>
      <div className="container">
        {showForm ? (
          <div className="card">
            <h1 className="title">
              {editingRowId ? "Edit Record" : "Add New Record"}
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="Activity" className="form-label">
                    Activity
                  </label>
                  <input
                    type="text"
                    id="Activity"
                    name="Activity"
                    placeholder="Activity"
                    value={formData.Activity}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="Donor" className="form-label">
                    Donor
                  </label>
                  <input
                    type="text"
                    id="Donor"
                    name="Donor"
                    placeholder="Donor"
                    value={formData.Donor}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="conditionArea" className="form-label">
                    Condition Area
                  </label>
                  <input
                    type="text"
                    id="conditionArea"
                    name="conditionArea"
                    placeholder="Condition Area"
                    value={formData.conditionArea}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="Location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="Location"
                    name="Location"
                    placeholder="Location"
                    value={formData.Location}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="Branch" className="form-label">
                    Branch
                  </label>
                  <input
                    type="text"
                    id="Branch"
                    name="Branch"
                    placeholder="Branch"
                    value={formData.Branch}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="button-container">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading || !isFormValid}
                >
                  {editingRowId ? "Update Record" : "Add Record"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCancelEdit();
                    setShowForm(false);
                  }}
                  className="submit-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="add-button-container">
              <button
                onClick={() => {
                  setShowForm(true);
                  handleCancelEdit();
                }}
                className="add-button"
              >
                Add Record
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Donor</th>
                    <th>Condition Area</th>
                    <th>Location</th>
                    <th>Branch</th>
                    <th className="actions-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((row) => (
                      <tr key={row.customData.ROWID}>
                        <td>{row.customData.Activity}</td>
                        <td>{row.customData.Donor}</td>
                        <td>{row.customData.conditionArea}</td>
                        <td>{row.customData.Location}</td>
                        <td>{row.customData.Branch}</td>
                        <td
                          className="actions-cell"
                          onMouseLeave={() => setActiveRowIdForActions(null)}
                        >
                          <button
                            className="actions-button"
                            onClick={() => toggleDropdown(row.customData.ROWID)}
                          >
                            ...
                          </button>
                          {activeRowIdForActions === row.customData.ROWID && (
                            <div className="dropdown-menu">
                              <button
                                className="dropdown-item"
                                onClick={() => handleEdit(row)}
                              >
                                Edit
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => handleDelete(row.customData.ROWID)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-records">
                        {loading ? "Fetching data..." : "No records found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Status messages */}
        {loading && <div className="status-message loading">Loading...</div>}
        {error && <div className="status-message error">Error: {error}</div>}
      </div>
    </div>
  );
};

export default CustomData;
