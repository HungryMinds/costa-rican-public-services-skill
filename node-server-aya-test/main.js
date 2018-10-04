
const express = require('express')
const parser = require('node-html-parser');
const request = require('request');
const app = express();

const AYA_FORM = {
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": "%2FwEPDwUJNTU2Nzg3MzE3D2QWAgIBD2QWBgIXD2QWBgIBDzwrABEDAA8WBB4LXyFEYXRhQm91bmRnHgtfIUl0ZW1Db3VudGZkARAWABYAFgAMFCsAAGQCDw9kFgICAQ88KwARAgEQFgAWABYADBQrAABkAhUPZBYCAgEPPCsAEQIBEBYAFgAWAAwUKwAAZAIZD2QWCAIZDzwrABECARAWABYAFgAMFCsAAGQCHw88KwARAgEQFgAWABYADBQrAABkAjUPPCsAEQIBEBYAFgAWAAwUKwAAZAI7DxQrAAVkKClYU3lzdGVtLkd1aWQsIG1zY29ybGliLCBWZXJzaW9uPTQuMC4wLjAsIEN1bHR1cmU9bmV1dHJhbCwgUHVibGljS2V5VG9rZW49Yjc3YTVjNTYxOTM0ZTA4OSRmMTYxYTUyNC03YWI2LTRlOGMtOTBjZi05NWZhZWVlNDFhMjACARQrAAE8KwAEAQBmZGQCGw9kFgICAQ88KwARAgEQFgAWABYADBQrAABkGAcFFWdydkRldGFsbGVGYWN0dXJhY2lvbg88KwAMAQhmZAUOZGd2RmFjdHVyYWNpb24PZ2QFDmRndkluZm9Db25zdW1vD2dkBQxkZ3ZIaXN0b3JpY28PZ2QFDGdydkhpc3RvcmlhbA9nZAUJZ3J2Q2FyZ29zD2dkBQ5ncnZBcnJlZ2xvUGFnbw9nZHzbTKfwP0oEw2kHjIcmt5u2lo5GgCu6a1oda/PWnr1a",
    "__VIEWSTATEGENERATOR": "D33FB4C6",
    "txtConsultaNIS": "33221428",
    "btnConsultar": "Consultar"
}
const AYA_SERVER_ERROR = "No se puede procesar la consulta";
const AYA_SERVER_UNEXISTING_NIS = "no existe";
const AYA_SERVER_NO_PENDING_BILL = "no tiene facturación al cobro";
const AYA_ID_MESSAGE = "#lblMsj"
const AYA_ID_BILL_TOTAL = "#lblFacturacion"
const AYA_ID_DETAIL = "#txtConsultaNIS"
const AYA_TEXT_MESSAGE_NIS_START = "NIS "
const AYA_TEXT_MESSAGE_NIS_END = " consultado"
const AYA_TEXT_DETAIL_NIS_START = 'value="'
const AYA_TEXT_DETAIL_NIS_END = '" max'


app.get('/aya/:nis', function (requested, response) {
    var responseBody = {
        nis: "",
        billTotal: "",
        error: ""
    }
    const requestedNis = requested.params.nis;
    if (requestedNis) {
        request.post(
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'https://websolution.aya.go.cr/ConsultaFacturacion/',
                body: `__EVENTTARGET=${AYA_FORM.__EVENTTARGET}` +
                    `&__EVENTARGUMENT=${AYA_FORM.__EVENTARGUMENT}` +
                    `&__VIEWSTATE=${AYA_FORM.__VIEWSTATE}` +
                    `&__VIEWSTATEGENERATOR=${AYA_FORM.__VIEWSTATEGENERATOR}` +
                    `&txtConsultaNIS=${requestedNis}` +
                    `&btnConsultar=${AYA_FORM.btnConsultar}`,
                method: 'POST'
            },
            (err, res, body) => {
                if (res.statusCode == 200) {

                    const root = parser.parse(body);
                    const message = root.querySelector(AYA_ID_MESSAGE);
                    const billTotal = root.querySelector(AYA_ID_BILL_TOTAL)
                    const detail = root.querySelector(AYA_ID_DETAIL)

                    if (message && message.childNodes[0].rawText.indexOf(AYA_SERVER_ERROR) != -1) {
                        responseBody.err = "AYA COMMON SERVER COLLAPSE"
                    }
                    else if (message && message.childNodes[0].rawText.indexOf(AYA_SERVER_UNEXISTING_NIS) != -1) {
                        responseBody.err = "AYA UNEXISTING NIS"
                    }
                    else if (message && message.childNodes[0].rawText.indexOf(AYA_SERVER_NO_PENDING_BILL) != -1) {
                        var nis = message.childNodes[0].rawText
                        nis = nis.slice(nis.indexOf(AYA_TEXT_MESSAGE_NIS_START) + AYA_TEXT_MESSAGE_NIS_START.length, nis.indexOf(AYA_TEXT_MESSAGE_NIS_END))
                        responseBody.nis = nis;
                        responseBody.billTotal = 0;
                    }
                    else if (billTotal) {
                        var total = billTotal.childNodes[0].rawText
                        total = parseFloat(total.replace(",", ""));
                        var nis = detail.rawAttrs
                        nis = nis.slice(nis.indexOf(AYA_TEXT_DETAIL_NIS_START) + AYA_TEXT_DETAIL_NIS_START.length, nis.indexOf(AYA_TEXT_DETAIL_NIS_END))
                        responseBody.nis = nis;
                        responseBody.billTotal = total;
                    }
                    else {
                        responseBody.err = "AYA UNKNOW SERVER ERROR"
                    }
                }
                else {
                    responseBody.err = "AYA CONNECTION SERVER ERROR"
                }
                response.send(responseBody)
            }
        )
    }
    else {
        responseBody.err = "PROVIDE A NICE ON THE FORMAT `/aya/<nis-number>`"
        response.send(responseBody)
    }


});


app.listen(1337, function () {

});
