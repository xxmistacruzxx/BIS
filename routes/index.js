import loginRoutes from "./login.js";
import registerRoutes from "./register.js";
import logoutRoutes from "./logout.js";
import profileRoutes from "./profile.js";
import dataRoutes from "./data.js";
import addRoutes from "./add.js";
import editRoutes from "./edit.js";
import deleteRoutes from "./delete.js";
import buildingRoutes from "./building.js";
import roomRoutes from "./room.js";
import containerRoutes from "./container.js";
import itemRoutes from "./item.js";

const constructorMethod = (app) => {
  app.use("/login", loginRoutes);
  app.use("/register", registerRoutes);
  app.use("/logout", logoutRoutes);
  app.use("/profile", profileRoutes);
  app.use("/add", addRoutes);
  app.use("/edit", editRoutes);
  app.use("/delete", deleteRoutes);
  app.use("/data", dataRoutes);
  app.use("/building", buildingRoutes);
  app.use("/room", roomRoutes);
  app.use("/container", containerRoutes);
  app.use("/item", itemRoutes);

  app.use("*", (req, res) => {
    return res.redirect("/");
  });

  app.use("/", (req, res) => {
    return res.json({ error: "YOU SHOULD NOT BE HERE" });
  });
};

export default constructorMethod;
