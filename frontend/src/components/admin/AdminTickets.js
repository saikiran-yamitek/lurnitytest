import React, { useEffect, useState } from "react";
import {
  listTickets,     // GET  /api/tickets
  updateTicket,    // PATCH /api/tickets/:id
  deleteTicket     // DELETE /api/tickets/:id     ← see service layer below
} from "../../services/adminApi";

import { FiTrash2, FiRefreshCw } from "react-icons/fi";
import "./adminLayout.css";   // colours / fonts already defined

export default function AdminTickets() {
  /* ---------------- state ---------------- */
  const [tickets, setTickets] = useState([]);
  const [pending, setPending] = useState(true);   // tab switch

  /* ---------------- data ---------------- */
  useEffect(() => { (async () => setTickets(await listTickets()))(); }, []);

  /* ---------------- helpers ---------------- */
  const del = async (t) => {
    if (!window.confirm("Delete this ticket permanently?")) return;
    await deleteTicket(t._id);
    setTickets((p) => p.filter((x) => x._id !== t._id));
  };

  const reopen = async (t) => {
    await updateTicket(t._id, { status: "Open", closedBy: "", resolutionNote: "" });
    setTickets((p) =>
      p.map((x) => (x._id === t._id ? { ...x, status: "Open" } : x))
    );
    setPending(true);
  };

  /* ---------------- filters ---------------- */
  const pendingList   = tickets.filter((t) => t.status !== "Resolved");
  const resolvedList  = tickets.filter((t) => t.status === "Resolved");

  /* ---------------- ui ---------------- */
  return (
    <div className="p-4">
      <h2 className="mb-4">Support Tickets</h2>

      {/* tab buttons */}
      <div className="btn-group mb-4">
        <button
          className={`btn btn-sm ${pending ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setPending(true)}
        >
          Pending ({pendingList.length})
        </button>
        <button
          className={`btn btn-sm ${pending ? "btn-outline-secondary" : "btn-primary"}`}
          onClick={() => setPending(false)}
        >
          Resolved ({resolvedList.length})
        </button>
      </div>

      {/* list */}
      <div className="list-group shadow-sm">
        {(pending ? pendingList : resolvedList).map((t) => (
          <div key={t._id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{t.subject}</strong>
                <small className="text-muted ms-2">{t.userEmail}</small>
              </div>

              {/* actions */}
              <div className="btn-group">
                {t.status === "Resolved" && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => reopen(t)}
                          title="Re‑open">
                    <FiRefreshCw />
                  </button>
                )}
                <button className="btn btn-sm btn-outline-danger" onClick={() => del(t)}
                        title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="mt-1">
              <span className="badge bg-info me-2">{t.category}</span>
              <span className="badge bg-warning text-dark">{t.priority}</span>
            </div>

            <p className="mb-1 mt-2">{t.description}</p>

            {t.status === "Resolved" && (
              <p className="mb-0 small">
                <em>Resolved by {t.closedBy}: “{t.resolutionNote || "—"}”</em>
              </p>
            )}
          </div>
        ))}

        {(pending ? pendingList : resolvedList).length === 0 && (
          <div className="text-center text-muted p-5">Nothing to show</div>
        )}
      </div>
    </div>
  );
}
