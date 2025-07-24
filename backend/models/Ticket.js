import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId:   { type: String, required: true, unique: true },   // e.g. TIC‑202507‑0001
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail:  { type: String, required: true },

    category:   { type: String, enum: [
      "Technical issue", "Payment related", "Login", "Bug report", "Feedback", "Other"
    ], required: true },
    priority:   { type: String, enum: ["Low", "Medium", "High"], default: "Low" },

    subject:    { type: String, required: true },
    description:{ type: String, required: true },
    attachment: { type: String },          // URL to uploaded file (optional)

    deviceInfo: { type: String },
    status:     { type: String, enum: ["Open","In‑progress","Resolved"], default: "Open" },
    closedBy:   { type: String }   ,
    resolutionNote: { type: String },        // employee name

  }, { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
