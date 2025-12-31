import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/ui/PageShell";
import EmptyState from "../components/ui/EmptyState";

export default function SearchLawyers() {
  const [filters, setFilters] = useState({
    district: "",
    city: "",
    specialization: "",
    language: "",
    q: "",
  });
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (filters.district) params.district = filters.district;
        if (filters.city) params.city = filters.city;
        if (filters.specialization) params.specialization = filters.specialization;
        if (filters.language) params.language = filters.language;
        if (filters.q) params.q = filters.q;

        const res = await api.get("/lawyers", { params });
        setLawyers(res.data || []);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load lawyers.";
        setError(msg);
        setLawyers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [filters.district, filters.city, filters.specialization, filters.language, filters.q]);

  const resultsLabel = useMemo(() => {
    if (loading) return "Loading...";
    if (error) return "Unable to load results";
    return `Showing ${lawyers.length} result${lawyers.length === 1 ? "" : "s"}`;
  }, [loading, error, lawyers.length]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageShell
      title="Search Lawyers"
      subtitle="Find a verified legal professional tailored to your needs"
      maxWidth="max-w-6xl"
      contentClassName="space-y-6"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Search by name"
            value={filters.q}
            onChange={(e) => handleChange("q", e.target.value)}
          />
          <input
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="District"
            value={filters.district}
            onChange={(e) => handleChange("district", e.target.value)}
          />
          <input
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="City"
            value={filters.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <input
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Specialization"
            value={filters.specialization}
            onChange={(e) => handleChange("specialization", e.target.value)}
          />
          <input
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Language"
            value={filters.language}
            onChange={(e) => handleChange("language", e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-400">{resultsLabel}</div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
        {loading && <div className="text-slate-300">Loading lawyers...</div>}

        {!loading && error && (
          <EmptyState
            title="Couldn't load lawyers"
            description={error}
            buttonLabel="Try again"
            buttonLink="/client/search"
          />
        )}

        {!loading && !error && lawyers.length === 0 && (
          <EmptyState
            title="No lawyers found"
            description="Try adjusting your filters."
            buttonLabel="Clear filters"
            buttonLink="/client/search"
          />
        )}

        {!loading && !error && lawyers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {lawyer.full_name || "Unnamed"}
                    </div>
                    <div className="text-sm text-slate-400">
                      {lawyer.specialization || "General"}
                    </div>
                  </div>
                  <div className="text-sm text-amber-300 font-semibold">
                    {lawyer.rating ?? "—"}
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {[lawyer.city, lawyer.district].filter(Boolean).join(", ") || "—"}
                </div>
                <div className="text-xs text-slate-300">
                  {Array.isArray(lawyer.languages) && lawyer.languages.length
                    ? lawyer.languages.join(", ")
                    : "Languages not set"}
                </div>
                <div className="flex justify-end">
                  <Link
                    to={`/client/profile/${lawyer.id}`}
                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-white transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
