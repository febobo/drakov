var fs = require('fs');
var express = require('express');
var path = require('path');
var requestUtils = require('./lib/middleware/request');
var drakovMiddleware = require('./index').middleware;
var requestModule = require('request');
// console.log(path)
var app = express();
app.use(requestUtils.getBody);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var request = function(url,cb){
    requestModule(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        cb && cb(body);
      }
    })
}
drakovOptions  = {
    sourceFiles: './*.md',
    serverPort: 1234,
    stealthmode: true,
    // disableCORS: false,
    // sslKeyFile: '/path/to/ssl/key.key',
    // sslCrtFile: '/path/to/ssl/cert.crt',
    // delay: 2000,
    method: ['GET','POST','PUT','DELETE','OPTIONS'],
    header: ['X-Le-Sense-AT'],
    autoOptions: true,
};

drakovMiddleware.init(app, drakovOptions, function(err, middlewareFunction) {
    if (err) {
        throw err;
    }
    app.use(middlewareFunction);

    app.get('/', function(req, res) {
        var host = 'http://' + req.headers.host;
        // res.send('<a href="/doc/readme">readme</a> <a href="/doc/tickts">券码</a>  <a href="/mock/backend-sense-ticket/v1/test">mock 测试</a> ');
        request(host + '/menus' , function(data){
            var data = JSON.parse(data);
            res.render('home',{
                name: 'layout',
                menus: data.menus
            })
        })
    });

    app.listen(drakovOptions.serverPort, function() {
        console.log('server started with Drakov middleware');
    });
});
