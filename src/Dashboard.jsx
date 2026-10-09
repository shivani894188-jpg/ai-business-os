import React from "react";
import "./Dashboard.css";

const Dashboard = ({
  stats = {
    customers: 0,
    leads: 0,
    followUps: 0,
    revenue: 0,
  },
  leads = [],
  customers = [],
  formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`,
  setActivePage,
}) => {
  const qualifiedLeads = leads.filter(
    (lead) =>
      lead.status === "Hot" ||
      lead.status === "Warm"
  ).length;

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back, Shivani! Here's what's happening
            with your business today.
          </p>
        </div>

        <button className="date-button">
          <span>▣</span>
          Last 30 days
          <span>⌄</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="dashboard-stats">

        <div className="dashboard-stat-card">
          <div className="stat-icon purple">♙</div>

          <div className="stat-content">
            <span>Total Customers</span>
            <strong>{stats.customers}</strong>
            <small className="growth">↑ 12%</small>
            <em>vs. last 30 days</em>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon teal">♧</div>

          <div className="stat-content">
            <span>New Leads</span>
            <strong>{stats.leads}</strong>
            <small className="growth">↑ 18%</small>
            <em>vs. last 30 days</em>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon violet">◷</div>

          <div className="stat-content">
            <span>Follow-ups Due</span>
            <strong>{stats.followUps}</strong>
            <small className="growth">↑ 6%</small>
            <em>vs. last 30 days</em>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon purple">₹</div>

          <div className="stat-content">
            <span>Total Revenue</span>
            <strong>{formatMoney(stats.revenue)}</strong>
            <small className="growth">↑ 22%</small>
            <em>vs. last 30 days</em>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="dashboard-main-grid">

        {/* CUSTOMER PIPELINE */}
        <div className="dashboard-panel pipeline-panel">

          <div className="panel-header">
            <div>
              <span className="panel-icon">◇</span>
              <h2>Customer Pipeline</h2>
            </div>

            <button
              onClick={() => setActivePage?.("leads")}
            >
              View Details →
            </button>
          </div>

          <div className="pipeline-content">

            <div className="pipeline-bars">
              <div className="pipeline-bar bar-1">
                <span />
              </div>

              <div className="pipeline-bar bar-2">
                <span />
              </div>

              <div className="pipeline-bar bar-3">
                <span />
              </div>

              <div className="pipeline-bar bar-4">
                <span />
              </div>

              <div className="pipeline-bar bar-5">
                <span />
              </div>
            </div>

            <div className="pipeline-list">

              <div>
                <span>New Leads</span>
                <strong>{stats.leads}</strong>
                <small>
                  {stats.leads ? "34.7%" : "0%"}
                </small>
              </div>

              <div>
                <span>Contacted</span>
                <strong>
                  {Math.round(stats.leads * 0.72)}
                </strong>
                <small>25.0%</small>
              </div>

              <div>
                <span>Qualified</span>
                <strong>{qualifiedLeads}</strong>
                <small>19.4%</small>
              </div>

              <div>
                <span>Proposal</span>
                <strong>
                  {Math.round(stats.leads * 0.33)}
                </strong>
                <small>11.3%</small>
              </div>

              <div>
                <span>Closed Won</span>
                <strong>
                  {Math.round(stats.leads * 0.28)}
                </strong>
                <small>9.7%</small>
              </div>

            </div>
          </div>
        </div>

        {/* SALES CHART */}
        <div className="dashboard-panel sales-panel">

          <div className="panel-header">

            <div>
              <span className="panel-icon">◈</span>
              <h2>Sales & Revenue Overview</h2>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-purple"></i>
                Revenue
              </span>

              <span>
                <i className="legend-blue"></i>
                Customers
              </span>
            </div>

          </div>

          <div className="sales-chart">

            <div className="chart-y-labels">
              <span>₹ 1.2L</span>
              <span>₹ 90K</span>
              <span>₹ 60K</span>
              <span>₹ 30K</span>
              <span>₹ 0</span>
            </div>

            <svg
              viewBox="0 0 600 260"
              className="chart-svg"
            >

              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8b5cf6"
                    stopOpacity="0.35"
                  />

                  <stop
                    offset="100%"
                    stopColor="#8b5cf6"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <path
                d="
                  M0 190
                  L40 165
                  L80 180
                  L120 140
                  L160 155
                  L200 150
                  L240 100
                  L280 125
                  L320 95
                  L360 110
                  L400 75
                  L440 105
                  L480 70
                  L520 95
                  L560 55
                  L600 15
                  L600 260
                  L0 260
                  Z
                "
                fill="url(#revenueGradient)"
              />

              <path
                d="
                  M0 190
                  L40 165
                  L80 180
                  L120 140
                  L160 155
                  L200 150
                  L240 100
                  L280 125
                  L320 95
                  L360 110
                  L400 75
                  L440 105
                  L480 70
                  L520 95
                  L560 55
                  L600 15
                "
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="4"
              />

              <path
                d="
                  M0 220
                  L40 200
                  L80 215
                  L120 190
                  L160 200
                  L200 185
                  L240 175
                  L280 185
                  L320 165
                  L360 170
                  L400 150
                  L440 160
                  L480 135
                  L520 145
                  L560 120
                  L600 105
                "
                fill="none"
                stroke="#22a6f2"
                strokeWidth="4"
              />

            </svg>

            <div className="chart-x-labels">
              <span>Aug 24</span>
              <span>Aug 31</span>
              <span>Sep 7</span>
              <span>Sep 14</span>
              <span>Sep 21</span>
            </div>

          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="dashboard-panel activity-panel">

          <div className="panel-header">
            <div>
              <span className="panel-icon">◉</span>
              <h2>Recent Customer Activity</h2>
            </div>

            <button
              onClick={() => setActivePage?.("leads")}
            >
              View All →
            </button>
          </div>

          <div className="activity-list">

            {leads.length === 0 ? (
              <div className="activity-empty">
                No recent activity yet.
              </div>
            ) : (
              leads.slice(0, 5).map((lead, index) => (
                <div
                  className="activity-item"
                  key={lead.id || index}
                >

                  <div className="activity-avatar">
                    {String(lead.name || "L")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="activity-info">
                    <strong>
                      {lead.name || "Unknown Customer"}
                    </strong>

                    <span>
                      {lead.message ||
                        "New enquiry received"}
                    </span>
                  </div>

                  <time>Recently</time>

                </div>
              ))
            )}

          </div>
        </div>

      </div>

      {/* CUSTOMER MANAGEMENT */}
      <div className="dashboard-panel customer-management">

        <div className="panel-header">

          <div>
            <span className="panel-icon">♙</span>
            <h2>Customer Management</h2>
          </div>

          <button
            onClick={() => setActivePage?.("customers")}
          >
            View All Customers →
          </button>

        </div>

        <div className="customer-toolbar">

          <div className="customer-search">
            🔍
            <input
              placeholder="Search by name, company, or email..."
            />
          </div>

          <select>
            <option>All Status</option>
          </select>

          <select>
            <option>All Segments</option>
          </select>

          <button
            className="add-customer-button"
            onClick={() => setActivePage?.("customers")}
          >
            + Add Customer
          </button>

        </div>

        <div className="customer-table-wrapper">

          <table className="customer-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th>Next Follow-up</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="table-empty"
                  >
                    No customers added yet.
                  </td>
                </tr>
              ) : (
                customers.slice(0, 5).map(
                  (customer, index) => (
                    <tr
                      key={customer.id || index}
                    >

                      <td>
                        <div className="table-name">

                          <div className="table-avatar">
                            {String(customer.name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {customer.name || "Customer"}
                            </strong>

                            <span>
                              {customer.email || "No email"}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        {customer.company || "—"}
                      </td>

                      <td>
                        <span className="status-pill">
                          {customer.status || "New Lead"}
                        </span>
                      </td>

                      <td>Recently</td>

                      <td>—</td>

                      <td>
                        {formatMoney(
                          Number(customer.value || 0)
                        )}
                      </td>

                      <td>⋯</td>

                    </tr>
                  )
                )
              )}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;