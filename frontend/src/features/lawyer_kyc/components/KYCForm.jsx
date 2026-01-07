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

  useEffect(() => {
    getMyKyc()
      .then((res) => setKycStatus(res.data.status))
      .catch(() => setKycStatus("not_submitted"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  if (loading) return <p className="text-white">Loading...</p>;

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-white space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">KYC Form</h1>
        <div className="text-sm">
          <span className="text-slate-300">KYC Status:</span>{" "}
          <span className="font-semibold text-white">{kycStatus}</span>
        </div>
      </div>

      {(kycStatus === "pending" || kycStatus === "approved") && (
        <p className="text-slate-200">Your KYC is under review or approved.</p>
      )}

      {kycStatus === "rejected" || kycStatus === "not_submitted" ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className={inputClasses}
          />

          <input
            name="nic_number"
            placeholder="NIC Number"
            onChange={handleChange}
            required
            className={inputClasses}
          />

          <input
            name="bar_council_id"
            placeholder="Bar Council ID"
            onChange={handleChange}
            required
            className={inputClasses}
          />

          <input
            name="address"
            placeholder="Address"
            onChange={handleChange}
            required
            className={inputClasses}
          />

          <input
            name="contact_number"
            placeholder="Contact Number"
            onChange={handleChange}
            required
            className={inputClasses}
          />

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Bar Council Certificate</label>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-white file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-600 file:text-white hover:file:bg-amber-700"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-semibold transition-colors"
          >
            Submit KYC
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default KYCForm;
