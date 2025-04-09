const jest = require("jest")

/** @type {jest.Config} */
const config = {
   verbose: true,
   globalSetup: "<rootDir>/tests/globalSetup.js",
}

module.exports = config
