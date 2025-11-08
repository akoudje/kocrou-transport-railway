// client/index.js
const serve = require("serve");
const port = process.env.PORT || 3000;

serve("build", {
  port,
  single: true,
});