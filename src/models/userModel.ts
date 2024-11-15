// models/userModel.ts
import db from "../lib/db"; // Assuming you have a db connection setup

export const User = {
  id: 1,
  email: process.env.USER_EMAIL || "mgr@ifca.co.id",
  password: process.env.USER_PASSWORD || "1fc41fc4", // Consider hashing passwords
};
