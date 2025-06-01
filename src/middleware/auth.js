import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env"
  );
}

export default async function auth(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Please authenticate.");
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Please authenticate.");
  }

  const user = await User.findOne({ _id: decoded.userId });
  if (!user) {
    throw new Error("Please authenticate.");
  }

  req.user = user;
  req.token = token;
}
