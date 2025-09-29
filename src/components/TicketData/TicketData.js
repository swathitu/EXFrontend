import React, { useEffect, useState } from "react";
import "./TicketData.css";

// The main App component that handles data fetching and rendering.
const App = () => {
  // State for the main ticket data
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to track the mode and status selected for detailed view
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // State for editing a pending ticket
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingVendorName, setEditingVendorName] = useState("");
  const [editingAmount, setEditingAmount] = useState("");
  const [editingBillNumber, setEditingBillNumber] = useState("");
  const [editingBillDate, setEditingBillDate] = useState("");
  const [editingTypeOfBook, setEditingTypeOfBook] = useState("");
  const [editingStatus, setEditingStatus] = useState("");

  // State for notifications
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationType, setNotificationType] = useState("success");

  // Function to show a temporary notification
  const showNotification = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000); // Hide after 3 seconds
  };

  // Defines the async function to fetch the data.
  const fetchTicketData = async () => {
    try {
      setLoading(true);
      // Using the provided API endpoint to fetch data
      const response = await fetch("/server/expenseData/handler");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTicketData(data);
    } catch (e) {
      console.error("Failed to fetch ticket data:", e);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect hook to fetch the data when the component mounts.
  useEffect(() => {
    fetchTicketData();
  }, []); // Empty dependency array ensures this runs once on mount.

  // New useEffect hook for debugging purposes. This logs the filtered data.
  useEffect(() => {
    if (selectedMode) {
      console.log("Selected Mode:", selectedMode);
      console.log("Selected Status:", selectedStatus);
      const filteredData = ticketData.filter(
        (item) =>
          item.TypeOfMode === selectedMode &&
          item.status?.toLowerCase() === selectedStatus
      );
      console.log("Filtered Detailed Data:", filteredData);
    }
  }, [selectedMode, selectedStatus, ticketData]);

  // New function to handle clicks on the pending count.
  const handlePendingClick = (mode, count) => {
    if (count > 0) {
      setSelectedMode(mode);
      setSelectedStatus("pending");
    }
  };

  // New function to handle clicks on the completed count.
  const handleCompletedClick = (mode, count) => {
    if (count > 0) {
      setSelectedMode(mode);
      setSelectedStatus("completed");
    }
  };

  // Handle click on the Edit button for a pending ticket
  const handleEditClick = (row) => {
    setEditingBookingId(row.bookingId);
    setEditingVendorName(row.vendorName || "");
    setEditingAmount(
      row.Amount !== undefined && row.Amount !== null
        ? row.Amount.toString()
        : ""
    );
    setEditingBillNumber(
      row.BillNumber !== undefined && row.BillNumber !== null
        ? row.BillNumber.toString()
        : ""
    );
    setEditingBillDate(row.BillDate || "");
    setEditingTypeOfBook(row.TypeOfBook || "");
    setEditingStatus(row.status?.toLowerCase() || "pending");
  };

  // Handle saving the updated pending ticket data
  const handleUpdateVendor = async (bookingId) => {
    if (!bookingId) {
      showNotification("No booking ID selected for update.", "error");
      return;
    }

    // Define a list of required fields for completion
    const requiredFields = {
      vendorName: editingVendorName,
      Amount: editingAmount,
      BillNumber: editingBillNumber,
      BillDate: editingBillDate,
      TypeOfBook: editingTypeOfBook,
    };

    // Check if all required fields are filled
    const allFieldsFilled = Object.values(requiredFields).every(
      (value) => value !== "" && value !== null && value !== undefined
    );

    const payload = {
      bookingId: bookingId,
      vendorName: editingVendorName,
      Amount: parseInt(editingAmount, 10),
      BillNumber: parseInt(editingBillNumber, 10),
      BillDate: editingBillDate,
      TypeOfBook: editingTypeOfBook,
      // Conditionally set the status to 'completed'
      status: allFieldsFilled ? "completed" : "pending",
    };

    // You should also add a check for valid numbers before proceeding
    const amountValue = parseInt(editingAmount, 10);
    if (isNaN(amountValue)) {
      showNotification("Amount must be a valid number.", "error");
      return;
    }

    const billNumberValue = parseInt(editingBillNumber, 10);
    if (isNaN(billNumberValue)) {
      showNotification("Bill Number must be a valid number.", "error");
      return;
    }

    try {
      const response = await fetch("/server/expenseData/handler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update data.");
      }

      showNotification("Data updated successfully!", "success");
      setEditingBookingId(null);
      setSelectedMode(null); // Added this line to remove Action word from pending columns
      setSelectedStatus(null); // Added this line to remove Action word from pending columns
      fetchTicketData();
    } catch (e) {
      console.error("Error updating data:", e);
      showNotification(e.message, "error");
    }
  };

  // Processes the raw data to calculate the counts for each mode.
  const processTicketData = (data) => {
    const counts = {};

    data.forEach((item) => {
      const mode = item.TypeOfMode;
      if (!counts[mode]) {
        counts[mode] = { pending: 0, completed: 0 };
      }
      const status = item.status?.toLowerCase() || "pending";
      if (status === "pending") {
        counts[mode].pending++;
      } else if (status === "completed") {
        counts[mode].completed++;
      }
    });

    return counts;
  };

  // Get the aggregated data for the summary table
  const aggregatedData = processTicketData(ticketData);

  // Filter the data for the detailed view
  const detailedData = ticketData.filter(
    (item) =>
      item.TypeOfMode === selectedMode &&
      item.status?.toLowerCase() === selectedStatus
  );

  // A helper function to create a human-readable label from a camelCase or snake_case key
  const formatLabel = (key) => {
    if (!key) return "";
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" ");
  };

  // Dynamically create columns based on the keys present in the data for the selected mode
  const getDetailedColumns = (data, mode) => {
    if (data.length === 0) {
      return [];
    }
    const firstItem = data[0];
    const keys = Object.keys(firstItem);

    // Define the desired order of common fields
    const initialFields = ["TripNumber", "RequestedBy", "TypeOfMode"];
    const secondaryFields = [
      "Amount",
      "vendorName",
      "BillNumber",
      "BillDate",
      "TypeOfBook",
    ];

    let columns = [];

    // Add initial common fields
    initialFields.forEach((field) => {
      if (keys.includes(field)) {
        columns.push({ key: field, label: formatLabel(field) });
      }
    });

    // Add mode-specific fields
    keys.forEach((key) => {
      // Check if the key starts with the selected mode and is not in the common fields.
      if (
        key.toLowerCase().startsWith(mode.toLowerCase()) &&
        !initialFields.includes(key) &&
        !secondaryFields.includes(key)
      ) {
        columns.push({ key, label: formatLabel(key) });
      }
    });

    // Add secondary common fields
    secondaryFields.forEach((field) => {
      if (keys.includes(field)) {
        columns.push({ key: field, label: formatLabel(field) });
      }
    });

    return columns;
  };

  const detailedColumns = getDetailedColumns(detailedData, selectedMode);

  // Render the component
  return (
    <div className="container">
      <div className="dashboard-card">
        <div className="header">
          <h1 className="title">Zoho Expense Sync</h1>
          {selectedMode && (
            <button
              onClick={() => {
                setSelectedMode(null);
                setSelectedStatus(null);
              }}
              className="back-button"
            >
              ← Back to Summary
            </button>
          )}
        </div>

        {notificationMessage && (
          <div className={`notification ${notificationType}`}>
            <p>{notificationMessage}</p>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-500">Loading ticket data...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          !selectedMode &&
          Object.keys(aggregatedData).length === 0 && (
            <div className="loading-container">
              <p>No data available to display.</p>
            </div>
          )}

        {!loading &&
          !error &&
          !selectedMode &&
          Object.keys(aggregatedData).length > 0 && (
            // Main summary table
            <div className="table-container">
              <table className="summary-table">
                <thead className="table-header-row">
                  <tr>
                    <th scope="col" className="table-header-cell left-round">
                      Mode
                    </th>
                    <th scope="col" className="table-header-cell">
                      Pending
                    </th>
                    <th scope="col" className="table-header-cell right-round">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(aggregatedData).map(([mode, counts]) => (
                    <tr key={mode} className="table-row">
                      <td className="table-cell left-round">{mode}</td>
                      <td className="table-cell">
                        <span
                          className="status-pending"
                          onClick={() =>
                            handlePendingClick(mode, counts.pending)
                          }
                        >
                          {counts.pending}
                        </span>
                      </td>
                      <td className="table-cell right-round">
                        <span
                          className="status-completed"
                          onClick={() =>
                            handleCompletedClick(mode, counts.completed)
                          }
                        >
                          {counts.completed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {!loading && !error && selectedMode && (
          // Dynamic view for both completed and pending tickets
          <div className="table-container1">
            <h2 className="detailed-title">
              {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}{" "}
              {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}{" "}
              Tickets
            </h2>
            <table className="detailed-table">
              <thead className="table-header-row">
                <tr>
                  {detailedColumns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="detailed-table-header-cell"
                    >
                      {column.label}
                    </th>
                  ))}
                  {selectedStatus === "pending" && (
                    <th scope="col" className="detailed-table-header-cell">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="detailed-table-body">
                {detailedData.map((row) => (
                  <tr key={row.bookingId} className="detailed-row">
                    {detailedColumns.map((column) => {
                      const isEditable = [
                        "vendorName",
                        "Amount",
                        "BillNumber",
                        "BillDate",
                        "TypeOfBook",
                        "status",
                      ].includes(column.key);
                      const isEditing = editingBookingId === row.bookingId;

                      let cellContent;
                      if (isEditing && isEditable) {
                        cellContent = (
                          <input
                            type={
                              column.key === "Amount" ||
                              column.key === "BillNumber"
                                ? "number"
                                : column.key === "BillDate"
                                ? "date"
                                : "text"
                            }
                            value={
                              column.key === "vendorName"
                                ? editingVendorName
                                : column.key === "Amount"
                                ? editingAmount
                                : column.key === "BillNumber"
                                ? editingBillNumber
                                : column.key === "BillDate"
                                ? editingBillDate
                                : column.key === "TypeOfBook"
                                ? editingTypeOfBook
                                : ""
                            }
                            onChange={(e) => {
                              if (column.key === "vendorName")
                                setEditingVendorName(e.target.value);
                              else if (column.key === "Amount")
                                setEditingAmount(e.target.value);
                              else if (column.key === "BillNumber")
                                setEditingBillNumber(e.target.value);
                              else if (column.key === "BillDate")
                                setEditingBillDate(e.target.value);
                              else if (column.key === "TypeOfBook")
                                setEditingTypeOfBook(e.target.value);
                            }}
                            className="edit-input"
                            placeholder={`Enter ${column.label}`}
                          />
                        );
                      } else {
                        cellContent =
                          row[column.key] !== undefined &&
                          row[column.key] !== null
                            ? row[column.key]
                            : "N/A";
                      }

                      return (
                        <td key={column.key} className="detailed-cell">
                          {cellContent}
                        </td>
                      );
                    })}
                    {selectedStatus === "pending" && (
                      <td className="detailed-cell text-right">
                        {editingBookingId === row.bookingId ? (
                          <>
                            <button
                              onClick={() => handleUpdateVendor(row.bookingId)}
                              className="save-button"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingBookingId(null)}
                              className="cancel-button"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditClick(row)}
                            className="edit-button"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
