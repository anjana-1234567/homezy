import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAnalytics() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin?section=Analytics", { replace: true });
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF8F5",
        color: "#8D7768",
        fontSize: 16,
      }}
    >
      <p>Loading Homezy Analytics...</p>
    </div>
  );
}