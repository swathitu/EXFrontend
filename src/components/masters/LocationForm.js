import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createLocation, updateLocation, getLocation,getprimarycontact } from "../../api/locations";
import "../styles/Form.css";

// Internal constants
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

const EMPTY = {
  name: "", street1: "", street2: "", city: "", state: "", zip: "",
  phone: "", fax: "", website: "", gstin: "", primaryContact: ""
};

export default function LocationForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [primaryContact, setPrimaryContact] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));


  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Location Name is required";
    return e;
  };

  useEffect(() => {
   
    (async () => {
       const primarycontact = await getprimarycontact();
       setPrimaryContact(Array.isArray(primarycontact?.data) ? primarycontact.data : []);
      if (!id) {
        setForm(EMPTY)
        return setLoading(false);
      }
      try {
        const loc = await getLocation(id);
        setForm({
          name: loc.Location_Name || "",
          street1: loc.Street1 || "",
          street2: loc.Street2 || "",
          city: loc.City || "",
          state: loc.State || "",
          zip: loc.Zip_Code || "",
          phone: loc.Phone || "",
          fax: loc.Fax || "",
          website: loc.Website || "",
          gstin: loc.GSTIN || "",
          primaryContact: loc.Primary_Contact || ""
        });
      } catch (e) {
        setError(e.message || "Failed to load location");
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
      ROWID: id || undefined,
      name: form.name,
      address: {
        street1: form.street1 || "",
        street2: form.street2 || "",
        city: form.city || "",
        state: form.state || "",
        zip: form.zip || ""
      },
      phone: form.phone || "",
      fax: form.fax || "",
      website: form.website || "",
      gstin: form.gstin || "",
      primary_contact_id: form.primaryContact || null
    };

    try {
      setSaving(true);
      const result = id ? await updateLocation(payload) : await createLocation(payload);
      navigate("/masters/location");
    } catch (err) {
      alert(err?.message || "Failed to save location");
      console.error("Save location failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading location form...</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;

  return (
    <form onSubmit={submit} className="form">
      <div className="form__header">
        <h1 className="page-title">{id ? "Edit Location" : "New Location"}</h1>
        <button type="button" className="form__close" onClick={() => navigate("/masters/location")} aria-label="Close">×</button>
      </div>
      <div className="page-rule" />

      {/* Location Name */}
      <div className="form__section form__section--top">
        <div className="form__grid">
          <label className="form__col-12">
            <span className="form__label">Location Name <span className="form__req">*</span></span>
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

      {/* Address */}
      <div className="form__section">
        <div className="form__subtitle">Company Address</div>
        <div className="form__grid">
          <label className="form__col-12">
            <span className="form__label">Street 1</span>
            <input className="form__input" value={form.street1} onChange={(e) => set("street1", e.target.value)} placeholder="Street" />
          </label>
          <label className="form__col-6">
            <span className="form__label">Street 2</span>
            <input className="form__input" value={form.street2} onChange={(e) => set("street2", e.target.value)} placeholder="Street" />
          </label>
          <label className="form__col-6">
            <span className="form__label">City</span>
            <input className="form__input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
          </label>
          <label className="form__col-6">
            <span className="form__label">State</span>
            <select className="form__input" value={form.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Select</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="form__col-6">
            <span className="form__label">Zip Code</span>
            <input className="form__input" value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="Zip Code" />
          </label>
        </div>
      </div>

      {/* Other Details */}
      <div className="form__section">
        <div className="form__subtitle">Other Details</div>
        <div className="form__grid">
          <label className="form__col-6">
            <span className="form__label">Phone</span>
            <input className="form__input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" />
          </label>
          <label className="form__col-6">
            <span className="form__label">Fax</span>
            <input className="form__input" value={form.fax} onChange={(e) => set("fax", e.target.value)} placeholder="Fax" />
          </label>
          <label className="form__col-12">
            <span className="form__label">Website</span>
            <input className="form__input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="Website" />
          </label>
        </div>
      </div>

      {/* GSTIN and Primary Contact */}
      <div className="form__section">
        <div className="form__grid">
          <label className="form__col-12">
            <span className="form__label">GSTIN</span>
            <input className="form__input" value={form.gstin} onChange={(e) => set("gstin", e.target.value)} placeholder="GSTIN" />
          </label>
          <label className="form__col-12">
            <span className="form__label">Primary Contact</span>
            <select className="form__input" value={form.primaryContact} onChange={(e) => set("primaryContact", e.target.value)}>
              <option value="">Select</option>
              {primaryContact.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="form__actions form__actions--end">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="btn" onClick={() => navigate("/masters/location")} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
