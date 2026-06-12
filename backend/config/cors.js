const parseOrigins = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins(process.env.CLIENT_URL || process.env.CLIENT_URLS);

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  if (allowedOrigins.length === 0) {
    const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    return callback(null, localOrigins.includes(origin));
  }

  return callback(null, allowedOrigins.includes(origin));
};

module.exports = {
  corsOrigin,
  allowedOrigins
};
