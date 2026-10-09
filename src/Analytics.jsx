import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

function Analytics() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    const unsubLeads = onSnapshot(
      collection(db, "leads"),
      (snapshot) => {
        setLeads(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error("Analytics leads error:", error);
      }
    );

    const unsubCustomers = onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        setCustomers(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(
          "Analytics customers error:",
          error
        );
      }
    );

    const unsubInvoices = onSnapshot(
      collection(db, "invoices"),
      (snapshot) => {
        setInvoices(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(
          "Analytics invoices error:",
          error
        );
      }
    );

    const unsubFollowUps = onSnapshot(
      collection(db, "followUps"),
      (snapshot) => {
        setFollowUps(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(
          "Analytics follow-ups error:",
          error
        );
      }
    );

    return () => {
      unsubLeads();
      unsubCustomers();
      unsubInvoices();
      unsubFollowUps();
    };
  }, []);

  const analytics = useMemo(() => {
    const totalLeads = leads.length;

    const hotLeads = leads.filter(
      (lead) => lead.status === "Hot"
    ).length;

    const warmLeads = leads.filter(
      (lead) => lead.status === "Warm"
    ).length;

    const coldLeads = leads.filter(
      (lead) => lead.status === "Cold"
    ).length;

    const totalCustomers = customers.length;

    const activeCustomers = customers.filter(
      (customer) =>
        customer.status === "Active"
    ).length;

    const totalInvoices = invoices.length;

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.amount ||
            invoice.total ||
            invoice.paidAmount ||
            0
        ),
      0
    );

    const paidRevenue = invoices
      .filter(
        (invoice) => invoice.status === "Paid"
      )
      .reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.amount ||
              invoice.total ||
              invoice.paidAmount ||
              0
          ),
        0
      );

    const pendingRevenue = invoices
      .filter(
        (invoice) =>
          invoice.status === "Pending"
      )
      .reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.amount ||
              invoice.total ||
              invoice.paidAmount ||
              0
          ),
        0
      );

    const overdueRevenue = invoices
      .filter(
        (invoice) =>
          invoice.status === "Overdue"
      )
      .reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.amount ||
              invoice.total ||
              invoice.paidAmount ||
              0
          ),
        0
      );

    const pendingFollowUps =
      followUps.filter(
        (item) => item.status === "Pending"
      ).length;

    const completedFollowUps =
      followUps.filter(
        (item) => item.status === "Completed"
      ).length;

    const highPriorityFollowUps =
      followUps.filter(
        (item) => item.priority === "High"
      ).length;

    const conversionRate =
      totalLeads > 0
        ? Math.round(
            (hotLeads / totalLeads) * 100
          )
        : 0;

    const averageInvoice =
      totalInvoices > 0
        ? Math.round(
            totalRevenue / totalInvoices
          )
        : 0;

    return {
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      totalCustomers,
      activeCustomers,
      totalInvoices,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      overdueRevenue,
      pendingFollowUps,
      completedFollowUps,
      highPriorityFollowUps,
      conversionRate,
      averageInvoice,
    };
  }, [
    leads,
    customers,
    invoices,
    followUps,
  ]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const maxLeadValue = Math.max(
    analytics.hotLeads,
    analytics.warmLeads,
    analytics.coldLeads,
    1
  );

  const leadBars = [
    {
      label: "Hot",
      value: analytics.hotLeads,
      className: "hot-bar",
    },
    {
      label: "Warm",
      value: analytics.warmLeads,
      className: "warm-bar",
    },
    {
      label: "Cold",
      value: analytics.coldLeads,
      className: "cold-bar",
    },
  ];

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>

          <p>
            Business performance and insights
          </p>
        </div>

        <div className="analytics-live">
          <span></span>
          Live Data
        </div>
      </div>

      {/* TOP STATS */}

      <div className="analytics-stats">

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon purple">
            ◈
          </div>

          <div>
            <span>Total Leads</span>
            <strong>
              {analytics.totalLeads}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon blue">
            ♙
          </div>

          <div>
            <span>Customers</span>
            <strong>
              {analytics.totalCustomers}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon green">
            ₹
          </div>

          <div>
            <span>Revenue</span>
            <strong>
              {formatMoney(
                analytics.totalRevenue
              )}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon orange">
            %
          </div>

          <div>
            <span>Hot Lead Rate</span>
            <strong>
              {analytics.conversionRate}%
            </strong>
          </div>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="analytics-grid">

        {/* LEAD PIPELINE */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Lead Pipeline</h2>
              <p>
                Current lead distribution
              </p>
            </div>

            <div className="analytics-card-icon">
              ◈
            </div>
          </div>

          <div className="lead-chart">

            {leadBars.map((item) => (
              <div
                className="lead-chart-row"
                key={item.label}
              >
                <div className="lead-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>

                <div className="lead-track">
                  <div
                    className={`lead-fill ${item.className}`}
                    style={{
                      width: `${
                        (item.value /
                          maxLeadValue) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}

          </div>

          <div className="pipeline-total">
            <span>Total Pipeline</span>

            <strong>
              {analytics.totalLeads} leads
            </strong>
          </div>

        </div>

        {/* REVENUE */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Revenue Overview</h2>
              <p>
                Invoice performance
              </p>
            </div>

            <div className="analytics-card-icon">
              ₹
            </div>
          </div>

          <div className="revenue-main">
            <span>Total Revenue</span>

            <strong>
              {formatMoney(
                analytics.totalRevenue
              )}
            </strong>
          </div>

          <div className="revenue-list">

            <div className="revenue-row">
              <div>
                <span className="dot paid"></span>
                Paid
              </div>

              <strong>
                {formatMoney(
                  analytics.paidRevenue
                )}
              </strong>
            </div>

            <div className="revenue-row">
              <div>
                <span className="dot pending"></span>
                Pending
              </div>

              <strong>
                {formatMoney(
                  analytics.pendingRevenue
                )}
              </strong>
            </div>

            <div className="revenue-row">
              <div>
                <span className="dot overdue"></span>
                Overdue
              </div>

              <strong>
                {formatMoney(
                  analytics.overdueRevenue
                )}
              </strong>
            </div>

          </div>

          <div className="average-invoice">
            <span>Average Invoice Value</span>

            <strong>
              {formatMoney(
                analytics.averageInvoice
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* SECOND GRID */}

      <div className="analytics-grid">

        {/* CUSTOMER ANALYTICS */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Customer Analytics</h2>

              <p>
                Customer database overview
              </p>
            </div>

            <div className="analytics-card-icon">
              ♙
            </div>
          </div>

          <div className="customer-analysis">

            <div className="analysis-box">
              <span>Total Customers</span>

              <strong>
                {analytics.totalCustomers}
              </strong>
            </div>

            <div className="analysis-box">
              <span>Active Customers</span>

              <strong className="green-text">
                {analytics.activeCustomers}
              </strong>
            </div>

            <div className="analysis-box">
              <span>Inactive</span>

              <strong className="gray-text">
                {Math.max(
                  analytics.totalCustomers -
                    analytics.activeCustomers,
                  0
                )}
              </strong>
            </div>

          </div>

          <div className="customer-progress">

            <div className="progress-header">
              <span>Customer Activity</span>

              <strong>
                {analytics.totalCustomers > 0
                  ? Math.round(
                      (analytics.activeCustomers /
                        analytics.totalCustomers) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    analytics.totalCustomers > 0
                      ? Math.round(
                          (analytics.activeCustomers /
                            analytics.totalCustomers) *
                            100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>

          </div>

        </div>

        {/* FOLLOW-UP ANALYTICS */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>Follow-Up Analytics</h2>

              <p>
                Customer engagement
              </p>
            </div>

            <div className="analytics-card-icon">
              ◷
            </div>
          </div>

          <div className="follow-analysis">

            <div className="follow-box">
              <span>Pending</span>

              <strong className="orange-text">
                {analytics.pendingFollowUps}
              </strong>
            </div>

            <div className="follow-box">
              <span>Completed</span>

              <strong className="green-text">
                {analytics.completedFollowUps}
              </strong>
            </div>

            <div className="follow-box">
              <span>High Priority</span>

              <strong className="purple-text">
                {analytics.highPriorityFollowUps}
              </strong>
            </div>

          </div>

          <div className="follow-summary">

            <div className="summary-icon">
              ✦
            </div>

            <div>
              <strong>
                Follow-up activity
              </strong>

              <p>
                Keep your pending follow-ups
                updated to improve customer
                engagement.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* PERFORMANCE */}

      <div className="analytics-card performance-card">

        <div className="analytics-card-header">

          <div>
            <h2>Business Performance</h2>

            <p>
              Key metrics from your Business OS
            </p>
          </div>

          <div className="performance-badge">
            AI Ready
          </div>

        </div>

        <div className="performance-grid">

          <div className="performance-item">
            <span>Lead Conversion</span>

            <strong>
              {analytics.conversionRate}%
            </strong>

            <small>
              Hot leads / total leads
            </small>
          </div>

          <div className="performance-item">
            <span>Invoice Collection</span>

            <strong>
              {analytics.totalRevenue > 0
                ? Math.round(
                    (analytics.paidRevenue /
                      analytics.totalRevenue) *
                      100
                  )
                : 0}
              %
            </strong>

            <small>
              Paid revenue / total revenue
            </small>
          </div>

          <div className="performance-item">
            <span>Average Invoice</span>

            <strong>
              {formatMoney(
                analytics.averageInvoice
              )}
            </strong>

            <small>
              Revenue per invoice
            </small>
          </div>

          <div className="performance-item">
            <span>Pending Work</span>

            <strong>
              {analytics.pendingFollowUps}
            </strong>

            <small>
              Follow-ups requiring action
            </small>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;