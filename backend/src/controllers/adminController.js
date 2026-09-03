const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { validateName, validateEmail, validatePassword, validateAddress, validateRole } = require('../validators');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const storesResult = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsResult = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalStores: parseInt(storesResult.rows[0].count),
        totalRatings: parseInt(ratingsResult.rows[0].count)
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (name) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${name}%`);
    }
    if (email) {
      query += ` AND email ILIKE $${paramIndex++}`;
      params.push(`%${email}%`);
    }
    if (address) {
      query += ` AND address ILIKE $${paramIndex++}`;
      params.push(`%${address}%`);
    }
    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    // Sorting
    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const errors = [];
    const nameErr = validateName(name);
    if (nameErr) errors.push(nameErr);
    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);
    const passErr = validatePassword(password);
    if (passErr) errors.push(passErr);
    const addrErr = validateAddress(address);
    if (addrErr) errors.push(addrErr);
    const roleErr = validateRole(role);
    if (roleErr) errors.push(roleErr);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at',
      [name.trim(), email.trim().toLowerCase(), passwordHash, address ? address.trim() : null, role]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    // If user is a STORE_OWNER, also get their store rating
    if (user.role === 'STORE_OWNER') {
      const storeResult = await pool.query(
        `SELECT s.id, s.name, s.email, s.address,
         COALESCE(AVG(r.rating), 0) as average_rating,
         COUNT(r.id) as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [user.id]
      );

      if (storeResult.rows.length > 0) {
        const store = storeResult.rows[0];
        user.store = {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating: store.total_ratings > 0 ? parseFloat(parseFloat(store.average_rating).toFixed(1)) : null,
          totalRatings: parseInt(store.total_ratings)
        };
      }
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stores
const getStores = async (req, res, next) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (name) {
      query += ` AND s.name ILIKE $${paramIndex++}`;
      params.push(`%${name}%`);
    }
    if (email) {
      query += ` AND s.email ILIKE $${paramIndex++}`;
      params.push(`%${email}%`);
    }
    if (address) {
      query += ` AND s.address ILIKE $${paramIndex++}`;
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id, u.name';

    // Sorting
    const allowedSortFields = { name: 's.name', email: 's.email', address: 's.address', rating: 'average_rating' };
    const sortField = allowedSortFields[sortBy] || 's.created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    const result = await pool.query(query, params);

    const stores = result.rows.map(store => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.owner_id,
      ownerName: store.owner_name,
      averageRating: parseInt(store.total_ratings) > 0 ? parseFloat(parseFloat(store.average_rating).toFixed(1)) : null,
      totalRatings: parseInt(store.total_ratings)
    }));

    res.json({ success: true, data: stores });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/stores
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors = [];
    const nameErr = validateName(name);
    if (nameErr) errors.push(nameErr);
    if (email) {
      const emailErr = validateEmail(email);
      if (emailErr) errors.push(emailErr);
    }
    const addrErr = validateAddress(address);
    if (addrErr) errors.push(addrErr);

    if (!ownerId) {
      errors.push('Store owner is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    // Verify owner exists and is a STORE_OWNER
    const ownerResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [ownerId]);
    if (ownerResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Owner user not found.' });
    }
    if (ownerResult.rows[0].role !== 'STORE_OWNER') {
      return res.status(400).json({ success: false, message: 'Selected user is not a Store Owner.' });
    }

    // Check if owner already has a store
    const existingStore = await pool.query('SELECT id FROM stores WHERE owner_id = $1', [ownerId]);
    if (existingStore.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This Store Owner already has a store assigned.' });
    }

    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id, created_at',
      [name.trim(), email ? email.trim().toLowerCase() : null, address ? address.trim() : null, ownerId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getUsers, createUser, getUserById, getStores, createStore };
