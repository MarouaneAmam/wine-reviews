const db = require("./db");

// Change this username to the one you created:
const username = "testuser";

const result = db.prepare("UPDATE users SET role='admin' WHERE username=?").run(username);

if (result.changes === 0) {
  console.log("No user found with username:", username);
} else {
  console.log("User is now admin:", username);
}
