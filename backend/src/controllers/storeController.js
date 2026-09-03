const pool = require('../config/db');
const { validateRating } = require('../validators');

// GET /api/stores
const getStores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, address, sortBy, sortOrder } = req.query;

    let query = `
      SELECT s.id, s.name, s.address,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
      WHERE 1=1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (name) {
      query += ` AND s.name ILIKE $${paramIndex++}`;
      params.push(`%${name}%`);
    }
    if (address) {
      query += ` AND s.address ILIKE $${paramIndex++}`;
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id, ur.rating';

    // Sorting
    const allowedSortFields = { name: 's.name', address: 's.address', rating: 'average_rating' };
    const sortField = allowedSortFields[sortBy] || 's.name';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(query, params);

    const stores = result.rows.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address,
      averageRating: parseInt(store.total_ratings) > 0 ? parseFloat(parseFloat(store.average_rating).toFixed(1)) : null,
      totalRatings: parseInt(store.total_ratings),
      userRating: store.user_rating ? parseInt(store.user_rating) : null
    }));

    res.json({ success: true, data: stores });
  } catch (err) {
    next(err);
  }
};

// POST /api/stores/:id/rating
const submitRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeId = req.params.id;
    const { rating } = req.body;

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ success: false, message: ratingErr });
    }

    // Check store exists
    const storeResult = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if user already rated this store
    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already rated this store. Use modify rating instead.' });
    }

    const result = await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING id, user_id, store_id, rating, created_at',
      [userId, storeId, parseInt(rating)]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/stores/:id/rating
const modifyRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeId = req.params.id;
    const { rating } = req.body;

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ success: false, message: ratingErr });
    }

    // Check existing rating
    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No existing rating found. Submit a rating first.' });
    }

    const result = await pool.query(
      'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3 RETURNING id, user_id, store_id, rating, updated_at',
      [parseInt(rating), userId, storeId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStores, submitRating, modifyRating };
