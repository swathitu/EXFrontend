import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Form.css";
import { addUser, getUser, updateUser,getReportingMasters,getDepartments,getLocations} from "../../api/users";

// Internal constants
const roles = [
  { id: "submitter", name: "Submitter" },
  { id: "approver", name: "Approver" },
  { id: "admin", name: "Admin" },
  { id: "travel_agent", name: "Travel Agent" },
];
const EMPTY = {
  firstName: "", lastName: "", employeeId: "", email: "", contactNo: "", roleId: "",
  managerId: "", departmentId: "", locationId: ""
};
export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [Reporters, setReporters] = useState([]);
  const [Departments,setDepartments] = useState([]);
  const [locations,setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First Name is required";
    if (!form.lastName.trim()) e.lastName = "Last Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.roleId) e.roleId = "Role is required";
    if (!form.locationId) e.locationId = "Location is required";
    return e;
  };

  useEffect(() => {
    (async () => {
      const reportingmanagers = await getReportingMasters();
      const departmentlist = await getDepartments();
      const locationlist = await getLocations();
      setReporters(Array.isArray(reportingmanagers?.data) ? reportingmanagers.data : []);
      setDepartments(Array.isArray(departmentlist?.data)? departmentlist.data : []);
      setLocations(Array.isArray(locationlist?.data)? locationlist.data : []);
      if (!id) {
        setForm(EMPTY)
        return setLoading(false);
      }
      try {
        const u = await getUser(id);
        setForm({
          firstName: u.First_Name || "",
          lastName: u.Last_Name || "",
          employeeId: u.Employee_ID || "",
          email: u.Email || "",
          contactNo: u.Contact_No || "",
          roleId: u.Role || "",
          managerId: u.Reporting_Manager || "",
          departmentId: u.Department || "",
          locationId: u.Location || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    const payload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      employee_id: form.employeeId?.trim() || "",
      email: form.email.trim(),
      contact_no: form.contactNo?.trim() || "",
      role_id: form.roleId || null,
      reporting_manager_id: form.managerId || null,
      department_id: form.departmentId || null,
      location_id: form.locationId || null,
    };

    try {
      setSaving(true);
      const result = id ? await updateUser(id, payload) : await addUser(payload);
      alert(
        result?.message ||
          (result?.status === "success" ? "User saved successfully." : null) ||
          "User saved successfully."
      );
      navigate("/masters/users");
    } catch (err) {
      alert("Failed to save user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading user form...</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;

  return (
    <form onSubmit={submit} className="form">
      <div className="form__header">
        <h1 className="page-title">{id ? "Edit User" : "New User"}</h1>
        <button
          type="button"
          className="form__close"
          onClick={() => navigate("/masters/users")}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="page-rule" />

      {/* User Details */}
      <div className="form__section">
        <div className="form__grid">
          <label className="form__col-6">
            <span className="form__label">
              First Name <span className="form__req">*</span>
            </span>
            <input
              className={`form__input${errors.firstName ? " form__input--err" : ""}`}
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="First Name"
            />
            {errors.firstName && <div className="form__err">{errors.firstName}</div>}
          </label>

          <label className="form__col-6">
            <span className="form__label">
              Last Name <span className="form__req">*</span>
            </span>
            <input
              className={`form__input${errors.lastName ? " form__input--err" : ""}`}
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Last Name"
            />
            {errors.lastName && <div className="form__err">{errors.lastName}</div>}
          </label>

          <label className="form__col-6">
            <span className="form__label">Employee ID</span>
            <input
              className="form__input"
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              placeholder="Employee ID"
            />
          </label>

          <label className="form__col-6">
            <span className="form__label">
              Email <span className="form__req">*</span>
            </span>
            <input
              type="email"
              className={`form__input${errors.email ? " form__input--err" : ""}`}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Email"
            />
            {errors.email && <div className="form__err">{errors.email}</div>}
          </label>

          <label className="form__col-6">
            <span className="form__label">Contact No.</span>
            <input
              className="form__input"
              value={form.contactNo}
              onChange={(e) => set("contactNo", e.target.value)}
              placeholder="Contact No."
            />
          </label>
        </div>
      </div>

      {/* Organization selections */}
      <div className="form__section">
        <div className="form__grid">
          <label className="form__col-6">
            <span className="form__label">
              Role <span className="form__req">*</span>
            </span>
            <select
              className={`form__input${errors.roleId ? " form__input--err" : ""}`}
              value={form.roleId}
              onChange={(e) => set("roleId", e.target.value)}
            >
              <option value="">Select</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.roleId && <div className="form__err">{errors.roleId}</div>}
          </label>

          <label className="form__col-6">
            <span className="form__label">Reporting Manager</span>
            <select
              className="form__input"
              value={form.managerId}
              onChange={(e) => set("managerId", e.target.value)}
            >
              <option value="">Select</option>
              {Reporters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form__col-6">
            <span className="form__label">Department</span>
            <select
              className="form__input"
              value={form.departmentId}
              onChange={(e) => set("departmentId", e.target.value)}
            >
              <option value="">Select</option>
              {Departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form__col-6">
            <span className="form__label">
              Location <span className="form__req">*</span>
            </span>
            <select
              className={`form__input${errors.locationId ? " form__input--err" : ""}`}
              value={form.locationId}
              onChange={(e) => set("locationId", e.target.value)}
            >
              <option value="">Select</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            {errors.locationId && <div className="form__err">{errors.locationId}</div>}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="form__actions form__actions--start">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/masters/users")}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
