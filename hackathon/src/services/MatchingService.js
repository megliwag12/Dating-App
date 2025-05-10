/**
 * Matching Service
 * Contains algorithms for matching users based on preferences and compatibility
 */

class MatchingService {
  /**
   * Calculates compatibility score between two users
   * @param {Object} user1 - First user object
   * @param {Object} user2 - Second user object
   * @returns {Number} Compatibility score (0-100)
   */
  calculateCompatibilityScore(user1, user2) {
    let score = 0;
    const weights = {
      interests: 40,
      age: 20,
      location: 40
    };
    
    // Interest compatibility (percentage of shared interests)
    const interestScore = this.calculateInterestCompatibility(user1, user2);
    
    // Age compatibility (inversely proportional to age difference)
    const ageScore = this.calculateAgeCompatibility(user1, user2);
    
    // Location compatibility (based on distance)
    const locationScore = this.calculateLocationCompatibility(user1, user2);
    
    // Calculate weighted score
    score = (interestScore * weights.interests) + 
            (ageScore * weights.age) + 
            (locationScore * weights.location);
            
    return Math.min(Math.round(score), 100);
  }
  
  /**
   * Calculate interest compatibility (0-1)
   */
  calculateInterestCompatibility(user1, user2) {
    const interests1 = new Set(user1.profile.interests);
    const interests2 = new Set(user2.profile.interests);
    
    if (interests1.size === 0 || interests2.size === 0) return 0;
    
    // Find intersection of interests
    const sharedInterests = [...interests1].filter(interest => interests2.has(interest));
    
    // Calculate Jaccard similarity (intersection over union)
    const union = new Set([...interests1, ...interests2]);
    return sharedInterests.length / union.size;
  }
  
  /**
   * Calculate age compatibility (0-1)
   */
  calculateAgeCompatibility(user1, user2) {
    const age1 = user1.profile.age;
    const age2 = user2.profile.age;
    
    // Check if each user falls within the other's age preferences
    const user1MinAge = user1.profile.preferences.minAge || 18;
    const user1MaxAge = user1.profile.preferences.maxAge || 100;
    const user2MinAge = user2.profile.preferences.minAge || 18;
    const user2MaxAge = user2.profile.preferences.maxAge || 100;
    
    const user1LikesUser2Age = age2 >= user1MinAge && age2 <= user1MaxAge;
    const user2LikesUser1Age = age1 >= user2MinAge && age1 <= user2MaxAge;
    
    if (!user1LikesUser2Age || !user2LikesUser1Age) return 0;
    
    // Calculate score based on age difference
    const ageDifference = Math.abs(age1 - age2);
    // Assuming larger age differences reduce compatibility
    return Math.max(0, 1 - (ageDifference / 20)); // 20 year difference gives score of 0
  }
  
  /**
   * Calculate location compatibility (0-1)
   * For now using a simple implementation
   * In a real app, would use coordinates and distance calculations
   */
  calculateLocationCompatibility(user1, user2) {
    // Simple implementation - checking if locations match
    // In a real app, would use geocoding and distance calculations
    if (user1.profile.location === user2.profile.location) {
      return 1;
    }
    
    // Placeholder for distance-based calculation
    // Would normally use coordinates and haversine formula
    return 0.5; // Default moderate score for different locations
  }
  
  /**
   * Find potential matches for a user
   * @param {Object} user - User to find matches for
   * @param {Array} userPool - Pool of potential matches
   * @param {Number} limit - Maximum number of matches to return
   * @returns {Array} Array of potential matches with compatibility scores
   */
  findPotentialMatches(user, userPool, limit = 20) {
    // Filter out users that don't match basic criteria
    const filteredPool = this.filterUserPool(user, userPool);
    
    // Calculate compatibility scores
    const scoredMatches = filteredPool.map(potentialMatch => ({
      user: potentialMatch,
      compatibilityScore: this.calculateCompatibilityScore(user, potentialMatch)
    }));
    
    // Sort by compatibility score (highest first)
    scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    // Return top matches
    return scoredMatches.slice(0, limit);
  }
  
  /**
   * Filter user pool based on basic preferences
   */
  filterUserPool(user, userPool) {
    return userPool.filter(potentialMatch => {
      // Skip the user themselves
      if (potentialMatch._id.toString() === user._id.toString()) return false;
      
      // Skip already liked or disliked users
      if (user.likes.includes(potentialMatch._id) || 
          user.dislikes.includes(potentialMatch._id)) return false;
      
      // Check gender preference
      const genderPrefs = user.profile.preferences.genderPreference;
      if (genderPrefs && genderPrefs.length > 0 && 
          !genderPrefs.includes(potentialMatch.profile.gender)) return false;
      
      // Check age range
      const minAge = user.profile.preferences.minAge || 18;
      const maxAge = user.profile.preferences.maxAge || 100;
      if (potentialMatch.profile.age < minAge || 
          potentialMatch.profile.age > maxAge) return false;
      
      // All basic criteria passed
      return true;
    });
  }
}

module.exports = new MatchingService();
