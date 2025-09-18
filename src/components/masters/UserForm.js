// src/components/masters/UserForm.js

import React, { useState } from "react";

import "../styles/Form.css";
 
const EMPTY = {

  firstName: "",

  lastName: "",

  employeeId: "",

  email: "",

  contactNo: "",

  roleId: "",

  managerId: "",

  departmentId: "",

  locationId: "",

};
 
export default function UserForm({

  onSave,

  onCancel,

  roles = [],        // [{id, name}]

  managers = [],     // [{id, name}] (Reporting Manager)

  departments = [],  // [{id, name}]

  locations = [],    // [{id, name}]

}) {

  const [form, setForm] = useState(EMPTY);

  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
 
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

      onSave?.(payload); // your route can navigate after save

    } finally {

      setSaving(false);

    }

  };
 
  return (
<form onSubmit={submit} className="form">

      {/* Header */}
<div className="form__header">
<h1 className="page-title">New User</h1>
<button

          type="button"

          className="form__close"

          onClick={onCancel}

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
 
      {/* Organization selections (only the fields you asked for) */}
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
<option key={r.id || r} value={r.id || r}>

                  {r.name || r}
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

              {managers.map((u) => (
<option key={u.id || u} value={u.id || u}>

                  {u.name || u}
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

              {departments.map((d) => (
<option key={d.id || d} value={d.id || d}>

                  {d.name || d}
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
<option key={l.id || l} value={l.id || l}>

                  {l.name || l}
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
<button type="button" className="btn" onClick={onCancel} disabled={saving}>

          Cancel
</button>
</div>
</form>

  );

}

 