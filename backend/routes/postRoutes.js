import express from "express";
import {
    createPost,
    deletePost,
    getPost,
    likeUnlikePost,
    replyToPost,
    getFeedPosts,
    deleteReply,
    getUserPosts
    
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
// Post routes
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost);
router.delete("/reply/:replyId", protectRoute, deleteReply);



export default router;
