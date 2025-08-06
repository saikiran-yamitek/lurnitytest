import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const empSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone:    { type: String },
    gender:   { type: String, enum: ["Male", "Female", "Other"] },
    role: { type: String, enum: ["super", "content", "support", "instructor","lab administrator", "lab incharge","placement"], default: "content" }
  },
  { timestamps: true }
);

empSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Employee", empSchema);
