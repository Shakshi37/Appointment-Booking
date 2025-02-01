const logger = require('../utils/logger')
const _ = require('underscore')

module.exports = {
  jsonCons: require('./constants/json-constant.constants'),
  logsCons: require('./constants/log-constant.constants'),
  responseCons: require('./constants/response-constant.constants'),
  httpStatusCode: require('http-status-codes'),
  inputCons : require('./constants/input-constant.constants'),
  responseGenerator: function (msg, code, isError, data) {
    let responseJson = {};
    let ERROR_CODE = this.statusGenerator(this.httpStatusCode.ReasonPhrases.INTERNAL_SERVER_ERROR, this.httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR);
    let SUCCESS_CODE = this.statusGenerator(this.httpStatusCode.ReasonPhrases.OK, this.httpStatusCode.StatusCodes.OK);
    responseJson[this.responseCons.RESP_ERROR_STATUS] = isError ? true : false;
    responseJson[this.responseCons.RESP_CODE] = code ? code : isError ? ERROR_CODE : SUCCESS_CODE;
    responseJson[this.responseCons.RESP_MSG] = msg ? msg : isError ? this.responseCons.RESP_SOMETHING_WENT_WRONG : this.responseCons.RESP_SUCCESS_MSG;
    if (data && data.length !== 0 && !isError)
      responseJson[this.responseCons.RESP_DATA] = data;
    return responseJson;
  },

  statusGenerator: function (code, statusCode) {
    let logJson = this.responseCons.RESP_APPOINTMENT_BOOKING.padEnd(20, '_') + String(code).replace(/ /g, "_").toUpperCase() + String(statusCode).padStart(4, '_');
    return logJson
  },

  checkIsEmail : function (identifier) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailPattern.test(identifier)) {
          return true;
      }
      else {
          return false;
      }
  },
  formatDate : function(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
}