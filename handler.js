'use strict';
const fetch = require ('node-fetch')

module.exports.lightBill = async (event, context) => {
  let niseNumber = '27894731' // Hardcoded for testing, this one currently owes 3 months.
  const getLightBillsFromAPI = function(nise) {
    let APIResponse
    const baseUrl = 'https://agenciavirtual.cnfl.go.cr/cnfl/resources/proxy/pendientesAbierta/'
    try {
      APIResponse = fetch(baseUrl + nise)
      return APIResponse
    } catch(e) {
      console.error(e)
    }
  }
  const parseAPIResponsetoText = function() {
    const apiResponse = getLightBillsFromAPI(niseNumber)
    const totalBills = apiResponse.length
    let textResponse
    if (!apiResponse | totalBills <= 0) {
      textResponse = 'You are all set!, no bills to pay.'
      return textResponse
    }
    let finalResponse = 'You have a total of ' + totalBills + ' bills for C N F L'
    apiResponse.forEach( bill => {
      let {mescobro, fechavencimiento, saldocapital} = bill
      textResponse = ' for the month of TEST for a total of ' +
                    saldocapital + ' costa rican colon due for ' + 'TEST,'
      finalResponse = finalResponse + textResponse
    });
    return finalResponse
  }
  const getResponse = function() {
    const textResponse = parseAPIResponsetoText()
    const response = {
      version: '1.0',
      statusCode: 200,
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: textResponse,
        },
        shouldEndSession: false,
      },
    }
    return response
  }
  return getResponse();
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
