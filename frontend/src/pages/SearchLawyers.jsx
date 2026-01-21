import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import EmptyState from "../components/ui/EmptyState";
import useRequireAuth from "../hooks/useRequireAuth";
import LoginRequiredModal from "../components/ui/LoginRequiredModal";

const DISTRICTS = ["Colombo", "Gampaha", "Kandy", "Galle", "Jaffna", "Kurunegala"];
const SPECIALIZATIONS = [
  "Family Law",
  "Corporate",
  "Criminal Defense",
  "Property",
  "Immigration",
  "Labor",
];
const LANGUAGES = ["Sinhala", "Tamil", "English"];
const MIN_RATING_OPTIONS = [
  { label: "Any rating", value: "" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
  { label: "4.5+", value: "4.5" },
];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "rating_desc" },
  { label: "Most Experienced", value: "experience_desc" },
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
];

export default function SearchLawyers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { requireAuth, modalOpen, closeModal } = useRequireAuth();
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") || "");
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get("q") || "",
    district: searchParams.get("district") || "",
    city: searchParams.get("city") || "",
    specialization: searchParams.get("specialization") || "",
    language: searchParams.get("language") || "",
    verified: searchParams.get("verified") === "true",
    min_rating: searchParams.get("min_rating") || "",
    sort: searchParams.get("sort") || "newest",
  }));
  const [page, setPage] = useState(() => {
    const raw = Number(searchParams.get("page") || 1);
    return Number.isNaN(raw) || raw < 1 ? 1 : raw;
  });
  const limit = 12;
  const [lawyers, setLawyers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (filters.q) params.q = filters.q;
        if (filters.district) params.district = filters.district;
        if (filters.city) params.city = filters.city;
        if (filters.specialization) params.specialization = filters.specialization;
        if (filters.language) params.language = filters.language;
        if (filters.verified) params.verified = true;
        if (filters.min_rating) params.min_rating = filters.min_rating;
        if (filters.sort) params.sort = filters.sort;
        params.page = page;
        params.limit = limit;

        const res = await api.get("/lawyers/search", { params });
        setLawyers(res.data?.items || []);
        setTotal(res.data?.total || 0);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load lawyers.";
        setError(msg);
        setLawyers([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [
    filters.q,
    filters.district,
    filters.city,
    filters.specialization,
    filters.language,
    filters.verified,
    filters.min_rating,
    filters.sort,
    page,
  ]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, q: searchInput }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    if (filters.district) next.set("district", filters.district);
    if (filters.city) next.set("city", filters.city);
    if (filters.specialization) next.set("specialization", filters.specialization);
    if (filters.language) next.set("language", filters.language);
    if (filters.verified) next.set("verified", "true");
    if (filters.min_rating) next.set("min_rating", filters.min_rating);
    if (filters.sort) next.set("sort", filters.sort);
    next.set("page", String(page));
    next.set("limit", String(limit));
    setSearchParams(next, { replace: true });
  }, [filters, page, limit, setSearchParams]);

  const resultsLabel = useMemo(() => {
    if (loading) return "Loading...";
    if (error) return "Unable to load results";
    return `Showing ${lawyers.length} of ${total} result${total === 1 ? "" : "s"}`;
  }, [loading, error, lawyers.length, total]);

  const handleChange = (field, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      q: "",
      district: "",
      city: "",
      specialization: "",
      language: "",
      verified: false,
      min_rating: "",
      sort: "newest",
    });
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

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

  return (
    <div className="min-h-screen w-full px-6 py-8 text-white">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Search Lawyers</h1>
        <p className="text-slate-400">
          Find a verified legal professional tailored to your needs
        </p>
      </div>

      <section className="mt-8 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] lg:sticky lg:top-24 lg:z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-200">Filters</div>
            <div className="text-xs text-slate-400">Refine your search</div>
          </div>
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
          >
            Clear filters
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <label className="text-xs text-slate-400">
            Name
            <input
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Search by name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            District
            <select
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={filters.district}
              onChange={(e) => handleChange("district", e.target.value)}
            >
              <option value="">All districts</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            City
            <input
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Specialization
            <select
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={filters.specialization}
              onChange={(e) => handleChange("specialization", e.target.value)}
            >
              <option value="">All specializations</option>
              {SPECIALIZATIONS.map((specialization) => (
                <option key={specialization} value={specialization}>
                  {specialization}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Language
            <select
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={filters.language}
              onChange={(e) => handleChange("language", e.target.value)}
            >
              <option value="">All languages</option>
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Minimum rating
            <select
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={filters.min_rating}
              onChange={(e) => handleChange("min_rating", e.target.value)}
            >
              {MIN_RATING_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Sort by
            <select
              className="mt-1 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={filters.sort}
              onChange={(e) => handleChange("sort", e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => handleChange("verified", e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
            />
            Verified only
          </label>
        </div>
        <div className="text-sm text-slate-400" aria-live="polite">
          {resultsLabel}
        </div>
      </section>

      <section className="mt-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
                <div className="h-9 bg-slate-800 rounded w-32" />
              </div>
            ))}
          </div>
        )}

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
            description="Try adjusting filters or searching by district, specialization, or language."
            buttonLabel="Reset filters"
            buttonLink="/client/search"
          />
        )}

        {!loading && !error && lawyers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-[0_12px_25px_rgba(0,0,0,0.25)] transition hover:border-slate-700 hover:shadow-[0_16px_32px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-amber-200 overflow-hidden">
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
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-white flex items-center gap-2">
                        {lawyer.name || "Unnamed"}
                        {lawyer.verified && (
                          <span className="text-[10px] uppercase tracking-wide text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {lawyer.specialization || "General"}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full">
                    {lawyer.rating?.toFixed ? lawyer.rating.toFixed(1) : lawyer.rating || "0.0"}{" "}
                    rating
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {[lawyer.city, lawyer.district].filter(Boolean).join(", ") || "Location not set"}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                  {(lawyer.languages || []).length ? (
                    lawyer.languages.map((lang) => (
                      <span
                        key={`${lawyer.id}-${lang}`}
                        className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">Languages not set</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>
                    Rating: {lawyer.rating ?? 0} | {lawyer.review_count || 0} reviews
                  </span>
                  {lawyer.cases_handled != null && (
                    <span>Cases handled: {lawyer.cases_handled}</span>
                  )}
                  {lawyer.starting_price != null && (
                    <span>Starting at: LKR {Number(lawyer.starting_price).toFixed(0)}</span>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => requireAuth(() => navigate(`/client/profile/${lawyer.id}`))}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && lawyers.length > 0 && (
          <div className="flex items-center justify-between border border-slate-800 rounded-xl px-4 py-3 bg-slate-900/60">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
            >
              Prev
            </button>
            <div className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-0"
            >
              Next
            </button>
          </div>
        )}
      </section>
      <LoginRequiredModal
        open={modalOpen}
        onClose={closeModal}
        title="Login to view full profile"
        description="Sign in or create an account to see lawyer details."
      />
    </div>
  );
}
