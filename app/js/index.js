var app = {

    container: null,
    body: null,
    evt: null,
    textProp: ('textContent' in document.createElement('i')) ? 'textContent' : 'innerText',
    telephoneNumber: null,
    apiUrl: 'http://188.166.172.137:8080',
    mapsKey: 'AIzaSyCBn8Da8NB_AHJgYRdT4Lj8HFtZNiC7BTg',
    transportKey: 'd9307fd91b0247c607e098d5effedc97',
    transportId: '03bf8009',
    destinationLat: null,
    destinationLng: null,
    searchQuery: null,
    route: null,
    token: null,
    loader: null,
    userId: null,
    location: {
        lat: null,
        lng: null
    },

    initialize: function() {
        window.setTimeout(function() {
            var e = document.createEvent('Events');
            e.initEvent("deviceready", true, false);
            document.dispatchEvent(e);
        }, 50);
        document.addEventListener('deviceready', function() {
            if (app.render()) {
                app.onOnline();
            }
        }, false);
    },

    render: function() {
        StatusBar.backgroundColorByName('black');
        StatusBar.styleLightContent();
        StatusBar.overlaysWebView(false);
        app.body = document.querySelector('body');
        // container definition
        app.container = helpers.createEl(app.body, 'main');

        app.loader = helpers.createEl(app.body, 'div', {
            'class': 'loader'
        });
        helpers.createEl(app.loader, 'img', {
            'src': 'img/loader.gif'
        });
        helpers.createEl(app.loader, 'h1', null, 'Coming right up!');
        return true;
    },

    onOnline: function() {
        storage.init();

        if (!localStorage.getItem('has_run')) {
            localStorage.setItem('has_run', 'true');
        }

        app.evt = new Hammer(app.body);
        app.evt.on("tap", app.eventDelegate);
        app.onDeviceReady();
    },

    onDeviceReady: function() {
        // Checking if user has previously authenticated
        if (localStorage.getItem('api_token') && localStorage.getItem('api_token') !== "undefined" && localStorage.getItem('user_id') && localStorage.getItem('user_id') !== "undefined") {
            app.token = localStorage.getItem('api_token');
            app.userId = localStorage.getItem('user_id');
            promise.post(app.apiUrl + '/api/user', {
                    '_id': app.userId
                }, {
                    'x-access-token': app.token
                })
                .then(function(error, result) {
                    result = JSON.parse(result);
                    if (!error && result.code === 200) {
                        app.actions.index(result.user);
                    } else {
                        app.token = null;
                        app.userId = null;
                        localStorage.removeItem('api_token');
                        localStorage.removeItem('user_id');
                        app.actions.signUp();
                    }
                });
        } else {
            app.actions.signUp();
        }
    },

    showLoader: function(status) {
        app.loader.style.display = (status) ? 'block' : 'none';
    },

    popUp: function(title, text, icon, btnText) {
        var popup = helpers.createEl(app.body, 'div', {
                'class': 'popupOverlay'
            }),
            popupWrapper = helpers.createEl(popup, 'div');
        (title ? helpers.createEl(popupWrapper, 'h1', null, title) : null);
        (icon ? helpers.createEl(popupWrapper, 'img', {
            'src': 'img/icons/' + icon + '.svg'
        }) : null);
        (text ? helpers.createEl(popupWrapper, 'p', null, text) : null);
        var btn = helpers.createEl(popupWrapper, 'button', {
            'class': 'btn btn-primary btn-block'
        }, (btnText ? btnText : 'Continue'));
        new Hammer(btn).on("tap", function() {
            app.body.removeChild(popup);
        });
    },

    renderView: function(view, append, model, id, container) {
        container = container || app.container;
        model = model || null;
        id = id || null;

        if (id) app.container.id = id;

        if (append == false) {
            container.classList.add('fade');
            helpers.clearEl(container);
        }

        // insert the template into the dom as dom elements
        MyApp.templates[view](model).toDOM(container);
        container.classList.remove('fade');

        return true;
    },

    eventDelegate: function(e) {
        e = e || event;
        var el = e.target || e.srcElement,
            action = el.getAttribute("data-action");
        href = el.getAttribute('data-href');
        switch (e.type) {
            case 'tap':
                {
                    if (href) {
                        cordova.InAppBrowser.open(href, '_system');
                    }
                    if (el.tagName == "INPUT" && el.getAttribute('type') == "submit" && el.disabled !== true) {
                        helpers.cancelEvent(e);
                        action = el.parentElement.getAttribute('data-action');
                    }
                    if (action) {
                        if (app.actions[action]) {
                            helpers.cancelEvent(e);
                            app.showLoader(true);
                            app.actions[action].call(el);
                        }
                    }
                }
                break;
        }
    },

    actions: {
        index: function() {
            function geoSuccess(position) {

                app.location.lat = position.coords.latitude;
                app.location.lng = position.coords.longitude;

                app.actions.watchLocation();

                if (app.renderView('index', false, null, 'app')) {
                    app.showLoader(false);
                    var searchInput = document.getElementById('searchInput'),
                        searchResults = document.getElementById('searchResults');

                    app.evt = new Hammer(document.getElementById('clearsearchinput'));
                    app.evt.on("tap", function() {
                        searchInput.value = '';
                    });
                    searchInput.onkeyup = function() {
                        if (searchInput.value.length > 2) {
                            helpers.clearEl(searchResults);
                            promise.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + searchInput.value + '&key=' + app.mapsKey + '&components=country:gb')
                                .then(function(error, results) {
                                    if (!error) {
                                        results = JSON.parse(results);
                                        results.predictions.forEach(function(val) {
                                            var li = helpers.createEl(searchResults, 'li');
                                            helpers.createEl(li, 'h1', null, val.description.split(",", 1));
                                            helpers.createEl(li, 'p', null, val.description);

                                            app.evt = new Hammer(li);
                                            app.evt.on("tap", function() {
                                                app.actions.showLocation(val.place_id)
                                            });

                                        });
                                    }
                                });
                        }
                    };
                }
            }

            function geoError(error) {
                alert('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');
            }
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
                timeout: 2000,
                enableHighAccuracy: true
            })

        },

        watchLocation: function() {

            function geoSuccess(position) {
                app.location.lat = position.coords.latitude;
                app.location.lng = position.coords.longitude;
            }

            function geoError(error) {
                console.log(error);
            }

            navigator.geolocation.watchPosition(geoSuccess, geoError, {
                timeout: 30000
            });

        },

        noLocation: function() {
            if (app.renderView('signUp', false, null, 'signUp')) {

                if (typeof cordova.plugins.settings.openSetting != undefined) {
                    cordova.plugins.settings.open(function() {
                            console.log("opened settings")
                        },
                        function() {
                            console.log("failed to open settings")
                        });
                }
            }

        },

        showLocation: function(locationId) {
            promise.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + locationId + '&key=' + app.mapsKey)
                .then(function(error, results) {
                    app.showLoader(false);
                    if (!error) {
                        results = JSON.parse(results);
                        helpers.clearEl(app.container);
                        app.destinationLat = results.result.geometry.location.lat;
                        app.destinationLng = results.result.geometry.location.lng;
                        app.container.id = "showLocation";
                        var mapWrapper = helpers.createEl(app.container, 'div', {
                                'id': 'map'
                            }),
                            lat = results.result.geometry.location.lat,
                            long = results.result.geometry.location.lng,
                            zoom = 15,
                            mapOptions = {
                                zoom: zoom,
                                center: new google.maps.LatLng(lat, long),
                                disableDefaultUI: true,
                                scrollwheel: true,
                                navigationControl: true,
                                mapTypeControl: false,
                                scaleControl: false,
                                styles: [{
                                    "featureType": "water",
                                    "stylers": [{
                                        "saturation": 43
                                    }, {
                                        "lightness": -11
                                    }, {
                                        "hue": "#0088ff"
                                    }]
                                }, {
                                    "featureType": "road",
                                    "elementType": "geometry.fill",
                                    "stylers": [{
                                        "hue": "#ff0000"
                                    }, {
                                        "saturation": -100
                                    }, {
                                        "lightness": 99
                                    }]
                                }, {
                                    "featureType": "road",
                                    "elementType": "geometry.stroke",
                                    "stylers": [{
                                        "color": "#808080"
                                    }, {
                                        "lightness": 54
                                    }]
                                }, {
                                    "featureType": "landscape.man_made",
                                    "elementType": "geometry.fill",
                                    "stylers": [{
                                        "color": "#ece2d9"
                                    }]
                                }, {
                                    "featureType": "poi.park",
                                    "elementType": "geometry.fill",
                                    "stylers": [{
                                        "color": "#ccdca1"
                                    }]
                                }, {
                                    "featureType": "road",
                                    "elementType": "labels.text.fill",
                                    "stylers": [{
                                        "color": "#767676"
                                    }]
                                }, {
                                    "featureType": "road",
                                    "elementType": "labels.text.stroke",
                                    "stylers": [{
                                        "color": "#ffffff"
                                    }]
                                }, {
                                    "featureType": "poi",
                                    "stylers": [{
                                        "visibility": "off"
                                    }]
                                }, {
                                    "featureType": "landscape.natural",
                                    "elementType": "geometry.fill",
                                    "stylers": [{
                                        "visibility": "on"
                                    }, {
                                        "color": "#b8cb93"
                                    }]
                                }, {
                                    "featureType": "poi.park",
                                    "stylers": [{
                                        "visibility": "on"
                                    }]
                                }, {
                                    "featureType": "poi.sports_complex",
                                    "stylers": [{
                                        "visibility": "on"
                                    }]
                                }, {
                                    "featureType": "poi.medical",
                                    "stylers": [{
                                        "visibility": "on"
                                    }]
                                }, {
                                    "featureType": "poi.business",
                                    "stylers": [{
                                        "visibility": "simplified"
                                    }]
                                }]
                            },
                            map = new google.maps.Map(mapWrapper, mapOptions),
                            marker = new google.maps.Marker({
                                position: new google.maps.LatLng(lat, long),
                                map: map,
                                icon: {
                                    url: "img/icons/map-marker.svg"
                                },
                                animation: google.maps.Animation.DROP
                            }),
                            infowindow = new google.maps.InfoWindow({
                                content: '<h1>' + results.result.name + '</h1><p>' + results.result.formatted_address + '</p>'
                            });
                        infowindow.open(map, marker);

                        var btnWrapper = helpers.createEl(app.container, 'div', {
                            'class': 'btn-wrapper'
                        });
                        helpers.createEl(btnWrapper, 'button', {
                            'class': 'btn btn-block btn-primary',
                            'data-action': 'queryResults'
                        }, "That's it, let's go!");
                        helpers.createEl(btnWrapper, 'button', {
                            'class': 'btn btn-block btn-cancel',
                            'data-action': 'index'
                        }, "Nope, search again");
                    } else {
                        app.actions.index();
                    }
                });
        },

        queryResults: function(searchQuery) {
            app.searchQuery = searchQuery || 'http://transportapi.com/v3/uk/public/journey/from/lonlat:' + app.location.lng + ',' + app.location.lat + '/to/lonlat:' + app.destinationLng + ',' + app.destinationLat + '/at/' + moment().format('YYYY-MM-DD') + '/' + moment().format('HH:mm') + '.json?app_id=' + app.transportId + '&app_key=' + app.transportKey + '&region=southeast';
            promise.get(app.searchQuery)
                .then(function(error, results) {
                    if (!error) {
                        app.searchResults = JSON.parse(results);
                        app.actions.resultList(app.searchResults);
                    }
                });
        },

        resultList: function(searchResults) {
            results = searchResults || app.searchResults
            if (app.renderView('results', false, null, 'results')) {
                app.showLoader(false);
                var routeResults = document.getElementById('routeResults');
                results.routes.forEach(function(route) {
                    var li = helpers.createEl(routeResults, 'li');
                    helpers.createEl(li, 'h1', null, route.arrival_time);
                    var departureTime = helpers.createEl(li, 'div');
                    helpers.createEl(departureTime, 'h4', null, 'Departure Time');
                    helpers.createEl(departureTime, 'h1', null, route.departure_time);
                    var duration = helpers.createEl(li, 'div');
                    helpers.createEl(duration, 'h4', null, 'Duration');
                    helpers.createEl(duration, 'h1', null, route.duration);
                    app.evt = new Hammer(li);
                    app.evt.on("tap", function() {
                        app.route = route;
                        app.actions.showRoute()
                    });
                });
            }
        },

        showRoute: function() {
            if (app.renderView('results', false, null, 'results') && app.route) {
                app.showLoader(false);
                app.evt = new Hammer(document.getElementById('back'));
                app.evt.on("tap", function() {
                    app.showLoader(true);
                    app.actions.resultList();
                });
                var routeResults = document.getElementById('routeResults');
                routeResults.classList.add('route-parts');
                app.route.route_parts.forEach(function(part) {
                    var li = helpers.createEl(routeResults, 'li');
                    helpers.createEl(li, 'h1', {
                        'data-type': part.mode
                    }, part.mode);
                    helpers.createEl(li, 'p', null, moment.duration(part.duration, "minutes").humanize())
                    var departDest = helpers.createEl(li, 'div');
                    helpers.createEl(departDest, 'h4', null, 'From');
                    helpers.createEl(departDest, 'h1', null, part.from_point_name);
                    var departAt = helpers.createEl(li, 'div');
                    helpers.createEl(departAt, 'h4', null, 'Leaving at');
                    helpers.createEl(departAt, 'h1', null, part.departure_time);
                    var arrivalDest = helpers.createEl(li, 'div');
                    helpers.createEl(arrivalDest, 'h4', null, 'to');
                    helpers.createEl(arrivalDest, 'h1', null, part.to_point_name);
                    var arrivalAt = helpers.createEl(li, 'div');
                    helpers.createEl(arrivalAt, 'h4', null, 'Arriving at');
                    helpers.createEl(arrivalAt, 'h1', null, part.arrival_time);
                    if (part.line_name) {
                        var lineName = helpers.createEl(li, 'div');
                        helpers.createEl(lineName, 'h4', null, 'Line name');
                        helpers.createEl(lineName, 'h1', null, part.line_name);
                    }
                    switch (part.mode) {
                        case 'foot':
                            {
                                var fromCoords = part.coordinates[0],
                                    toCoords = part.coordinates[part.coordinates.length - 1];
                                helpers.createEl(li, 'button', {
                                    'class': 'btn btn-block btn-primary',
                                    'data-href': 'http://maps.google.com/?saddr=' + fromCoords[1] + ',' + fromCoords[0] + '&daddr=' + toCoords[1] + ',' + toCoords[0],
                                }, "Get directions");
                            }
                            break
                    }
                });
            } else {
                app.actions.resultList();
            }
        },

        signOut: function() {
            app.token = null;
            app.userId = null;
            localStorage.removeItem('api_token');
            localStorage.removeItem('user_id');
            app.onDeviceReady()
        },

        signUp: function() {
            if (app.renderView('signUp', false, null, 'signUp')) {
                app.showLoader(false);
                var phoneNumberInput = document.querySelector('input#phonenumber'),
                    submit = document.querySelector('input[type=submit]');
                submit.disabled = true;
                phoneNumberInput.onkeyup = function() {
                    if (this.value.length > 11 || isNaN(this.value.slice(-1))) {
                        this.value = this.value.slice(0, -1);
                    }
                    ((this.value.length == 11) ? submit.disabled = false : submit.disabled = true);
                };
            }
        },

        validate: function() {
            document.querySelector('input#phonenumber').blur();
            app.telephoneNumber = document.querySelector('input#phonenumber').value;
            if (app.telephoneNumber.length == 11) {
                promise.post(app.apiUrl + '/api/register', {
                        'phoneNumber': app.telephoneNumber
                    })
                    .then(function(error, result) {
                        result = JSON.parse(result);
                        if (!error && result.code === 200) {
                            app.userId = result.userId;
                            localStorage.setItem('user_id', app.userId);
                            app.actions.verify();
                        } else {
                            //TODO Create nice alert box which also handles errors
                            alert('something went wrong!')
                            app.actions.signUp();
                        }
                    });
            } else {
                //TODO Create nice alert box
                alert('The phone number that you have entered is incorrect');
                app.actions.signUp();
            }
        },

        verify: function() {
            if (app.renderView('verify', false, null, 'verify')) {
                app.showLoader(false);
                var verificationCodeInput = document.querySelector('input#verificationCode'),
                    submit = document.querySelector('input[type=submit]');
                submit.disabled = true;
                verificationCodeInput.onkeyup = function() {
                    if (this.value.length > 6 || isNaN(this.value.slice(-1))) {
                        this.value = this.value.slice(0, -1);
                    }
                    ((this.value.length === 6) ? submit.disabled = false : submit.disabled = true);
                };
            }
        },

        checkValidation: function() {
            var verificationCode = document.querySelector('input#verificationCode').value;
            if (verificationCode.length === 6 && !isNaN(verificationCode)) {
                promise.post(app.apiUrl + '/api/verify', {
                        '_id': app.userId,
                        'verificationCode': verificationCode
                    })
                    .then(function(error, result) {
                        result = JSON.parse(result);
                        if (!error && result.code === 200) {
                            app.token = result.token;
                            localStorage.setItem('api_token', app.token);
                            app.actions.index();
                        } else {
                            //TODO Create nice alert box which also handles errors
                            alert('something went wrong!');
                            app.actions.verify();
                        }
                    });
            } else {
                //TODO Create nice alert box
                alert('The verification code that you have entered is incorrect');
                app.actions.verify();
            }

        },

        skip: function() {
            if (app.renderView('skip', false, null, 'skip')) {

            }
        },

        registerGuest: function() {
            app.actions.index();
        }

    }

};

app.initialize();
