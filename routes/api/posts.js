const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

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

module.exports = router;
