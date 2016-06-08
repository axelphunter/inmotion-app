const app = {
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

  initialize() {
    app.preparePartials();
    window.setTimeout(() => {
      const e = document.createEvent('Events');
      e.initEvent('deviceready', true, false);
      document.dispatchEvent(e);
    }, 50);
    document.addEventListener('deviceready', () => {
      if (app.render()) {
        app.onOnline();
      }
    }, false);
  },

  preparePartials() {
    Handlebars.registerPartial('header', document.getElementById('header-partial')
      .innerHTML);
    Handlebars.registerPartial('notifier', document.getElementById('notifier-partial')
      .innerHTML)
    Handlebars.registerPartial('search', document.getElementById('search-partial')
      .innerHTML);
  },

  render() {
    StatusBar.backgroundColorByName('black');
    StatusBar.styleLightContent();
    StatusBar.overlaysWebView(false);
    app.body = document.querySelector('body');
    // container definition
    app.container = helpers.createEl(app.body, 'main');

    app.loader = helpers.createEl(app.body, 'div', {
      class: 'loader'
    });
    helpers.createEl(app.loader, 'img', {
      src: 'img/loader.gif'
    });
    helpers.createEl(app.loader, 'h1', null, 'Coming right up!');
    return true;
  },

  onOnline() {
    storage.init();

    if (!localStorage.getItem('has_run')) {
      localStorage.setItem('has_run', 'true');
    }

    app.evt = new Hammer(app.body);
    app.evt.on('tap', app.eventDelegate);
    app.onDeviceReady();
  },

  onDeviceReady() {
    // Checking if user has previously authenticated
    if (localStorage.getItem('api_token') && localStorage.getItem('api_token') !== 'undefined' && localStorage.getItem('user_id') && localStorage.getItem('user_id') !== 'undefined') {
      app.token = localStorage.getItem('api_token');
      app.userId = localStorage.getItem('user_id');
      promise.post(`${app.apiUrl}/api/user`, {
          _id: app.userId
        }, {
          'x-access-token': app.token
        })
        .then((error, res) => {
          const result = JSON.parse(res);
          if (!error && result.code === 200) {
            app.actions.index(result.user);
          } else {
            app.token = null;
            app.userId = null;
            localStorage.removeItem('api_token');
            localStorage.removeItem('user_id');
            app.actions.signup();
          }
        });
    } else {
      app.actions.signup();
    }
  },

  showLoader(status) {
    app.loader.style.display = (status) ? 'block' : 'none';
  },

  popUp(title, text, icon, buttonText) {
    const btnText = buttonText || 'Continue';
    const popup = helpers.createEl(app.body, 'div', {
      class: 'popupOverlay'
    });
    const popupWrapper = helpers.createEl(popup, 'div');
    if (title) {
      helpers.createEl(popupWrapper, 'h1', null, title);
    }
    if (icon) {
      helpers.createEl(popupWrapper, 'img', {
        src: `img/icons/${icon}.svg`
      });
    }
    if (text) {
      helpers.createEl(popupWrapper, 'p', null, text);
    }
    const btn = helpers.createEl(popupWrapper, 'button', {
      class: 'btn btn-primary btn-block'
    }, btnText);
    new Hammer(btn)
      .on('tap', () => {
        app.body.removeChild(popup);
      });
  },

  renderView(view, append, mdl, _id, cntnr) {
    const container = cntnr || app.container;
    const model = mdl || null;
    const id = _id || null;
    if (id) app.container.id = id;
    if (append === false) {
      container.classList.add('fade');
      helpers.clearEl(container);
    }

    Handlebars.compile(document.getElementById(`${view}-template`)
        .innerHTML)(model)
      .toDOM(container);

    container.classList.remove('fade');

    return true;
  },

  eventDelegate(ev) {
    const e = ev || event;
    const el = e.target || e.srcElement;
    let action = el.getAttribute('data-action');
    const href = el.getAttribute('data-href');
    switch (e.type) {
      case 'swipe':
        {
          console.log('swipe recorded');
        }
        break;
      default:
        {
          if (href) {
            cordova.InAppBrowser.open(href, '_system');
          }
          if (el.getAttribute('type') === 'submit' && el.disabled !== true) {
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
    }
  },

  actions: {
    index() {
      function geoSuccess(position) {
        app.location.lat = position.coords.latitude;
        app.location.lng = position.coords.longitude;

        app.actions.watchLocation();

        if (app.renderView('index', false, null, 'app')) {
          app.showLoader(false);
          const searchInput = document.getElementById('searchInput');
          const searchResults = document.getElementById('searchResults');

          app.evt = new Hammer(document.getElementById('clearsearchinput'));
          app.evt.on('tap', () => {
            searchInput.value = '';
          });
          searchInput.onkeyup = function onkeyup() {
            if (searchInput.value.length > 2) {
              helpers.clearEl(searchResults);
              promise.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchInput.value}&key=${app.mapsKey}&components=country:gb`)
                .then((error, res) => {
                  if (!error) {
                    const results = JSON.parse(res);
                    results.predictions.forEach((val) => {
                      const li = helpers.createEl(searchResults, 'li');
                      helpers.createEl(li, 'h1', null, val.description.split(',', 1));
                      helpers.createEl(li, 'p', null, val.description);
                      app.evt = new Hammer(li);
                      app.evt.on('tap', () => {
                        app.actions.showLocation(val.place_id);
                      });
                    });
                  }
                });
            }
          };
        }
      }

      function geoError(error) {
        // TODO handle feo error
      }
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
        timeout: 2000,
        enableHighAccuracy: true
      });
    },

    watchLocation() {
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

    noLocation() {
      if (app.renderView('signup', false, null, 'signup')) {
        if (typeof cordova.plugins.settings.openSetting !== undefined) {
          cordova.plugins.settings.open(() => {
              console.log('opened settings');
            },
            () => {
              console.log('failed to open settings');
            });
        }
      }
    },

    showLocation(locationId) {
      promise.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${locationId}&key=${app.mapsKey}`)
        .then((error, res) => {
          app.showLoader(false);
          if (!error) {
            const results = JSON.parse(res);
            helpers.clearEl(app.container);
            app.destinationLat = results.result.geometry.location.lat;
            app.destinationLng = results.result.geometry.location.lng;
            app.container.id = 'showLocation';
            const mapWrapper = helpers.createEl(app.container, 'div', {
              id: 'map'
            });
            const lat = results.result.geometry.location.lat;
            const long = results.result.geometry.location.lng;
            const zoom = 15;
            const mapOptions = {
              zoom,
              center: new google.maps.LatLng(lat, long),
              disableDefaultUI: true,
              scrollwheel: true,
              navigationControl: true,
              mapTypeControl: false,
              scaleControl: false,
              styles: [{
                featureType: 'water',
                stylers: [{
                  saturation: 43
                }, {
                  lightness: -11
                }, {
                  hue: '#0088ff'
                }]
              }, {
                featureType: 'road',
                elementType: 'geometry.fill',
                stylers: [{
                  hue: '#ff0000'
                }, {
                  saturation: -100
                }, {
                  lightness: 99
                }]
              }, {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{
                  color: '#808080'
                }, {
                  lightness: 54
                }]
              }, {
                featureType: 'landscape.man_made',
                elementType: 'geometry.fill',
                stylers: [{
                  color: '#ece2d9'
                }]
              }, {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{
                  color: '#ccdca1'
                }]
              }, {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{
                  color: '#767676'
                }]
              }, {
                featureType: 'road',
                elementType: 'labels.text.stroke',
                stylers: [{
                  color: '#ffffff'
                }]
              }, {
                featureType: 'poi',
                stylers: [{
                  visibility: 'off'
                }]
              }, {
                featureType: 'landscape.natural',
                elementType: 'geometry.fill',
                stylers: [{
                  visibility: 'on'
                }, {
                  color: '#b8cb93'
                }]
              }, {
                featureType: 'poi.park',
                stylers: [{
                  visibility: 'on'
                }]
              }, {
                featureType: 'poi.sports_complex',
                stylers: [{
                  visibility: 'on'
                }]
              }, {
                featureType: 'poi.medical',
                stylers: [{
                  visibility: 'on'
                }]
              }, {
                featureType: 'poi.business',
                stylers: [{
                  visibility: 'simplified'
                }]
              }]
            };
            const map = new google.maps.Map(mapWrapper, mapOptions);
            const marker = new google.maps.Marker({
              position: new google.maps.LatLng(lat, long),
              map,
              icon: {
                url: 'img/icons/map-marker.svg'
              },
              animation: google.maps.Animation.DROP
            });
            const infowindow = new google.maps.InfoWindow({
              content: `<h1>${results.result.name}</h1><p>${results.result.formatted_address}</p>`
            });
            infowindow.open(map, marker);

            const btnWrapper = helpers.createEl(app.container, 'div', {
              class: 'btn-wrapper'
            });
            helpers.createEl(btnWrapper, 'button', {
              class: 'btn btn-block btn-primary',
              'data-action': 'queryResults'
            }, 'Thats it, lets go!');
            helpers.createEl(btnWrapper, 'button', {
              class: 'btn btn-block btn-cancel',
              'data-action': 'index'
            }, 'Nope, search again');
          } else {
            app.actions.index();
          }
        });
    },

    queryResults(searchQuery) {
      app.searchQuery = searchQuery || `http://transportapi.com/v3/uk/public/journey/from/lonlat:${app.location.lng},${app.location.lat}/to/lonlat:${app.destinationLng},${app.destinationLat}/at/${moment().format('YYYY-MM-DD')}/${moment().format('HH:mm')}.json?app_id=${app.transportId}&app_key=${app.transportKey}&region=southeast`;
      promise.get(app.searchQuery)
        .then((error, results) => {
          if (!error) {
            app.searchResults = JSON.parse(results);
            app.actions.resultList(app.searchResults);
          }
        });
    },

    resultList(searchResults) {
      const results = searchResults || app.searchResults;

      if (app.renderView('results', false, null, 'results')) {
        app.showLoader(false);
        const routeResults = document.getElementById('routeResults');
        results.routes.forEach((route) => {
          const li = helpers.createEl(routeResults, 'li');
          helpers.createEl(li, 'h1', null, route.arrival_time);
          const departureTime = helpers.createEl(li, 'div');
          helpers.createEl(departureTime, 'h4', null, 'Departure Time');
          helpers.createEl(departureTime, 'h1', null, route.departure_time);
          const duration = helpers.createEl(li, 'div');
          helpers.createEl(duration, 'h4', null, 'Duration');
          helpers.createEl(duration, 'h1', null, route.duration);
          app.evt = new Hammer(li);
          app.evt.on('tap', () => {
            app.route = route;
            app.actions.showRoute();
          });
        });
      }
    },

    showRoute() {
      if (app.renderView('results', false, null, 'results') && app.route) {
        app.showLoader(false);
        app.evt = new Hammer(document.getElementById('back'));
        app.evt.on('tap', () => {
          app.showLoader(true);
          app.actions.resultList();
        });
        const routeResults = document.getElementById('routeResults');
        routeResults.classList.add('route-parts');
        app.route.route_parts.forEach((part) => {
          const li = helpers.createEl(routeResults, 'li');
          helpers.createEl(li, 'h1', {
            'data-type': part.mode
          }, part.mode);
          helpers.createEl(li, 'p', null, moment.duration(part.duration, 'minutes')
            .humanize());
          const departDest = helpers.createEl(li, 'div');
          helpers.createEl(departDest, 'h4', null, 'From');
          helpers.createEl(departDest, 'h1', null, part.from_point_name);
          const departAt = helpers.createEl(li, 'div');
          helpers.createEl(departAt, 'h4', null, 'Leaving at');
          helpers.createEl(departAt, 'h1', null, part.departure_time);
          const arrivalDest = helpers.createEl(li, 'div');
          helpers.createEl(arrivalDest, 'h4', null, 'to');
          helpers.createEl(arrivalDest, 'h1', null, part.to_point_name);
          const arrivalAt = helpers.createEl(li, 'div');
          helpers.createEl(arrivalAt, 'h4', null, 'Arriving at');
          helpers.createEl(arrivalAt, 'h1', null, part.arrival_time);
          if (part.line_name) {
            const lineName = helpers.createEl(li, 'div');
            helpers.createEl(lineName, 'h4', null, 'Line name');
            helpers.createEl(lineName, 'h1', null, part.line_name);
          }
          switch (part.mode) {
            case 'foot':
              {
                const fromCoords = part.coordinates[0];
                const toCoords = part.coordinates[part.coordinates.length - 1];
                helpers.createEl(li, 'button', {
                  class: 'btn btn-block btn-primary',
                  'data-href': `http://maps.google.com/?saddr=${fromCoords[1]},${fromCoords[0]}&daddr=${toCoords[1]},${toCoords[0]}`
                }, 'Get directions');
              }
              break;
            default:
              {
                return;
              }
          }
        });
      } else {
        app.actions.resultList();
      }
    },

    signOut() {
      app.token = null;
      app.userId = null;
      localStorage.removeItem('api_token');
      localStorage.removeItem('user_id');
      app.onDeviceReady();
    },

    signup() {
      if (app.renderView('signup', false, null, 'signup')) {
        app.showLoader(false);
        const phoneNumberInput = document.querySelector('input#phonenumber');
        const submit = document.querySelector('input[type=submit]');
        submit.disabled = true;
        phoneNumberInput.onkeyup = function onkeyup() {
          if (this.value.length > 11 || isNaN(this.value.slice(-1))) {
            this.value = this.value.slice(0, -1);
          }
          if (this.value.length === 11) {
            submit.disabled = false;
          }
        };
      }
    },

    validate() {
      document.querySelector('input#phonenumber')
        .blur();
      app.telephoneNumber = document.querySelector('input#phonenumber')
        .value;
      if (app.telephoneNumber.length === 11) {
        promise.post(`${app.apiUrl}/api/register`, {
            phoneNumber: app.telephoneNumber
          })
          .then((error, res) => {
            const result = JSON.parse(res);
            if (!error && result.code === 200) {
              app.userId = result.userId;
              localStorage.setItem('user_id', app.userId);
              app.actions.verify();
            } else {
              // TODO Create nice alert box which also handles errors
              app.actions.signup();
            }
          });
      } else {
        // TODO Create nice alert box
        app.actions.signup();
      }
    },

    verify() {
      if (app.renderView('verify', false, null, 'verify')) {
        app.showLoader(false);
        const verificationCodeInput = document.querySelector('input#verificationCode');
        const submit = document.querySelector('input[type=submit]');
        submit.disabled = true;
        verificationCodeInput.onkeyup = function onkeyup() {
          if (this.value.length > 6 || isNaN(this.value.slice(-1))) {
            this.value = this.value.slice(0, -1);
          }
          if (this.value.length === 6) {
            submit.disabled = false;
          }
        };
      }
    },

    checkValidation() {
      const verificationCode = document.querySelector('input#verificationCode')
        .value;
      if (verificationCode.length === 6 && !isNaN(verificationCode)) {
        promise.post(`${app.apiUrl}/api/verify`, {
            _id: app.userId,
            verificationCode
          })
          .then((error, res) => {
            const result = JSON.parse(res);
            if (!error && result.code === 200) {
              app.token = result.token;
              localStorage.setItem('api_token', app.token);
              app.actions.index();
            } else {
              // TODO Create nice alert box which also handles errors
              app.actions.verify();
            }
          });
      } else {
        // TODO Create nice alert box
        app.actions.verify();
      }
    },

    skip() {
      if (app.renderView('skip', false, null, 'skip')) {
        return;
      }
    },

    registerGuest() {
      app.actions.index();
    }

  }

};

app.initialize();
