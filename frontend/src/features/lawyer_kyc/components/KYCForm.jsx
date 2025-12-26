import { useEffect, useState } from "react";
import { submitKyc, getMyKyc } from "../services/lawyerKyc.service";

function KYCForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    nic_number: "",
    bar_council_id: "",
    address: "",
    contact_number: "",
    bar_certificate_url: "",
  });

  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing KYC
  useEffect(() => {
    getMyKyc()
      .then((res) => setKycStatus(res.data.status))
      .catch(() => setKycStatus("not_submitted"))
      .finally(() => setLoading(false));
  }, []);
  
  // Handle text input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection (OPTION 1)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TEMP: save file name only
      setFormData({
        ...formData,
        bar_certificate_url: file.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitKyc(formData);
    setKycStatus("pending");
  };
  

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>KYC Form</h1>

      <p>
        <b>KYC Status:</b> {kycStatus}
      </p>

      {/* Disable form if already pending or approved */}
      {(kycStatus === "pending" || kycStatus === "approved") && (
        <p>Your KYC is under review or approved.</p>
      )}

      {kycStatus === "rejected" || kycStatus === "not_submitted" ? (
        <form onSubmit={handleSubmit}>
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />
          <br />

          <input
            name="nic_number"
            placeholder="NIC Number"
            onChange={handleChange}
            required
          />
          <br />

          <input
            name="bar_council_id"
            placeholder="Bar Council ID"
            onChange={handleChange}
            required
          />
          <br />

          <input
            name="address"
            placeholder="Address"
            onChange={handleChange}
            required
          />
          <br />

          <input
            name="contact_number"
            placeholder="Contact Number"
            onChange={handleChange}
            required
          />
          <br />

          <label>Bar Council Certificate</label>
          <br />
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={handleFileChange}
            required
          />
          <br /><br />

          <button type="submit">Submit KYC</button>
        </form>
      ) : null}
    </div>
  );
}

export default KYCForm;
