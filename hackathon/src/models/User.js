const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 18
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'non-binary', 'other']
    },
    location: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      maxlength: 500
    },
    interests: [{
      type: String,
      trim: true
    }],
    photos: [{
      url: String,
      isPrimary: Boolean
    }],
    preferences: {
      genderPreference: [{
        type: String,
        enum: ['male', 'female', 'non-binary', 'other']
      }],
      minAge: {
        type: Number,
        default: 18
      },
      maxAge: {
        type: Number,
        default: 100
      },
      maxDistance: {
        type: Number,
        default: 50 // in kilometers
      }
    }
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
