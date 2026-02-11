import { Request, Response } from "express";
import { db } from "../db";

// GET all users
export const getUsers = async (_: Request, res: Response) => {
  const database = await db;
  const users = await database.all("SELECT * FROM users");
  res.json(users);
};

// GET single user
export const getUser = async (req: Request, res: Response) => {
  const database = await db;
  const user = await database.get(
    "SELECT * FROM users WHERE id = ?",
    req.params.id
  );
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(user);
};

// CREATE user with optional avatar upload
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    const database = await db;

    const result = await database.run(
      "INSERT INTO users (name, email, avatar) VALUES (?, ?, ?)",
      [name, email, avatar]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      email,
      avatar,
    });
  } catch (err: any) {
    // ✅ Handle duplicate email
    if (
      err.code === "SQLITE_CONSTRAINT" &&
      err.message.includes("users.email")
    ) {
      return res.status(409).json({
        message: "User already exists with this email.",
      });
    }

    // fallback
    res.status(500).json({
      message: "Failed to create user.",
    });
  }
};


// UPDATE user with optional avatar upload
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    const database = await db;

    if (avatar) {
      await database.run(
        "UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?",
        [name, email, avatar, req.params.id]
      );
    } else {
      await database.run(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, req.params.id]
      );
    }

    const updatedUser = await database.get(
      "SELECT * FROM users WHERE id = ?",
      req.params.id
    );

    res.json(updatedUser);
  } catch (err: any) {
    if (
      err.code === "SQLITE_CONSTRAINT" &&
      err.message.includes("users.email")
    ) {
      return res.status(409).json({
        message: "Another user already exists with this email.",
      });
    }

    res.status(500).json({
      message: "Failed to update user.",
    });
  }
};


// DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const database = await db;
    await database.run("DELETE FROM users WHERE id = ?", req.params.id);
    res.json({ message: "User deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET users grouped by date (for dashboard chart)
export const getUserStats = async (_: Request, res: Response) => {
  const database = await db;

  const rows = await database.all(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM users
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `);

  res.json(rows);
};
