import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";

import configRoutes from "./routes/index.js";
import middleware from "./middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const staticDir = express.static(__dirname + "/public");

app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    saveUninitialized: false,
    resave: false,
  })
);

app.use("/public", staticDir);
app.use(middleware.rewriteUnsupportedBrowserMethods);
app.use(middleware.loggingMiddleware);
app.use("/", middleware.noAuthRedirect);
app.use("/", middleware.authRedirect);

app.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}))

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}, {partialsDir: __dirname + "/views/partials"}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});