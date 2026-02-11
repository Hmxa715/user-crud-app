import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} from "../controllers/users.controller";

const router = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getUsers);
router.get("/:id", getUser);

// Use multer for file upload on create
router.post("/", upload.single("avatar"), createUser);

// Use multer for file upload on update
router.put("/:id", upload.single("avatar"), updateUser);

router.delete("/:id", deleteUser);

router.get("/stats/growth", getUserStats);

export default router;
