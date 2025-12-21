import { useState } from "react";

const LawyerKYC = () => {
  const [form, setForm] = useState({
    fullName: "",
    nic: "",
    barId: "",
    certificate: null,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Lawyer KYC Verification
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit your details to verify your lawyer account.
        </p>
      </div>

      {/* Status banner */}
      {submitted && (
        <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800 font-medium">
            ⏳ KYC Submitted – Pending Admin Approval
          </p>
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* NIC */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              NIC Number
            </label>
            <input
              type="text"
              name="nic"
              value={form.nic}
              onChange={handleChange}
              required
              placeholder="Ex: 200012345678"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Bar ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bar Association ID
            </label>
            <input
              type="text"
              name="barId"
              value={form.barId}
              onChange={handleChange}
              required
              placeholder="Enter your Bar ID"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Certificate upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Certificate
            </label>
            <input
              type="file"
              name="certificate"
              onChange={handleChange}
              className="mt-1 w-full text-sm text-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">
              Accepted formats: PDF, JPG, PNG
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-2 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Submit KYC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LawyerKYC;
