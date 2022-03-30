// const AdminBro = require("admin-bro");
// const AdminBroExpress = require("admin-bro-expressjs");
// const AdminBroMongoose = require("admin-bro-mongoose");
// const mongoose = require("mongoose");
// AdminBro.registerAdapter(AdminBroMongoose);
// const adminBro = new AdminBro({
//   databases: [mongoose],
//   rootPath: "/admin",
// });

// const ADMIN = {
//   email: process.env.ADMIN_EMAIL || "test@example.com",
//   password: process.env.ADMIN_PASSWORD || "password",
// };
// const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
//   cookieName: process.env.ADMIN_COOKIE_NAME || "adminbro",
//   cookiePassword: process.env.ADMIN_COOKIE_PASS || "somePassword",
//   //   cookiePassword: "somePassword",
//   authenticate: async (email, password) => {
//     if (ADMIN.password === password && ADMIN.email === email) {
//       return ADMIN;
//     }
//     return null;
//   },
// });

// module.exports = router;
