import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/ui/PageShell";
import EmptyState from "../components/ui/EmptyState";
import useRequireAuth from "../hooks/useRequireAuth";
import LoginRequiredModal from "../components/ui/LoginRequiredModal";

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
        const res = await api.get(`/lawyers/${id}`);
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

  const tags = useMemo(() => {
    if (!lawyer) return [];
    return [
      lawyer.specialization,
      [lawyer.city, lawyer.district].filter(Boolean).join(", "),
    ].filter(Boolean);
  }, [lawyer]);

  const languagesLabel = useMemo(() => {
    if (!lawyer || !Array.isArray(lawyer.languages) || lawyer.languages.length === 0) {
      return "Languages not set";
    }
    return lawyer.languages.join(", ");
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
        title={lawyer.full_name || "Lawyer"}
        subtitle="Public profile"
        actions={
          <button
            onClick={() => requireAuth(() => navigate(`/client/booking/${lawyer.id}`))}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-sm font-medium text-white transition-colors"
          >
            Book Appointment
          </button>
        }
        contentClassName="space-y-6 max-w-4xl"
      >
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">Lawyer Profile</div>
            <h1 className="text-3xl font-bold text-white">{lawyer.full_name || "Lawyer"}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {tag}
                </span>
              ))}
              {lawyer.is_verified && (
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/30 border border-green-700 text-green-200">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Specialization</div>
            <div className="text-white font-medium">{lawyer.specialization || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Languages</div>
            <div className="text-white font-medium">{languagesLabel}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Experience</div>
            <div className="text-white font-medium">
              {lawyer.years_of_experience ? `${lawyer.years_of_experience} years` : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Rating</div>
            <div className="text-amber-300 font-semibold">
              {lawyer.rating !== null && lawyer.rating !== undefined ? lawyer.rating : "—"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-slate-400 text-xs uppercase tracking-wide">Bio</div>
          <div className="text-slate-200 text-sm leading-relaxed">
            {lawyer.bio || "No bio provided yet."}
          </div>
        </div>
      </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 text-slate-300">
          <div className="text-lg font-semibold text-white mb-1">Reviews</div>
          <div className="text-sm text-slate-400">Coming soon.</div>
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
