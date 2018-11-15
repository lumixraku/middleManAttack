const url = require('url');
var fs = require("fs");
var http = require("http");
var https = require("https");
var httpProxy = require("http-proxy");
var HttpProxyRules = require("http-proxy-rules");
var express = require("express");
var app = express();

const HTTP = 'http:'
const HTTPS = 'https:'
const PORT = 6010;
const certOpt = {
    key: fs.readFileSync('./ssl/private.pem'),
    cert: fs.readFileSync('./ssl/file.crt')
}
const proxyRules = require('./rules')
// https.createServer(certOpt, app).listen(PORT, function() {
//     console.log('HTTPs Server is running on: http://localhost:%s', PORT);
// });;
// // https://www.jianshu.com/p/6406584ef018
// app.get('*', function (req, res) {
//     if(req.protocol === 'https') {
//         res.status(200).send('This is https visit!');
//     }
//     else {
//         res.status(200).send('This is http visit!');
//     }
// });

// https.createServer(certOpt, function (req, res) {
//     res.writeHead(200);
//     res.end(JSON.stringify({foo:"bar"}))
//   }).listen(6010);




// Create reverse proxy instance
var proxy = httpProxy.createProxy();

http.createServer(function (req, res) {
        // a match method is exposed on the proxy rules instance
        // to test a request to see if it matches against one of the specified rules
        console.log("req", req.url)
        var target = proxyRules.match(req);
        if (target) {
            let rs = proxy.web(req, res, {
                target: target
            });
            console.log('rs', rs)
            return rs;
        }
        console.log("NOT", req.url);
        const srvUrl = url.parse(`${req.url}`);
        const reqProtocol = srvUrl.protocol == HTTP ? HTTP : HTTPS;
        const reqEngine = srvUrl.protocol == HTTP ? http : https;
        // console.log('engine::', reqEngine)
        return reqEngine.get(
            req.url,
            innerRes => {
                const {
                    statusCode
                } = innerRes;
                const contentType = innerRes.headers["content-type"];

                let error;
                if (statusCode !== 200) {
                    error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
                }
                if (error) {
                    console.error(error.message);
                    // consume response data to free up memory
                    innerRes.resume();
                    return;
                }
                res.writeHead(innerRes.statusCode, innerRes.headers);
                innerRes.setEncoding("utf8");
                innerRes.pipe(res);
                // let rawData = "";
                // innerRes.on("data", chunk => {
                //   rawData += chunk;
                // });
                // innerRes.on("end", () => {
                //     console.log('end')
                //     res.writeHead(200, { "Content-Type": contentType })
                //     res.end(rawData)
                // });
            }
        ).on('error', function(e){
            console.log('err', e)
        });

        // res.writeHead(500, { "Content-Type": "text/plain" });
        // res.end("The request url and path did not match any of the listed rules!");
    })
    .listen(6010, function () {
        console.log("establishd");
    });