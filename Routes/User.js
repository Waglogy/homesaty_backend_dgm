import express from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/UserController.js";

const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-users", getUsers);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

export default router;