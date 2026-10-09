import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";

import LeadRecovery from "./LeadRecovery";
import InvoiceCollection from "./InvoiceCollection";
import Customers from "./Customers";
import FollowUps from "./FollowUps";
import AIAssistant from "./AIAssistant";
import Compliance from "./Compliance";
import Analytics from "./Analytics";
import Settings from "./Settings";
import Dashboard from "./Dashboard";

import "./App.css";

function App() {
  // ==========================================
  // ACTIVE PAGE
  // ==========================================

  const [activePage, setActivePage] = useState("dashboard");

  // ==========================================
  // GLOBAL STATS
  // ==========================================

  const [stats, setStats] = useState({
    customers: 0,
    leads: 0,
    followUps: 0,
    revenue: 0,
  });

  // ==========================================
  // FIREBASE DATA
  // ==========================================

  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // ==========================================
  // FIREBASE - LEADS
  // ==========================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "leads"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLeads(data);

        setStats((prev) => ({
          ...prev,
          leads: data.length,
        }));
      },
      (error) => {
        console.error("Leads Firebase error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================================
  // FIREBASE - CUSTOMERS
  // ==========================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCustomers(data);

        setStats((prev) => ({
          ...prev,
          customers: data.length,
        }));
      },
      (error) => {
        console.error("Customers Firebase error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================================
  // FIREBASE - FOLLOW UPS
  // ==========================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "followUps"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFollowUps(data);

        setStats((prev) => ({
          ...prev,
          followUps: data.length,
        }));
      },
      (error) => {
        console.error("Follow-ups Firebase error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================================
  // FIREBASE - INVOICES
  // ==========================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "invoices"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInvoices(data);

        const totalRevenue = data.reduce(
          (total, invoice) => {
            const amount = Number(
              invoice.amount ||
              invoice.total ||
              invoice.paidAmount ||
              0
            );

            return total + amount;
          },
          0
        );

        setStats((prev) => ({
          ...prev,
          revenue: totalRevenue,
        }));
      },
      (error) => {
        console.error("Invoices Firebase error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigation = [
    {
      id: "dashboard",
      icon: "⌂",
      label: "Dashboard",
    },
    {
      id: "leads",
      icon: "♧",
      label: "Leads",
      count: stats.leads,
    },
    {
      id: "customers",
      icon: "♙",
      label: "Customers",
      count: stats.customers,
    },
    {
      id: "followups",
      icon: "◷",
      label: "Follow-ups",
      count: stats.followUps,
    },
    {
      id: "invoices",
      icon: "▣",
      label: "Invoices",
    },
    {
      id: "analytics",
      icon: "▥",
      label: "Analytics",
    },
    {
      id: "ai",
      icon: "✧",
      label: "AI Assistant",
    },
    {
      id: "settings",
      icon: "⚙",
      label: "Settings",
    },
  ];

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // ==========================================
  // AI ASSISTANT SIDE PANEL
  // ==========================================

  const AIAssistantPanel = () => {
    const hotLeads = leads.filter(
      (lead) => lead.status === "Hot"
    ).length;

    const qualifiedLeads = leads.filter(
      (lead) =>
        lead.status === "Hot" ||
        lead.status === "Warm"
    ).length;

    return (
      <aside className="right-sidebar">

        {/* AI PANEL */}

        <div className="ai-panel">

          <div className="ai-panel-header">

            <div>
              <span className="ai-sparkle">
                ✦
              </span>

              <h3>
                AI Assistant
              </h3>
            </div>

            <span className="beta-badge">
              Beta
            </span>

          </div>

          <div className="ai-insights">

            <p>
              Here are some insights for you:
            </p>

            <ul>

              <li>
                {hotLeads} high-value leads
                haven't been contacted yet.
              </li>

              <li>
                {qualifiedLeads} qualified leads
                are currently in your pipeline.
              </li>

              <li>
                Revenue insights are ready
                based on your recent activity.
              </li>

              <li>
                {stats.customers} customers
                are currently in your system.
              </li>

            </ul>

            <button
              onClick={() =>
                setActivePage("ai")
              }
            >
              View Detailed Report →
            </button>

          </div>

          <button
            className="ai-input"
            onClick={() =>
              setActivePage("ai")
            }
          >

            <span>
              ✧
            </span>

            Ask me anything...

            <b>
              →
            </b>

          </button>

        </div>

        {/* UPCOMING FOLLOW UPS */}

        <div className="upcoming-panel">

          <div className="panel-header">

            <div>

              <span className="panel-icon">
                ◷
              </span>

              <h3>
                Upcoming Follow-ups
              </h3>

            </div>

            <button
              onClick={() =>
                setActivePage("followups")
              }
            >
              View All →
            </button>

          </div>

          <div className="upcoming-list">

            {followUps.length === 0 ? (

              <div className="upcoming-empty">
                No upcoming follow-ups.
              </div>

            ) : (

              followUps
                .slice(0, 5)
                .map((item, index) => (

                  <div
                    className="upcoming-item"
                    key={item.id || index}
                  >

                    <div className="calendar-icon">
                      ◷
                    </div>

                    <div>

                      <strong>
                        {item.name ||
                          item.customerName ||
                          "Customer"}
                      </strong>

                      <span>
                        {item.title ||
                          item.message ||
                          "Follow-up"}
                      </span>

                      <small>
                        {item.date ||
                          item.followUpDate ||
                          "Upcoming"}
                      </small>

                    </div>

                  </div>

                ))

            )}

          </div>

        </div>

      </aside>
    );
  };

  // ==========================================
  // PAGE RENDER
  // ==========================================

  const renderPage = () => {

    // DASHBOARD
    if (activePage === "dashboard") {
      return (
        <Dashboard
          stats={stats}
          leads={leads}
          customers={customers}
          followUps={followUps}
          invoices={invoices}
          formatMoney={formatMoney}
          setActivePage={setActivePage}
        />
      );
    }

    // LEADS
    if (activePage === "leads") {
      return <LeadRecovery />;
    }

    // INVOICES
    if (activePage === "invoices") {
      return <InvoiceCollection />;
    }

    // CUSTOMERS
    if (activePage === "customers") {
      return <Customers />;
    }

    // FOLLOW UPS
    if (activePage === "followups") {
      return <FollowUps />;
    }

    // ANALYTICS
    if (activePage === "analytics") {
      return <Analytics />;
    }

    // AI ASSISTANT
    if (activePage === "ai") {
      return <AIAssistant />;
    }

    // COMPLIANCE
    if (activePage === "compliance") {
      return <Compliance />;
    }

    // SETTINGS
    if (activePage === "settings") {
      return <Settings />;
    }

    return (
      <Dashboard
        stats={stats}
        leads={leads}
        customers={customers}
        followUps={followUps}
        invoices={invoices}
        formatMoney={formatMoney}
        setActivePage={setActivePage}
      />
    );
  };

  // ==========================================
  // APP UI
  // ==========================================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-logo">
            ✦
          </div>

          <div>

            <h2>
              BUSINESS OS
            </h2>

            <span>
              Smarter Operations. Bigger Growth.
            </span>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          {navigation.map((item) => (

            <button
              key={item.id}
              className={
                activePage === item.id
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage(item.id)
              }
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-label">
                {item.label}
              </span>

              {item.count > 0 && (
                <span className="nav-count">
                  {item.count}
                </span>
              )}

            </button>

          ))}

        </nav>

        {/* UPGRADE CARD */}

        <div className="sidebar-upgrade">

          <strong>
            Grow Your Business
          </strong>

          <p>
            Automate. Manage. Scale.
          </p>

          <button>
            ♕ Upgrade Plan
          </button>

        </div>

      </aside>

      {/* MAIN AREA */}

      <div className="app-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="global-search">

            <span>
              ⌕
            </span>

            <input
              placeholder="Search customers, leads, or anything..."
            />

            <kbd>
              ⌘ K
            </kbd>

          </div>

          <div className="topbar-actions">

            <button>
              ♧
            </button>

            <button>
              ☾
            </button>

            <div className="topbar-divider"></div>

            <div className="profile">

              <div className="profile-avatar">
                S
              </div>

              <div>

                <strong>
                  Shivani
                </strong>

                <span>
                  Administrator
                </span>

              </div>

              <span>
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="main-content">
          {renderPage()}
        </main>

      </div>

      {/* RIGHT PANEL */}

      {activePage === "dashboard" && (
        <AIAssistantPanel />
      )}

    </div>
  );
}

export default App;