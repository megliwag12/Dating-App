const express = require('express');
const router = express.Router();
const MatchController = require('../controllers/MatchController');
const auth = require('../middleware/auth');

// Routes
router.get('/potential', auth, MatchController.getPotentialMatches);
router.post('/like/:userId', auth, MatchController.likeUser);
router.post('/dislike/:userId', auth, MatchController.dislikeUser);
router.get('/matches', auth, MatchController.getMatches);

module.exports = router;
