const jwt = require('jsonwebtoken');

// 校验请求头 Authorization: Bearer <token>
// 供后续需要登录态的受保护接口使用（例如记账、账本等）
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未登录或登录已过期' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, ... }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: '未登录或登录已过期' });
  }
}

module.exports = authMiddleware;
