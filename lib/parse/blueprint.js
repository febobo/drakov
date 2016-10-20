var fs = require('fs');
var drafter = require('drafter.js');
var _ = require('lodash');
var urlParser = require('./url');
var nodeUrl = require('url');
var parseParameters = require('./parameters');
var parseAction = require('./action');
var autoOptionsAction = require('../json/auto-options-action.json');
var theme = require('aglio-theme-olio');
var menuArr = [];
var rootDir= {
        docUrl : '/doc/'
    }
module.exports = function(filePath, autoOptions, routeMap) {
    return function(cb) {
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        var options = { type: 'ast' };
        drafter.parse(data, options, function(err, result) {
            if (err) {
                console.log(err);
                return cb(err);
            }

            var themeOptions = {
                filterInput:true,
                includePath:"./",
                theme:"default",
                themeCondenseNav:true,
                themeEmoji:true,
                themeFullWidth:false,
                themeStyle:undefined,
                themeTemplate:"default",
                themeVariables:"default"
            }

            var doc = '...';

            theme.render(result.ast, themeOptions, function(err, html){
                if(err){
                    return doc = 'ERROR';
                }
                doc = html;
            })

            var filename = /^\.\/(.*)\.([^\.]+)$/.exec(filePath)[1].toLowerCase();


            menuArr.push({
                name: filename,
                url: rootDir.docUrl + filename
            })
            routeMap['/menus'] = {
                methods: {
                    GET: [{
                        execute: function(req, res){
                            res.json({
                                menus: menuArr
                            })
                        }
                    }]
                }
            }
            routeMap[rootDir.docUrl + filename] = {
                methods: {
                    GET: [{
                        execute: function(req, res){
                            res.send(doc)
                        }
                    }]
                }
            }

            var metadata = {};
            result.ast.metadata.forEach(function(item){
                metadata[item.name] = item.value;
            });

            var allRoutesList = [];
            result.ast.resourceGroups.forEach(function(resourceGroup){
                resourceGroup.resources.forEach(function(resource){
                    resource.metadata = metadata;
                    setupResourceAndUrl(resource);
                });
            });

            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            cb();

            function setupResourceAndUrl(resource) {
                var host = resource.metadata.HOST || '';
                var path = '';
                if (host) {
                    var url = nodeUrl.parse(host);
                    host = url.host;
                    path = url.path;
                }
                var parsedUrl = urlParser.parse('/mock' + path + resource.uriTemplate);
                var key = parsedUrl.url;
                routeMap[key] = routeMap[key] || { urlExpression: key, host: host, methods: {} };
                parseParameters(parsedUrl, resource.parameters, routeMap);
                resource.actions.forEach(function(action){
                    action.host = host;
                    parseAction(parsedUrl, action, routeMap);
                    saveRouteToTheList(parsedUrl, action);
                });
            }

            /**
             * Adds route and its action to the allRoutesList. It appends the action when route already exists in the list.
             * @param resource Route URI
             * @param action HTTP action
             */
            function saveRouteToTheList(parsedUrl, action) {
                // used to add options routes later
                if (typeof allRoutesList[parsedUrl.url] === 'undefined') {
                    allRoutesList[parsedUrl.url] = [];
                }
                allRoutesList[parsedUrl.url].push(action);
            }

            function addOptionsRoutesWhereMissing(allRoutes) {
                var routesWithoutOptions = [];
                // extracts only routes without OPTIONS
                _.forIn(allRoutes, function (actions, route) {
                    var containsOptions = _.reduce(actions, function (previousResult, iteratedAction) {
                        return previousResult || (iteratedAction.method === 'OPTIONS');
                    }, false);
                    if (!containsOptions) {
                        routesWithoutOptions.push(route);
                    }
                });

                _.forEach(routesWithoutOptions, function (uriTemplate) {
                    // adds prepared OPTIONS action for route
                    var parsedUrl = urlParser.parse(uriTemplate);
                    parseAction(parsedUrl, autoOptionsAction, routeMap);
                });
            }
        });
    };
};
