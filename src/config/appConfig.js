const dotenv = require('dotenv')
const path = require('path')

const configpath = dotenv.config({ path: path.resolve(__dirname, `../config/env/${process.env.NODE_ENV}.env`) })

module.exports = configpath