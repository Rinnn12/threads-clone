import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.model.js"




const createPost = async (req, res) => {
	try {
	  const { postedBy, text, img, taggedUsers } = req.body;
  
	  if (!postedBy || !text) {
		return res.status(400).json({ error: "PostedBy and text fields are required" });
	  }
  
	  const user = await User.findById(postedBy);
	  if (!user) {
		return res.status(404).json({ error: "User not found" });
	  }
  
	  if (user._id.toString() !== req.user._id.toString()) {
		return res.status(401).json({ error: "Unauthorized to create post" });
	  }
  
	  const maxLength = 500;
	  if (text.length > maxLength) {
		return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
	  }
  
	  let imageUrl = img;
	  if (img) {
		const uploadedResponse = await cloudinary.uploader.upload(img);
		imageUrl = uploadedResponse.secure_url;
	  }
  
	  const newPost = new Post({
		postedBy,
		text,
		img: imageUrl,
		tags: taggedUsers, // Save tagged user IDs
	  });
  
	  await newPost.save();
  
	  res.status(201).json(newPost);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  


const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to delete post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			// Create notification for the post author
			const notification = new Notification({
				from: userId,
				to: post.postedBy,  // Reference 'postedBy' instead of 'user'
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const reply = { userId, text, userProfilePic, username };

		post.replies.push(reply);
		await post.save();

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;

		const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const deleteReply = async (req, res) => {
    try {
        // Find the post that contains the reply
        const post = await Post.findOne({ "replies._id": req.params.replyId });

        if (!post) {
            return res.status(404).json({ error: "Post or reply not found" });
        }

        // Find the index of the reply to delete
        const replyIndex = post.replies.findIndex(reply => reply._id.toString() === req.params.replyId);

        // Check if the reply exists
        if (replyIndex === -1) {
            return res.status(404).json({ error: "Reply not found" });
        }

        // Check if the user is authorized to delete the reply
        if (post.replies[replyIndex].userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete this reply" });
        }

        // Remove the reply from the array
        post.replies.splice(replyIndex, 1);

        // Save the updated post
        await post.save();

        res.status(200).json({ message: "Reply deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
	  const user = await User.findOne({ username });
	  if (!user) {
		return res.status(404).json({ error: "User not found" });
	  }
  
	  const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });
  
	  res.status(200).json(posts);
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  };
  


  
  
  
export {createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts,  getUserPosts  };
