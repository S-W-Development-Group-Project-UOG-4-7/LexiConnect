import { useState, useEffect } from "react";
import { submitKyc, getMyKyc } from "../services/lawyerKyc.service";

function LawyerKYC() {
  const [kycStatus, setKycStatus] = useState("not_submitted");

  const [form, setForm] = useState({
    full_name: "",
    nic_number: "",
    bar_council_id: "",
    address: "",
    contact_number: "",
    bar_certificate_url: "",
  });

  useEffect(() => {
    const fetchMyKyc = async () => {
      try {
        const res = await getMyKyc();
        if (res?.data?.status) setKycStatus(res.data.status);
      } catch {
        setKycStatus("not_submitted");
      }
    };
    fetchMyKyc();
  }, []);

  const isPending = kycStatus === "pending";
  const isApproved = kycStatus === "approved";
  const isRejected = kycStatus === "rejected";

  const statusText = {
    not_submitted: "Please submit your KYC documents to become a verified lawyer.",
    pending: "Your KYC is under review.",
    approved: "Your KYC has been approved.",
    rejected: "Your KYC was rejected. Please resubmit.",
  }[kycStatus];

  const bannerClasses = {
    not_submitted: "bg-slate-100 border border-slate-200 text-slate-700",
    pending: "bg-blue-50 border border-blue-200 text-blue-700",
    approved: "bg-green-50 border border-green-200 text-green-700",
    rejected: "bg-red-50 border border-red-200 text-red-700",
  }[kycStatus];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitKyc(form);
      setKycStatus("pending");
    } catch (err) {
      alert("Failed to submit KYC");
      console.error(err);
    }
  };

  const handleResubmit = () => setKycStatus("not_submitted");

  return (
    <div className="min-h-screen bg-[#1e1f23] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* STATUS */}
        <div className={`rounded-md px-4 py-3 ${bannerClasses}`}>
          <div className="flex gap-2">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-current" />
            <div>
              <div className="text-sm font-semibold">Status</div>
              <p className="text-sm mt-1">{statusText}</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        {!isApproved && (
          <div className="bg-white rounded-md border shadow-sm">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold text-slate-800">
                Submit KYC Documents
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {isRejected && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  Your KYC was rejected. Please review and resubmit.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} disabled={isPending} />
                <Input label="NIC Number" name="nic_number" value={form.nic_number} onChange={handleChange} disabled={isPending} />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input label="Bar Council ID" name="bar_council_id" value={form.bar_council_id} onChange={handleChange} disabled={isPending} />
                <Input label="Contact Number" name="contact_number" value={form.contact_number} onChange={handleChange} disabled={isPending} />
              </div>

              <div>
                <label className="text-xs uppercase text-slate-600">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={isPending}
                  rows={3}
                  className="w-full border rounded bg-slate-100 px-3 py-2 text-sm"
                />
              </div>

              {/* URL INPUT (REPLACES FILE UPLOAD) */}
              <div>
                <label className="text-xs uppercase text-slate-600">
                  Bar Council Certificate URL
                </label>
                <div className="border-dashed border rounded bg-slate-50 px-4 py-6">
                  <input
                    name="bar_certificate_url"
                    value={form.bar_certificate_url}
                    onChange={handleChange}
                    disabled={isPending}
                    placeholder="https://drive.google.com/..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Upload the certificate to Google Drive / Cloudinary and paste the link here
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded disabled:opacity-60"
                >
                  Submit for Verification
                </button>

                {isRejected && (
                  <button
                    type="button"
                    onClick={handleResubmit}
                    className="border bg-white px-3 py-2 rounded text-black"
                  >
                    Start Over
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs uppercase text-slate-600">{label}</label>
      <input
        {...props}
        className="w-full border rounded bg-slate-100 px-3 py-2 text-sm"
      />
    </div>
  );
}

export default LawyerKYC;
