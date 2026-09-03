const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.code === '23505') {
    // Unique constraint violation
    if (err.constraint === 'users_email_key') {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
    if (err.constraint === 'ratings_user_id_store_id_key') {
      return res.status(409).json({ success: false, message: 'You have already rated this store. Use modify instead.' });
    }
    return res.status(409).json({ success: false, message: 'Duplicate entry.' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found.' });
  }

  if (err.code === '23514') {
    return res.status(400).json({ success: false, message: 'Invalid value. Check constraints.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
