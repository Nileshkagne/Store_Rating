const pool = require('../config/db');

// GET /api/owner/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get the owner's store
    const storeResult = await pool.query(
      'SELECT id, name, email, address FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          store: null,
          averageRating: null,
          ratings: [],
          message: 'No store assigned to your account yet.'
        }
      });
    }

    const store = storeResult.rows[0];

    // Get average rating
    const avgResult = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = $1',
      [store.id]
    );

    const totalRatings = parseInt(avgResult.rows[0].total_ratings);
    const averageRating = totalRatings > 0 ? parseFloat(parseFloat(avgResult.rows[0].average_rating).toFixed(1)) : null;

    // Get users who submitted ratings
    const ratingsResult = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
       u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    res.json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address
        },
        averageRating,
        totalRatings,
        ratings: ratingsResult.rows.map(r => ({
          id: r.id,
          userName: r.user_name,
          userEmail: r.user_email,
          rating: r.rating,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
