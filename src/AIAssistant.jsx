import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

function AIAssistant() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi Shivani 👋 I'm your Business AI Assistant. Ask me about leads, customers, invoices, revenue, or follow-ups.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const leadsQuery = query(
          collection(db, "leads"),
          orderBy("createdAt", "desc")
        );

        const customersQuery = query(
          collection(db, "customers"),
          orderBy("createdAt", "desc")
        );

        const invoicesQuery = query(
          collection(db, "invoices"),
          orderBy("createdAt", "desc")
        );

        const [leadSnap, customerSnap, invoiceSnap] =
          await Promise.all([
            getDocs(leadsQuery),
            getDocs(customersQuery),
            getDocs(invoicesQuery),
          ]);

        setLeads(
          leadSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        setCustomers(
          customerSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        setInvoices(
          invoiceSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("AI data loading error:", error);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const hot = leads.filter(
      (lead) => lead.status === "Hot"
    ).length;

    const warm = leads.filter(
      (lead) => lead.status === "Warm"
    ).length;

    const cold = leads.filter(
      (lead) => lead.status === "Cold"
    ).length;

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
      .filter((invoice) => invoice.status === "Paid")
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
          invoice.status === "Pending" ||
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

    return {
      hot,
      warm,
      cold,
      totalLeads: leads.length,
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
    };
  }, [leads, customers, invoices]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const generateAIResponse = (question) => {
    const q = question.toLowerCase();

    if (
      q.includes("lead") ||
      q.includes("leads")
    ) {
      if (
        q.includes("hot") ||
        q.includes("high value")
      ) {
        return `You currently have ${stats.hot} hot leads. 🔥 These should be contacted first because they have the highest conversion potential based on your lead scoring.`;
      }

      if (
        q.includes("warm")
      ) {
        return `You currently have ${stats.warm} warm leads. These leads are interested but may need more information or follow-up.`;
      }

      if (
        q.includes("cold")
      ) {
        return `You currently have ${stats.cold} cold leads. Consider using automated follow-ups to re-engage them.`;
      }

      return `You have ${stats.totalLeads} total leads: ${stats.hot} Hot, ${stats.warm} Warm, and ${stats.cold} Cold.`;
    }

    if (
      q.includes("customer") ||
      q.includes("customers")
    ) {
      return `Your Business OS currently has ${stats.totalCustomers} customers in the database.`;
    }

    if (
      q.includes("revenue") ||
      q.includes("sales")
    ) {
      return `Your recorded invoice revenue is ${formatMoney(
        stats.totalRevenue
      )}. Paid revenue is ${formatMoney(
        stats.paidRevenue
      )}, while pending/overdue revenue is ${formatMoney(
        stats.pendingRevenue
      )}.`;
    }

    if (
      q.includes("invoice") ||
      q.includes("invoices")
    ) {
      return `You currently have ${stats.totalInvoices} invoices. Recorded revenue is ${formatMoney(
        stats.totalRevenue
      )}.`;
    }

    if (
      q.includes("what should") ||
      q.includes("priority") ||
      q.includes("next")
    ) {
      if (stats.hot > 0) {
        return `Your first priority should be the ${stats.hot} Hot lead${
          stats.hot > 1 ? "s" : ""
        }. Contact them quickly, then follow up with your Warm leads.`;
      }

      if (stats.warm > 0) {
        return `You don't currently have any Hot leads. Your next priority should be following up with your ${stats.warm} Warm lead${
          stats.warm > 1 ? "s" : ""
        }.`;
      }

      return "Your pipeline currently has no Hot or Warm leads. Focus on generating new leads and adding them to Lead Recovery.";
    }

    if (
      q.includes("summary") ||
      q.includes("business") ||
      q.includes("overview")
    ) {
      return `Here's your business snapshot:\n\n• Leads: ${stats.totalLeads}\n• Hot leads: ${stats.hot}\n• Warm leads: ${stats.warm}\n• Customers: ${stats.totalCustomers}\n• Invoices: ${stats.totalInvoices}\n• Revenue: ${formatMoney(
        stats.totalRevenue
      )}\n• Pending/overdue: ${formatMoney(
        stats.pendingRevenue
      )}`;
    }

    if (
      q.includes("hello") ||
      q.includes("hi") ||
      q.includes("hey")
    ) {
      return "Hello 👋 I'm ready to analyze your business data. Try asking: “How many hot leads do I have?”";
    }

    return `I can currently help with your business data. Try asking:\n\n• How many hot leads do I have?\n• What's my revenue?\n• How many customers do I have?\n• Show me my business summary\n• What should I focus on next?`;
  };

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: cleanMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    setTimeout(() => {
      const response = generateAIResponse(
        cleanMessage
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response,
        },
      ]);

      setLoading(false);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How many hot leads do I have?",
    "What's my revenue?",
    "How many customers do I have?",
    "Give me a business summary",
  ];

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <div>
          <h1>AI Assistant</h1>
          <p>
            Ask questions about your business data.
          </p>
        </div>

        <div className="ai-status">
          <span></span>
          AI Online
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-chat-card">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <div className="ai-avatar">✦</div>

              <div>
                <strong>Business AI</strong>
                <span>Business intelligence assistant</span>
              </div>
            </div>

            <div className="ai-online-dot"></div>
          </div>

          <div className="ai-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`ai-message ${
                  item.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="message-avatar">
                    ✦
                  </div>
                )}

                <div className="message-bubble">
                  {item.text
                    .split("\n")
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        {i <
                          item.text.split("\n").length -
                            1 && <br />}
                      </span>
                    ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message assistant-message">
                <div className="message-avatar">
                  ✦
                </div>

                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="quick-questions">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() => {
                  setMessage(question);
                }}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="ai-input-area">
            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask your business assistant..."
              rows="1"
            />

            <button
              className="ai-send-button"
              onClick={sendMessage}
              disabled={
                !message.trim() || loading
              }
            >
              ➤
            </button>
          </div>
        </div>

        <div className="ai-stats-card">
          <h3>Business Snapshot</h3>

          <div className="ai-stat">
            <span>Total Leads</span>
            <strong>{stats.totalLeads}</strong>
          </div>

          <div className="ai-stat">
            <span>Hot Leads</span>
            <strong className="purple-text">
              {stats.hot}
            </strong>
          </div>

          <div className="ai-stat">
            <span>Customers</span>
            <strong>
              {stats.totalCustomers}
            </strong>
          </div>

          <div className="ai-stat">
            <span>Revenue</span>
            <strong>
              {formatMoney(stats.totalRevenue)}
            </strong>
          </div>

          <div className="ai-stat">
            <span>Pending</span>
            <strong className="orange-text">
              {formatMoney(
                stats.pendingRevenue
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;