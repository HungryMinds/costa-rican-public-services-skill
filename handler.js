'use strict';

module.exports.lightBill = async (event, context) => {
  const response = {
    version: '1.0',
    statusCode: 200,
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: `This is a test function.`,
      },
      shouldEndSession: false,
    },
  };
  return response;

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
