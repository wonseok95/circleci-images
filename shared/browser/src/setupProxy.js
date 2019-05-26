// This file is loaded by create-react-app during devserver startup
// We use it as a convenient way to insert a call to pull down the
// docker tags details for local dev

module.exports = function(app) {
  app.get("/dockerhub-info.json", (req, res, next) =>
    require("./download-dockerhub-info").then(data => res.json(data), next)
  );
};
