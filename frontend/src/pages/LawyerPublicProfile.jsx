import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/ui/PageShell";
import EmptyState from "../components/ui/EmptyState";
import useRequireAuth from "../hooks/useRequireAuth";
import LoginRequiredModal from "../components/ui/LoginRequiredModal";

const formatNumber = (value) => {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(Number(value))) return "—";
  return String(value);
};

const formatRating = (value) => {
  if (value === null || value === undefined) return "0.0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0.0";
  return num.toFixed(1);
};

const formatLocation = (city, district) => {
  const parts = [city, district].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location not set";
};

const getInitials = (name) => {
  if (!name) return "LC";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function LawyerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth, modalOpen, closeModal } = useRequireAuth();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/lawyers/${id}/profile`);
        setLawyer(res.data);
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Lawyer not found.";
        setError(message);
        setLawyer(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const languages = useMemo(() => {
    if (!lawyer || !Array.isArray(lawyer.languages)) return [];
    return lawyer.languages.filter(Boolean);
  }, [lawyer]);

  const admissions = useMemo(() => {
    if (!lawyer || !Array.isArray(lawyer.court_admissions)) return [];
    return lawyer.court_admissions.filter(Boolean);
  }, [lawyer]);

  if (loading) {
    return (
      <PageShell title="Lawyer Profile" subtitle="Loading profile...">
        <div className="text-slate-300">Loading...</div>
      </PageShell>
    );
  }

  if (!lawyer || error) {
    return (
      <PageShell title="Lawyer Profile">
        <EmptyState
          title="Lawyer not found"
          description={error || "We couldn't find this lawyer profile."}
          buttonLabel="Back to search"
          buttonLink="/client/search"
        />
      </PageShell>
    );
  }

  return (
    <>
      <PageShell
        title={lawyer.name || "Lawyer"}
        subtitle="Public profile"
        contentClassName="space-y-6 max-w-6xl"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)] space-y-4">
              <div className="flex items-center justify-between">
                <Link to="/client/search" className="text-sm text-amber-200 hover:text-amber-100">
                  ← Back to search
                </Link>
                <button
                  onClick={() => requireAuth(() => navigate(`/client/booking/${lawyer.id}`))}
                  className="hidden md:inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-colors"
                >
                  Book Appointment
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-semibold text-amber-200 overflow-hidden">
                  {lawyer.profile_photo_url ? (
                    <img
                      src={lawyer.profile_photo_url}
                      alt={lawyer.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(lawyer.name)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{lawyer.name || "Lawyer"}</h1>
                    {lawyer.verified && (
                      <span className="text-xs uppercase tracking-wide text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {lawyer.specialization || "General Practice"}
                  </div>
                  <div className="text-sm text-amber-200 mt-3">
                    {formatRating(lawyer.rating)} · {formatNumber(lawyer.review_count)} reviews
                  </div>
                </div>
                <button
                  onClick={() => requireAuth(() => navigate(`/client/booking/${lawyer.id}`))}
                  className="md:hidden px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Experience</div>
                <div className="text-xl font-semibold text-white mt-2">
                  {lawyer.experience_years != null
                    ? `${lawyer.experience_years} years`
                    : "—"}
                </div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Cases Handled</div>
                <div className="text-xl font-semibold text-white mt-2">
                  {formatNumber(lawyer.cases_handled)}
                </div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Avg Response Time
                </div>
                <div className="text-xl font-semibold text-white mt-2">
                  {lawyer.response_time_hours != null
                    ? `${lawyer.response_time_hours} hours`
                    : "—"}
                </div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Location</div>
                <div className="text-sm text-slate-200 mt-2">
                  {formatLocation(lawyer.city, lawyer.district)}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <div className="text-lg font-semibold text-white mb-2">About</div>
                <div className="text-sm text-slate-300 leading-relaxed">
                  {lawyer.bio || "No bio provided yet."}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Education</div>
                  <div className="text-sm text-slate-200 mt-2">
                    {lawyer.education || "Not specified"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Languages</div>
                  <div className="text-sm text-slate-200 mt-2">
                    {languages.length ? languages.join(", ") : "Not specified"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Court Admissions</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {admissions.length ? (
                    admissions.map((admission) => (
                      <span
                        key={admission}
                        className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200"
                      >
                        {admission}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Not specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">Service Packages</div>
                  <div className="text-sm text-slate-400">
                    Select a package to continue booking.
                  </div>
                </div>
              </div>

              {lawyer.service_packages && lawyer.service_packages.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lawyer.service_packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="border border-slate-800 rounded-2xl p-4 bg-slate-900"
                    >
                      <div className="text-lg font-semibold text-white">{pkg.name}</div>
                      <div className="text-sm text-slate-400 mt-1">
                        {pkg.description || "No description provided."}
                      </div>
                      <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
                        <span>LKR {Number(pkg.price).toFixed(0)}</span>
                        <span>{pkg.duration ? `${pkg.duration} mins` : "Flexible"}</span>
                      </div>
                      <button
                        onClick={() =>
                          requireAuth(() =>
                            navigate(`/client/booking/${lawyer.id}?packageId=${pkg.id}`)
                          )
                        }
                        className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white"
                      >
                        Select package
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">No packages listed yet.</div>
              )}
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="text-lg font-semibold text-white">Reviews</div>
              {lawyer.recent_reviews && lawyer.recent_reviews.length ? (
                <div className="space-y-3">
                  {lawyer.recent_reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-slate-800 rounded-2xl p-4 bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">
                          {review.client_name || "Client"}
                        </div>
                        <div className="text-sm text-amber-200">
                          {formatRating(review.rating)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{review.created_at}</div>
                      <div className="text-sm text-slate-300 mt-2">
                        {review.comment || "No comments provided."}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">No reviews yet.</div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                <div className="text-sm text-slate-400">Book consultation</div>
                <div className="text-lg font-semibold text-white mt-2">
                  {lawyer.name || "Lawyer"}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {formatLocation(lawyer.city, lawyer.district)}
                </div>
                <div className="mt-4 text-sm text-slate-300">
                  Starting at{" "}
                  {lawyer.service_packages && lawyer.service_packages.length
                    ? `LKR ${Number(lawyer.service_packages[0]?.price || 0).toFixed(0)}`
                    : "custom pricing"}
                </div>
                <button
                  onClick={() => requireAuth(() => navigate(`/client/booking/${lawyer.id}`))}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
              {lawyer.contact_email && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Contact</div>
                  <div className="text-sm text-slate-200 mt-2">{lawyer.contact_email}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageShell>
      <LoginRequiredModal
        open={modalOpen}
        onClose={closeModal}
        title="Login to request a booking"
        description="Sign up to book, upload documents, and submit intake details."
      />
    </>
  );
}
