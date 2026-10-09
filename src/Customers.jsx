import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [revenue, setRevenue] = useState("");
  const [status, setStatus] = useState("Active");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  // =========================
  // LOAD CUSTOMERS
  // =========================
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const q = query(
          collection(db, "customers"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setCustomers(data);
      } catch (error) {
        console.log("Ordered query failed:", error);

        try {
          const snapshot = await getDocs(collection(db, "customers"));

          const data = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

          setCustomers(data);
        } catch (err) {
          console.error("Customers load error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // =========================
  // ADD CUSTOMER
  // =========================
  const handleAddCustomer = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("Customer name and email are required.");
      return;
    }

    try {
      const customerData = {
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        revenue: Number(revenue) || 0,
        status,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(db, "customers"),
        customerData
      );

      setCustomers((prev) => [
        {
          id: docRef.id,
          ...customerData,
        },
        ...prev,
      ]);

      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setRevenue("");
      setStatus("Active");
      setShowForm(false);
    } catch (error) {
      console.error("Add customer error:", error);
      alert("Customer add nahi hua. Console check karo.");
    }
  };

  // =========================
  // STATUS UPDATE
  // =========================
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "customers", id), {
        status: newStatus,
      });

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id
            ? { ...customer, status: newStatus }
            : customer
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // =========================
  // DELETE CUSTOMER
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "customers", id));

      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== id)
      );
    } catch (error) {
      console.error("Delete customer error:", error);
      alert("Customer delete nahi hua.");
    }
  };

  // =========================
  // FILTER + SEARCH
  // =========================
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const text = search.toLowerCase();

      const matchesSearch =
        customer.name?.toLowerCase().includes(text) ||
        customer.company?.toLowerCase().includes(text) ||
        customer.email?.toLowerCase().includes(text) ||
        customer.phone?.toLowerCase().includes(text);

      const matchesFilter =
        filter === "All" || customer.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [customers, search, filter]);

  // =========================
  // STATS
  // =========================
  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.revenue || 0),
    0
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="customers-page">
      <style>{`
        .customers-page {
          min-height: calc(100vh - 80px);
          color: #f8fafc;
          animation: customersFade .35s ease;
        }

        @keyframes customersFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .customers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .customers-title h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .customers-title p {
          margin: 7px 0 0;
          color: #9ca3af;
          font-size: 14px;
        }

        .customers-add-btn {
          border: 0;
          border-radius: 12px;
          padding: 12px 18px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          box-shadow: 0 10px 30px rgba(139, 92, 246, .22);
          transition: .2s ease;
        }

        .customers-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 35px rgba(139, 92, 246, .3);
        }

        .customers-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .customer-stat {
          position: relative;
          overflow: hidden;
          padding: 20px;
          border: 1px solid rgba(168, 85, 247, .16);
          border-radius: 16px;
          background: linear-gradient(
            145deg,
            rgba(24, 18, 38, .94),
            rgba(12, 12, 18, .96)
          );
          box-shadow: 0 15px 45px rgba(0,0,0,.18);
        }

        .customer-stat::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          right: -35px;
          top: -35px;
          border-radius: 50%;
          background: rgba(139, 92, 246, .08);
          filter: blur(2px);
        }

        .customer-stat-label {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .customer-stat-value {
          margin-top: 9px;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
        }

        .customers-form {
          margin-bottom: 22px;
          padding: 22px;
          border: 1px solid rgba(168, 85, 247, .2);
          border-radius: 18px;
          background:
            radial-gradient(
              circle at top right,
              rgba(139,92,246,.12),
              transparent 35%
            ),
            rgba(13, 13, 20, .96);
        }

        .customers-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .customers-form-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .customers-close {
          border: 0;
          background: transparent;
          color: #9ca3af;
          font-size: 22px;
          cursor: pointer;
        }

        .customers-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .customers-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .customers-field.full {
          grid-column: 1 / -1;
        }

        .customers-field label {
          color: #a1a1aa;
          font-size: 12px;
          font-weight: 600;
        }

        .customers-field input,
        .customers-field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(168, 85, 247, .18);
          outline: none;
          border-radius: 10px;
          padding: 12px 13px;
          color: white;
          background: rgba(255,255,255,.035);
          transition: .2s ease;
        }

        .customers-field input:focus,
        .customers-field select:focus {
          border-color: rgba(168,85,247,.65);
          box-shadow: 0 0 0 3px rgba(139,92,246,.1);
        }

        .customers-field select option {
          background: #17131f;
          color: white;
        }

        .customers-submit {
          margin-top: 18px;
          border: 0;
          border-radius: 10px;
          padding: 12px 20px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
        }

        .customers-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .customers-search {
          flex: 1;
          position: relative;
        }

        .customers-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 15px;
          border-radius: 12px;
          border: 1px solid rgba(168,85,247,.15);
          background: rgba(15,15,22,.92);
          color: white;
          outline: none;
        }

        .customers-search input:focus {
          border-color: rgba(168,85,247,.55);
        }

        .customers-filter {
          display: flex;
          gap: 7px;
          padding: 5px;
          border: 1px solid rgba(168,85,247,.14);
          border-radius: 12px;
          background: rgba(15,15,22,.92);
        }

        .customers-filter button {
          border: 0;
          border-radius: 8px;
          padding: 9px 13px;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .customers-filter button.active {
          color: white;
          background: rgba(139,92,246,.2);
        }

        .customers-list {
          overflow: hidden;
          border: 1px solid rgba(168,85,247,.15);
          border-radius: 18px;
          background: rgba(13,13,20,.96);
        }

        .customers-list-header {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .customers-list-header h2 {
          margin: 0;
          font-size: 17px;
        }

        .customers-list-header span {
          color: #71717a;
          font-size: 12px;
        }

        .customer-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1.4fr 1fr .9fr 90px;
          align-items: center;
          gap: 15px;
          padding: 17px 20px;
          border-bottom: 1px solid rgba(255,255,255,.045);
          transition: .2s ease;
        }

        .customer-row:last-child {
          border-bottom: 0;
        }

        .customer-row:hover {
          background: rgba(139,92,246,.045);
        }

        .customer-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .customer-avatar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: white;
          font-weight: 800;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          box-shadow: 0 8px 20px rgba(139,92,246,.2);
        }

        .customer-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 700;
          color: #f8fafc;
        }

        .customer-company {
          margin-top: 3px;
          color: #71717a;
          font-size: 11px;
        }

        .customer-contact {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #a1a1aa;
          font-size: 13px;
        }

        .customer-revenue {
          font-weight: 700;
          color: #e9d5ff;
        }

        .customer-status {
          border: 0;
          outline: none;
          border-radius: 20px;
          padding: 7px 10px;
          color: white;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          background: rgba(34,197,94,.13);
        }

        .customer-status.inactive {
          background: rgba(239,68,68,.12);
          color: #fca5a5;
        }

        .customer-delete {
          border: 1px solid rgba(239,68,68,.14);
          border-radius: 8px;
          padding: 8px 10px;
          color: #fca5a5;
          background: rgba(239,68,68,.06);
          cursor: pointer;
        }

        .customer-delete:hover {
          background: rgba(239,68,68,.13);
        }

        .customers-empty {
          padding: 60px 20px;
          text-align: center;
          color: #71717a;
        }

        .customers-empty-icon {
          font-size: 38px;
          margin-bottom: 12px;
        }

        .customers-empty h3 {
          margin: 0 0 7px;
          color: #d4d4d8;
        }

        .customers-empty p {
          margin: 0;
          font-size: 13px;
        }

        .customers-footer {
          margin-top: 18px;
          padding: 14px 18px;
          border: 1px solid rgba(168,85,247,.13);
          border-radius: 12px;
          color: #8b8b95;
          font-size: 12px;
          background: rgba(139,92,246,.035);
        }

        @media (max-width: 1100px) {
          .customers-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .customer-row {
            grid-template-columns: 1.5fr 1.2fr 1.3fr 1fr;
          }

          .customer-row > :nth-child(5),
          .customer-row > :nth-child(6) {
            display: none;
          }
        }

        @media (max-width: 750px) {
          .customers-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .customers-stats {
            grid-template-columns: 1fr;
          }

          .customers-form-grid {
            grid-template-columns: 1fr;
          }

          .customers-field.full {
            grid-column: auto;
          }

          .customers-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .customers-filter {
            overflow-x: auto;
          }

          .customer-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .customer-row > :nth-child(5),
          .customer-row > :nth-child(6) {
            display: block;
          }

          .customer-delete {
            width: fit-content;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="customers-header">
        <div className="customers-title">
          <h1>Customers</h1>
          <p>Manage customers, relationships and revenue in one place.</p>
        </div>

        <button
          className="customers-add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Add Customer"}
        </button>
      </div>

      {/* STATS */}
      <div className="customers-stats">
        <div className="customer-stat">
          <div className="customer-stat-label">Total Customers</div>
          <div className="customer-stat-value">
            {totalCustomers}
          </div>
        </div>

        <div className="customer-stat">
          <div className="customer-stat-label">Active</div>
          <div className="customer-stat-value">
            {activeCustomers}
          </div>
        </div>

        <div className="customer-stat">
          <div className="customer-stat-label">Inactive</div>
          <div className="customer-stat-value">
            {inactiveCustomers}
          </div>
        </div>

        <div className="customer-stat">
          <div className="customer-stat-label">Total Revenue</div>
          <div className="customer-stat-value">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <form className="customers-form" onSubmit={handleAddCustomer}>
          <div className="customers-form-header">
            <h2>Add New Customer</h2>

            <button
              type="button"
              className="customers-close"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
          </div>

          <div className="customers-form-grid">
            <div className="customers-field">
              <label>Customer Name *</label>
              <input
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="customers-field">
              <label>Company</label>
              <input
                type="text"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="customers-field">
              <label>Email *</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="customers-field">
              <label>Phone</label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="customers-field">
              <label>Total Revenue</label>
              <input
                type="number"
                min="0"
                placeholder="50000"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>

            <div className="customers-field">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="customers-submit">
            Save Customer
          </button>
        </form>
      )}

      {/* TOOLBAR */}
      <div className="customers-toolbar">
        <div className="customers-search">
          <input
            type="text"
            placeholder="Search customer, company, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="customers-filter">
          {["All", "Active", "Inactive"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMER LIST */}
      <div className="customers-list">
        <div className="customers-list-header">
          <h2>Customer Management</h2>
          <span>
            {filteredCustomers.length} customer
            {filteredCustomers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="customers-empty">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="customers-empty">
            <div className="customers-empty-icon">👥</div>
            <h3>No customers found</h3>
            <p>
              Add your first customer to start managing your
              customer database.
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const initials = customer.name
              ? customer.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "CU";

            return (
              <div className="customer-row" key={customer.id}>
                <div className="customer-main">
                  <div className="customer-avatar">
                    {initials}
                  </div>

                  <div>
                    <div className="customer-name">
                      {customer.name}
                    </div>

                    <div className="customer-company">
                      {customer.company || "Independent Customer"}
                    </div>
                  </div>
                </div>

                <div className="customer-contact">
                  {customer.email || "No email"}
                </div>

                <div className="customer-contact">
                  {customer.phone || "No phone"}
                </div>

                <div className="customer-revenue">
                  {formatCurrency(customer.revenue)}
                </div>

                <select
                  className={`customer-status ${
                    customer.status === "Inactive"
                      ? "inactive"
                      : ""
                  }`}
                  value={customer.status || "Active"}
                  onChange={(e) =>
                    handleStatusChange(
                      customer.id,
                      e.target.value
                    )
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button
                  className="customer-delete"
                  onClick={() => handleDelete(customer.id)}
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="customers-footer">
        ✨ Customer data is stored securely in your Firebase
        Firestore database and synced with your Business OS.
      </div>
    </div>
  );
}