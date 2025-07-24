import express  from "express";
import Ticket    from "../models/Ticket.js";
import User      from "../models/User.js";

const router = express.Router();

/* helper to create sequential ticket IDs */
const makeId = async () => {
  const now = new Date();
  const prefix = `TIC-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,"0")}-`;
  const last   = await Ticket.findOne({ ticketId: new RegExp(`^${prefix}`) })
                             .sort({ createdAt: -1 });
  const seqNum = last ? Number(last.ticketId.slice(-4)) + 1 : 1;
  return prefix + seqNum.toString().padStart(4,"0");
};

/* -------- POST /api/tickets  (raise ticket) -------- */
router.post("/", async (req,res) => {
  try{
    const ticketId = await makeId();
    const t = new Ticket({ ...req.body, ticketId });
    await t.save();

    /* store id in user doc (optional, no middleware) */
    await User.findByIdAndUpdate(req.body.userId,
      { $push:{ ticketIds: t._id } });

    res.json(t);
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Ticket create failed" });
  }
});

/* -------- GET /api/tickets          (all) -------- */
router.get("/", async (_req,res) => {
  const list = await Ticket.find().sort({ createdAt:-1 });
  res.json(list);
});

/* -------- PATCH /api/tickets/:id    (update/close) -------- */
// tickets.js
router.patch("/:id", async (req, res) => {
  const t = await Ticket.findById(req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });

  Object.assign(t, req.body); // status, closedBy, etc.
  await t.save();

  // ✅ Update user's lastSeenResolvedTicketId if resolved
  if (t.status === "Resolved") {
    await User.findOneAndUpdate(
      { email: t.userEmail },
      { lastSeenResolvedTicketId: t._id }
    );
  }

  res.json(t);
});






/* -------- PATCH /api/tickets/:id    (update/close) -------- */



export default router;
