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
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(404).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills, name } = req.body;
    const standardFields = [
      'company',
      'website',
      'location',
      'bio',
      'status',
      'githubusername'
    ];
    const socialFields = [
      'youtube',
      'facebook',
      'twitter',
      'instagram',
      'linkedin'
    ];

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

    try {
      // Update user name if provided in req body
      let user;
      if (name) {
        user = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: { name } },
          { new: true }
        );
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

      res.json({
        profile,
        user
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
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
    const profile = await Profile.findOne({ user: user_id }).populate('user', [
      'name',
      'avatar'
    ]);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove users posts

    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    /// Remove user
    await User.findByIdAndRemove(req.user.id);

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fields = [
      'title',
      'company',
      'location',
      'from',
      'to',
      'current',
      'description'
    ];

    const newExp = {};
    fields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        newExp[field] = req.body[field];
      }
    });

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/profile/experience/:exp_id
// @desc    Update profile experience
// @access  Private
router.put(
  '/experience/:exp_id',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fields = [
      'title',
      'company',
      'location',
      'from',
      'to',
      'current',
      'description'
    ];

    const newExp = {};
    fields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        newExp[field] = req.body[field];
      }
    });

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const updateIndex = profile.experience.findIndex(
        item => item.id === req.params.exp_id
      );

      if (updateIndex < 0) {
        return res.status(404).json({ msg: 'Experience not found' });
      }

      newExp._id = profile.experience[updateIndex]._id;
      profile.experience.splice(updateIndex, 1, newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Experience not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience.findIndex(
      item => item.id === req.params.exp_id
    );

    if (removeIndex < 0) {
      return res.status(404).json({ msg: 'Experience not found' });
    }

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Experience not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fields = [
      'school',
      'degree',
      'fieldofstudy',
      'from',
      'to',
      'current',
      'description'
    ];

    const newEdu = {};
    fields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        newEdu[field] = req.body[field];
      }
    });

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/profile/education/:edu_id
// @desc    Update profile education
// @access  Private
router.put(
  '/education/:edu_id',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fields = [
      'school',
      'degree',
      'fieldofstudy',
      'from',
      'to',
      'current',
      'description'
    ];

    const newEdu = {};
    fields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        newEdu[field] = req.body[field];
      }
    });

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const updateIndex = profile.education.findIndex(
        item => item.id === req.params.edu_id
      );

      if (updateIndex < 0) {
        return res.status(404).json({ msg: 'Education not found' });
      }

      newEdu._id = profile.education[updateIndex]._id;
      profile.education.splice(updateIndex, 1, newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Education not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.education.findIndex(
      item => item.id === req.params.edu_id
    );

    if (removeIndex < 0) {
      return res.status(404).json({ msg: 'Education not found' });
    }

    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
