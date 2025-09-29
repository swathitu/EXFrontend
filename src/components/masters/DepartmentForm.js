// src/components/masters/DepartmentForm.js

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Form.css";
import {
  createDepartment,
  updateDepartment,
  getDepartment,
  listDeptHeads,
} from "../../api/departments";

const EMPTY = { rowid: "", name: "", code: "", headId: "", description: "" };

export default function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("[DepartmentForm] ID from URL params:", id);
  const [form, setForm] = useState(EMPTY);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    (async () => {
      try {
        const headsResp = await listDeptHeads();
        setUsers(Array.isArray(headsResp?.data) ? headsResp.data : []);

        if (id) {
         
          const deptRow = await getDepartment(id);
         
          if (deptRow) {
            
            setForm({
              rowid: deptRow.ROWID || "",
              name: deptRow.Department_Name || "",
              code: deptRow.Department_Code || "",
              headId: deptRow.Department_Head || "",
              description: deptRow.Description || "",
            });
          }
        }
      } catch (e) {
        setError(e.message || "Failed to load department data");
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

    try {
      setSaving(true);
      const payload = {
        ROWID: form.rowid || undefined,
        department_name: form.name.trim(),
        department_code: form.code.trim(),
        department_head_id: form.headId || null,
        description: form.description?.trim() || "",
      };
      const res = form.rowid
        ? await updateDepartment(payload)
        : await createDepartment(payload);
      navigate("/masters/department");
    } catch (err) {
      alert(`Failed to save department: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading department form...</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={() => navigate("/masters/department")} />
      <div className="modal__card" role="dialog" aria-modal="true" aria-label="New Department">
        <div className="modal__header">
          <h2 className="modal__title">{form.rowid ? "Edit Department" : "New Department"}</h2>
          <button className="form__close" aria-label="Close" onClick={() => navigate("/masters/department")}>×</button>
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
              <span className="form__label">Department Head <span title="Optional">ℹ️</span></span>
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
              <div className="form__help">{remaining} characters left</div>
              {errors.description && <div className="form__err">{errors.description}</div>}
            </label>
          </div>

          <div className="form__actions form__actions--start">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn" onClick={() => navigate("/masters/department")} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
