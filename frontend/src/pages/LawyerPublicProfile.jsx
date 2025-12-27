import { Link, useParams } from "react-router-dom";

const MOCK = {
  1: {
    id: 1,
    name: "Priya Jayawardena",
    specialty: "Corporate Law",
    city: "Colombo",
    about:
      "Corporate and contract advisory for SMEs, startups, and individuals. 8+ years experience in legal drafting and litigation support.",
    languages: ["English", "Sinhala", "Tamil"],
    verified: true,
  },
  2: {
    id: 2,
    name: "Rohan Perera",
    specialty: "Criminal Law",
    city: "Kandy",
    about:
      "Criminal defense and family law consultation. Court representation and documentation support.",
    languages: ["English", "Sinhala"],
    verified: true,
  },
};

export default function LawyerPublicProfile() {
  const { id } = useParams();
  const lawyer = MOCK[id];

  if (!lawyer) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-200">
        Lawyer not found (demo data). Go back to{" "}
        <Link className="text-amber-400 underline" to="/client/search">
          Search
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">Lawyer Profile</div>
            <h1 className="text-3xl font-bold text-white">{lawyer.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
                {lawyer.specialty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200">
                {lawyer.city}
              </span>
              {lawyer.verified && (
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/30 border border-green-700 text-green-200">
                  Verified
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/client/booking/${lawyer.id}`}
            className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            Book Appointment
          </Link>
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            About
          </div>
          <p className="text-slate-200 leading-relaxed">{lawyer.about}</p>
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
            Languages
          </div>
          <div className="flex flex-wrap gap-2">
            {lawyer.languages.map((l) => (
              <span
                key={l}
                className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-200"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-300">
        <div className="text-lg font-semibold text-white mb-1">Reviews</div>
        <div className="text-sm text-slate-400">
          Coming soon (Chapa module).
        </div>
      </div>
    </div>
  );
}
