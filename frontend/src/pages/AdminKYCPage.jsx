import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AdminKYCPage() {
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch pending KYC data on component mount
  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Using the endpoint path as specified by user
      // Note: If /api/v1/admin/kyc/pending doesn't exist, use /kyc/pending instead
      const res = await axios.get(`${API_BASE}/kyc/pending`);
      setKycData(res.data || []);
    } catch (err) {
      console.error("Failed to load pending KYC", err);
      setError("Could not load pending KYC applications");
      // Fallback to empty array on error
      setKycData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (lawyerId) => {
    setError("");
    setSuccess("");
    try {
      // Using the endpoint path as specified by user
      // Note: If /api/v1/admin/kyc/{lawyer_id}/approve doesn't exist, use /kyc/{lawyer_id}/approve instead
      await axios.post(`${API_BASE}/kyc/${lawyerId}/approve`);
      setSuccess(`KYC for lawyer ID ${lawyerId} has been approved successfully`);
      // Refresh the table data
      await fetchPendingKYC();
    } catch (err) {
      console.error("Failed to approve KYC", err);
      setError(err.response?.data?.detail || "Failed to approve KYC application");
    }
  };

  const handleReject = async (lawyerId) => {
    setError("");
    setSuccess("");
    try {
      // Using the endpoint path as specified by user
      // Note: If /api/v1/admin/kyc/{lawyer_id}/reject doesn't exist, use /kyc/{lawyer_id}/reject instead
      await axios.post(`${API_BASE}/kyc/${lawyerId}/reject`);
      setSuccess(`KYC for lawyer ID ${lawyerId} has been rejected`);
      // Refresh the table data
      await fetchPendingKYC();
    } catch (err) {
      console.error("Failed to reject KYC", err);
      setError(err.response?.data?.detail || "Failed to reject KYC application");
    }
  };

  // Helper function to get lawyer name from KYC data
  // Since the API returns user_id, we'll display it as Lawyer ID
  const getLawyerDisplayName = (kyc) => {
    return `Lawyer ID: ${kyc.user_id}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
        }}></div>
      </div>

      <AdminHeader />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard - Lawyer Verification</h1>
          <p className="text-gray-400">Review and manage lawyer KYC applications</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-200">
            {success}
          </div>
        )}

        {/* Stats Card */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Pending Verifications</h2>
              <p className="text-gray-400">Review lawyer applications awaiting approval</p>
            </div>
            <div className="text-4xl font-bold text-yellow-400">
              {loading ? "..." : kycData.length}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-gray-400">Loading pending applications...</p>
          </div>
        )}

        {/* Responsive Table */}
        {!loading && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Lawyer Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Bar ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody className="divide-y divide-gray-700">
                  {kycData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                        <div className="text-4xl mb-2">✓</div>
                        <p>No pending KYC applications found.</p>
                      </td>
                    </tr>
                  ) : (
                    kycData.map((kyc) => (
                      <tr
                        key={kyc.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        {/* Lawyer Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                              👨‍💼
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {getLawyerDisplayName(kyc)}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                NIC: {kyc.nic_number}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Bar ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300 font-mono">
                            {kyc.bar_association_id}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {kyc.status === "Pending" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/50 border border-yellow-600 text-yellow-300">
                              🕐 Pending
                            </span>
                          ) : kyc.status === "Approved" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 border border-green-600 text-green-300">
                              ✓ Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 border border-red-600 text-red-300">
                              ✕ Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(kyc.user_id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                              disabled={kyc.status === "Approved" || kyc.status === "Rejected"}
                            >
                              <span>✓</span>
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(kyc.user_id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                              disabled={kyc.status === "Approved" || kyc.status === "Rejected"}
                            >
                              <span>✕</span>
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


