import { useEffect, useState } from "react";



import { useNavigate, useSearchParams } from "react-router-dom";



import {



  LayoutDashboard, BarChart3, Users, UserCheck, UserRound, Wrench,



  CalendarCheck, MessageSquareWarning, Star, UserCircle, LogOut, Menu, X,



  Save, Pencil, LockKeyhole, RefreshCw, Search,



} from "lucide-react";







const API = "http://localhost:5000/api/admin";



const COMPLAINT_API = "http://localhost:5000/api/complaints";



const REVIEW_API = "http://localhost:5000/api/reviews";

const SERVICE_API = "http://localhost:5000/api/services";







function AdminDashboard() {



  const navigate = useNavigate();



  const [searchParams, setSearchParams] = useSearchParams();



  const activePage = searchParams.get("section") || "Dashboard";







  const [usersOpen, setUsersOpen] = useState(true);



  const [sidebarOpen, setSidebarOpen] = useState(false);



  const [loading, setLoading] = useState(true);



  const [errorMessage, setErrorMessage] = useState("");



  const [stats, setStats] = useState({



    totalCustomers: 0, totalProviders: 0, totalBookings: 0,



    pendingComplaints: 0, completedBookings: 0,



  });



  const [customers, setCustomers] = useState([]);



  const [providers, setProviders] = useState([]);



  const [bookings, setBookings] = useState([]);



  const [complaints, setComplaints] = useState([]);



  const [reviews, setReviews] = useState([]);



  const [reviewsLoading, setReviewsLoading] = useState(false);



  const [reviewsError, setReviewsError] = useState("");



  const [reviewSearch, setReviewSearch] = useState("");



  const [ratingFilter, setRatingFilter] = useState("ALL");







  const loadAdminData = async (cancelledCheck = () => false) => {



    try {



      setLoading(true);



      setErrorMessage("");







      // Admin endpoints and complaints endpoint are fetched separately



      // because complaints are mounted at /api/complaints.



      const requests = await Promise.all([



        fetch(`${API}/stats`),



        fetch(`${API}/customers`),



        fetch(`${API}/providers`),



        fetch(`${API}/bookings`),



        fetch(`${COMPLAINT_API}/admin/all`),



      ]);







      const results = await Promise.all(requests.map(async (response) => {



        if (!response.ok) {



          throw new Error(`Unable to fetch admin data (${response.status})`);



        }



        return response.json();



      }));







      if (cancelledCheck()) return;



      if (results[0].success) setStats(results[0].stats || {});



      if (results[1].success) setCustomers(results[1].customers || []);



      if (results[2].success) setProviders(results[2].providers || []);



      if (results[3].success) setBookings(results[3].bookings || []);



      if (results[4].success) setComplaints(results[4].complaints || []);



    } catch (error) {



      if (!cancelledCheck()) {



        console.error("Admin data fetch error:", error);



        setErrorMessage(error.message || "Unable to load admin data.");



      }



    } finally {



      if (!cancelledCheck()) setLoading(false);



    }



  };







  const loadReviews = async () => {



    try {



      setReviewsLoading(true);



      setReviewsError("");



      const response = await fetch(`${REVIEW_API}/admin`);



      const data = await response.json();



      if (!response.ok || !data.success) {



        throw new Error(data.message || "Unable to load reviews.");



      }



      setReviews(Array.isArray(data.reviews) ? data.reviews : []);



    } catch (error) {



      console.error("Reviews fetch error:", error);



      setReviewsError(error.message || "Unable to load reviews. Check the backend route.");



    } finally {



      setReviewsLoading(false);



    }



  };







  useEffect(() => {



    let cancelled = false;



    loadAdminData(() => cancelled);



    return () => { cancelled = true; };



  }, []);







  useEffect(() => {



    if (["Customers", "Providers"].includes(activePage)) setUsersOpen(true);



  }, [activePage]);







  useEffect(() => {



    if (activePage === "Reviews") loadReviews();



  }, [activePage]);







  const changePage = (page) => {



    setSidebarOpen(false);



    if (page === "Analytics") {



      navigate("/admin/analytics");



      return;



    }



    setSearchParams(page === "Dashboard" ? {} : { section: page });



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



  const usersActive = ["Customers", "Providers"].includes(activePage);







  return (



    <div style={s.app}>



      <style>{`



        .admin-sidebar{position:fixed;inset:0 auto 0 0;width:250px;overflow-y:auto;background:#2B1B14;color:white;padding:25px 15px;box-sizing:border-box;z-index:1001;transition:transform .25s}



        .admin-main{margin-left:250px;min-width:0;padding:30px;box-sizing:border-box}



        .admin-mobile-header{display:none}



        .admin-nav{width:100%;border:0;color:white;padding:12px 14px;border-radius:10px;display:flex;align-items:center;gap:12px;cursor:pointer;margin-bottom:5px;text-align:left;font-size:14px;box-sizing:border-box}



        .admin-nav:hover{background:#3B281F!important}



        .admin-table-wrap{background:white;border-radius:16px;padding:24px;box-shadow:0 5px 20px rgba(15,23,42,.06);overflow-x:auto}



        .profile-input{width:100%;padding:12px;border:1px solid #E6D6C8;border-radius:9px;box-sizing:border-box;font-size:14px;color:#172033}



        .profile-input:disabled{background:#FCF9F5;opacity:1}



        .review-filter-input,.review-filter-select{width:100%;box-sizing:border-box;padding:12px;border:1px solid #E6D6C8;border-radius:9px;font-size:14px;outline-color:#6366f1;background:white}



        @media(max-width:800px){.admin-sidebar{transform:translateX(-100%)}.admin-sidebar.admin-sidebar-open{transform:translateX(0)}.admin-main{margin-left:0;padding:82px 18px 24px}.admin-mobile-header{display:flex;position:fixed;top:0;left:0;right:0;height:60px;background:#2B1B14;color:white;align-items:center;justify-content:space-between;padding:0 18px;z-index:1000}}



      `}</style>







      <header className="admin-mobile-header">



        <strong style={{ fontSize: 21 }}>Homezy</strong>



        <button type="button" onClick={() => setSidebarOpen(v => !v)} style={s.mobileButton} aria-label="Toggle sidebar">



          {sidebarOpen ? <X size={25} /> : <Menu size={25} />}



        </button>



      </header>







      {sidebarOpen && <div style={s.overlay} onClick={() => setSidebarOpen(false)} />}







      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}>



        <div style={s.brand}>



          <div style={s.brandIcon}>H</div>



          <div><h2 style={{ margin: 0, fontSize: 22 }}>Homezy</h2><small style={{ color: "#DCCABB" }}>ADMIN PANEL</small></div>



        </div>



        <p style={s.menuLabel}>MAIN MENU</p>



        {menuItems.map(item => {



          const Icon = item.icon;



          const active = item.dropdown ? usersActive : activePage === item.name;



          return <div key={item.name}>



            <button type="button" className="admin-nav" onClick={() => item.dropdown ? setUsersOpen(v => !v) : changePage(item.name)} style={{ background: active ? "#B87943" : "transparent" }}>



              <Icon size={19} /><span style={{ flex: 1 }}>{item.name}</span>{item.dropdown && <span>{usersOpen ? "−" : "+"}</span>}



            </button>



            {item.dropdown && usersOpen && <div style={{ marginLeft: 18, marginBottom: 7 }}>



              {[{ name: "Customers", icon: UserRound }, { name: "Providers", icon: UserCheck }].map(sub => {



                const SubIcon = sub.icon;



                return <button type="button" key={sub.name} className="admin-nav" onClick={() => changePage(sub.name)} style={{ background: activePage === sub.name ? "#C88D59" : "transparent", color: "#EADCCF", padding: "9px 12px" }}>



                  <SubIcon size={16} />{sub.name}



                </button>;



              })}



            </div>}



          </div>;



        })}



        <div style={s.logoutArea}><button type="button" className="admin-nav" onClick={handleLogout} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)" }}><LogOut size={19} />Logout</button></div>



      </aside>







      <main className="admin-main">



        <header style={s.header}>



          <div><h1 style={s.heading}>{activePage}</h1><p style={s.subtitle}>Welcome back, Homezy Admin 👋</p></div>



          <div style={s.avatar}>{(localStorage.getItem("adminName") || "A")[0].toUpperCase()}</div>



        </header>







        {errorMessage && <p role="alert" style={s.error}>{errorMessage}</p>}



        {loading && <p style={{ color: "#8D7768" }}>Loading admin data...</p>}







        {!loading && activePage === "Dashboard" && <>



          <div style={s.statsGrid}>



            <StatCard icon={<Users />} title="Total Customers" value={stats.totalCustomers} />



            <StatCard icon={<UserCheck />} title="Total Providers" value={stats.totalProviders} />



            <StatCard icon={<CalendarCheck />} title="Total Bookings" value={stats.totalBookings} />



            <StatCard icon={<MessageSquareWarning />} title="Pending Complaints" value={stats.pendingComplaints} />



            <StatCard icon={<Star />} title="Completed Bookings" value={stats.completedBookings} />



          </div>



          <div style={s.panel}>



            <h2>Homezy Admin Dashboard</h2>



            <p style={s.subtitle}>Manage customers, providers, services, bookings, complaints and reviews from the sidebar.</p>



            <div style={s.quickGrid}>



              {[["Manage Customers", "Customers"], ["Manage Providers", "Providers"], ["Manage Services", "Services"], ["View Bookings", "Bookings"], ["Manage Complaints", "Complaints"], ["View Reviews", "Reviews"], ["Admin Profile", "Admin Profile"]].map(([label, page]) =>



                <button type="button" key={page} style={s.quickButton} onClick={() => changePage(page)}>{label} →</button>



              )}



            </div>



          </div>



        </>}







        {!loading && activePage === "Customers" && <UserTable title="All Customers" users={customers} type="customer" />}



        {!loading && activePage === "Providers" && <UserTable title="All Providers" users={providers} type="provider" />}



        {!loading && activePage === "Bookings" && <BookingTable bookings={bookings} />}



        {!loading && activePage === "Complaints" && <ComplaintTable complaints={complaints} onComplaintUpdated={updated => setComplaints(previous => previous.map(c => c._id === updated._id ? { ...c, ...updated } : c))} />}



        {!loading && activePage === "Reviews" && <ReviewsSection reviews={reviews} loading={reviewsLoading} error={reviewsError} search={reviewSearch} setSearch={setReviewSearch} ratingFilter={ratingFilter} setRatingFilter={setRatingFilter} onRefresh={loadReviews} />}



        {!loading && activePage === "Admin Profile" && <AdminProfileSection />}



       {!loading && activePage === "Services" && <ServicesSection />}

      </main>



    </div>



  );



}







