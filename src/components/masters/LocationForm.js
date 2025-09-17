// src/components/masters/LocationForm.js

import React, { useState } from "react";

import "../styles/Form.css"; // ✅ only this css import
 
const EMPTY = {

  name: "",

  street1: "",

  street2: "",

  city: "",

  state: "",

  zip: "",

  phone: "",

  fax: "",

  website: "",

  gstin: "",

  admins: "",

  primaryContact: "",

};
 
export default function LocationForm({

  onSave,

  onCancel,

  gstins = [],

  admins = [],

  contacts = [],

  states = [],

}) {

  const [form, setForm] = useState(EMPTY);

  const [errors, setErrors] = useState({});
 
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
 
  const validate = () => {

    const e = {};

    if (!form.name.trim()) e.name = "Location Name is required";

    return e;

  };
 
const submit = (e) => {
  e.preventDefault();
  console.log("Submit clicked");

  const eobj = validate();
  setErrors(eobj);
  if (Object.keys(eobj).length) return;

  console.log("Calling onSave with:", form); // ✅ Add this
  onSave?.(form);
};

 
  return (
<form onSubmit={submit} className="form">

      {/* New Location */}
<div className="form__section">
<div className="form__grid">
<label className="form__col-12">
<span className="form__label">

              Location Name <span className="form__req">*</span>
</span>
<input

              className={`form__input${errors.name ? " form__input--err" : ""}`}

              value={form.name}

              onChange={(e) => set("name", e.target.value)}

              placeholder="Location Name"

            />

            {errors.name && <div className="form__err">{errors.name}</div>}
</label>
</div>
</div>
 
      {/* Company Address */}
{/* Company Address */}
<div className="form__section">
  <div className="form__subtitle">Company Address</div>
  <div className="form__grid">
    <label className="form__col-12">
      <span className="form__label">Street 1</span>
      <input
        className="form__input"
        value={form.street1}
        onChange={(e) => set("street1", e.target.value)}
        placeholder="Street"
      />
    </label>

    <label className="form__col-6">
      <span className="form__label">Street 2</span>
      <input
        className="form__input"
        value={form.street2}
        onChange={(e) => set("street2", e.target.value)}
        placeholder="Street"
      />
    </label>

    <label className="form__col-6">
      <span className="form__label">City</span>
      <input
        className="form__input"
        value={form.city}
        onChange={(e) => set("city", e.target.value)}
        placeholder="City"
      />
    </label>

    <label className="form__col-6">
      <span className="form__label">State</span>
      <select
        className="form__input"
        value={form.state}
        onChange={(e) => set("state", e.target.value)}
      >
        <option value="">Select</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </label>

    <label className="form__col-6">
      <span className="form__label">Zip Code</span>
      <input
        className="form__input"
        value={form.zip}
        onChange={(e) => set("zip", e.target.value)}
        placeholder="Zip Code"
      />
    </label>
  </div>
</div>

 
      {/* Other Details */}
<div className="form__section">
<div className="form__subtitle">Other Details</div>
<div className="form__grid">
<label className="form__col-6">
<span className="form__label">Phone</span>
<input

              className="form__input"

              value={form.phone}

              onChange={(e) => set("phone", e.target.value)}

              placeholder="Phone"

            />
</label>
<label className="form__col-6">
<span className="form__label">Fax</span>
<input

              className="form__input"

              value={form.fax}

              onChange={(e) => set("fax", e.target.value)}

              placeholder="Fax"

            />
</label>
<label className="form__col-12">
<span className="form__label">Website</span>
<input

              className="form__input"

              value={form.website}

              onChange={(e) => set("website", e.target.value)}

              placeholder="Website"

            />
</label>
</div>
</div>
 
    {/* GSTIN / Primary Contact */}
<div className="form__section">
  <div className="form__grid">
    <label className="form__col-12">
      <span className="form__label">GSTIN</span>
      <input
        className="form__input"
        value={form.gstin}
        onChange={(e) => set("gstin", e.target.value)}
        placeholder="GSTIN"
      />
    </label>

    <label className="form__col-12">
      <span className="form__label">Primary Contact</span>
      <select
        className="form__input"
        value={form.primaryContact}
        onChange={(e) => set("primaryContact", e.target.value)}
      >
        <option value="">Select</option>
        {contacts.map((u) => (
          <option key={u.id || u} value={u.id || u}>
            {u.name || u}
          </option>
        ))}
      </select>
    </label>
  </div>
</div>


 
      {/* Actions */}
<div className="form__actions">
<button type="submit" className="btn btn--primary">Save</button>
<button type="button" className="btn" onClick={onCancel}>Cancel</button>
</div>
</form>

  );

}

 