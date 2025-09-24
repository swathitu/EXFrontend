// src/components/masters/DepartmentForm.js

import React, { useState, useMemo } from "react";

import "../styles/Form.css";
import { createDepartment, updateDepartment } from "../../api/departments";
 
const EMPTY = { rowid: "", name: "", code: "", headId: "", description: "" };
 
export default function DepartmentForm({ mode = "create", initial, onSave, onCancel, users = [] }) {

  const [form, setForm] = useState(EMPTY);

  

  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
 
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
 
  const remaining = useMemo(

    () => 250 - (form.description?.length || 0),

    [form.description]

  );
 
  const validate = () => {

    const e = {};

    if (!form.name.trim()) e.name = "Department Name is required";

    if ((form.description || "").length > 250)

      e.description = "Description must be 250 characters or less";

    return e;

  };

  React.useEffect(() => {
    if (initial) {
      setForm({
        rowid:       initial.ROWID || "",
        name:        initial.Department_Name || "",
        code:        initial.Department_Code || "",
        headId:      initial.Department_Head || "",
        description: initial.Description || "",
      });
    }
  }, [initial]);
 
  const submit = async (e) => {

    e.preventDefault();
    console.log("[DepartmentForm] Save clicked. Current form =", form);
    alert("Save clicked — check console for logs.");
    const eobj = validate();

    setErrors(eobj);

    if (Object.keys(eobj).length) return;
 
    try {

      setSaving(true);

      const payload = {
        ROWID: form.rowid || undefined,
       department_name: form.name.trim(),
      department_code: form.code.trim(),
       department_head_id: form.headId || null,
      description: form.description?.trim() || "",
     };
     console.log("[DepartmentForm] Submitting payload to API:", payload);
        const res = form.rowid ? await updateDepartment(payload) : await createDepartment(payload)
      // if you wire an API, call it here and pass result to onSave
      console.log("[DepartmentForm] API response:", res);
      onSave?.(res);

    }
    catch (err) {
     console.error("[DepartmentForm] API error:", err);
     alert(`Failed to save department: ${err?.message || "Unknown error"}`);
    } finally {

      setSaving(false);

    }

  };
 
  return (
<div className="modal">
<div className="modal__backdrop" onClick={onCancel} />
<div className="modal__card" role="dialog" aria-modal="true" aria-label="New Department">
<div className="modal__header">
<h2 className="modal__title">{form.rowid ? "Edit Department" : "New Department"}</h2>
<button className="form__close" aria-label="Close" onClick={onCancel}>×</button>
</div>
 
        <form onSubmit={submit} className="modal__body">
<div className="form__grid">
<label className="form__col-6">
<span className="form__label">Department Name <span className="form__req">*</span></span>
<input

                className={`form__input${errors.name ? " form__input--err" : ""}`}

                value={form.name}

                onChange={(e) => set("name", e.target.value)}

                placeholder="Department Name"

              />

              {errors.name && <div className="form__err">{errors.name}</div>}
</label>
 
            <label className="form__col-6">
<span className="form__label">Department Code</span>
<input

                className="form__input"

                value={form.code}

                onChange={(e) => set("code", e.target.value)}

                placeholder="Department Code"

              />
</label>
 
            <label className="form__col-12">
<span className="form__label">

                Department Head <span title="Optional">ℹ️</span>
</span>
<select

                className="form__input"

                value={form.headId}

                onChange={(e) => set("headId", e.target.value)}
>
<option value="">Select</option>

                {users.map((u) => (
<option key={u.id || u} value={u.id || u}>

                    {u.name || u}
</option>

                ))}
</select>
</label>
 
            <label className="form__col-12">
<span className="form__label">Description</span>
<textarea

                className={`form__input form__input--textarea${errors.description ? " form__input--err" : ""}`}

                value={form.description}

                onChange={(e) => set("description", e.target.value)}

                placeholder="Max 250 characters"

                rows={3}

                maxLength={250}

              />
<div className="form__help">

                {remaining} characters left
</div>

              {errors.description && <div className="form__err">{errors.description}</div>}
</label>
</div>
 
          <div className="form__actions form__actions--start">
<button type="submit" className="btn btn--primary" disabled={saving}>

              {saving ? "Saving..." : "Save"}
</button>
<button type="button" className="btn" onClick={onCancel} disabled={saving}>

              Cancel
</button>
</div>
</form>
</div>
</div>

  );

}

 