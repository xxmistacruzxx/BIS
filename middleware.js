import multer from "multer";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  next();
};

function loggingMiddleware(req, res, next) {
  let time = new Date().toUTCString();
  let method = req.method;
  let originalUrl = req.originalUrl;
  let reqBody = JSON.stringify(req.body);
  let isAuth = "Authenticated User";
  if (!req.session.user) isAuth = "Non-Authenticated User";
  console.log(`\[${time}\]: ${method} ${originalUrl} (${isAuth}) | ${reqBody}`);
  next();
}

function noAuthRedirect(req, res, next) {
  if (req.path === "/favicon.ico") return next();
  if (!req.path.trim().startsWith("/public")) {
    if (
      !req.session.user &&
      (req.path.trim() === "/" ||
        (!req.path.trim().startsWith("/login") &&
          !req.path.trim().startsWith("/register")))
    ) {
      return res.redirect("/login");
    }
  }
  next();
}

function authRedirect(req, res, next) {
  if (req.path === "/favicon.ico") return next();
  if (!req.path.trim().startsWith("/public")) {
    if (
      req.session.user &&
      (req.path.trim().startsWith("/login") ||
        req.path.trim().startsWith("/register") ||
        req.path.trim() === "/")
    ) {
      return res.redirect("/profile");
    }
  }
  next();
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/profilepics/");
    },
    filename: (req, file, cb) => {
      // console.log(file);
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  // limits: { fileSize: 1 * 1024 * 1024 },
});

const itemUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/items/");
    },
    filename: (req, file, cb) => {
      // console.log(file);
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  // limits: { fileSize: 1 * 1024 * 1024 },
});

export default {
  rewriteUnsupportedBrowserMethods,
  loggingMiddleware,
  noAuthRedirect,
  authRedirect,
  upload,
  itemUpload,
};
