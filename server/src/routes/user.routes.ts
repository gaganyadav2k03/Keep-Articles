import {
  registerUser,
  loginUser,
  logoutUser,
  deleteArticle,
  createArticle,
  listArticles,
  updateArticle,
  articleById,
  listOlderVersions,
  getAllArticles,
  likesController,
  notificationRead,
  addMessage,
  messageById,
  messageList,
  profile,
  followController,
  // messageRead
} from "../controllers/user.controller";
import {
  getUnreadCounts,
  markMessagesAsRead,
} from "../controllers/message.controller";
import { Router } from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { users } from "../controllers/user.controller";
import { notificationController } from "../controllers/user.controller";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

//admin routes
router.get("/users", verifyAccessToken, users);
//Article routes
router.put("/profile", verifyAccessToken, profile);
router.post("/create-article", verifyAccessToken, createArticle);
router.get("/list-articles", verifyAccessToken, listArticles);
router.get("/article/:id", articleById);
router.post("/update-article/:id", verifyAccessToken, updateArticle);
router.delete("/delete-article/:id", verifyAccessToken, deleteArticle);
router.get("/version/:id", verifyAccessToken, listOlderVersions);
router.post("/likes/:id", verifyAccessToken, likesController);
router.get("/notifications", verifyAccessToken, notificationController);
router.put("/notificationsRead", verifyAccessToken, notificationRead);
router.post("/messages", verifyAccessToken, addMessage);
router.get("/messages/:id", verifyAccessToken, messageById);
router.get("/messageList", verifyAccessToken, messageList);
router.post("/follow/:authorId", verifyAccessToken, followController);
router.get("/unreadCounts", verifyAccessToken, getUnreadCounts);
router.post("/markAsRead/:userId", verifyAccessToken, markMessagesAsRead);
// router.put('/messageRead',verifyAccessToken,messageRead)
//public routes
router.get("/all-articles", getAllArticles);

export default router;
