
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  CalendarCheck,
  MessageSquare,
  User,
  Headphones,
  LogOut,
} from "lucide-react";

function CustomerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const links = [
    {
      to: "/customer",
      label: "Dashboard",
      icon: Home,
      end: true,
    },
    {
      to: "/customer/find-services",
      label: "Find Services",
      icon: Search,
    },
    {
      to: "/customer/bookings",
      label: "My Bookings",
      icon: CalendarCheck,
    },
    {
      to: "/customer/complaints",
      label: "Complaints",
      icon: MessageSquare,
    },
    {
      to: "/customer/profile",
      label: "My Profile",
      icon: User,
    },
    {
      to: "/customer/support",
      label: "Contact & Support",
      icon: Headphones,
    },
  ];

  return (
    <div className="customer-layout">
      <aside className="customer-sidebar">
        <div className="sidebar-logo">
          <Home size={26} />
          <span>Homezy</span>
        </div>

        <nav className="sidebar-menu">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="customer-main">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
