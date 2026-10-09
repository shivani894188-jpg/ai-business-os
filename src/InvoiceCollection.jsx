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

function InvoiceCollection() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // ==========================================
  // LOAD INVOICES
  // ==========================================

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);

        const invoiceQuery = query(
          collection(db, "invoices"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(invoiceQuery);

        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setInvoices(data);
      } catch (error) {
        console.error("Load invoices error:", error);

        try {
          const snapshot = await getDocs(
            collection(db, "invoices")
          );

          const data = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

          setInvoices(data);
        } catch (fallbackError) {
          console.error(
            "Fallback invoices error:",
            fallbackError
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  // ==========================================
  // ADD INVOICE
  // ==========================================

  const handleAddInvoice = async (event) => {
    event.preventDefault();

    const cleanCustomer = customer.trim();
    const cleanEmail = email.trim();
    const cleanAmount = Number(amount);

    if (
      !cleanCustomer ||
      !cleanEmail ||
      !cleanAmount ||
      cleanAmount <= 0 ||
      !dueDate
    ) {
      alert("Please fill all invoice details.");
      return;
    }

    const newInvoice = {
      invoiceNumber: `INV-${Date.now()
        .toString()
        .slice(-6)}`,
      customer: cleanCustomer,
      email: cleanEmail,
      amount: cleanAmount,
      dueDate,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(
        collection(db, "invoices"),
        newInvoice
      );

      setInvoices((previous) => [
        {
          id: docRef.id,
          ...newInvoice,
        },
        ...previous,
      ]);

      setCustomer("");
      setEmail("");
      setAmount("");
      setDueDate("");

      alert("Invoice created successfully!");
    } catch (error) {
      console.error(
        "Add invoice error:",
        error
      );

      alert(
        "Failed to create invoice. Check Firebase rules."
      );
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange = async (
    invoiceId,
    newStatus
  ) => {
    try {
      await updateDoc(
        doc(db, "invoices", invoiceId),
        {
          status: newStatus,
        }
      );

      setInvoices((previous) =>
        previous.map((invoice) =>
          invoice.id === invoiceId
            ? {
                ...invoice,
                status: newStatus,
              }
            : invoice
        )
      );
    } catch (error) {
      console.error(
        "Update invoice error:",
        error
      );

      alert("Failed to update invoice.");
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (invoiceId) => {
    const confirmed = window.confirm(
      "Delete this invoice?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "invoices", invoiceId)
      );

      setInvoices((previous) =>
        previous.filter(
          (invoice) =>
            invoice.id !== invoiceId
        )
      );
    } catch (error) {
      console.error(
        "Delete invoice error:",
        error
      );

      alert("Failed to delete invoice.");
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredInvoices = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return invoices.filter((invoice) => {
      const invoiceCustomer =
        String(
          invoice.customer || ""
        ).toLowerCase();

      const invoiceEmail =
        String(
          invoice.email || ""
        ).toLowerCase();

      const invoiceNumber =
        String(
          invoice.invoiceNumber || ""
        ).toLowerCase();

      const invoiceStatus =
        String(
          invoice.status || ""
        ).toLowerCase();

      const matchesSearch =
        !value ||
        invoiceCustomer.includes(value) ||
        invoiceEmail.includes(value) ||
        invoiceNumber.includes(value);

      const matchesFilter =
        filter === "All" ||
        invoiceStatus ===
          filter.toLowerCase();

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [invoices, search, filter]);

  // ==========================================
  // STATS
  // ==========================================

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.amount || 0),
    0
  );

  const paidAmount = invoices
    .filter(
      (invoice) =>
        invoice.status === "Paid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const pendingAmount = invoices
    .filter(
      (invoice) =>
        invoice.status === "Pending"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const overdueAmount = invoices
    .filter(
      (invoice) =>
        invoice.status === "Overdue"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="invoice-page">

      {/* HEADER */}

      <div className="invoice-page-header">

        <div>
          <div className="invoice-eyebrow">
            BUSINESS OS / FINANCE
          </div>

          <h1>
            Invoice Collection
          </h1>

          <p>
            Create invoices, track payments and
            recover outstanding balances.
          </p>
        </div>

        <div className="invoice-header-actions">

          <div className="invoice-total-badge">
            <span>₹</span>
            {formatCurrency(
              totalAmount
            )}
          </div>

          <button
            className="invoice-primary-button"
            onClick={() =>
              document
                .getElementById(
                  "create-invoice-form"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            + Create Invoice
          </button>

        </div>

      </div>

      {/* KPI */}

      <div className="invoice-kpi-grid">

        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon purple">
            ₹
          </div>

          <div>
            <span>Total Invoiced</span>

            <strong>
              {formatCurrency(
                totalAmount
              )}
            </strong>

            <small>
              Across all invoices
            </small>
          </div>

        </div>

        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon green">
            ✓
          </div>

          <div>
            <span>Collected</span>

            <strong>
              {formatCurrency(
                paidAmount
              )}
            </strong>

            <small className="positive">
              Successfully paid
            </small>
          </div>

        </div>

        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon yellow">
            ◷
          </div>

          <div>
            <span>Pending</span>

            <strong>
              {formatCurrency(
                pendingAmount
              )}
            </strong>

            <small>
              Awaiting payment
            </small>
          </div>

        </div>

        <div className="invoice-kpi-card">

          <div className="invoice-kpi-icon red">
            !
          </div>

          <div>
            <span>Overdue</span>

            <strong>
              {formatCurrency(
                overdueAmount
              )}
            </strong>

            <small className="danger">
              Requires attention
            </small>
          </div>

        </div>

      </div>

      {/* MAIN */}

      <div className="invoice-content-grid">

        {/* CREATE INVOICE */}

        <div
          className="invoice-form-panel"
          id="create-invoice-form"
        >

          <div className="invoice-panel-header">

            <div>
              <span className="invoice-panel-icon">
                ₹
              </span>

              <div>
                <h2>
                  Create Invoice
                </h2>

                <p>
                  Add a new customer invoice.
                </p>
              </div>
            </div>

          </div>

          <form
            className="invoice-form"
            onSubmit={handleAddInvoice}
          >

            <div className="invoice-input-group">

              <label>
                Customer Name
              </label>

              <input
                type="text"
                value={customer}
                onChange={(event) =>
                  setCustomer(
                    event.target.value
                  )
                }
                placeholder="e.g. ABC Solutions"
              />

            </div>

            <div className="invoice-input-group">

              <label>
                Customer Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="customer@example.com"
              />

            </div>

            <div className="invoice-input-row">

              <div className="invoice-input-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="25000"
                />

              </div>

              <div className="invoice-input-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="invoice-ai-note">

              <span>✦</span>

              <div>
                <strong>
                  Automated Collection
                </strong>

                <p>
                  Your Business OS can track
                  pending invoices and identify
                  overdue payments.
                </p>
              </div>

            </div>

            <button
              type="submit"
              className="invoice-submit-button"
            >
              Create Invoice
              <span>→</span>
            </button>

          </form>

        </div>

        {/* INVOICE LIST */}

        <div className="invoice-list-panel">

          <div className="invoice-panel-header">

            <div>
              <span className="invoice-panel-icon">
                ▤
              </span>

              <div>
                <h2>
                  Invoice Management
                </h2>

                <p>
                  {filteredInvoices.length} of{" "}
                  {invoices.length} invoices
                </p>
              </div>
            </div>

          </div>

          {/* TOOLBAR */}

          <div className="invoice-toolbar">

            <div className="invoice-search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search customer or invoice..."
              />

            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="invoice-filter-select"
            >
              <option value="All">
                All
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Overdue">
                Overdue
              </option>
            </select>

          </div>

          {/* LIST */}

          {loading ? (

            <div className="invoice-empty">

              <div className="invoice-loader">
                ◌
              </div>

              <h3>
                Loading invoices...
              </h3>

              <p>
                Fetching finance data from
                Firebase.
              </p>

            </div>

          ) : filteredInvoices.length === 0 ? (

            <div className="invoice-empty">

              <div className="invoice-empty-icon">
                ₹
              </div>

              <h3>
                No invoices found
              </h3>

              <p>
                Create your first invoice to
                start tracking payments.
              </p>

            </div>

          ) : (

            <div className="invoice-list">

              {filteredInvoices.map(
                (invoice) => {

                  const status =
                    invoice.status ||
                    "Pending";

                  const statusClass =
                    status === "Paid"
                      ? "paid"
                      : status ===
                        "Overdue"
                      ? "overdue"
                      : "pending";

                  return (

                    <div
                      className="invoice-row"
                      key={invoice.id}
                    >

                      <div className="invoice-number-icon">
                        ₹
                      </div>

                      <div className="invoice-main-info">

                        <div className="invoice-name-line">

                          <h3>
                            {invoice.customer ||
                              "Unknown Customer"}
                          </h3>

                          <span
                            className={`invoice-status ${statusClass}`}
                          >
                            {status}
                          </span>

                        </div>

                        <p>
                          {invoice.invoiceNumber ||
                            "Invoice"}
                          {" • "}
                          {invoice.email ||
                            "No email"}
                        </p>

                      </div>

                      <div className="invoice-amount">

                        <span>
                          AMOUNT
                        </span>

                        <strong>
                          {formatCurrency(
                            Number(
                              invoice.amount ||
                                0
                            )
                          )}
                        </strong>

                      </div>

                      <div className="invoice-due">

                        <span>
                          DUE
                        </span>

                        <strong>
                          {invoice.dueDate ||
                            "—"}
                        </strong>

                      </div>

                      <select
                        className={`invoice-status-select ${statusClass}`}
                        value={status}
                        onChange={(event) =>
                          handleStatusChange(
                            invoice.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Paid">
                          Paid
                        </option>

                        <option value="Overdue">
                          Overdue
                        </option>
                      </select>

                      <button
                        className="invoice-delete"
                        type="button"
                        onClick={() =>
                          handleDelete(
                            invoice.id
                          )
                        }
                        title="Delete invoice"
                      >
                        ⋯
                      </button>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

      {/* AI FOOTER */}

      <div className="invoice-ai-footer">

        <div className="invoice-footer-icon">
          ✦
        </div>

        <div>
          <strong>
            Smart payment tracking
          </strong>

          <p>
            Monitor pending and overdue
            invoices from your Business OS.
          </p>
        </div>

        <div className="invoice-footer-status">
          <span></span>
          Finance Engine Active
        </div>

      </div>

      {/* PAGE CSS */}

      <style>{`

        .invoice-page {
          width: 100%;
          min-height: 100%;
          color: #eef2f8;
        }

        .invoice-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .invoice-eyebrow {
          color: #8b68e8;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.4px;
          margin-bottom: 7px;
        }

        .invoice-page-header h1 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 24px;
          color: #f6f8fc;
        }

        .invoice-page-header p {
          margin-top: 5px;
          color: #78869d;
          font-size: 10px;
        }

        .invoice-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .invoice-total-badge {
          height: 32px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid rgba(92, 119, 174, .2);
          border-radius: 7px;
          background: rgba(12, 24, 43, .7);
          color: #a6b1c3;
          font-size: 9px;
        }

        .invoice-total-badge span {
          color: #b48aff;
          font-weight: 800;
        }

        .invoice-primary-button {
          height: 32px;
          padding: 0 14px;
          border: 0;
          border-radius: 7px;
          background: linear-gradient(135deg, #683cf2, #7b48ef);
          color: white;
          font-size: 9px;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(104, 60, 242, .18);
        }

        .invoice-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }

        .invoice-kpi-card {
          min-height: 82px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px;
          border: 1px solid rgba(81, 111, 168, .2);
          border-radius: 8px;
          background: linear-gradient(
            145deg,
            rgba(13, 25, 46, .96),
            rgba(7, 17, 31, .97)
          );
        }

        .invoice-kpi-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          font-size: 16px;
          font-weight: 800;
        }

        .invoice-kpi-icon.purple {
          color: #ba91ff;
          background: rgba(124, 58, 237, .17);
        }

        .invoice-kpi-icon.green {
          color: #2dd4a7;
          background: rgba(20, 184, 166, .13);
        }

        .invoice-kpi-icon.yellow {
          color: #facc15;
          background: rgba(234, 179, 8, .13);
        }

        .invoice-kpi-icon.red {
          color: #fb7185;
          background: rgba(244, 63, 94, .13);
        }

        .invoice-kpi-card span {
          display: block;
          color: #7f8da4;
          font-size: 8px;
        }

        .invoice-kpi-card strong {
          display: inline-block;
          margin-top: 4px;
          color: #f1f5fb;
          font-family: "Space Grotesk", sans-serif;
          font-size: 18px;
        }

        .invoice-kpi-card small {
          display: block;
          margin-top: 2px;
          color: #647289;
          font-size: 7px;
        }

        .invoice-kpi-card small.positive {
          color: #19cda2;
        }

        .invoice-kpi-card small.danger {
          color: #fb7185;
        }

        .invoice-content-grid {
          display: grid;
          grid-template-columns: 330px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .invoice-form-panel,
        .invoice-list-panel {
          border: 1px solid rgba(81, 111, 168, .22);
          border-radius: 8px;
          background: linear-gradient(
            145deg,
            rgba(11, 23, 42, .97),
            rgba(7, 17, 31, .98)
          );
          overflow: hidden;
        }

        .invoice-panel-header {
          min-height: 58px;
          display: flex;
          align-items: center;
          padding: 0 15px;
          border-bottom: 1px solid rgba(82, 110, 163, .13);
        }

        .invoice-panel-header > div {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .invoice-panel-icon {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(124, 58, 237, .13);
          color: #ad7cff;
          font-size: 14px;
          font-weight: 800;
        }

        .invoice-panel-header h2 {
          color: #edf1f8;
          font-size: 12px;
          font-weight: 700;
        }

        .invoice-panel-header p {
          margin-top: 3px;
          color: #68778f;
          font-size: 8px;
        }

        .invoice-form {
          padding: 16px;
        }

        .invoice-input-group {
          margin-bottom: 13px;
        }

        .invoice-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .invoice-input-group label {
          display: block;
          margin-bottom: 6px;
          color: #9ba7bb;
          font-size: 8px;
          font-weight: 600;
        }

        .invoice-input-group input {
          width: 100%;
          height: 35px;
          border: 1px solid rgba(87, 116, 173, .2);
          border-radius: 7px;
          background: rgba(16, 29, 51, .8);
          color: #e8edf5;
          padding: 0 10px;
          font-size: 9px;
        }

        .invoice-input-group input:focus {
          border-color: rgba(139, 92, 246, .65);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, .08);
        }

        .invoice-input-group input::placeholder {
          color: #55647c;
        }

        .invoice-input-group input[type="date"] {
          color-scheme: dark;
        }

        .invoice-ai-note {
          display: flex;
          gap: 9px;
          padding: 10px;
          margin-bottom: 13px;
          border: 1px solid rgba(124, 58, 237, .16);
          border-radius: 7px;
          background: rgba(124, 58, 237, .06);
        }

        .invoice-ai-note > span {
          color: #a879ff;
          font-size: 15px;
        }

        .invoice-ai-note strong {
          color: #c8b5f1;
          font-size: 8px;
        }

        .invoice-ai-note p {
          margin-top: 3px;
          color: #69778d;
          font-size: 7px;
          line-height: 1.4;
        }

        .invoice-submit-button {
          width: 100%;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 7px;
          background: linear-gradient(135deg, #683cf2, #7b48ef);
          color: white;
          font-size: 9px;
          font-weight: 700;
        }

        .invoice-submit-button span {
          font-size: 13px;
        }

        .invoice-toolbar {
          display: flex;
          gap: 8px;
          padding: 10px 13px;
        }

        .invoice-search-box {
          flex: 1;
          height: 34px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 10px;
          border: 1px solid rgba(82, 113, 170, .2);
          border-radius: 7px;
          background: rgba(16, 29, 51, .75);
          color: #77869e;
        }

        .invoice-search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          background: transparent;
          color: #e5e7eb;
          font-size: 9px;
        }

        .invoice-search-box input::placeholder {
          color: #5d6b82;
        }

        .invoice-filter-select {
          width: 105px;
          height: 34px;
          border: 1px solid rgba(82, 113, 170, .2);
          border-radius: 7px;
          padding: 0 9px;
          background: #101d33;
          color: #a8b3c5;
          font-size: 8px;
        }

        .invoice-filter-select option {
          background: #101d33;
          color: #e5e7eb;
        }

        .invoice-list {
          padding: 0 13px 13px;
        }

        .invoice-row {
          min-height: 69px;
          display: grid;
          grid-template-columns: 32px minmax(150px, 1fr) 75px 70px 82px 25px;
          align-items: center;
          gap: 9px;
          padding: 9px 6px;
          border-top: 1px solid rgba(82, 110, 163, .1);
        }

        .invoice-row:hover {
          background: rgba(124, 58, 237, .035);
        }

        .invoice-number-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(124, 58, 237, .11);
          color: #ae80ff;
          font-size: 13px;
          font-weight: 800;
        }

        .invoice-main-info {
          min-width: 0;
        }

        .invoice-name-line {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .invoice-name-line h3 {
          overflow: hidden;
          color: #e6ebf4;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .invoice-main-info p {
          overflow: hidden;
          margin-top: 4px;
          color: #69788f;
          font-size: 7px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .invoice-status {
          display: inline-flex;
          align-items: center;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 6px;
          font-weight: 800;
        }

        .invoice-status.paid {
          color: #22d3a6;
          background: rgba(20, 184, 166, .12);
        }

        .invoice-status.pending {
          color: #facc15;
          background: rgba(234, 179, 8, .12);
        }

        .invoice-status.overdue {
          color: #fb7185;
          background: rgba(244, 63, 94, .12);
        }

        .invoice-amount,
        .invoice-due {
          text-align: right;
        }

        .invoice-amount span,
        .invoice-due span {
          display: block;
          color: #59677e;
          font-size: 6px;
          letter-spacing: .7px;
        }

        .invoice-amount strong {
          display: block;
          margin-top: 3px;
          color: #c7a2ff;
          font-size: 9px;
        }

        .invoice-due strong {
          display: block;
          margin-top: 3px;
          color: #a0acbd;
          font-size: 7px;
          font-weight: 500;
        }

        .invoice-status-select {
          width: 82px;
          height: 27px;
          border-radius: 5px;
          padding: 0 5px;
          background: #101d33;
          font-size: 7px;
          font-weight: 700;
        }

        .invoice-status-select.paid {
          border: 1px solid rgba(20, 184, 166, .25);
          color: #22d3a6;
        }

        .invoice-status-select.pending {
          border: 1px solid rgba(234, 179, 8, .25);
          color: #facc15;
        }

        .invoice-status-select.overdue {
          border: 1px solid rgba(244, 63, 94, .25);
          color: #fb7185;
        }

        .invoice-status-select option {
          background: #101d33;
          color: #e5e7eb;
        }

        .invoice-delete {
          width: 25px;
          height: 25px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #65748b;
          font-size: 14px;
        }

        .invoice-delete:hover {
          background: rgba(244, 63, 94, .1);
          color: #fb7185;
        }

        .invoice-empty {
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .invoice-empty-icon,
        .invoice-loader {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          border-radius: 50%;
          background: rgba(124, 58, 237, .1);
          color: #a97aff;
          font-size: 21px;
        }

        .invoice-loader {
          animation: invoice-spin 1.2s linear infinite;
        }

        .invoice-empty h3 {
          color: #cbd3df;
          font-size: 12px;
        }

        .invoice-empty p {
          margin-top: 5px;
          color: #66748a;
          font-size: 8px;
        }

        .invoice-ai-footer {
          min-height: 65px;
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 15px;
          padding: 11px 14px;
          border: 1px solid rgba(124, 58, 237, .18);
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            rgba(75, 42, 153, .12),
            rgba(11, 23, 42, .7)
          );
        }

        .invoice-footer-icon {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(124, 58, 237, .15);
          color: #b28aff;
          font-size: 15px;
        }

        .invoice-ai-footer strong {
          color: #cfd7e5;
          font-size: 9px;
        }

        .invoice-ai-footer p {
          margin-top: 3px;
          color: #68778d;
          font-size: 7px;
        }

        .invoice-footer-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #19cda2;
          font-size: 7px;
          font-weight: 600;
        }

        .invoice-footer-status span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #19cda2;
          box-shadow: 0 0 8px rgba(25, 205, 162, .7);
        }

        @keyframes invoice-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .invoice-content-grid {
            grid-template-columns: 1fr;
          }

          .invoice-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 750px) {
          .invoice-row {
            grid-template-columns: 32px minmax(0, 1fr) 25px;
          }

          .invoice-amount,
          .invoice-due,
          .invoice-status-select {
            display: none;
          }
        }

        @media (max-width: 650px) {
          .invoice-page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .invoice-header-actions {
            justify-content: space-between;
          }

          .invoice-kpi-grid {
            grid-template-columns: 1fr;
          }

          .invoice-toolbar {
            flex-direction: column;
          }

          .invoice-filter-select {
            width: 100%;
          }

          .invoice-input-row {
            grid-template-columns: 1fr;
          }

          .invoice-footer-status {
            display: none;
          }
        }

      `}</style>

    </div>
  );
}

export default InvoiceCollection;