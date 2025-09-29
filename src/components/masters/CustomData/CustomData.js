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
  const [editData, setEditData] = useState(null);
  const [selectedEditField, setSelectedEditField] = useState(null);
  const [activeRowIdForActions, setActiveRowIdForActions] = useState(null);

  // Using a timeout to prevent the dropdown from immediately closing on click.
  // This is a common pattern to fix a race condition with click-outside handlers.
  const toggleDropdown = (rowId) => {
    setActiveRowIdForActions((prevId) => (prevId === rowId ? null : rowId));
  };

  const dropdownRef = useRef(null);

  // This effect will only run after the component has rendered.
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveRowIdForActions(null);
      }
    }
    // We add a slight delay to the listener to prevent it from
    // firing immediately after the button click.
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const API_ENDPOINT = "/server/insertData";

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRadioChange = (e) => {
    const fieldName = e.target.value;
    setSelectedEditField(fieldName);
    setFormData({
      ...formData,
      [fieldName]: editData[fieldName] || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let response;
      let method;
      let payload;

      if (editingRowId) {
        method = "PUT";
        payload = { ROWID: editingRowId, [selectedEditField]: formData[selectedEditField] };
      } else {
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
        await fetchData();
        handleCancelEdit();
        setShowForm(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (row) => {
    setEditData(row.customData);
    setEditingRowId(row.customData.ROWID);
    setShowForm(true);
    setSelectedEditField(null);
    setFormData({
      Activity: "",
      Donor: "",
      conditionArea: "",
      Location: "",
      Branch: "",
    });
    setActiveRowIdForActions(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditData(null);
    setSelectedEditField(null);
    setFormData({
      Activity: "",
      Donor: "",
      conditionArea: "",
      Location: "",
      Branch: "",
    });
  };

  const isFormValid = editingRowId
    ? selectedEditField && formData[selectedEditField]
    : Object.values(formData).some((value) => value.trim() !== "");

  const fields = ["Activity", "Donor", "conditionArea", "Location", "Branch"];

  return (
    <div className="container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #1f2937;
          }

          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            min-height: 100vh;
          }

          .card {
            background: #ffffff;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            width: 100%;
            max-width: 900px;
            box-sizing: border-box;
            margin-top: 1.5rem;
          }

          .title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
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
          
          .form-group-radio {
            margin-bottom: 1rem;
          }

          .form-label {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #374151;
          }
          
          .radio-group {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .radio-label {
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-size: 0.875rem;
            font-weight: 500;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .radio-label input[type="radio"] {
            display: none;
          }
          
          .radio-label input[type="radio"]:checked + .radio-span {
            background-color: #4c51bf;
            color: #fff;
          }

          .radio-label:hover {
            background-color: #d1d5db;
          }
          
          .radio-span {
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            transition: background-color 0.2s ease-in-out;
          }

          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #d1d5db;
            background-color: #f9fafb;
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
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
            background-color: #fee2e2;
            color: #b91c1c;
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
            top: 20%;
            right: 0;
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10;
            display: flex;
            flex-direction: column;
            min-width: 120px;
            overflow: hidden;
            transform: translateY(0.5rem);
            pointer-events: auto;
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .dropdown-item:hover {
            background-color: #f7fafc;
          }
        `}
      </style>
      {showForm ? (
        <div className="card">
          <h1 className="title">
            {editingRowId ? "Edit Record" : "Add New Record"}
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {editingRowId ? (
                <>
                  <div className="form-group-radio">
                    <label className="form-label">
                      Select a field to edit:
                    </label>
                    <div className="radio-group">
                      {fields.map((field) => (
                        <label key={field} className="radio-label">
                          <input
                            type="radio"
                            name="editField"
                            value={field}
                            checked={selectedEditField === field}
                            onChange={handleRadioChange}
                          />
                          <span className="radio-span">{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {selectedEditField && (
                    <div className="form-group">
                      <label
                        htmlFor={selectedEditField}
                        className="form-label"
                      >
                        {selectedEditField}
                      </label>
                      <input
                        type="text"
                        id={selectedEditField}
                        name={selectedEditField}
                        placeholder={`Enter new ${selectedEditField}`}
                        value={formData[selectedEditField]}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
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
                      <td className="actions-cell">
                        <button
                          className="actions-button"
                          onClick={() => toggleDropdown(row.customData.ROWID)}
                        >
                          ...
                        </button>
                        {activeRowIdForActions === row.customData.ROWID && (
                          <div className="dropdown-menu" ref={dropdownRef}>
                            <button
                              className="dropdown-item"
                              onClick={() => handleEdit(row)}
                            >
                              Edit
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleDelete(row.customData.ROWID)
                              }
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
  );
};

export default CustomData;
