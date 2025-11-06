// client/src/config/api.js
const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

export default API_BASE;