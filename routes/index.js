import loginRoutes from "./login.js";
import registerRoutes from "./register.js";
import profileRoutes from "./profile.js";
import addRoutes from "./add.js"
import dataRoutes from "./data.js"
import userRoutes from "./user.js";
import buildingRoutes from "./building.js";
import roomRoutes from "./room.js";
import landingRoutes from "./landing.js";

const constructorMethod = (app) => {
  app.use("/login", loginRoutes);
  app.use("/register", registerRoutes);
  app.use("/profile", profileRoutes);
  app.use("/add", addRoutes)
  app.use("/data", dataRoutes)
  // app.use("/user", userRoutes);
  // app.use("/building", buildingRoutes);
  // app.use("/room", roomRoutes);

  app.use("*", (req, res) => {
    return res.redirect("/");
  });

  app.use("/", (req, res) => {
    return res.json({ error: "YOU SHOULD NOT BE HERE" });
  });
};

export default constructorMethod;
