const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(404).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', [ auth, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', 'Skills is required').not().isEmpty()
] ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { skills, name }  = req.body;
  const standardFields = ['company', 'website', 'location', 'bio', 'status', 'githubusername'];
  const socialFields = ['youtube', 'facebook', 'twitter', 'instagram', 'linkedin'];

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;

  standardFields.forEach(field => {
    if (req.body.hasOwnProperty(field)) {
      profileFields[field] = req.body[field];
    }
  });

  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  // Build social object
  profileFields.social = {};
  socialFields.forEach(field => {
    if (req.body.hasOwnProperty(field)) {
      profileFields.social[field] = req.body[field];
    }
  });

  console.log(profileFields);

  try {
    let user;
    if (name) {
      user = await User.findByIdAndUpdate(req.user.id, { name });
    }
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();

    res.json(profile);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const profile = await Profile.findOne({ user: user_id }).populate('user', ['name', 'avatar']);
      if (!profile) {
        return res.status(404).json({ msg: 'Profile not found' });
      }

      res.json(profile);
    } catch(err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Profile not found' });
      }
      res.status(500).send('Server Error');
    }
});

module.exports = router;
