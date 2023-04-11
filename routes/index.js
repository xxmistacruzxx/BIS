import buildingRoutes from "./building.js";

const constructorMethod = (app) => {
  app.use("/building/", buildingRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" });
  });
};

export default constructorMethod;
