const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required.';
  if (name.trim().length < 20) return 'Name must be at least 20 characters.';
  if (name.trim().length > 60) return 'Name must be at most 60 characters.';
  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Invalid email format.';
  return null;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 16) return 'Password must be at most 16 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character.';
  return null;
};

const validateAddress = (address) => {
  if (address && typeof address === 'string' && address.trim().length > 400) {
    return 'Address must be at most 400 characters.';
  }
  return null;
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null) return 'Rating is required.';
  const num = Number(rating);
  if (!Number.isInteger(num)) return 'Rating must be an integer.';
  if (num < 1 || num > 5) return 'Rating must be between 1 and 5.';
  return null;
};

const validateRole = (role) => {
  const validRoles = ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
  if (!role || !validRoles.includes(role)) {
    return `Role must be one of: ${validRoles.join(', ')}.`;
  }
  return null;
};

module.exports = { validateName, validateEmail, validatePassword, validateAddress, validateRating, validateRole };