function ComplaintTable({ complaints = [], onComplaintUpdated }) {



  const [items, setItems] = useState(complaints);



  const [savingId, setSavingId] = useState("");



  const [message, setMessage] = useState("");



  const [messageType, setMessageType] = useState("success");







  useEffect(() => setItems(complaints), [complaints]);







  const updateItem = (id, field, value) => {



    setItems(previous => previous.map(item => item._id === id ? { ...item, [field]: value } : item));



    setMessage("");



  };







  const saveComplaint = async (complaint) => {



    setSavingId(complaint._id);



    setMessage("");



    try {



      // Backend route from complaintRoutes.js: PATCH /api/complaints/:complaintId/resolve



      // This endpoint resolves the complaint. The dropdown is retained for display,



      // but this button intentionally sends the resolve request only.



      const response = await fetch(`${COMPLAINT_API}/${complaint._id}/resolve`, {



        method: "PATCH",



        headers: { "Content-Type": "application/json" },



      });



      const result = await response.json().catch(() => ({}));



      if (!response.ok || !result.success) {



        throw new Error(result.message || `Could not resolve complaint (${response.status}).`);



      }



      const updated = { ...complaint, ...(result.complaint || {}), status: "RESOLVED" };



      setItems(previous => previous.map(item => item._id === complaint._id ? { ...item, ...updated } : item));



      onComplaintUpdated?.(updated);



      setMessage("Complaint resolved successfully!");



      setMessageType("success");



    } catch (error) {



      console.error("Resolve complaint error:", error);



      setMessage(error.message || "Failed to resolve complaint.");



      setMessageType("error");



    } finally {



      setSavingId("");



    }



  };







  const statusColor = status => ({



    "IN REVIEW": { bg: "#fef3c7", color: "#92400e" },



    RESOLVED: { bg: "#dcfce7", color: "#166534" },



    REJECTED: { bg: "#fee2e2", color: "#991b1b" },



  }[String(status || "IN REVIEW").toUpperCase()] || { bg: "#fef3c7", color: "#92400e" });







  return <div className="admin-table-wrap">



    <h2 style={{ marginTop: 0 }}>Customer Complaints ({items.length})</h2>



    {message && <p role="status" style={{ padding: 12, borderRadius: 8, background: messageType === "success" ? "#dcfce7" : "#fee2e2", color: messageType === "success" ? "#166534" : "#991b1b" }}>{message}</p>}



    {items.length === 0 ? <Empty text="No complaints found." /> : <div style={{ display: "grid", gap: 18 }}>



      {items.map(complaint => {



        const booking = complaint.bookingId && typeof complaint.bookingId === "object" ? complaint.bookingId : null;



        const bookingId = complaint.bookingCode || booking?.bookingCode || booking?._id || complaint.bookingId || complaint.booking?._id || "Not available";



        const customer = complaint.customerId && typeof complaint.customerId === "object" ? complaint.customerId : null;



        const color = statusColor(complaint.status);



        return <div key={complaint._id} style={{ border: "1px solid #EADCCF", borderRadius: 14, padding: 20, background: "#fff" }}>



          <div style={s.complaintHeader}>



            <h3 style={{ margin: 0, color: "#2B1B14" }}>{complaint.complaintType || complaint.service || "Customer Complaint"}</h3>



            <span style={{ background: color.bg, color: color.color, borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>{complaint.status || "IN REVIEW"}</span>



          </div>



          <p style={s.complaintText}><strong>Customer:</strong> {customer?.name || "Not available"} {customer?.email ? `(${customer.email})` : ""}</p>



          <p style={s.complaintText}><strong>Booking ID:</strong> {String(bookingId)}</p>



          <p style={s.complaintText}><strong>Service:</strong> {complaint.service || booking?.service || "Not specified"}</p>



          <p style={{ color: "#49352A", lineHeight: 1.6 }}><strong>Description:</strong> {complaint.description || "No description provided."}</p>



          <div style={{ marginTop: 18 }}>



            <label htmlFor={`complaint-status-${complaint._id}`} style={{ display: "block", marginBottom: 7, fontWeight: 600, fontSize: 13 }}>Status</label>



            <select id={`complaint-status-${complaint._id}`} value={complaint.status || "IN REVIEW"} disabled style={s.complaintSelect}>



              <option value="IN REVIEW">In Review</option><option value="RESOLVED">Resolved</option><option value="REJECTED">Rejected</option>



            </select>



          </div>



          <button type="button" onClick={() => saveComplaint(complaint)} disabled={savingId === complaint._id || complaint.status === "RESOLVED"} style={{ marginTop: 16, padding: "11px 18px", border: 0, borderRadius: 8, background: complaint.status === "RESOLVED" ? "#16a34a" : "#B87943", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: savingId === complaint._id ? 0.6 : 1 }}>



            {savingId === complaint._id ? "Resolving..." : complaint.status === "RESOLVED" ? "Resolved" : "Resolve Complaint"}



          </button>



        </div>;



      })}



    </div>}



  </div>;



}







function ReviewsSection({ reviews, loading, error, search, setSearch, ratingFilter, setRatingFilter, onRefresh }) {



  const query = search.trim().toLowerCase();



  const filtered = reviews.filter(review => {



    const values = [review.customer?.name, review.customer?.email, review.provider?.name, review.service, review.comment];



    return values.some(value => String(value || "").toLowerCase().includes(query)) &&



      (ratingFilter === "ALL" || String(review.rating) === ratingFilter);



  });



  const average = reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";



  const fiveStars = reviews.filter(r => Number(r.rating) === 5).length;



  return <div>



    <div style={s.statsGrid}>



      <StatCard icon={<Star />} title="Total Reviews" value={reviews.length} />



      <StatCard icon={<UserCheck />} title="Average Rating" value={`${average} / 5`} />



      <StatCard icon={<CalendarCheck />} title="5-Star Reviews" value={fiveStars} />



    </div>



    <div style={s.panel}>



      <div style={s.reviewHeader}>



        <div><h2 style={{ margin: 0 }}>Customer Reviews</h2><p style={s.subtitle}>Ratings and feedback shared by customers.</p></div>



        <button type="button" onClick={onRefresh} style={s.primaryButton} disabled={loading}><RefreshCw size={16} />{loading ? "Refreshing..." : "Refresh Reviews"}</button>



      </div>



      {error && <p role="alert" style={s.error}>{error}</p>}



      <div style={s.reviewFilters}>



        <div style={{ position: "relative" }}><Search size={18} style={{ position: "absolute", left: 12, top: 13, color: "#A99789" }} /><input type="search" aria-label="Search reviews" className="review-filter-input" placeholder="Search customer, provider, service..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} /></div>



        <select aria-label="Filter by rating" className="review-filter-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>



          <option value="ALL">All Ratings</option><option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option>



        </select>



      </div>



      {loading && reviews.length === 0 ? <p style={s.subtitle}>Loading reviews...</p> : filtered.length === 0 ? <Empty text={reviews.length === 0 ? "No reviews found yet." : "No reviews match your search or rating filter."} /> :



        <div className="admin-table-wrap" style={{ padding: 0, boxShadow: "none" }}><table style={s.table}><thead><tr><th style={s.th}>Customer</th><th style={s.th}>Service</th><th style={s.th}>Provider</th><th style={s.th}>Rating</th><th style={s.th}>Review</th><th style={s.th}>Date</th></tr></thead><tbody>



          {filtered.map(review => { const rating = Math.max(0, Math.min(5, Number(review.rating) || 0)); return <tr key={review._id}>



            <td style={s.td}><strong>{review.customer?.name || "Customer"}</strong>{review.customer?.email && <div style={{ color: "#A99789", marginTop: 5 }}>{review.customer.email}</div>}</td>



            <td style={s.td}>{review.service || "—"}</td><td style={s.td}>{review.provider?.name || "Provider"}</td>



            <td style={s.td}><span style={s.stars}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span><div style={{ fontSize: 12, marginTop: 4 }}>{rating}/5</div></td>



            <td style={s.reviewComment}>{review.comment || "No written comment"}</td><td style={s.td}>{formatDate(review.createdAt)}</td>



          </tr>; })}



        </tbody></table></div>}



      <p style={s.reviewCount}>Showing {filtered.length} of {reviews.length} reviews.</p>



    </div>



  </div>;



}







function ServicesSection() {

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [editingId, setEditingId] = useState("");

  const [savingId, setSavingId] = useState("");

  const [editForm, setEditForm] = useState({ category: "", serviceName: "", price: "", description: "" });



  const loadServices = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(`${SERVICE_API}/admin/all`);

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || `Unable to load services (${response.status})`);

      setServices(Array.isArray(data.services) ? data.services : []);

    } catch (err) {

      setError(err.message || "Unable to load services. Check that the backend is running.");

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => { loadServices(); }, []);



  const beginEdit = service => {

    setEditingId(service._id);

    setEditForm({ category: service.category || "", serviceName: service.serviceName || "", price: String(service.price ?? ""), description: service.description || "" });

    setNotice(""); setError("");

  };



  const saveEdit = async (event, service) => {

    event.preventDefault();

    const price = Number(editForm.price);

    if (!editForm.category.trim() || !editForm.serviceName.trim() || editForm.price === "" || !Number.isFinite(price) || price < 0) {

      setError("Enter a category, service name and a valid non-negative price."); return;

    }

    try {

      setSavingId(service._id); setError(""); setNotice("");

      const response = await fetch(`${SERVICE_API}/${service._id}`, {

        method: "PUT", headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ category: editForm.category.trim(), serviceName: editForm.serviceName.trim(), price, description: editForm.description.trim() })

      });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || "Could not update service.");

      setServices(previous => previous.map(item => item._id === service._id ? { ...item, ...(data.service || {}), providerId: item.providerId } : item));

      setEditingId(""); setNotice("Service updated successfully.");

    } catch (err) { setError(err.message || "Could not update service."); }

    finally { setSavingId(""); }

  };



  const toggleStatus = async service => {

    const nextStatus = service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {

      setSavingId(service._id); setError(""); setNotice("");

      const response = await fetch(`${SERVICE_API}/${service._id}`, {

        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus })

      });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || "Could not update service status.");

      setServices(previous => previous.map(item => item._id === service._id ? { ...item, status: nextStatus } : item));

      setNotice(`Service marked ${nextStatus.toLowerCase()}.`);

    } catch (err) { setError(err.message || "Could not update service status."); }

    finally { setSavingId(""); }

  };



  const deleteService = async service => {

    if (!window.confirm(`Delete "${service.serviceName}"? This cannot be undone.`)) return;

    try {

      setSavingId(service._id); setError(""); setNotice("");

      const response = await fetch(`${SERVICE_API}/${service._id}`, { method: "DELETE" });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || "Could not delete service.");

      setServices(previous => previous.filter(item => item._id !== service._id));

      if (editingId === service._id) setEditingId("");

      setNotice("Service deleted successfully.");

    } catch (err) { setError(err.message || "Could not delete service."); }

    finally { setSavingId(""); }

  };



  const query = search.trim().toLowerCase();

  const filtered = services.filter(service => {

    const provider = service.providerId && typeof service.providerId === "object" ? service.providerId : {};

    const matchesSearch = [service.serviceName, service.category, provider.name, provider.email, provider.phone].some(value => String(value || "").toLowerCase().includes(query));

    const matchesStatus = statusFilter === "ALL" || String(service.status || "ACTIVE").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;

  });

  const activeCount = services.filter(service => service.status === "ACTIVE").length;

  const inactiveCount = services.length - activeCount;

  const inputStyle = { width: "100%", padding: 10, border: "1px solid #DCCABB", borderRadius: 8, boxSizing: "border-box", marginTop: 5, color: "#0f172a", background: "white" };

  const buttonStyle = { border: 0, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12 };



  return <div>

    <div style={s.statsGrid}>

      <StatCard icon={<Wrench />} title="Total Services" value={services.length} />

      <StatCard icon={<UserCheck />} title="Active Services" value={activeCount} />

      <StatCard icon={<LockKeyhole />} title="Inactive Services" value={inactiveCount} />

    </div>

    <div style={s.panel}>

      <div style={s.reviewHeader}>

        <div><h2 style={{ margin: 0 }}>Services Management</h2><p style={s.subtitle}>View and manage all services offered by providers.</p></div>

        <button type="button" onClick={loadServices} disabled={loading} style={s.primaryButton}><RefreshCw size={16} />{loading ? "Refreshing..." : "Refresh Services"}</button>

      </div>

      {error && <p role="alert" style={s.error}>{error}</p>}

      {notice && <p role="status" style={{ padding: 12, borderRadius: 8, background: "#dcfce7", color: "#166534" }}>{notice}</p>}

      <div style={s.reviewFilters}>

        <div style={{ position: "relative" }}><Search size={18} style={{ position: "absolute", left: 12, top: 14, color: "#A99789" }} /><input className="review-filter-input" style={{ paddingLeft: 40 }} aria-label="Search services" placeholder="Search service, category or provider..." value={search} onChange={event => setSearch(event.target.value)} /></div>

        <select className="review-filter-select" aria-label="Filter service status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>

      </div>

      {loading ? <p style={s.subtitle}>Loading services...</p> : filtered.length === 0 ? <Empty text={services.length ? "No services match your search or filter." : "No services found."} /> :

        <div className="admin-table-wrap" style={{ padding: 0, boxShadow: "none" }}><table style={s.table}>

          <thead><tr><th style={s.th}>Service</th><th style={s.th}>Category</th><th style={s.th}>Provider</th><th style={s.th}>Price</th><th style={s.th}>Status</th><th style={s.th}>Actions</th></tr></thead>

          <tbody>{filtered.map(service => {

            const provider = service.providerId && typeof service.providerId === "object" ? service.providerId : {};

            const isEditing = editingId === service._id; const isSaving = savingId === service._id;

            return <tr key={service._id}>

              <td style={s.td}>{isEditing ? <form onSubmit={event => saveEdit(event, service)} style={{ minWidth: 190 }}>

                <label style={{ fontSize: 12 }}>Service name<input style={inputStyle} value={editForm.serviceName} required onChange={event => setEditForm(p => ({ ...p, serviceName: event.target.value }))} /></label>

                <label style={{ display: "block", fontSize: 12, marginTop: 8 }}>Description<textarea style={inputStyle} rows={2} value={editForm.description} onChange={event => setEditForm(p => ({ ...p, description: event.target.value }))} /></label>

                <div style={{ display: "flex", gap: 7, marginTop: 9 }}><button type="submit" disabled={isSaving} style={{ ...buttonStyle, background: "#B87943", color: "white" }}>{isSaving ? "Saving..." : "Save"}</button><button type="button" onClick={() => setEditingId("")} style={{ ...buttonStyle, background: "#EADCCF", color: "#49352A" }}>Cancel</button></div>

              </form> : <><strong>{service.serviceName || "—"}</strong><div style={{ color: "#A99789", fontSize: 12, marginTop: 5 }}>{service.description || "No description"}</div></>}</td>

              <td style={s.td}>{isEditing ? <label style={{ fontSize: 12 }}>Category<input style={inputStyle} value={editForm.category} required onChange={event => setEditForm(p => ({ ...p, category: event.target.value }))} /></label> : (service.category || "—")}</td>

              <td style={s.td}><strong>{provider.name || "Unknown provider"}</strong><div style={{ fontSize: 12, color: "#8D7768", marginTop: 5 }}>{provider.email || "—"}</div><div style={{ fontSize: 12, color: "#8D7768", marginTop: 3 }}>{provider.phone || ""}</div></td>

              <td style={s.td}>{isEditing ? <label style={{ fontSize: 12 }}>Price (₹)<input type="number" min="0" step="0.01" style={inputStyle} value={editForm.price} required onChange={event => setEditForm(p => ({ ...p, price: event.target.value }))} /></label> : <strong>₹{Number(service.price || 0).toLocaleString("en-IN")}</strong>}</td>

              <td style={s.td}><Badge status={service.status || "ACTIVE"} /></td>

              <td style={s.td}><div style={{ display: "flex", gap: 7, flexWrap: "wrap", minWidth: 145 }}>

                {!isEditing && <button type="button" disabled={isSaving} onClick={() => beginEdit(service)} style={{ ...buttonStyle, background: "#F8EEE3", color: "#3730a3" }}><Pencil size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Edit</button>}

                <button type="button" disabled={isSaving || isEditing} onClick={() => toggleStatus(service)} style={{ ...buttonStyle, background: service.status === "ACTIVE" ? "#fef3c7" : "#dcfce7", color: service.status === "ACTIVE" ? "#92400e" : "#166534" }}>{service.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>

                <button type="button" disabled={isSaving || isEditing} onClick={() => deleteService(service)} style={{ ...buttonStyle, background: "#fee2e2", color: "#991b1b" }}>Delete</button>

              </div></td>

            </tr>;

          })}</tbody>

        </table></div>}

      <p style={s.reviewCount}>Showing {filtered.length} of {services.length} services.</p>

    </div>

  </div>;

}



