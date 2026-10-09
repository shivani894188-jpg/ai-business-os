import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

function LeadRecovery() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // ==========================================
  // LOAD LEADS
  // ==========================================

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);

        const leadsQuery = query(
          collection(db, "leads"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(leadsQuery);

        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setLeads(data);
      } catch (error) {
        console.error("Load leads error:", error);

        try {
          const snapshot = await getDocs(
            collection(db, "leads")
          );

          const data = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

          setLeads(data);
        } catch (fallbackError) {
          console.error(
            "Fallback leads error:",
            fallbackError
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  // ==========================================
  // SCORE
  // ==========================================

  const calculateScore = (text) => {
    const value = text.toLowerCase();

    const hotWords = [
      "buy",
      "purchase",
      "book",
      "price",
      "budget",
      "ready",
      "buying",
      "order",
    ];

    const warmWords = [
      "interested",
      "details",
      "information",
      "demo",
      "know more",
      "more info",
      "available",
    ];

    if (
      hotWords.some((word) =>
        value.includes(word)
      )
    ) {
      return 90;
    }

    if (
      warmWords.some((word) =>
        value.includes(word)
      )
    ) {
      return 75;
    }

    return 55;
  };

  // ==========================================
  // ADD LEAD
  // ==========================================

  const handleAddLead = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanMessage
    ) {
      alert("Please fill all fields.");
      return;
    }

    const score = calculateScore(cleanMessage);

    const status =
      score >= 80
        ? "Hot"
        : score >= 65
        ? "Warm"
        : "Cold";

    const newLead = {
      name: cleanName,
      phone: cleanPhone,
      message: cleanMessage,
      score,
      status,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(
        collection(db, "leads"),
        newLead
      );

      setLeads((previous) => [
        {
          id: docRef.id,
          ...newLead,
        },
        ...previous,
      ]);

      setName("");
      setPhone("");
      setMessage("");

      alert("Lead added successfully!");
    } catch (error) {
      console.error("Add lead error:", error);
      alert(
        "Failed to add lead. Check Firebase rules."
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this lead?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "leads", id)
      );

      setLeads((previous) =>
        previous.filter(
          (lead) => lead.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete lead error:",
        error
      );

      alert("Failed to delete lead.");
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredLeads = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return leads.filter((lead) => {
      const leadName = String(
        lead.name || ""
      ).toLowerCase();

      const leadPhone = String(
        lead.phone || ""
      ).toLowerCase();

      const leadMessage = String(
        lead.message || ""
      ).toLowerCase();

      const leadStatus = String(
        lead.status || ""
      ).toLowerCase();

      const matchesSearch =
        !value ||
        leadName.includes(value) ||
        leadPhone.includes(value) ||
        leadMessage.includes(value);

      const matchesFilter =
        filter === "All" ||
        leadStatus ===
          filter.toLowerCase();

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [leads, search, filter]);

  // ==========================================
  // STATS
  // ==========================================

  const hotLeads = leads.filter(
    (lead) => lead.status === "Hot"
  ).length;

  const warmLeads = leads.filter(
    (lead) => lead.status === "Warm"
  ).length;

  const coldLeads = leads.filter(
    (lead) => lead.status === "Cold"
  ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="leads-page">

      {/* HEADER */}

      <div className="leads-page-header">

        <div>
          <div className="page-eyebrow">
            BUSINESS OS / LEADS
          </div>

          <h1>
            Lead Management
          </h1>

          <p>
            Capture, qualify and manage your
            customer enquiries from one place.
          </p>
        </div>

        <div className="lead-header-actions">

          <div className="lead-total-badge">
            <span>●</span>
            {leads.length} Total Leads
          </div>

          <button
            className="lead-primary-button"
            onClick={() =>
              document
                .getElementById(
                  "add-lead-form"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            + Add Lead
          </button>

        </div>

      </div>

      {/* STAT CARDS */}

      <div className="lead-kpi-grid">

        <div className="lead-kpi-card">

          <div className="lead-kpi-icon purple">
            ♧
          </div>

          <div>
            <span>Total Leads</span>

            <strong>
              {leads.length}
            </strong>

            <small>
              All captured enquiries
            </small>
          </div>

        </div>

        <div className="lead-kpi-card">

          <div className="lead-kpi-icon red">
            🔥
          </div>

          <div>
            <span>Hot Leads</span>

            <strong>
              {hotLeads}
            </strong>

            <small className="positive">
              High purchase intent
            </small>
          </div>

        </div>

        <div className="lead-kpi-card">

          <div className="lead-kpi-icon yellow">
            ●
          </div>

          <div>
            <span>Warm Leads</span>

            <strong>
              {warmLeads}
            </strong>

            <small>
              Needs follow-up
            </small>
          </div>

        </div>

        <div className="lead-kpi-card">

          <div className="lead-kpi-icon blue">
            ❄
          </div>

          <div>
            <span>Cold Leads</span>

            <strong>
              {coldLeads}
            </strong>

            <small>
              Early-stage enquiries
            </small>
          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div className="leads-content-grid">

        {/* ADD LEAD */}

        <div
          className="lead-form-panel"
          id="add-lead-form"
        >

          <div className="lead-panel-header">

            <div>
              <span className="lead-panel-icon">
                ✦
              </span>

              <div>
                <h2>
                  Add New Lead
                </h2>

                <p>
                  Enter customer enquiry
                  details.
                </p>
              </div>
            </div>

          </div>

          <form
            className="lead-form"
            onSubmit={handleAddLead}
          >

            <div className="lead-input-group">

              <label>
                Customer Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="e.g. Rahul Sharma"
              />

            </div>

            <div className="lead-input-group">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="+91 9876543210"
              />

            </div>

            <div className="lead-input-group">

              <label>
                Customer Message
              </label>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="What does the customer need?"
              />

            </div>

            <div className="lead-ai-note">

              <span>✦</span>

              <div>
                <strong>
                  AI Lead Scoring
                </strong>

                <p>
                  We'll automatically detect
                  buying intent and assign a
                  lead score.
                </p>
              </div>

            </div>

            <button
              type="submit"
              className="lead-submit-button"
            >
              Add Lead
              <span>→</span>
            </button>

          </form>

        </div>

        {/* LEADS LIST */}

        <div className="lead-list-panel">

          <div className="lead-panel-header list-header">

            <div>
              <span className="lead-panel-icon">
                ♧
              </span>

              <div>
                <h2>
                  Recovered Leads
                </h2>

                <p>
                  {filteredLeads.length} of{" "}
                  {leads.length} leads
                </p>
              </div>
            </div>

          </div>

          {/* TOOLBAR */}

          <div className="lead-toolbar">

            <div className="lead-search-box">

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
                placeholder="Search leads..."
              />

            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="lead-filter-select"
            >
              <option value="All">
                All Leads
              </option>

              <option value="Hot">
                🔥 Hot
              </option>

              <option value="Warm">
                ● Warm
              </option>

              <option value="Cold">
                ❄ Cold
              </option>
            </select>

          </div>

          {/* LIST */}

          {loading ? (

            <div className="lead-empty">
              <div className="empty-loader">
                ◌
              </div>

              <h3>
                Loading leads...
              </h3>

              <p>
                Fetching your leads from
                Firebase.
              </p>
            </div>

          ) : filteredLeads.length === 0 ? (

            <div className="lead-empty">

              <div className="empty-icon">
                ♧
              </div>

              <h3>
                No leads found
              </h3>

              <p>
                Add a customer enquiry to
                get started.
              </p>

            </div>

          ) : (

            <div className="lead-list">

              {filteredLeads.map((lead) => {

                const score = Number(
                  lead.score || 0
                );

                const status =
                  lead.status ||
                  (
                    score >= 80
                      ? "Hot"
                      : score >= 65
                      ? "Warm"
                      : "Cold"
                  );

                const statusClass =
                  status === "Hot"
                    ? "hot"
                    : status === "Warm"
                    ? "warm"
                    : "cold";

                return (

                  <div
                    className="lead-row"
                    key={lead.id}
                  >

                    <div className="lead-avatar">
                      {String(
                        lead.name ||
                          "L"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="lead-main-info">

                      <div className="lead-name-line">

                        <h3>
                          {lead.name ||
                            "Unknown Lead"}
                        </h3>

                        <span
                          className={`lead-status ${statusClass}`}
                        >
                          {status}
                        </span>

                      </div>

                      <p className="lead-phone-text">
                        {lead.phone ||
                          "No phone"}
                      </p>

                      <p className="lead-message-text">
                        {lead.message ||
                          "No message available"}
                      </p>

                    </div>

                    <div className="lead-score">

                      <span>
                        SCORE
                      </span>

                      <strong>
                        {score}
                      </strong>

                    </div>

                    <button
                      className="lead-delete"
                      type="button"
                      onClick={() =>
                        handleDelete(
                          lead.id
                        )
                      }
                      title="Delete lead"
                    >
                      ⋯
                    </button>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </div>

      {/* AI FOOTER */}

      <div className="lead-ai-footer">

        <div className="lead-footer-icon">
          ✦
        </div>

        <div>

          <strong>
            AI-powered lead qualification
          </strong>

          <p>
            Your Business OS automatically
            analyzes customer messages to
            identify high-intent opportunities.
          </p>

        </div>

        <div className="lead-footer-status">
          <span></span>
          AI Engine Active
        </div>

      </div>

      {/* PAGE CSS */}

      <style>{`

        .leads-page {
          width: 100%;
          min-height: 100%;
          color: #eef2f8;
        }

        .leads-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .page-eyebrow {
          color: #8b68e8;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.4px;
          margin-bottom: 7px;
        }

        .leads-page-header h1 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 24px;
          color: #f6f8fc;
        }

        .leads-page-header p {
          margin-top: 5px;
          color: #78869d;
          font-size: 10px;
        }

        .lead-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .lead-total-badge {
          height: 32px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid rgba(92, 119, 174, .2);
          border-radius: 7px;
          background: rgba(12, 24, 43, .7);
          color: #9ba7ba;
          font-size: 9px;
        }

        .lead-total-badge span {
          color: #22c7a5;
          font-size: 7px;
        }

        .lead-primary-button {
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

        .lead-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }

        .lead-kpi-card {
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

        .lead-kpi-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          font-size: 16px;
        }

        .lead-kpi-icon.purple {
          color: #ba91ff;
          background: rgba(124, 58, 237, .17);
        }

        .lead-kpi-icon.red {
          color: #fb7185;
          background: rgba(244, 63, 94, .13);
        }

        .lead-kpi-icon.yellow {
          color: #facc15;
          background: rgba(234, 179, 8, .13);
        }

        .lead-kpi-icon.blue {
          color: #60a5fa;
          background: rgba(59, 130, 246, .13);
        }

        .lead-kpi-card span {
          display: block;
          color: #7f8da4;
          font-size: 8px;
        }

        .lead-kpi-card strong {
          display: inline-block;
          margin-top: 4px;
          color: #f1f5fb;
          font-family: "Space Grotesk", sans-serif;
          font-size: 19px;
        }

        .lead-kpi-card small {
          display: block;
          margin-top: 2px;
          color: #647289;
          font-size: 7px;
        }

        .lead-kpi-card small.positive {
          color: #19cda2;
        }

        .leads-content-grid {
          display: grid;
          grid-template-columns: 330px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .lead-form-panel,
        .lead-list-panel {
          border: 1px solid rgba(81, 111, 168, .22);
          border-radius: 8px;
          background: linear-gradient(
            145deg,
            rgba(11, 23, 42, .97),
            rgba(7, 17, 31, .98)
          );
          overflow: hidden;
        }

        .lead-panel-header {
          min-height: 58px;
          display: flex;
          align-items: center;
          padding: 0 15px;
          border-bottom: 1px solid rgba(82, 110, 163, .13);
        }

        .lead-panel-header > div {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .lead-panel-icon {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(124, 58, 237, .13);
          color: #ad7cff;
          font-size: 14px;
        }

        .lead-panel-header h2 {
          color: #edf1f8;
          font-size: 12px;
          font-weight: 700;
        }

        .lead-panel-header p {
          margin-top: 3px;
          color: #68778f;
          font-size: 8px;
        }

        .lead-form {
          padding: 16px;
        }

        .lead-input-group {
          margin-bottom: 13px;
        }

        .lead-input-group label {
          display: block;
          margin-bottom: 6px;
          color: #9ba7bb;
          font-size: 8px;
          font-weight: 600;
        }

        .lead-input-group input,
        .lead-input-group textarea {
          width: 100%;
          border: 1px solid rgba(87, 116, 173, .2);
          border-radius: 7px;
          background: rgba(16, 29, 51, .8);
          color: #e8edf5;
          padding: 10px;
          font-size: 9px;
          transition: .2s ease;
        }

        .lead-input-group input {
          height: 35px;
        }

        .lead-input-group textarea {
          min-height: 82px;
          resize: vertical;
        }

        .lead-input-group input:focus,
        .lead-input-group textarea:focus {
          border-color: rgba(139, 92, 246, .65);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, .08);
        }

        .lead-input-group input::placeholder,
        .lead-input-group textarea::placeholder {
          color: #55647c;
        }

        .lead-ai-note {
          display: flex;
          gap: 9px;
          padding: 10px;
          margin-bottom: 13px;
          border: 1px solid rgba(124, 58, 237, .16);
          border-radius: 7px;
          background: rgba(124, 58, 237, .06);
        }

        .lead-ai-note > span {
          color: #a879ff;
          font-size: 15px;
        }

        .lead-ai-note strong {
          color: #c8b5f1;
          font-size: 8px;
        }

        .lead-ai-note p {
          margin-top: 3px;
          color: #69778d;
          font-size: 7px;
          line-height: 1.4;
        }

        .lead-submit-button {
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

        .lead-submit-button span {
          font-size: 13px;
        }

        .list-header {
          min-height: 58px;
        }

        .lead-toolbar {
          display: flex;
          gap: 8px;
          padding: 10px 13px;
        }

        .lead-search-box {
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

        .lead-search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          background: transparent;
          color: #e5e7eb;
          font-size: 9px;
        }

        .lead-search-box input::placeholder {
          color: #5d6b82;
        }

        .lead-filter-select {
          width: 125px;
          height: 34px;
          border: 1px solid rgba(82, 113, 170, .2);
          border-radius: 7px;
          padding: 0 9px;
          background: #101d33;
          color: #a8b3c5;
          font-size: 8px;
        }

        .lead-filter-select option {
          background: #101d33;
          color: #e5e7eb;
        }

        .lead-list {
          padding: 0 13px 13px;
        }

        .lead-row {
          min-height: 75px;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) 55px 25px;
          align-items: center;
          gap: 10px;
          padding: 10px 7px;
          border-top: 1px solid rgba(82, 110, 163, .1);
        }

        .lead-row:hover {
          background: rgba(124, 58, 237, .035);
        }

        .lead-avatar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #7386aa, #3d4d68);
          color: #f5f7fb;
          font-size: 10px;
          font-weight: 800;
        }

        .lead-main-info {
          min-width: 0;
        }

        .lead-name-line {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .lead-name-line h3 {
          overflow: hidden;
          color: #e6ebf4;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .lead-status {
          display: inline-flex;
          align-items: center;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 6px;
          font-weight: 800;
        }

        .lead-status.hot {
          color: #fb7185;
          background: rgba(244, 63, 94, .12);
        }

        .lead-status.warm {
          color: #facc15;
          background: rgba(234, 179, 8, .12);
        }

        .lead-status.cold {
          color: #60a5fa;
          background: rgba(59, 130, 246, .12);
        }

        .lead-phone-text {
          margin-top: 4px;
          color: #8a99af;
          font-size: 7px;
        }

        .lead-message-text {
          overflow: hidden;
          margin-top: 4px;
          color: #69788f;
          font-size: 7px;
          line-height: 1.4;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .lead-score {
          text-align: center;
        }

        .lead-score span {
          display: block;
          color: #59677e;
          font-size: 6px;
          letter-spacing: .7px;
        }

        .lead-score strong {
          display: block;
          margin-top: 3px;
          color: #b990ff;
          font-family: "Space Grotesk", sans-serif;
          font-size: 16px;
        }

        .lead-delete {
          width: 25px;
          height: 25px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #65748b;
          font-size: 14px;
        }

        .lead-delete:hover {
          background: rgba(244, 63, 94, .1);
          color: #fb7185;
        }

        .lead-empty {
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .empty-icon,
        .empty-loader {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          border-radius: 50%;
          background: rgba(124, 58, 237, .1);
          color: #a97aff;
          font-size: 22px;
        }

        .empty-loader {
          animation: lead-spin 1.2s linear infinite;
        }

        .lead-empty h3 {
          color: #cbd3df;
          font-size: 12px;
        }

        .lead-empty p {
          margin-top: 5px;
          color: #66748a;
          font-size: 8px;
        }

        .lead-ai-footer {
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

        .lead-footer-icon {
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

        .lead-ai-footer strong {
          color: #cfd7e5;
          font-size: 9px;
        }

        .lead-ai-footer p {
          margin-top: 3px;
          color: #68778d;
          font-size: 7px;
        }

        .lead-footer-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #19cda2;
          font-size: 7px;
          font-weight: 600;
        }

        .lead-footer-status span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #19cda2;
          box-shadow: 0 0 8px rgba(25, 205, 162, .7);
        }

        @keyframes lead-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .leads-content-grid {
            grid-template-columns: 1fr;
          }

          .lead-form-panel {
            max-width: none;
          }

          .lead-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .leads-page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .lead-header-actions {
            justify-content: space-between;
          }

          .lead-kpi-grid {
            grid-template-columns: 1fr;
          }

          .lead-toolbar {
            flex-direction: column;
          }

          .lead-filter-select {
            width: 100%;
          }

          .lead-row {
            grid-template-columns: 34px minmax(0, 1fr) 25px;
          }

          .lead-score {
            display: none;
          }

          .lead-footer-status {
            display: none;
          }
        }

      `}</style>

    </div>
  );
}

export default LeadRecovery;