import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getAuthLoginsPerMinute } from "../../services/adminMetrics.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const formatLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function AuthLoginsPerMinuteLineChart() {
  const [dataPoints, setDataPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [windowMinutes, setWindowMinutes] = useState(60);
  const timerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAuthLoginsPerMinute(60);
      const series = Array.isArray(res?.series) ? res.series : [];
      setDataPoints(series);
      setWindowMinutes(res?.minutes || 60);
      setLastUpdated(new Date());
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(load, 10000);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message;
      console.error("Auth logins per minute metrics failed:", detail);
      setError("Failed to load auth login metrics");
      setDataPoints([]);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const chartData = useMemo(() => {
    const labels = dataPoints.map((p) => formatLabel(p.minute));
    const counts = dataPoints.map((p) => (p.success || 0) + (p.fail || 0));
    return {
      labels,
      datasets: [
        {
          label: "Logins",
          data: counts,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96, 165, 250, 0.2)",
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [dataPoints]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e2e8f0" },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} logins`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxTicksLimit: 8 },
        grid: { color: "rgba(148, 163, 184, 0.15)" },
      },
      y: {
        ticks: { color: "#94a3b8", precision: 0 },
        grid: { color: "rgba(148, 163, 184, 0.15)" },
      },
    },
  };

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div>
          <h3 className="admin-chart-title">
            Auth Logins (Last {windowMinutes} min)
            <span
              className="admin-tooltip"
              title="Login attempts aggregated by time bucket."
            >
              i
            </span>
          </h3>
        </div>
        {lastUpdated && (
          <span className="admin-chart-updated">
            Last updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && <div className="admin-chart-error">{error}</div>}

      {loading ? (
        <div className="admin-chart-loading">Loading chart...</div>
      ) : dataPoints.length === 0 ? (
        <div className="admin-chart-empty">No login activity in this window.</div>
      ) : (
        <div className="admin-chart-canvas">
          <Line data={chartData} options={options} />
        </div>
      )}

      {!loading && !error && dataPoints.length < 3 && (
        <div className="admin-chart-empty">
          Low login volume — data will appear as activity increases.
        </div>
      )}
    </div>
  );
}