function AdminProfileSection() {



  const [editing, setEditing] = useState(false);



  const [message, setMessage] = useState("");



  const [profile, setProfile] = useState(() => ({



    name: localStorage.getItem("adminName") || "Homezy Admin",



    email: localStorage.getItem("adminEmail") || "admin@homezy.com",



    phone: localStorage.getItem("adminPhone") || "",



  }));



  const updateField = (field, value) => setProfile(previous => ({ ...previous, [field]: value }));



  const saveProfile = event => {



    event.preventDefault();



    if (!profile.name.trim() || !profile.email.trim()) { setMessage("Name and email are required."); return; }



    localStorage.setItem("adminName", profile.name.trim());



    localStorage.setItem("adminEmail", profile.email.trim());



    localStorage.setItem("adminPhone", profile.phone.trim());



    setProfile(p => ({ ...p, name: p.name.trim(), email: p.email.trim(), phone: p.phone.trim() }));



    setEditing(false);



    setMessage("Profile saved on this browser. This does not update the server account.");



  };



  const cancelEdit = () => {



    setProfile({ name: localStorage.getItem("adminName") || "Homezy Admin", email: localStorage.getItem("adminEmail") || "admin@homezy.com", phone: localStorage.getItem("adminPhone") || "" });



    setEditing(false); setMessage("");



  };



  const labelStyle = { display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#6F594B" };



  return <div style={s.panel}>



    <div style={s.profileHeader}>



      <div style={s.profileAvatar}>{(profile.name.trim()[0] || "A").toUpperCase()}</div>



      <div style={{ flex: 1, minWidth: 180 }}><h2 style={{ margin: "0 0 8px" }}>{profile.name}</h2><p style={{ margin: 0, color: "#8D7768", overflowWrap: "anywhere" }}>{profile.email}</p><span style={s.adminBadge}>ADMINISTRATOR</span></div>



      {!editing && <button type="button" onClick={() => { setMessage(""); setEditing(true); }} style={s.primaryButton}><Pencil size={16} /> Edit Profile</button>}



    </div>



    {message && <p role="status" style={{ padding: 12, borderRadius: 8, background: "#F8EEE3", color: "#2459a9" }}>{message}</p>}



    <form onSubmit={saveProfile}><h3 style={{ marginBottom: 22 }}>Personal Information</h3>



      <div style={s.profileGrid}>



        <div><label style={labelStyle}>Full Name</label><input className="profile-input" value={profile.name} disabled={!editing} required onChange={e => updateField("name", e.target.value)} /></div>



        <div><label style={labelStyle}>Email Address</label><input className="profile-input" type="email" value={profile.email} disabled={!editing} required onChange={e => updateField("email", e.target.value)} /></div>



        <div><label style={labelStyle}>Phone Number</label><input className="profile-input" type="tel" value={profile.phone} disabled={!editing} placeholder="Enter phone number" onChange={e => updateField("phone", e.target.value)} /></div>



      </div>



      {editing && <div style={s.profileActions}><button type="submit" style={s.primaryButton}><Save size={16} /> Save Changes</button><button type="button" onClick={cancelEdit} style={s.secondaryButton}>Cancel</button></div>}



    </form>



    <div style={s.securityPanel}><h3 style={s.securityHeading}><LockKeyhole size={18} /> Account Security</h3><p style={{ color: "#8D7768", lineHeight: 1.6, marginBottom: 0 }}>Password changes are not handled by this profile form.</p></div>



  </div>;



}







function StatCard({ icon, title, value }) {



  return <div style={s.statCard}><div style={s.statIcon}>{icon}</div><div><p style={s.statTitle}>{title}</p><h2 style={s.statValue}>{value ?? 0}</h2></div></div>;



}







function UserTable({ title, users, type }) {



  return <div className="admin-table-wrap"><h2 style={{ marginTop: 0 }}>{title} ({users.length})</h2>



    {users.length === 0 ? <Empty text={`No ${type}s found.`} /> : <table style={s.table}>



      <thead><tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Phone</th><th style={s.th}>Status</th>{type === "provider" && <th style={s.th}>Approval</th>}</tr></thead>



      <tbody>{users.map(user => <tr key={user._id}><td style={s.td}>{user.name || "—"}</td><td style={s.td}>{user.email || "—"}</td><td style={s.td}>{user.phone || "—"}</td><td style={s.td}><Badge status={user.accountStatus || "ACTIVE"} /></td>{type === "provider" && <td style={s.td}><Badge status={user.approvalStatus || "PENDING"} /></td>}</tr>)}</tbody>



    </table>}



  </div>;



}







function BookingTable({ bookings }) {



  return <div className="admin-table-wrap"><h2 style={{ marginTop: 0 }}>All Bookings ({bookings.length})</h2>



    {bookings.length === 0 ? <Empty text="No bookings found." /> : <table style={s.table}>



      <thead><tr><th style={s.th}>Booking ID</th><th style={s.th}>Service</th><th style={s.th}>Customer</th><th style={s.th}>Provider</th><th style={s.th}>Date</th><th style={s.th}>Price</th><th style={s.th}>Status</th></tr></thead>



      <tbody>{bookings.map(b => <tr key={b._id}><td style={s.td}>{b.bookingCode || b._id || "—"}</td><td style={s.td}>{b.service || b.serviceName || "—"}</td><td style={s.td}>{b.customerId?.name || "—"}</td><td style={s.td}>{b.providerId?.name || "—"}</td><td style={s.td}>{formatDate(b.bookingDate)}</td><td style={s.td}>₹{b.price ?? 0}</td><td style={s.td}><Badge status={b.status || "REQUESTED"} /></td></tr>)}</tbody>



    </table>}



  </div>;



}







function Badge({ status }) {



  const value = String(status || "UNKNOWN").toUpperCase().replaceAll("_", " ");



  const good = ["ACTIVE", "APPROVED", "COMPLETED", "RESOLVED"].includes(value);



  const bad = ["BLOCKED", "REJECTED", "CANCELLED"].includes(value);



  return <span style={{ background: good ? "#dcfce7" : bad ? "#fee2e2" : "#fef3c7", color: good ? "#166534" : bad ? "#991b1b" : "#92400e", borderRadius: 20, padding: "5px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{value}</span>;



}







function Empty({ text }) {



  return <p style={{ padding: 25, textAlign: "center", color: "#8D7768" }}>{text}</p>;



}







function formatDate(date) {



  if (!date) return "—";



  const value = new Date(date);



  return Number.isNaN(value.getTime()) ? "—" : value.toLocaleDateString("en-IN");



}







const s = {



  app: { minHeight: "100vh", background: "#F7F1E9", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#2B1B14" },



  brand: { display: "flex", alignItems: "center", gap: 10, padding: "0 12px", marginBottom: 35 },



  brandIcon: { width: 38, height: 38, borderRadius: 10, background: "#C88D59", display: "flex", alignItems: "center", justifyContent: "center", color: "#2B1B14", fontWeight: "bold", fontSize: 20 },



  menuLabel: { color: "#A99789", fontSize: 11, letterSpacing: 1.5, padding: "0 12px" },



  logoutArea: { marginTop: 25, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,.15)" },



  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000 },



  mobileButton: { border: 0, color: "white", background: "transparent", cursor: "pointer" },



  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, marginBottom: 30 },



  heading: { margin: 0, color: "#2B1B14", fontSize: 30 },



  subtitle: { color: "#8D7768", marginTop: 7, lineHeight: 1.6 },



  avatar: { width: 45, height: 45, borderRadius: "50%", background: "#B87943", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 },



  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 18, marginBottom: 30 },



  statCard: { background: "white", borderRadius: 16, padding: 22, boxShadow: "0 10px 24px rgba(73,53,42,.07)", border: "1px solid #EADCCF", display: "flex", alignItems: "center", gap: 15 },



  statIcon: { width: 48, height: 48, borderRadius: 12, background: "#F8EEE3", color: "#B87943", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },



  statTitle: { margin: 0, color: "#8D7768", fontSize: 13 },



  statValue: { margin: "5px 0 0" },



  panel: { background: "white", borderRadius: 16, padding: 28, boxShadow: "0 10px 24px rgba(73,53,42,.07)", border: "1px solid #EADCCF", marginBottom: 20, boxSizing: "border-box" },



  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginTop: 20 },



  quickButton: { border: "1px solid #EADCCF", background: "#FCF9F5", padding: 16, borderRadius: 10, textAlign: "left", cursor: "pointer", color: "#B87943", fontWeight: 700 },



  table: { width: "100%", borderCollapse: "collapse", minWidth: 650 },



  th: { padding: 13, textAlign: "left", background: "#FCF9F5", color: "#6F594B", fontSize: 12, borderBottom: "1px solid #EADCCF", whiteSpace: "nowrap" },



  td: { padding: 14, color: "#6F594B", fontSize: 13, borderBottom: "1px solid #F3E9DF", verticalAlign: "top" },



  profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 },



  primaryButton: { background: "#B87943", color: "#fff", border: 0, borderRadius: 9, padding: "12px 17px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 },



  secondaryButton: { background: "#EADCCF", color: "#49352A", border: 0, borderRadius: 9, padding: "12px 17px", cursor: "pointer" },



  securityPanel: { marginTop: 32, padding: 20, border: "1px solid #EADCCF", borderRadius: 12, background: "#FCF9F5" },



  securityHeading: { display: "flex", alignItems: "center", gap: 8, marginTop: 0 },



  profileAvatar: { width: 76, height: 76, borderRadius: "50%", background: "#B87943", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, flexShrink: 0 },



  adminBadge: { display: "inline-block", marginTop: 10, padding: "5px 10px", borderRadius: 20, background: "#F8EEE3", color: "#C88D59", fontSize: 12, fontWeight: 700 },



  error: { padding: 12, borderRadius: 8, background: "#fee2e2", color: "#991b1b", overflowWrap: "anywhere" },



  reviewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15, marginBottom: 20 },



  reviewFilters: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 22 },



  stars: { color: "#f59e0b", fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" },



  reviewComment: { padding: 14, color: "#6F594B", fontSize: 13, borderBottom: "1px solid #F3E9DF", verticalAlign: "top", minWidth: 200, maxWidth: 350, whiteSpace: "normal", overflowWrap: "anywhere" },



  reviewCount: { marginTop: 16, fontSize: 13, color: "#8D7768" },



  profileHeader: { display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 28 },



  profileActions: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" },



  complaintHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },



  complaintText: { color: "#8D7768", marginBottom: 8, overflowWrap: "anywhere" },



  complaintSelect: { width: "100%", maxWidth: 350, padding: 11, border: "1px solid #DCCABB", borderRadius: 8, background: "#fff" },



};







export default AdminDashboard;
