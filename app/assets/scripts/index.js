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
  favouriteLocations: localStorage.getItem('favourite_locations') || '[]',
  searchHistory: localStorage.getItem('search_history') || '[]',
  transportPreference: localStorage.getItem('transport_preference') || '["bus", "train", "tube", "boat"]',
  route: null,
  token: null,
  loader: null,
  userId: null,
  location: {
    lat: null,
    lng: null
  },
  factsList: [
    'Walking to and from public transport is a great way to incorporate some extra physical activity into your routine.',
    'Their are nearly 47,000 buses that operate in the UK.',
    'Buses account for around two-thirds of all public transport journeys in the UK, with 5.2 million journeys a year.',
    'Catching public transport may also improve your mental health. It’s less stressful than driving, and you can read, listen to music or unwind on your daily commute.',
    'Catching public transport may be up to four times cheaper than travelling in your car. It can also reduce the cost of buying, maintaining and running additional vehicles.',
    'Bus, train, ferry and tram travel reduces the reliance on fossil fuel supplies, making public transport at least twice as energy efficient as private cars.',
    'One full bus can take more than 50 cars off the road—1 full train can take more than 600 cars off the road.',
    'Cars account for around 55% of all UK domestic transport greenhouse gas emissions',
    'Buses account for less than 4% of all UK domestic transport greenhouse gas emissions',
    'Trains account for less than 2% of all UK domestic transport greenhouse gas emissions',
    'Switching from the car to bus and coach for one in 25 journeys could save 2 million tonnes of CO2'
  ],

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
      .innerHTML);
    Handlebars.registerPartial('search', document.getElementById('search-partial')
      .innerHTML);
    Handlebars.registerPartial('settingsModal', document.getElementById('settings-modal-partial')
      .innerHTML);
    Handlebars.registerPartial('profileModal', document.getElementById('profile-modal-partial')
      .innerHTML);
    Handlebars.registerPartial('footerNav', document.getElementById('footer-nav-partial')
      .innerHTML);
  },

  render() {
    StatusBar.backgroundColorByHexString('#E71D36');
    StatusBar.styleBlackTranslucent();
    StatusBar.overlaysWebView(false);
    app.body = document.querySelector('body');
    // container definition
    app.container = helpers.createEl(app.body, 'main');

    app.loader = helpers.createEl(app.body, 'div', {
      class: 'loader'
    });
    helpers.createEl(app.loader, 'img', {
      src: 'img/loader.svg'
    });
    helpers.createEl(app.loader, 'h3', null, 'Coming right up!');
    helpers.createEl(app.loader, 'p')
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
    if (status) {
      app.loader.querySelector('p')[app.textProp] = app.factsList[Math.floor(Math.random() * app.factsList.length) + 0];
      app.loader.style.display = 'block';
    } else {
      setTimeout(function() {
        app.loader.style.display = 'none';
      }, 1000);
    }
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

    const favourties = JSON.parse(app.favouriteLocations);
    if (favourties.length > 0) {
      model.push(favourties);
    }

    Handlebars.compile(document.getElementById(`${view}-template`)
        .innerHTML)(model)
      .toDOM(container);

    if (document.getElementById('settingsModal')) {
      const transportPreference = JSON.parse(app.transportPreference);
      transportPreference.forEach(function(el) {
        document.querySelector(`.toggle[data-transport-preference="${el}"]`)
          .classList.add('active');
      });
    }

    container.classList.remove('fade');

    return true;
  },

  eventDelegate(ev) {
    const e = ev || event;
    const el = e.target || e.srcElement;
    let action = el.getAttribute('data-action') || el.parentElement.getAttribute('data-action');
    const href = el.getAttribute('data-href');
    if (el.classList.contains('active') || el.parentElement.classList.contains('active')) {
      return;
    }
    switch (e.type) {
      case 'swipe':
        {
          console.log('swipe recorded');
        }
        break;
      default:
        {
          if (el.getAttribute('type') === 'submit' && el.disabled !== true) {
            helpers.cancelEvent(e);
            action = el.parentElement.getAttribute('data-action');
          }
          if (action) {
            if (app.actions[action]) {
              app.showLoader(true);
              app.actions[action].call(el);
            }
          }
          if (el.getAttribute('data-transport-preference') || el.parentElement.getAttribute('data-transport-preference')) {
            const preference = el.getAttribute('data-transport-preference') || el.parentElement.getAttribute('data-transport-preference');
            const status = (el.classList.contains('active') || el.parentElement.classList.contains('active'));
            let transportPreference = JSON.parse(app.transportPreference);
            if (!status) {
              transportPreference.push(preference);
            } else {
              const index = transportPreference.indexOf(preference);
              if (index > -1) {
                transportPreference.splice(index, 1);
              }
            }
            transportPreference = JSON.stringify(transportPreference);
            app.transportPreference = transportPreference;
            localStorage.setItem('transport_preference', app.transportPreference);
          }
          if (href && el.classList.contains('browser')) {
            cordova.InAppBrowser.open(href, '_system');
          }
        }
    }
  },

  actions: {
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

    index() {
      function geoSuccess(position) {
        app.location.lat = position.coords.latitude;
        app.location.lng = position.coords.longitude;

        app.actions.watchLocation();

        if (app.renderView('index', false, null, 'app')) {
          document.querySelector('.home')
            .classList.add('active');
          app.showLoader(false);
          const searchInput = document.getElementById('searchInput');
          const searchResults = document.getElementById('searchResults');

          const clearSearch = document.getElementById('clearsearchinput');
          clearSearch.classList.add('hidden');
          app.evt = new Hammer(clearSearch);
          app.evt.on('tap', () => {
            clearSearch.classList.add('hidden');
            searchInput.value = '';
            searchInput.blur();
          });

          let searchHistory = JSON.parse(app.searchHistory);
          if (searchHistory.length > 0 && searchInput.value.length === 0) {
            helpers.clearEl(searchResults);
            searchHistory.forEach((val) => {
              const li = helpers.createEl(searchResults, 'li', {
                class: 'table-view-cell'
              });
              const a = helpers.createEl(li, 'a', {
                class: 'navigate-right'
              }, val.description.split(',', 1));
              helpers.createEl(a, 'p', null, val.description);
              app.evt = new Hammer(a);
              app.evt.on('tap', () => {
                searchInput.blur();
                app.showLoader(true);
                app.actions.showLocation(val.id);
              });
            });
          }

          searchInput.onkeyup = function onkeyup() {
            if (searchInput.value.length > 1) {
              clearSearch.classList.remove('hidden');
              helpers.clearEl(searchResults);
              promise.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${this.value}&key=${app.mapsKey}&components=country:gb`)
                .then((error, res) => {
                  if (!error) {
                    const results = JSON.parse(res);
                    results.predictions.forEach((val) => {
                      const li = helpers.createEl(searchResults, 'li', {
                        class: 'table-view-cell'
                      });
                      const a = helpers.createEl(li, 'a', {
                        class: 'navigate-right'
                      }, val.description.split(',', 1));
                      helpers.createEl(a, 'p', null, val.description);
                      app.evt = new Hammer(a);
                      app.evt.on('tap', () => {
                        app.showLoader(true);
                        const selectedObj = {
                          id: val.place_id,
                          description: val.description
                        };
                        if (searchHistory.unshift(selectedObj) > 10) {
                          searchHistory.pop();
                        }
                        searchHistory = JSON.stringify(searchHistory);
                        app.searchHistory = searchHistory;
                        localStorage.setItem('search_history', app.searchHistory);
                        app.actions.showLocation(val.place_id);
                      });
                    });
                  }
                });
            } else {
              clearSearch.classList.add('hidden');
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

    showLocation(locationId) {
      promise.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${locationId}&key=${app.mapsKey}`)
        .then((error, res) => {
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
              content: `<h3>${results.result.name}</h1><p>${results.result.formatted_address}</p>`
            });
            infowindow.open(map, marker);

            const header = helpers.createEl(app.container, 'header', {
              class: 'bar bar-nav'
            });
            helpers.createEl(header, 'a', {
              class: 'icon icon-left-nav pull-left',
              'data-action': 'index'
            });
            // const favouriteToggle = helpers.createEl(header, 'a', {
            //   class: 'icon icon-left-nav pull-right'
            // });
            // let isFavourite = false;
            // const favouriteLocations = JSON.parse(app.favouriteLocations);
            // favouriteLocations.forEach((location) => {
            //   if (location.id === locationId) {
            //     isFavourite = true;
            //   }
            // });
            // if (isFavourite) {
            //   favouriteToggle.classList.add('icon-star-filled');
            // } else {
            //   favouriteToggle.classList.add('icon-star');
            // }
            // app.evt = new Hammer(favouriteToggle);
            // app.evt.on('tap', () => {
            //   if (isFavourite) {
            //     favouriteToggle.classList.remove('icon-star-filled')
            //       .add('icon-star');
            //   } else {
            //     const selectedObj = {
            //       id: locationId,
            //       title: results.result.name,
            //       address: results.result.formatted_address
            //     };
            //     favouriteLocations = JSON.stringify(selectedObj);
            //     app.favouriteLocations = favouriteLocations;
            //     localStorage.setItem('favourite_locations', app.favouriteLocations);
            //   }
            // });
            helpers.createEl(header, 'h1', {
              class: 'title logo'
            }, 'INMOTION');

            const btnWrapper = helpers.createEl(app.container, 'div', {
              class: 'btn-wrapper'
            });
            helpers.createEl(btnWrapper, 'button', {
              class: 'btn btn-positive btn-block',
              'data-action': 'queryResults'
            }, 'Thats it, lets go!');
            helpers.createEl(btnWrapper, 'button', {
              class: 'btn btn-negative btn-block',
              'data-action': 'index'
            }, 'Nope, search again');
          } else {
            app.actions.index();
          }
          app.showLoader(false);
        });
    },

    queryResults(searchQuery) {
      const params = {
        app_id: app.transportId,
        app_key: app.transportKey,
        region: 'southeast',
        modes: JSON.parse(app.transportPreference)
          .join('-')
      };
      let paramStr = '';
      for (const key in params) {
        if (paramStr !== '') {
          paramStr += '&';
        }
        paramStr += `${key}=${encodeURIComponent(params[key])}`;
      }
      app.searchQuery = searchQuery || `http://transportapi.com/v3/uk/public/journey/from/lonlat:${app.location.lng},${app.location.lat}/to/lonlat:${app.destinationLng},${app.destinationLat}/at/${moment().format('YYYY-MM-DD')}/${moment().format('HH:mm')}.json?${paramStr}`;
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
        app.evt = new Hammer(document.querySelector('.icon-left-nav'));
        app.evt.on('tap', () => {
          app.actions.index();
        });
        app.showLoader(false);
        const routeResults = document.getElementById('routeResults');
        results.routes.forEach((route) => {
          const li = helpers.createEl(routeResults, 'li', {
            class: 'table-view-cell'
          });
          const a = helpers.createEl(li, 'a', {
            class: 'navigate-right'
          })

          const depTime = moment()
            .set('hour', route.departure_time.split(':')[0])
            .set('minute', route.departure_time.split(':')[1]);

          const departsIn = helpers.createEl(a, 'div');
          helpers.createEl(departsIn, 'p', null, 'Leaves');
          helpers.createEl(departsIn, 'h3', null, moment(depTime)
            .fromNow());
          const duration = helpers.createEl(a, 'div');
          helpers.createEl(duration, 'p', null, 'Journey time');
          helpers.createEl(duration, 'h3', {
              class: 'duration'
            }, moment.duration(route.duration, 'minutes')
            .format('h [hrs], m [min]'));
          const departureTime = helpers.createEl(a, 'div');
          helpers.createEl(departureTime, 'p', null, 'Departure time');
          helpers.createEl(departureTime, 'h3', null, route.departure_time);
          const arrivalTime = helpers.createEl(a, 'div');
          helpers.createEl(arrivalTime, 'p', null, 'Arrival time');
          helpers.createEl(arrivalTime, 'h3', null, route.arrival_time);
          app.evt = new Hammer(a);
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
        app.evt = new Hammer(document.querySelector('.icon-left-nav'));
        app.evt.on('tap', () => {
          app.actions.resultList();
        });
        const routeResults = document.getElementById('routeResults');
        routeResults.classList.add('route-parts');
        app.route.route_parts.forEach((part) => {
          const li = helpers.createEl(routeResults, 'li', {
            class: 'table-view-cell'
          });
          helpers.createEl(li, 'h2', {
            'data-type': part.mode
          }, part.mode);
          helpers.createEl(li, 'p', {
              class: 'time'
            }, moment.duration(part.duration, 'minutes')
            .humanize());
          const departDest = helpers.createEl(li, 'div');
          helpers.createEl(departDest, 'p', null, 'From');
          helpers.createEl(departDest, 'h4', null, part.from_point_name);
          const departAt = helpers.createEl(li, 'div');
          helpers.createEl(departAt, 'p', null, 'Leaving at');
          helpers.createEl(departAt, 'h3', null, part.departure_time);
          const arrivalDest = helpers.createEl(li, 'div');
          helpers.createEl(arrivalDest, 'p', null, 'To');
          helpers.createEl(arrivalDest, 'h4', null, part.to_point_name);
          const arrivalAt = helpers.createEl(li, 'div');
          helpers.createEl(arrivalAt, 'p', null, 'Arriving at');
          helpers.createEl(arrivalAt, 'h3', null, part.arrival_time);
          if (part.line_name) {
            const lineName = helpers.createEl(li, 'div');
            helpers.createEl(lineName, 'p', null, 'Line name');
            helpers.createEl(lineName, 'h4', null, part.line_name);
          }
          switch (part.mode) {
            case 'foot':
              {
                const fromCoords = part.coordinates[0];
                const toCoords = part.coordinates[part.coordinates.length - 1];
                helpers.createEl(li, 'button', {
                  class: 'btn btn-block btn-positive browser',
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
tialize();
