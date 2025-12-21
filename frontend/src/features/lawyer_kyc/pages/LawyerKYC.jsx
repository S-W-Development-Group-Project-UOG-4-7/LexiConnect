import { useState } from "react";

function LawyerKYC() {
  const [kycStatus, setKycStatus] = useState("not_submitted");
  const [form, setForm] = useState({
    fullName: "",
    nic: "",
    barId: "",
    address: "",
    contact: "",
    fileName: "",
  });

  const isPending = kycStatus === "pending";
  const isApproved = kycStatus === "approved";
  const isRejected = kycStatus === "rejected";

  const statusText = {
    not_submitted: "Please submit your KYC documents to become a verified lawyer.",
    pending: "Your KYC is under review.",
    approved: "Your KYC has been approved.",
    rejected: "Your KYC was rejected. Please resubmit.",
  }[kycStatus];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, fileName: file ? file.name : "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setKycStatus("pending");
  };

  const handleResubmit = () => {
    setKycStatus("not_submitted");
  };

  const bannerClasses = {
    not_submitted: "bg-slate-100 border border-slate-200 text-slate-700",
    pending: "bg-blue-50 border border-blue-200 text-blue-700",
    approved: "bg-green-50 border border-green-200 text-green-700",
    rejected: "bg-red-50 border border-red-200 text-red-700",
  }[kycStatus];

  return (
    <div className="min-h-screen bg-[#1e1f23] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className={`rounded-md px-4 py-3 ${bannerClasses}`}>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-current" />
            <div>
              <div className="text-sm font-semibold">Status</div>
              <p className="text-sm mt-1">{statusText}</p>
            </div>
          </div>
        </div>

        {!isApproved && (
          <div className="bg-white rounded-md shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-800">
                Submit KYC Documents
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {isRejected && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm">
                  Your KYC was rejected. Please review and resubmit your details.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-600">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full rounded-sm border border-slate-300 bg-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="Your full legal name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-600">
                    NIC Number
                  </label>
                  <input
                    name="nic"
                    value={form.nic}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full rounded-sm border border-slate-300 bg-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="e.g., 199512345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-600">
                    Bar Council ID
                  </label>
                  <input
                    name="barId"
                    value={form.barId}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full rounded-sm border border-slate-300 bg-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="e.g., BAR2026001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-600">
                    Contact Number
                  </label>
                  <input
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full rounded-sm border border-slate-300 bg-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="e.g., 0771234567"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-slate-600">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={isPending}
                  rows={3}
                  className="w-full rounded-sm border border-slate-300 bg-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  placeholder="Your complete address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-600">
                  Bar Council Certificate
                </label>
                <div className="border border-dashed border-slate-300 rounded-md bg-slate-50 px-4 py-6 text-center">
                  <div className="text-slate-500 text-sm mb-2">
                    Upload your Bar Council certificate
                  </div>
                  <label className="inline-flex items-center justify-center rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 transition">
                    Select File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isPending}
                    />
                  </label>
                  <div className="text-xs text-slate-500 mt-2">
                    Accepted formats: PDF, JPG, PNG
                  </div>
                  {form.fileName && (
                    <div className="text-sm text-slate-700 mt-2">
                      Selected: {form.fileName}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-sm bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  Submit for Verification
                </button>
                {isRejected && (
                  <button
                    type="button"
                    onClick={handleResubmit}
                    className="whitespace-nowrap rounded-sm border border-slate-300 bg-white text-slate-700 text-sm font-medium px-3 py-2 hover:bg-slate-100 transition"
                  >
                    Start Over
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {isApproved && (
          <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 text-center space-y-2">
            <div className="text-green-600 text-lg font-semibold">
              KYC Approved
            </div>
            <p className="text-slate-600 text-sm">
              Your KYC has been approved. No further action is required.
            </p>
          </div>
        )}

        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Required Documents
          </h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>Valid National Identity Card (NIC)</li>
            <li>Bar Council Registration Certificate</li>
            <li>Proof of address (utility bill, bank statement, etc.)</li>
            <li>Professional photograph</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LawyerKYC;