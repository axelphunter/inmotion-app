var app = {

    container: null,
    body: null,
    evt: null,
    textProp: ('textContent' in document.createElement('i')) ? 'textContent' : 'innerText',
    telephoneNumber: null,
    apiUrl: 'http://localhost:8080',
    mapsKey: 'AIzaSyCBn8Da8NB_AHJgYRdT4Lj8HFtZNiC7BTg',
    token: null,
    userId: null,

    initialize: function() {
        window.setTimeout(function() {
            var e = document.createEvent('Events');
            e.initEvent("deviceready", true, false);
            document.dispatchEvent(e);
        }, 50);
        document.addEventListener('deviceready', function() {
            if(app.render()) {
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
        return true;
    },
    
    onOnline:function() {
        storage.init();

        if (!localStorage.getItem('has_run'))
        {
            localStorage.setItem('has_run', 'true');
        }

        app.evt = new Hammer(app.body);
        app.evt.on("tap", app.eventDelegate);
        app.onDeviceReady();
    },
    
    onDeviceReady: function() {
        // Checking if user has previously authenticated
        if(localStorage.getItem('api_token') && localStorage.getItem('api_token') !== "undefined" && localStorage.getItem('user_id') && localStorage.getItem('user_id') !== "undefined") {
            app.token = localStorage.getItem('api_token');
            app.userId = localStorage.getItem('user_id');
            promise.post(app.apiUrl + '/api/user', { '_id': app.userId }, {'x-access-token': app.token})
                .then(function(error, result) {
                    result = JSON.parse(result);
                    if(!error && result.code === 200) {
                        app.actions.index(result.user);
                    }
                    else {
                        app.token = null;
                        app.userId = null;
                        localStorage.removeItem('api_token');
                        localStorage.removeItem('user_id');
                        app.actions.signUp();
                    }
                });
        }
        else {
            app.actions.signUp();
        }
    },
    
    showLoader: function(status){
          app.loader.style.display = (status) ? 'block' : 'none';
    },

    popUp: function(title, text, icon, btnText) {
        var popup = helpers.createEl(app.body, 'div', {'class': 'popupOverlay'}),
            popupWrapper = helpers.createEl(popup, 'div');
        (title ? helpers.createEl(popupWrapper, 'h1', null, title) : null);
        (icon ? helpers.createEl(popupWrapper, 'img', {'src': 'img/icons/'+icon+'.svg'}) : null);
        (text ? helpers.createEl(popupWrapper, 'p', null, text) : null);
        var btn = helpers.createEl(popupWrapper, 'button', {'class': 'btn btn-primary btn-block'}, (btnText ? btnText : 'Continue'));
        new Hammer(btn).on("tap", function(){
            app.body.removeChild(popup);
        });
    },

    renderView: function(view, append, model, id, container){
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

    eventDelegate: function (e) {
        e = e || event;
        var el = e.target || e.srcElement,
            action = el.getAttribute("data-action");

        switch (e.type){
            case 'tap': {

                if (el.tagName == "INPUT" && el.getAttribute('type') == "submit" && el.disabled !== true) {
                    helpers.cancelEvent(e);

                    action = el.parentElement.getAttribute('data-action');
                }
                
                if (action) {
                    if (app.actions[action]) {
                        helpers.cancelEvent(e);

                        app.actions[action].call(el);
                    }
                }
                
            } break;
        }
    },

    actions:{

        index: function () {
            if(app.renderView('index', false, null, 'app')) {
                var searchInput = document.getElementById('searchInput'),
                    searchResults = document.getElementById('searchResults');
                searchInput.onkeyup = function () {
                    if(searchInput.value.length > 3) {
                        helpers.clearEl(searchResults);
                        promise.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+searchInput.value+'&key='+app.mapsKey+'&components=country:gb')
                            .then(function(error, results) {
                                if(!error) {
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
        },

        showLocation: function(locationId) {
            promise.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+locationId+'&key='+app.mapsKey)
                .then(function(error, results) {
                    if(!error) {
                        results = JSON.parse(results);
                        helpers.clearEl(app.container);
                        app.container.id = "showLocation";
                        var mapWrapper = helpers.createEl(app.container, 'div', {'id': 'map'}),
                            lat = results.result.geometry.location.lat,
                            long = results.result.geometry.location.lng,
                            zoom = 15,
                            mapOptions = {
                                zoom: zoom,
                                center: new google.maps.LatLng(lat,long),
                                disableDefaultUI: true,
                                scrollwheel: true,
                                navigationControl: true,
                                mapTypeControl: false,
                                scaleControl: false,
                                styles: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ece2d9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b8cb93"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"simplified"}]}]
                            },
                            map = new google.maps.Map(mapWrapper, mapOptions);

                        new google.maps.Marker({
                            position: new google.maps.LatLng(lat, long),
                            map: map,
                            animation: google.maps.Animation.DROP
                        });

                        var btnWrapper = helpers.createEl(app.container, 'div', {'class': 'btn-wrapper'});
                        helpers.createEl(btnWrapper, 'button', {'class': 'btn btn-block btn-primary'}, "That's it, let's go!");
                        helpers.createEl(btnWrapper, 'button', {'class': 'btn btn-block btn-cancel', 'data-action': 'index'}, "Nope, search again");
                    }
                    else {
                        app.actions.index();
                    }
                });
        },

        signOut: function () {
            app.token = null;
            app.userId = null;
            localStorage.removeItem('api_token');
            localStorage.removeItem('user_id');
            app.onDeviceReady()
        },

        signUp: function() {
            if(app.renderView('signUp', false, null, 'signUp')) {
                var phoneNumberInput = document.querySelector('input#phonenumber'),
                    submit = document.querySelector('input[type=submit]');
                submit.disabled = true;
                phoneNumberInput.onkeyup = function() {
                    if(this.value.length > 11 || isNaN(this.value.slice(-1))) {
                        this.value = this.value.slice(0, -1);
                    }
                    ((this.value.length == 11) ? submit.disabled = false : submit.disabled = true);
                };
            }
        },

        validate: function () {
            app.telephoneNumber = document.querySelector('input#phonenumber').value;
            if(app.telephoneNumber.length == 11) {
                promise.post(app.apiUrl + '/api/register', { 'phoneNumber': app.telephoneNumber })
                    .then(function(error, result) {
                        result = JSON.parse(result);
                        if(!error && result.code === 200) {
                            app.userId = result.userId;
                            localStorage.setItem('user_id', app.userId);
                            app.actions.verify();
                        }
                        else {
                            //TODO Create nice alert box which also handles errors
                            alert('something went wrong!')
                            app.actions.signUp();
                        }
                    });
            }
            else {
                //TODO Create nice alert box
                alert('The phone number that you have entered is incorrect');
                app.actions.signUp();
            }
        },

        verify: function() {
            if(app.renderView('verify', false, null, 'verify')) {
                var verificationCodeInput = document.querySelector('input#verificationCode'),
                    submit = document.querySelector('input[type=submit]');
                submit.disabled = true;
                verificationCodeInput.onkeyup = function() {
                    if(this.value.length > 6 || isNaN(this.value.slice(-1))) {
                        this.value = this.value.slice(0, -1);
                    }
                    ((this.value.length === 6) ? submit.disabled = false : submit.disabled = true);
                };
            }
        },

        checkValidation: function() {
            var verificationCode = document.querySelector('input#verificationCode').value;
            if(verificationCode.length === 6 && !isNaN(verificationCode)) {
                promise.post(app.apiUrl + '/api/verify', { '_id': app.userId, 'verificationCode': verificationCode})
                    .then(function(error, result) {
                        result = JSON.parse(result);
                        if(!error && result.code === 200) {
                            app.token = result.token;
                            localStorage.setItem('api_token', app.token);
                            app.actions.index();
                        }
                        else {
                            //TODO Create nice alert box which also handles errors
                            alert('something went wrong!');
                            app.actions.verify();
                        }
                    });
            }
            else {
                //TODO Create nice alert box
                alert('The verification code that you have entered is incorrect');
                app.actions.verify();
            }

        },

        skip: function() {
            if(app.renderView('skip', false, null, 'skip')) {

            }
        },

        registerGuest: function () {
          app.actions.index();
        }

    }

};

app.initialize();

