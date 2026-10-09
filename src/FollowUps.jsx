import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);

  const [customer, setCustomer] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "followUps"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setFollowUps(data);
      },
      (error) => {
        console.error("Follow-up Firebase error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addFollowUp = async (e) => {
    e.preventDefault();

    if (!customer.trim() || !note.trim() || !date) {
      alert("Customer, note and date are required.");
      return;
    }

    try {
      await addDoc(collection(db, "followUps"), {
        customer: customer.trim(),
        note: note.trim(),
        date,
        priority,
        status,
        createdAt: new Date().toISOString(),
      });

      setCustomer("");
      setNote("");
      setDate("");
      setPriority("Medium");
      setStatus("Pending");

      alert("Follow-up added successfully! ✅");
    } catch (error) {
      console.error("Follow-up save error:", error);

      alert("Follow-up save nahi hua. Firebase check karo.");
    }
  };

  const deleteFollowUp = async (id) => {
    const confirmed = window.confirm(
      "Delete this follow-up?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "followUps", id));
    } catch (error) {
      console.error("Follow-up delete error:", error);
    }
  };

  const toggleStatus = async (item) => {
    const newStatus =
      item.status === "Completed"
        ? "Pending"
        : "Completed";

    try {
      await updateDoc(doc(db, "followUps", item.id), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const filteredFollowUps = followUps.filter((item) => {
    const text = search.toLowerCase();

    return (
      item.customer?.toLowerCase().includes(text) ||
      item.note?.toLowerCase().includes(text) ||
      item.priority?.toLowerCase().includes(text) ||
      item.status?.toLowerCase().includes(text)
    );
  });

  const pendingCount = followUps.filter(
    (item) => item.status === "Pending"
  ).length;

  const completedCount = followUps.filter(
    (item) => item.status === "Completed"
  ).length;

  const highPriorityCount = followUps.filter(
    (item) => item.priority === "High"
  ).length;

  return (
    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 Follow-Ups</h1>

          <p style={styles.subtitle}>
            Schedule and manage customer follow-ups
          </p>
        </div>

        <div style={styles.count}>
          {followUps.length} Follow-Ups
        </div>
      </div>

      {/* STATS */}

      <div style={styles.stats}>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total</span>
          <strong style={styles.statNumber}>
            {followUps.length}
          </strong>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Pending</span>
          <strong
            style={{
              ...styles.statNumber,
              color: "#f59e0b",
            }}
          >
            {pendingCount}
          </strong>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Completed</span>
          <strong
            style={{
              ...styles.statNumber,
              color: "#22c55e",
            }}
          >
            {completedCount}
          </strong>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>
            High Priority
          </span>

          <strong
            style={{
              ...styles.statNumber,
              color: "#a855f7",
            }}
          >
            {highPriorityCount}
          </strong>
        </div>

      </div>

      {/* ADD FOLLOW-UP */}

      <div style={styles.card}>

        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Schedule Follow-Up
            </h2>

            <p style={styles.cardSubtitle}>
              Create a reminder for your customer
            </p>
          </div>

          <div style={styles.cardIcon}>
            📅
          </div>
        </div>

        <form onSubmit={addFollowUp}>

          <div style={styles.formGrid}>

            <input
              style={styles.input}
              placeholder="Customer Name *"
              value={customer}
              onChange={(e) =>
                setCustomer(e.target.value)
              }
            />

            <input
              style={styles.input}
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            <textarea
              style={styles.textarea}
              placeholder="Follow-up note *"
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
            />

            <select
              style={styles.input}
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
            >
              <option value="High">
                🔥 High Priority
              </option>

              <option value="Medium">
                🟡 Medium Priority
              </option>

              <option value="Low">
                ❄️ Low Priority
              </option>
            </select>

            <select
              style={styles.input}
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="Pending">
                ⏳ Pending
              </option>

              <option value="Completed">
                ✅ Completed
              </option>
            </select>

          </div>

          <button
            type="submit"
            style={styles.addButton}
          >
            + Schedule Follow-Up
          </button>

        </form>

      </div>

      {/* SEARCH */}

      <div style={styles.searchBox}>

        <input
          style={styles.searchInput}
          placeholder="🔍 Search follow-ups..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* LIST HEADER */}

      <div style={styles.listHeader}>
        <div>
          <h2 style={styles.listTitle}>
            Follow-Up List
          </h2>

          <p style={styles.muted}>
            {filteredFollowUps.length} results
          </p>
        </div>
      </div>

      {/* LIST */}

      {filteredFollowUps.length === 0 ? (
        <div style={styles.empty}>

          <div style={styles.emptyIcon}>
            📅
          </div>

          <h3 style={styles.emptyTitle}>
            {search
              ? "No follow-ups found"
              : "No follow-ups yet"}
          </h3>

          <p style={styles.emptyText}>
            {search
              ? "Try a different search."
              : "Schedule your first follow-up above."}
          </p>

        </div>
      ) : (
        <div style={styles.list}>

          {filteredFollowUps.map((item) => (
            <div
              key={item.id}
              style={styles.followCard}
            >

              {/* DATE ICON */}

              <div style={styles.dateBox}>
                📅
              </div>

              {/* INFO */}

              <div style={styles.info}>

                <h3 style={styles.customerName}>
                  {item.customer}
                </h3>

                <p style={styles.note}>
                  {item.note}
                </p>

                <span style={styles.dateText}>
                  📆 {item.date}
                </span>

              </div>

              {/* PRIORITY */}

              <div
                style={{
                  ...styles.badge,
                  ...(item.priority === "High"
                    ? styles.high
                    : item.priority === "Low"
                    ? styles.low
                    : styles.medium),
                }}
              >
                {item.priority}
              </div>

              {/* STATUS */}

              <button
                onClick={() => toggleStatus(item)}
                style={{
                  ...styles.status,
                  ...(item.status === "Completed"
                    ? styles.completed
                    : styles.pending),
                }}
              >
                {item.status === "Completed"
                  ? "✓ Completed"
                  : "⏳ Pending"}
              </button>

              {/* DELETE */}

              <button
                style={styles.deleteButton}
                onClick={() =>
                  deleteFollowUp(item.id)
                }
              >
                🗑️
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    width: "100%",
    maxWidth: "1200px",
    boxSizing: "border-box",
    color: "#f5f7fb",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "25px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    color: "#7f8ba3",
    marginTop: "7px",
    fontSize: "12px",
  },

  count: {
    background: "rgba(139, 92, 246, 0.12)",
    color: "#b794ff",
    padding: "10px 16px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    border: "1px solid rgba(139, 92, 246, 0.25)",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  statCard: {
    background:
      "linear-gradient(145deg, #101521, #0b101a)",
    padding: "20px",
    borderRadius: "12px",
    border:
      "1px solid rgba(104, 125, 163, 0.16)",
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  statLabel: {
    color: "#78859c",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  statNumber: {
    color: "#f1f5f9",
    fontSize: "24px",
    fontWeight: "700",
  },

  card: {
    background:
      "linear-gradient(145deg, #101521, #0b101a)",
    padding: "24px",
    borderRadius: "12px",
    border:
      "1px solid rgba(104, 125, 163, 0.16)",
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.25)",
    marginBottom: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    color: "#f3f4f6",
    fontSize: "15px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#69778e",
    fontSize: "10px",
  },

  cardIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background:
      "rgba(139, 92, 246, 0.12)",
    border:
      "1px solid rgba(139, 92, 246, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border:
      "1px solid rgba(94, 116, 154, 0.25)",
    borderRadius: "8px",
    outline: "none",
    fontSize: "12px",
    background: "#080d16",
    color: "#e5e7eb",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "90px",
    padding: "13px",
    border:
      "1px solid rgba(94, 116, 154, 0.25)",
    borderRadius: "8px",
    outline: "none",
    fontSize: "12px",
    resize: "vertical",
    background: "#080d16",
    color: "#e5e7eb",
    fontFamily: "inherit",
  },

  addButton: {
    padding: "12px 20px",
    background:
      "linear-gradient(135deg, #6d3df2, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    boxShadow:
      "0 8px 20px rgba(109,61,242,0.25)",
  },

  searchBox: {
    marginBottom: "20px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 15px",
    border:
      "1px solid rgba(94, 116, 154, 0.22)",
    borderRadius: "9px",
    outline: "none",
    fontSize: "11px",
    background: "#0b1019",
    color: "#e5e7eb",
  },

  listHeader: {
    marginBottom: "12px",
  },

  listTitle: {
    margin: 0,
    color: "#f3f4f6",
    fontSize: "15px",
  },

  muted: {
    color: "#68768d",
    fontSize: "10px",
    marginTop: "4px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  followCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background:
      "linear-gradient(145deg, #101521, #0b1019)",
    padding: "16px",
    borderRadius: "11px",
    border:
      "1px solid rgba(104, 125, 163, 0.14)",
    boxShadow:
      "0 6px 20px rgba(0,0,0,0.2)",
  },

  dateBox: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    borderRadius: "9px",
    background:
      "rgba(139, 92, 246, 0.12)",
    border:
      "1px solid rgba(139, 92, 246, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  customerName: {
    margin: "0 0 5px",
    color: "#edf2f7",
    fontSize: "12px",
    fontWeight: "600",
  },

  note: {
    margin: "0 0 6px",
    color: "#8a96a9",
    fontSize: "10px",
  },

  dateText: {
    color: "#66748b",
    fontSize: "9px",
  },

  badge: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  high: {
    background:
      "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border:
      "1px solid rgba(239, 68, 68, 0.2)",
  },

  medium: {
    background:
      "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    border:
      "1px solid rgba(245, 158, 11, 0.2)",
  },

  low: {
    background:
      "rgba(14, 165, 233, 0.12)",
    color: "#38bdf8",
    border:
      "1px solid rgba(14, 165, 233, 0.2)",
  },

  status: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  pending: {
    background:
      "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    border:
      "1px solid rgba(245, 158, 11, 0.2)",
  },

  completed: {
    background:
      "rgba(34, 197, 94, 0.12)",
    color: "#4ade80",
    border:
      "1px solid rgba(34, 197, 94, 0.2)",
  },

  deleteButton: {
    border:
      "1px solid rgba(239, 68, 68, 0.15)",
    background:
      "rgba(239, 68, 68, 0.08)",
    color: "#f87171",
    padding: "7px 9px",
    borderRadius: "7px",
    cursor: "pointer",
  },

  empty: {
    background:
      "linear-gradient(145deg, #101521, #0b1019)",
    padding: "55px",
    textAlign: "center",
    borderRadius: "12px",
    border:
      "1px solid rgba(104, 125, 163, 0.14)",
  },

  emptyIcon: {
    fontSize: "42px",
    opacity: 0.8,
  },

  emptyTitle: {
    color: "#e5e7eb",
    fontSize: "14px",
    marginTop: "12px",
  },

  emptyText: {
    color: "#6f7c91",
    fontSize: "10px",
  },
};

export default FollowUps;