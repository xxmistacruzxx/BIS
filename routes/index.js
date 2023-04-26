import loginRoutes from "./login.js";
import registerRoutes from "./register.js";
import profileRoutes from "./profile.js";
import userRoutes from "./user.js";
import buildingRoutes from "./building.js";
import roomRoutes from "./room.js";

const constructorMethod = (app) => {
  app.use("/login", loginRoutes);
  app.use("/register", registerRoutes);
  app.use("/profile", profileRoutes);
  // app.use("/user", userRoutes);
  // app.use("/building", buildingRoutes);
  // app.use("/room", roomRoutes);

  app.use("/", (req, res) => {
    return res.json({error: "YOU SHOULD NOT BE HERE"})
  });

  app.use("*", (req, res) => {
    return res.redirect("/");
  });
};

export default constructorMethod;
