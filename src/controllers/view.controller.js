// src/controllers/view.controller.js
const homepageTemplate = require("../templates/homepage.template.js");

class ViewController {
  constructor() {
    this.renderHomepage = this.renderHomepage.bind(this);
  }

  renderHomepage(req, res) {
    res.send(homepageTemplate.generate());
  }
}

module.exports = new ViewController();
