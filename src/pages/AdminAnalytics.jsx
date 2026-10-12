import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";

import { useNavigate } from "react-router-dom";

import {

  LayoutDashboard,

  BarChart3,

  Users,

  UserCheck,

  UserRound,

  Wrench,

  CalendarCheck,

  MessageSquareWarning,

  Star,

  UserCircle,

  LogOut,

  Menu,

  X,

  TrendingUp,

  CheckCircle2,

  Clock3,

  AlertCircle,

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



const AdminAnalytics = () => {

  const navigate = useNavigate();



  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [usersOpen, setUsersOpen] = useState(true);



  useEffect(() => {

    let cancelled = false;



    const fetchAnalytics = async () => {

      try {

        setLoading(true);

        setError("");



        const response = await fetch(
          `${API_ENDPOINTS.ADMIN}/analytics`
        );

        const data = await response.json();



        if (!response.ok || !data.success) {

          throw new Error(data.message || "Failed to load analytics");

        }



        if (!cancelled) setAnalytics(data.analytics);

      } catch (err) {

        if (!cancelled) {

          setError(err.message || "Unable to load analytics");

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    };



    fetchAnalytics();



    return () => {

      cancelled = true;

    };

  }, []);



  const changePage = (page) => {

    setSidebarOpen(false);



    if (page === "Analytics") navigate("/admin/analytics");

    else if (page === "Dashboard") navigate("/admin");

    else navigate(`/admin?section=${encodeURIComponent(page)}`);

  };



  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  };



  const menuItems = [

    { name: "Dashboard", icon: LayoutDashboard },

    { name: "Analytics", icon: BarChart3 },

    { name: "Users", icon: Users, dropdown: true },

    { name: "Services", icon: Wrench },

    { name: "Bookings", icon: CalendarCheck },

    { name: "Complaints", icon: MessageSquareWarning },

    { name: "Reviews", icon: Star },

    { name: "Admin Profile", icon: UserCircle },

  ];



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

    { name: "Requested", bookings: Number(analytics?.requestedBookings) || 0, fill: COLORS.REQUESTED },

    { name: "Accepted", bookings: Number(analytics?.acceptedBookings) || 0, fill: COLORS.ACCEPTED },

    { name: "Completed", bookings: Number(analytics?.completedBookings) || 0, fill: COLORS.COMPLETED },

    { name: "Rejected", bookings: Number(analytics?.rejectedBookings) || 0, fill: COLORS.REJECTED },

    { name: "Cancelled", bookings: Number(analytics?.cancelledBookings) || 0, fill: COLORS.CANCELLED },

  ];



  return (

    <div style={styles.app}>

      <style>{`

        * { box-sizing: border-box; }



        .analytics-sidebar {

          position: fixed;

          top: 0;

          bottom: 0;

          left: 0;

          width: 250px;

          background: #2b1b14;

          color: white;

          padding: 25px 15px;

          overflow-y: auto;

          z-index: 1001;

          transition: transform .25s ease;

        }



        .analytics-main {

          margin-left: 250px;

          min-width: 0;

          min-height: 100vh;

        }



        .analytics-mobile-header { display: none; }



        .analytics-nav {

          width: 100%;

          border: none;

          color: white;

          padding: 12px 14px;

          border-radius: 10px;

          display: flex;

          align-items: center;

          gap: 12px;

          cursor: pointer;

          margin-bottom: 5px;

          text-align: left;

          font-size: 14px;

          background: transparent;

        }



        .analytics-nav:hover { background: #493025; }



        .analytics-grid {

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 16px;

        }



        .analytics-charts {

          display: grid;

          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

          gap: 22px;

          margin-top: 24px;

        }



        .analytics-card {

          background: white;

          border: 1px solid #eee0d2;

          border-radius: 18px;

          padding: 24px;

          box-shadow: 0 5px 22px rgba(65, 40, 25, .04);

          min-width: 0;

        }



        .analytics-stat {

          transition: transform .2s ease, box-shadow .2s ease;

        }



        .analytics-stat:hover {

          transform: translateY(-3px);

          box-shadow: 0 12px 28px rgba(65, 40, 25, .08);

        }



        .analytics-chart-area { width: 100%; height: 290px; }



        .analytics-nav:focus-visible,

        .analytics-action:focus-visible {

          outline: 3px solid #a5b4fc;

          outline-offset: 3px;

        }



        @media(max-width: 1250px) {

          .analytics-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

        }



        @media(max-width: 1000px) {

          .analytics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

          .analytics-charts { grid-template-columns: minmax(0, 1fr); }

        }



        @media(max-width: 900px) {

          .analytics-sidebar { transform: translateX(-100%); }

          .analytics-sidebar.analytics-sidebar-open { transform: translateX(0); }

          .analytics-main { margin-left: 0; }



          .analytics-mobile-header {

            display: flex;

            position: fixed;

            top: 0;

            left: 0;

            right: 0;

            height: 60px;

            background: #2b1b14;

            color: white;

            align-items: center;

            justify-content: space-between;

            padding: 0 18px;

            z-index: 1000;

          }



          .analytics-content { padding: 82px 20px 24px !important; }

        }



        @media(max-width: 520px) {

          .analytics-grid { grid-template-columns: 1fr; }

          .analytics-content { padding: 78px 14px 20px !important; }

          .analytics-title { font-size: 25px !important; }

          .analytics-card { padding: 17px; }

          .analytics-chart-area { height: 260px; }

        }

      `}</style>



      <header className="analytics-mobile-header" style={{ display: "none" }}>

        <strong style={{ fontSize: 21 }}>Homezy</strong>

        <button

          type="button"

          onClick={() => setSidebarOpen(!sidebarOpen)}

          aria-label="Toggle sidebar"

          style={styles.mobileButton}

        >

          {sidebarOpen ? <X size={25} /> : <Menu size={25} />}

        </button>

      </header>



      {sidebarOpen && (

        <div

          style={styles.overlay}

          onClick={() => setSidebarOpen(false)}

        />

      )}



      <aside className={`analytics-sidebar ${sidebarOpen ? "analytics-sidebar-open" : ""}`} style={{ position: "fixed", top: 0, bottom: 0, left: 0, width: 250, minWidth: 250, overflowY: "auto", background: "#2b1b14", color: "#fff", padding: "25px 15px", zIndex: 1001, boxSizing: "border-box" }}>

        <div style={styles.brand}>

          <div style={styles.brandIcon}>H</div>

          <div>

            <h2 style={{ margin: 0, fontSize: 22 }}>Homezy</h2>

            <small style={{ color: "#cbd5e1" }}>ADMIN PANEL</small>

          </div>

        </div>



        <p style={styles.menuLabel}>MAIN MENU</p>



        {menuItems.map((item) => {

          const Icon = item.icon;



          return (

            <div key={item.name}>

              <button

                type="button"

                className="analytics-nav"

                onClick={() => {

                  if (item.dropdown) setUsersOpen(!usersOpen);

                  else changePage(item.name);

                }}

                style={{

                  background: item.name === "Analytics" ? "#c88c59" : "transparent",

                }}

              >

                <Icon size={19} />

                <span style={{ flex: 1 }}>{item.name}</span>

                {item.dropdown && <span>{usersOpen ? "−" : "+"}</span>}

              </button>



              {item.dropdown && usersOpen && (

                <div style={{ marginLeft: 18, marginBottom: 7 }}>

                  {[

                    { name: "Customers", icon: UserRound },

                    { name: "Providers", icon: UserCheck },

                  ].map((sub) => {

                    const SubIcon = sub.icon;



                    return (

                      <button

                        key={sub.name}

                        type="button"

                        className="analytics-nav"

                        onClick={() => changePage(sub.name)}

                        style={{ width: "100%", border: 0, color: "#eadccf", padding: "9px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 5, textAlign: "left", fontSize: 14, background: "transparent", boxSizing: "border-box" }}

                      >

                        <SubIcon size={16} />

                        {sub.name}

                      </button>

                    );

                  })}

                </div>

              )}

            </div>

          );

        })}



        <div style={styles.logoutArea}>

          <button

            type="button"

            className="analytics-nav"

            onClick={handleLogout}

            style={{

              background: "rgba(255,255,255,.06)",

              border: "1px solid rgba(255,255,255,.15)",

            }}

          >

            <LogOut size={19} />

            Logout

          </button>

        </div>

      </aside>



      <main className="analytics-main" style={{ marginLeft: 250, width: "calc(100% - 250px)", minWidth: 0, minHeight: "100vh", boxSizing: "border-box" }}>

        <div className="analytics-content" style={{ ...styles.page, width: "100%", minWidth: 0, boxSizing: "border-box", padding: 32 }}>

          <header style={styles.header}>

            <div>

              <p style={styles.eyebrow}>HOMEZY ADMIN PANEL</p>

              <h1 className="analytics-title" style={styles.heading}>

                Analytics Dashboard

              </h1>

              <p style={styles.subtitle}>

                Your platform performance, at a glance.

              </p>

            </div>



            <button

              type="button"

              className="analytics-action"

              style={styles.button}

              onClick={() => window.location.reload()}

            >

              ↻ Refresh

            </button>

          </header>



          {loading ? (

            <div style={styles.message}>Loading your analytics...</div>

          ) : error ? (

            <div style={styles.errorCard}>

              <h2>Unable to load analytics</h2>

              <p>{error}</p>

              <button

                type="button"

                style={styles.button}

                onClick={() => window.location.reload()}

              >

                Try Again

              </button>

            </div>

          ) : (

            <>

              <div style={styles.welcome}>

                <div>

                  <p style={styles.welcomeLabel}>YOUR HOMEZY OVERVIEW</p>

                  <h2 style={styles.welcomeTitle}>Platform at a glance ✨</h2>

                  <p style={styles.welcomeText}>

                    Track bookings, users and customer support activity in one place.

                  </p>

                </div>

                <div style={styles.welcomeEmoji}>📊</div>

              </div>



              <div className="analytics-grid">

                {cards.map((card) => {

                  const Icon = card.icon;



                  return (

                    <div

                      className="analytics-stat"

                      style={styles.card}

                      key={card.title}

                    >

                      <div

                        style={{

                          ...styles.icon,

                          backgroundColor: card.bg,

                          color: card.color,

                        }}

                      >

                        <Icon size={23} />

                      </div>



                      <p style={styles.cardTitle}>{card.title}</p>

                      <h2 style={{ ...styles.number, color: card.color }}>

                        {Number(card.value) || 0}

                      </h2>

                    </div>

                  );

                })}

              </div>



              <div className="analytics-charts">

                <section className="analytics-card">

                  <div style={styles.chartHeading}>

                    <div>

                      <h2 style={styles.sectionTitle}>Booking Status</h2>

                      <p style={styles.chartSubtitle}>

                        Share of bookings by current status

                      </p>

                    </div>

                    <div style={styles.chartIcon}>◔</div>

                  </div>



                  {statusData.length > 0 ? (

                    <>

                      <div className="analytics-chart-area" style={{ position: "relative" }}>

                        <ResponsiveContainer width="100%" height="100%">

                          <PieChart>

                            <Pie

                              data={statusData}

                              dataKey="value"

                              nameKey="name"

                              cx="50%"

                              cy="46%"

                              innerRadius={68}

                              outerRadius={100}

                              paddingAngle={4}

                              stroke="none"

                            >

                              {statusData.map((entry) => (

                                <Cell key={entry.name} fill={entry.fill} />

                              ))}

                            </Pie>

                            <Tooltip

                              formatter={(value, name) => [value, name]}

                              contentStyle={{

                                borderRadius: 12,

                                border: "1px solid #e2e8f0",

                                boxShadow: "0 6px 20px rgba(15,23,42,.1)",

                              }}

                            />

                            <Legend verticalAlign="bottom" height={38} />

                          </PieChart>

                        </ResponsiveContainer>

                        <div style={styles.donutCenter}>

                          <strong>{totalBookings}</strong>

                          <span>Total bookings</span>

                        </div>

                      </div>

                    </>

                  ) : (

                    <div style={styles.emptyChart}>

                      No booking status data available yet.

                    </div>

                  )}

                </section>



                <section className="analytics-card">

                  <div style={styles.chartHeading}>

                    <div>

                      <h2 style={styles.sectionTitle}>Bookings Breakdown</h2>

                      <p style={styles.chartSubtitle}>

                        Compare bookings across statuses

                      </p>

                    </div>

                    <div style={styles.chartIcon}>▥</div>

                  </div>



                  <div className="analytics-chart-area">

                    <ResponsiveContainer width="100%" height="100%">

                      <BarChart

                        data={barData}

                        margin={{ top: 16, right: 8, left: -18, bottom: 8 }}

                      >

                        <CartesianGrid

                          strokeDasharray="3 3"

                          vertical={false}

                          stroke="#eee0d2"

                        />

                        <XAxis

                          dataKey="name"

                          tick={{ fontSize: 11, fill: "#9b806d" }}

                          axisLine={false}

                          tickLine={false}

                          interval={0}

                        />

                        <YAxis

                          allowDecimals={false}

                          tick={{ fontSize: 11, fill: "#9b806d" }}

                          axisLine={false}

                          tickLine={false}

                        />

                        <Tooltip

                          cursor={{ fill: "#f1f5f9" }}

                          contentStyle={{

                            borderRadius: 12,

                            border: "1px solid #e2e8f0",

                          }}

                        />

                        <Bar dataKey="bookings" radius={[7, 7, 0, 0]}>

                          {barData.map((entry) => (

                            <Cell key={entry.name} fill={entry.fill} />

                          ))}

                        </Bar>

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </section>

              </div>



              <section className="analytics-card" style={{ marginTop: 24 }}>

                <div style={styles.chartHeading}>

                  <div>

                    <h2 style={styles.sectionTitle}>Booking Status Details</h2>

                    <p style={styles.chartSubtitle}>

                      Exact count and percentage for each reported status

                    </p>

                  </div>

                </div>



                {statusData.length > 0 ? (

                  <div style={styles.statusList}>

                    {statusData.map((item) => {

                      const percentage = totalBookings

                        ? Math.round((item.value / totalBookings) * 100)

                        : 0;



                      return (

                        <div key={item.name} style={styles.statusItem}>

                          <div style={styles.statusHeader}>

                            <span style={styles.statusName}>

                              <span

                                style={{

                                  ...styles.statusDot,

                                  background: item.fill,

                                }}

                              />

                              {item.name}

                            </span>

                            <span style={styles.statusCount}>

                              {item.value} bookings · {percentage}%

                            </span>

                          </div>



                          <div style={styles.track}>

                            <div

                              style={{

                                ...styles.bar,

                                width: `${Math.min(percentage, 100)}%`,

                                backgroundColor: item.fill,

                              }}

                            />

                          </div>

                        </div>

                      );

                    })}

                  </div>

                ) : (

                  <p style={styles.emptyText}>No booking records to display.</p>

                )}

              </section>

            </>

          )}

        </div>

      </main>

    </div>

  );

};



const styles = {

  app: {

    minHeight: "100vh",

    background: "#f7f1e9",

    fontFamily: "Inter, Arial, sans-serif",

    color: "#1e293b",

  },

  brand: {

    display: "flex",

    alignItems: "center",

    gap: 10,

    padding: "0 12px",

    marginBottom: 35,

  },

  brandIcon: {

    width: 38,

    height: 38,

    borderRadius: 10,

    background: "#d4af37",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#2b1b14",

    fontWeight: "bold",

    fontSize: 20,

  },

  menuLabel: {

    color: "#b7a08f",

    fontSize: 11,

    letterSpacing: 1.5,

    padding: "0 12px",

  },

  logoutArea: {

    marginTop: 25,

    paddingTop: 15,

    borderTop: "1px solid rgba(255,255,255,.15)",

  },

  mobileButton: {

    border: 0,

    color: "white",

    background: "transparent",

    cursor: "pointer",

  },

  overlay: {

    position: "fixed",

    inset: 0,

    background: "rgba(0,0,0,.4)",

    zIndex: 1000,

  },

  page: {

    minHeight: "100vh",

    padding: 32,

    background: "#f7f1e9",

  },

  header: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    flexWrap: "wrap",

    gap: 16,

    marginBottom: 26,

  },

  eyebrow: {

    color: "#b77740",

    fontWeight: 800,

    fontSize: 11,

    letterSpacing: 2,

    margin: "0 0 8px",

  },

  heading: {

    fontSize: 31,

    margin: "0 0 8px",

    fontWeight: 800,

    color: "#2b1b14",

    letterSpacing: "-.7px",

  },

  subtitle: {

    color: "#9b806d",

    fontSize: 14,

    lineHeight: 1.6,

    margin: 0,

  },

  button: {

    border: 0,

    borderRadius: 11,

    padding: "12px 18px",

    background: "#c88c59",

    color: "#fff",

    fontWeight: 700,

    cursor: "pointer",

    whiteSpace: "nowrap",

  },

  welcome: {

    background: "linear-gradient(120deg, #a76735, #c88c59 58%, #e0b68f)",

    color: "white",

    padding: "26px 30px",

    borderRadius: 20,

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 18,

    marginBottom: 24,

    boxShadow: "0 12px 28px rgba(200,140,89,.18)",

  },

  welcomeLabel: {

    margin: "0 0 8px",

    fontSize: 10,

    letterSpacing: 1.8,

    fontWeight: 800,

    color: "#f1d8bf",

  },

  welcomeTitle: {

    margin: "0 0 8px",

    fontSize: 23,

    fontWeight: 800,

  },

  welcomeText: {

    margin: 0,

    color: "#f8eee2",

    fontSize: 13,

    lineHeight: 1.6,

  },

  welcomeEmoji: {

    fontSize: 48,

    background: "rgba(255,255,255,.13)",

    borderRadius: 18,

    padding: 15,

  },

  card: {

    background: "#fff",

    padding: 20,

    borderRadius: 17,

    boxShadow: "0 4px 18px rgba(15,23,42,.04)",

    border: "1px solid #eee0d2",

    minWidth: 0,

  },

  icon: {

    width: 44,

    height: 44,

    borderRadius: 13,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 15,

  },

  cardTitle: {

    color: "#9b806d",

    fontSize: 13,

    lineHeight: 1.5,

    margin: "0 0 10px",

    fontWeight: 600,

  },

  number: {

    fontSize: 30,

    margin: 0,

    fontWeight: 800,

  },

  chartHeading: {

    display: "flex",

    alignItems: "flex-start",

    justifyContent: "space-between",

    gap: 12,

  },

  sectionTitle: {

    margin: "0 0 7px",

    fontSize: 18,

    fontWeight: 800,

    color: "#2b1b14",

  },

  chartSubtitle: {

    margin: 0,

    fontSize: 12,

    color: "#b7a08f",

    lineHeight: 1.6,

  },

  chartIcon: {

    width: 38,

    height: 38,

    borderRadius: 12,

    background: "#f8eee2",

    color: "#c88c59",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: 24,

    flexShrink: 0,

  },

  donutCenter: {

    position: "absolute",

    top: "42%",

    left: "50%",

    transform: "translate(-50%, -50%)",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    pointerEvents: "none",

  },

  emptyChart: {

    height: 290,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#b7a08f",

    fontSize: 13,

    textAlign: "center",

  },

  emptyText: {

    color: "#b7a08f",

    fontSize: 13,

    paddingTop: 14,

  },

  statusList: {

    marginTop: 25,

    display: "grid",

    gap: 20,

  },

  statusItem: {

    width: "100%",

  },

  statusHeader: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    flexWrap: "wrap",

    gap: 10,

    marginBottom: 9,

  },

  statusName: {

    fontSize: 13,

    fontWeight: 700,

    display: "flex",

    alignItems: "center",

    gap: 9,

  },

  statusDot: {

    display: "inline-block",

    width: 9,

    height: 9,

    borderRadius: "50%",

  },

  statusCount: {

    fontSize: 12,

    color: "#9b806d",

    fontWeight: 600,

  },

  track: {

    height: 9,

    borderRadius: 20,

    background: "#eee0d2",

    overflow: "hidden",

  },

  bar: {

    height: "100%",

    borderRadius: 20,

    transition: "width .3s ease",

  },

  message: {

    padding: 40,

    color: "#9b806d",

  },

  errorCard: {

    padding: 30,

    borderRadius: 16,

    background: "#fff",

    border: "1px solid #fecaca",

    color: "#991b1b",

  },

};



export default AdminAnalytics;