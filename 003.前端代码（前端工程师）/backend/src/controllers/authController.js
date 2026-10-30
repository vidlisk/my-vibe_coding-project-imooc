const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const SALT_ROUNDS = 10;

// 生成 JWT（前端会把它存到 localStorage 的 token 里）
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/register
async function register(req, res) {
  const { username, password, nickname } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }
  if (String(username).trim().length < 3) {
    return res.status(400).json({ success: false, message: '用户名需至少3个字符' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: '密码需至少6个字符' });
  }

  try {
    // 检查用户名是否已存在
    const [existRows] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existRows.length > 0) {
      return res.status(409).json({ success: false, message: '用户名已存在' });
    }

    // 密码哈希（绝不明文存储）
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const finalNickname = (nickname && String(nickname).trim()) || username;

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, passwordHash, finalNickname]
    );

    const userId = Number(result.insertId);
    const token = signToken({ id: userId, username });

    return res.status(201).json({
      success: true,
      message: '注册成功',
      data: { token, userId, username, nickname: finalNickname },
    });
  } catch (err) {
    console.error('注册失败:', err);
    return res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// POST /api/login
async function login(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password, nickname, theme FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const user = rows[0];

    // 校验密码
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        userId: Number(user.id),
        username: user.username,
        nickname: user.nickname || user.username,
        theme: user.theme || 'light',
      },
    });
  } catch (err) {
    console.error('登录失败:', err);
    return res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

module.exports = { register, login };
