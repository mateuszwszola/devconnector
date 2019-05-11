const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

// Load models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
// Load routers
const commentRouter = require('./comments');

router.use('/comment', commentRouter);

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:post_id
// @desc    Get single post by ID
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      // This code will run if user passes valid post ID, but the post with this ID does not exists
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    // If the user passes invalid post id the code below will run
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:post_id
// @desc    Delete post
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // There is a post, make sure the user is the owner of that post
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User not authorized to delete that post' });
    }
    await post.remove();
    res.json({ msg: 'Post deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  const { id } = req.params;
  // Grab the post
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // Check if the post has already been liked
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );
    if (likeIndex > -1) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes = [{ user: req.user.id }, ...post.likes];
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Remove like from a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  const { id } = req.params;
  // Grab the post
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // Check if the post has already been liked
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );
    if (likeIndex < 0) {
      return res.status(400).json({ msg: 'Post has not been yet liked' });
    }
    post.likes = [
      ...post.likes.slice(0, likeIndex),
      ...post.likes.slice(likeIndex + 1)
    ];
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/:post_id/like
// @desc    Toggle post like
// @access  Private
router.put('/:post_id/like', auth, async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // Check if user has already been liked
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );
    if (likeIndex < 0) {
      // User hasn't yet liked this post, like it
      post.likes = [{ user: req.user.id }, ...post.likes];
    } else {
      post.likes = [
        ...post.likes.slice(0, likeIndex),
        ...post.likes.slice(likeIndex + 1)
      ];
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
