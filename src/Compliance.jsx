
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

function Compliance() {
  const [items, setItems] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Document");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "compliance"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setItems(data);
      },
      (error) => {
        console.error(
          "Compliance Firebase error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const addCompliance = async (e) => {
    e.preventDefault();

    if (!title.trim() || !dueDate) {
      alert(
        "Title and due date are required."
      );
      return;
    }

    try {
      await addDoc(
        collection(db, "compliance"),
        {
          title: title.trim(),
          category,
          dueDate,
          priority,
          status,
          notes: notes.trim(),
          createdAt: new Date().toISOString(),
        }
      );

      setTitle("");
      setCategory("Document");
      setDueDate("");
      setPriority("Medium");
      setStatus("Pending");
      setNotes("");

      alert(
        "Compliance item added successfully! ✅"
      );
    } catch (error) {
      console.error(
        "Compliance save error:",
        error
      );

      alert(
        "Compliance item save nahi hua."
      );
    }
  };

  const deleteCompliance = async (id) => {
    const confirmed = window.confirm(
      "Delete this compliance item?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "compliance", id)
      );
    } catch (error) {
      console.error(
        "Compliance delete error:",
        error
      );
    }
  };

  const filteredItems = items.filter(
    (item) => {
      const text = search.toLowerCase();

      return (
        item.title
          ?.toLowerCase()
          .includes(text) ||
        item.category
          ?.toLowerCase()
          .includes(text) ||
        item.priority
          ?.toLowerCase()
          .includes(text) ||
        item.status
          ?.toLowerCase()
          .includes(text)
      );
    }
  );

  const pending = items.filter(
    (item) => item.status === "Pending"
  ).length;

  const completed = items.filter(
    (item) => item.status === "Completed"
  ).length;

  const highPriority = items.filter(
    (item) => item.priority === "High"
  ).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1>🛡️ Compliance</h1>

          <p style={styles.subtitle}>
            Track business documents, requirements
            and compliance tasks
          </p>
        </div>

        <div style={styles.count}>
          {items.length} Items
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <span>Total</span>
          <strong>{items.length}</strong>
        </div>

        <div style={styles.statCard}>
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>

        <div style={styles.statCard}>
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>

        <div style={styles.statCard}>
          <span>High Priority</span>
          <strong>{highPriority}</strong>
        </div>
      </div>

      <div style={styles.card}>
        <h2>Add Compliance Item</h2>

        <form onSubmit={addCompliance}>
          <div style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Document / Task Title *"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <select
              style={styles.input}
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="Document">
                📄 Document
              </option>

              <option value="License">
                📜 License
              </option>

              <option value="Tax">
                💰 Tax
              </option>

              <option value="Contract">
                📝 Contract
              </option>

              <option value="Other">
                📌 Other
              </option>
            </select>

            <input
              style={styles.input}
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
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

            <textarea
              style={styles.textarea}
              placeholder="Notes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            style={styles.addButton}
          >
            + Add Compliance Item
          </button>
        </form>
      </div>

      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search compliance items..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div style={styles.listHeader}>
        <div>
          <h2>Compliance List</h2>

          <p style={styles.muted}>
            {filteredItems.length} results
          </p>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>
            🛡️
          </div>

          <h3>
            {search
              ? "No compliance items found"
              : "No compliance items yet"}
          </h3>

          <p>
            {search
              ? "Try another search."
              : "Add your first compliance item above."}
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={styles.itemCard}
            >
              <div style={styles.icon}>
                {item.category === "Document"
                  ? "📄"
                  : item.category === "License"
                  ? "📜"
                  : item.category === "Tax"
                  ? "💰"
                  : item.category === "Contract"
                  ? "📝"
                  : "📌"}
              </div>

              <div style={styles.info}>
                <h3>{item.title}</h3>

                <p>
                  {item.category} • Due:{" "}
                  {item.dueDate}
                </p>

                {item.notes && (
                  <span>{item.notes}</span>
                )}
              </div>

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

              <div
                style={{
                  ...styles.status,
                  ...(item.status === "Completed"
                    ? styles.completed
                    : styles.pending),
                }}
              >
                {item.status}
              </div>

              <button
                style={styles.deleteButton}
                onClick={() =>
                  deleteCompliance(item.id)
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
    maxWidth: "1200px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: "5px",
  },

  count: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "10px 16px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow:
      "0 4px 18px rgba(0,0,0,0.07)",
    marginBottom: "20px",
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
    border: "1px solid #ddd",
    borderRadius: "9px",
    outline: "none",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "90px",
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "9px",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
  },

  addButton: {
    padding: "12px 20px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  searchBox: {
    marginBottom: "20px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    outline: "none",
    fontSize: "15px",
  },

  listHeader: {
    marginBottom: "10px",
  },

  muted: {
    color: "#6b7280",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "#fff",
    padding: "18px",
    borderRadius: "13px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.06)",
  },

  icon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  info: {
    flex: 1,
  },

  badge: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  high: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  medium: {
    background: "#fef3c7",
    color: "#92400e",
  },

  low: {
    background: "#e0f2fe",
    color: "#0369a1",
  },

  status: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  pending: {
    background: "#fef3c7",
    color: "#92400e",
  },

  completed: {
    background: "#dcfce7",
    color: "#166534",
  },

  deleteButton: {
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px 10px",
    borderRadius: "7px",
    cursor: "pointer",
  },

  empty: {
    background: "#fff",
    padding: "50px",
    textAlign: "center",
    borderRadius: "14px",
  },

  emptyIcon: {
    fontSize: "45px",
  },
};

export default Compliance;