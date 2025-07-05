const crypto = require('crypto');
const mongoose = require('mongoose');
const validators = require('validator');
const bcrypt = require('bcrypt');

const userScheme = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must has name'],
    minlength: [4, 'Name length must be > 5 digits'],
    maxlength: [30, 'Name length must be < 30 digits'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validators.isEmail, 'Email must be valid']
  },
  password: {
    type: String,
    required: [true, 'User must has a password'],
    minlength: [6, 'User password must be > 6 digits'],
    maxlength: [30, 'User password must be < 30 digis'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User must has a password'],
    minlength: [6, 'User password must be > 6 digits'],
    maxlength: [30, 'User password must be < 30 digis'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Confirm password incorrect'
    }
  },
  CreatedPasswordAt: Date,
  PasswordResetToken: String,
  PasswordResetExpire: Date,
  active: {
    type: Boolean,
    default: true
  }
});

//Encrypt pasword when it's created
userScheme.pre('save', async function (next) {
  //Make sure it's used only when the password is modified
  if (!this.isModified('password')) return next();

  //Encrpt the password
  this.password = await bcrypt.hash(this.password, 12);

  //Get rid of PasswordConfirm
  this.passwordConfirm = undefined;

  //Continue to the next middleware
  next();
});

userScheme.pre('save', function (next) {
  // Password Modified and not new => set createdpassword
  if (!this.isModified('password') || this.isNew) return next();
  this.CreatedPasswordAt = Date.now() - 1000;
  next();
});

// With all find operations Select Active users(Deleted User eliminated)
userScheme.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// STATIC METHODS:
// TO compare input password with DB user password
userScheme.methods.correctPassword = async function (InpPassword, password) {
  return await bcrypt.compare(InpPassword, password);
};

userScheme.methods.changedPassword = function (jwtTime) {
  if (this.CreatedPasswordAt) {
    const createdTimeStamp = parseInt(
      this.CreatedPasswordAt.getTime() / 1000,
      10
    );
    return createdTimeStamp > jwtTime;
  }
  return false;
};

const User = mongoose.model('user', userScheme);
module.exports = User;
