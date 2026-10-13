import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import {
  Users,
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  TrendingUp,
  AlertCircle,
  MessageSquareWarning,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  COMPLETED: "#16a34a",
  ACCEPTED: "#8c6b52",
  REQUESTED: "#c88c59",
  REJECTED: "#ef4444",
  CANCELLED: "#9b806d",
};

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_ENDPOINTS.ADMIN}/analytics`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load analytics");
      }

      setAnalytics(data.analytics || {});
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const cards = [
    {
      title: "Total Customers",
      value: analytics?.totalCustomers,
      icon: Users,
      color: "#b77740",
      bg: "#f8eee2",
    },
    {
      title: "Total Providers",
      value: analytics?.totalProviders,
      icon: UserCheck,
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      title: "Total Bookings",
      value: analytics?.totalBookings,
      icon: CalendarCheck,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Completed Bookings",
      value: analytics?.completedBookings,
      icon: CheckCircle2,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      title: "Requested Bookings",
      value: analytics?.requestedBookings,
      icon: Clock3,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      title: "Accepted Bookings",
      value: analytics?.acceptedBookings,
      icon: TrendingUp,
      color: "#0284c7",
      bg: "#eff6ff",
    },
    {
      title: "Rejected Bookings",
      value: analytics?.rejectedBookings,
      icon: AlertCircle,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      title: "Cancelled Bookings",
      value: analytics?.cancelledBookings,
      icon: AlertCircle,
      color: "#9b806d",
      bg: "#f1f5f9",
    },
    {
      title: "Pending Complaints",
      value: analytics?.pendingComplaints,
      icon: MessageSquareWarning,
      color: "#ea580c",
      bg: "#fff7ed",
    },
    {
      title: "Resolved Complaints",
      value: analytics?.resolvedComplaints,
      icon: CheckCircle2,
      color: "#059669",
      bg: "#ecfdf5",
    },
  ];

  const statusData = (analytics?.bookingStatus || [])
    .map((item) => ({
      name: item._id || "UNKNOWN",
      value: Number(item.count) || 0,
      fill: COLORS[item._id] || "#8b5cf6",
    }))
    .filter((item) => item.value > 0);

  const totalBookings = Number(analytics?.totalBookings) || 0;

  const barData = [
    {
      name: "Requested",
      bookings: Number(analytics?.requestedBookings) || 0,
      fill: COLORS.REQUESTED,
    },
    {
      name: "Accepted",
      bookings: Number(analytics?.acceptedBookings) || 0,
      fill: COLORS.ACCEPTED,
    },
    {
      name: "Completed",
      bookings: Number(analytics?.completedBookings) || 0,
      fill: COLORS.COMPLETED,
    },
    {
      name: "Rejected",
      bookings: Number(analytics?.rejectedBookings) || 0,
      fill: COLORS.REJECTED,
    },
    {
      name: "Cancelled",
      bookings: Number(analytics?.cancelledBookings) || 0,
      fill: COLORS.CANCELLED,
    },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        .sec-analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
        }
        .sec-analytics-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .sec-analytics-card {
          background: #fff;
          border: 1px solid #EADCCF;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 18px rgba(43,27,20,0.05);
          min-width: 0;
        }
        .sec-chart-area {
          width: 100%;
          height: 290px;
          min-width: 0;
          min-height: 290px;
          position: relative;
        }
        @media (max-width: 600px) {
          .sec-analytics-grid {
            grid-template-columns: 1fr;
          }
          .sec-analytics-charts {
            grid-template-columns: 1fr;
          }
          .sec-chart-area {
            height: 260px;
            min-height: 260px;
          }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px 0", color: "#2B1B14", fontSize: 24 }}>
            Platform Analytics
          </h2>
          <p style={{ margin: 0, color: "#8D7768", fontSize: 14 }}>
            Live platform performance, user counts, and booking metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "#B87943",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
            touchAction: "manipulation",
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {loading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 40,
            textAlign: "center",
            color: "#8D7768",
            border: "1px solid #EADCCF",
          }}
        >
          <p style={{ fontSize: 16, margin: 0 }}>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div
          style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            borderRadius: 12,
            padding: 20,
            color: "#991B1B",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>Unable to load analytics</h4>
          <p style={{ margin: "0 0 14px 0", fontSize: 14 }}>{error}</p>
          <button
            type="button"
            onClick={fetchAnalytics}
            style={{
              padding: "8px 16px",
              background: "#991B1B",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="sec-analytics-grid">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  style={{
                    background: "#fff",
                    border: "1px solid #EADCCF",
                    borderRadius: 14,
                    padding: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 3px 12px rgba(43,27,20,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 10,
                      background: card.bg,
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        color: "#8D7768",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {card.title}
                    </p>
                    <h3
                      style={{
                        margin: 0,
                        color: "#2B1B14",
                        fontSize: 22,
                        fontWeight: 700,
                      }}
                    >
                      {Number(card.value) || 0}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="sec-analytics-charts">
            {/* Booking Status Donut Chart */}
            <section className="sec-analytics-card">
              <div style={{ marginBottom: 16 }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 17,
                    color: "#2B1B14",
                    fontWeight: 700,
                  }}
                >
                  Booking Status Share
                </h3>
                <p style={{ margin: 0, color: "#8D7768", fontSize: 13 }}>
                  Distribution of all bookings by current status
                </p>
              </div>

              {statusData.length > 0 ? (
                <div className="sec-chart-area">
                  <ResponsiveContainer width="100%" height={290} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="46%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [val, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #EADCCF",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontSize: 13,
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div
                    style={{
                      position: "absolute",
                      top: "46%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: 22,
                        color: "#2B1B14",
                        fontWeight: 800,
                      }}
                    >
                      {totalBookings}
                    </strong>
                    <span
                      style={{ fontSize: 11, color: "#8D7768", fontWeight: 600 }}
                    >
                      Total
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    height: 290,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8D7768",
                    fontSize: 14,
                  }}
                >
                  No booking status data available yet.
                </div>
              )}
            </section>

            {/* Bookings Breakdown Bar Chart */}
            <section className="sec-analytics-card">
              <div style={{ marginBottom: 16 }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 17,
                    color: "#2B1B14",
                    fontWeight: 700,
                  }}
                >
                  Bookings Breakdown
                </h3>
                <p style={{ margin: 0, color: "#8D7768", fontSize: 13 }}>
                  Direct volume comparison across booking stages
                </p>
              </div>

              <div className="sec-chart-area">
                <ResponsiveContainer width="100%" height={290} minWidth={0}>
                  <BarChart
                    data={barData}
                    margin={{ top: 16, right: 12, left: -16, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F0E5D8"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#8D7768" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#8D7768" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(184,121,67,0.06)" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #EADCCF",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Status Progress Bars Details */}
          <section className="sec-analytics-card" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: 17,
                  color: "#2B1B14",
                  fontWeight: 700,
                }}
              >
                Booking Status Metrics
              </h3>
              <p style={{ margin: 0, color: "#8D7768", fontSize: 13 }}>
                Exact volume counts and percentage shares per category
              </p>
            </div>

            {statusData.length > 0 ? (
              <div style={{ display: "grid", gap: 14 }}>
                {statusData.map((item) => {
                  const percentage = totalBookings
                    ? Math.round((item.value / totalBookings) * 100)
                    : 0;

                  return (
                    <div key={item.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#2B1B14",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: item.fill,
                              display: "inline-block",
                            }}
                          />
                          {item.name}
                        </span>
                        <span style={{ color: "#8D7768", fontWeight: 500 }}>
                          {item.value} bookings ({percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "#F2ECE5",
                          borderRadius: 6,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(percentage, 100)}%`,
                            background: item.fill,
                            borderRadius: 6,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, color: "#8D7768", fontSize: 14 }}>
                No booking records found.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
