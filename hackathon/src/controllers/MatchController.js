const User = require('../models/User');
const MatchingService = require('../services/MatchingService');

class MatchController {
  /**
   * Get potential matches for the current user
   */
  async getPotentialMatches(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get all users except current user, already liked or disliked users
      const userPool = await User.find({
        _id: { $ne: user._id },
        _id: { $nin: [...user.likes, ...user.dislikes] }
      });
      
      // Get potential matches using matching service
      const potentialMatches = MatchingService.findPotentialMatches(user, userPool);
      
      // Format response to exclude sensitive data
      const formattedMatches = potentialMatches.map(match => ({
        _id: match.user._id,
        profile: {
          name: match.user.profile.name,
          age: match.user.profile.age,
          gender: match.user.profile.gender,
          location: match.user.profile.location,
          bio: match.user.profile.bio,
          interests: match.user.profile.interests,
          photos: match.user.profile.photos
        },
        compatibilityScore: match.compatibilityScore
      }));
      
      res.json(formattedMatches);
    } catch (error) {
      console.error('Get potential matches error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  /**
   * Like a user
   */
  async likeUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUser = await User.findById(req.user.userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Validate that userId exists
      const likedUser = await User.findById(userId);
      if (!likedUser) {
        return res.status(404).json({ message: 'User to like not found' });
      }
      
      // Check if already liked
      if (currentUser.likes.includes(userId)) {
        return res.status(400).json({ message: 'User already liked' });
      }
      
      // Add to likes
      currentUser.likes.push(userId);
      
      // Check if this creates a match (both users liked each other)
      const isMatch = likedUser.likes.includes(currentUser._id);
      
      if (isMatch) {
        // Create a match
        currentUser.matches.push(userId);
        likedUser.matches.push(currentUser._id);
        await likedUser.save();
      }
      
      await currentUser.save();
      
      res.json({ 
        message: isMatch ? 'Match created!' : 'User liked successfully',
        isMatch
      });
    } catch (error) {
      console.error('Like user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  /**
   * Dislike a user
   */
  async dislikeUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUser = await User.findById(req.user.userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Validate that userId exists
      const dislikedUser = await User.findById(userId);
      if (!dislikedUser) {
        return res.status(404).json({ message: 'User to dislike not found' });
      }
      
      // Check if already disliked
      if (currentUser.dislikes.includes(userId)) {
        return res.status(400).json({ message: 'User already disliked' });
      }
      
      // Add to dislikes
      currentUser.dislikes.push(userId);
      await currentUser.save();
      
      res.json({ message: 'User disliked successfully' });
    } catch (error) {
      console.error('Dislike user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  /**
   * Get all matches for the current user
   */
  async getMatches(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .populate('matches', 'profile.name profile.age profile.gender profile.photos');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user.matches);
    } catch (error) {
      console.error('Get matches error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new MatchController();
