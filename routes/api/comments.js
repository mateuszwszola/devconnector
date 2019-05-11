const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');

// @route   POST api/posts/comment/:post_id
// @desc    Comment to a post
// @access  Private
router.post(
  '/:post_id',
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
      const post = await Post.findById(req.params.post_id);
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      const newComment = {
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar
      };

      post.comments = [newComment, ...post.comments];

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Remove a comment from a post
// @access  Private
router.delete('/:post_id/:comment_id', auth, async (req, res) => {
  const { post_id, comment_id } = req.params;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(
      comment => comment.id === comment_id
    );
    if (commentIndex < 0) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (post.comments[commentIndex].user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = [
      ...post.comments.slice(0, commentIndex),
      ...post.comments.slice(commentIndex + 1)
    ];

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      if (err.model.modelName === 'post') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
