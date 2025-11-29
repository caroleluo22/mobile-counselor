const Post = require('../models/post.model');

exports.listPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; // Default page size of 5
        const skip = (page - 1) * limit;

        const posts = await Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({ posts, totalPages, currentPage: page });
    } catch (error) {
        console.error('Failed to fetch posts with pagination', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content || !category) {
            return res.status(400).json({ message: 'Title, content, and category are required' });
        }
        const post = await Post.create({
            user: req.user._id,
            authorName: req.user.displayName,
            title,
            content,
            category,
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create post' });
    }
};

exports.addReply = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Reply content is required' });
        }
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.replies.push({
            user: req.user._id,
            authorName: req.user.displayName,
            content,
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add reply' });
    }
};

exports.updatePostWithAIReply = async (req, res) => {
    try {
        const { postId } = req.params;
        const { aiReply } = req.body;

        const post = await Post.findByIdAndUpdate(postId, { aiReply }, { new: true });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update post with AI reply' });
    }
};