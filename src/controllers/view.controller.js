// src/controllers/view.controller.js
const homepageTemplate = require("../templates/homepage.template.js");

class ViewController {
  renderHomepage(req, res) {
    res.send(homepageTemplate.generate());
  }
}

module.exports = new ViewController();
