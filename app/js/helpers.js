/**
 * Allows "{0} - {1}".format("hello","world") // returns 'hello - world'
 * @param {string} endless list of arguments
 * @returns {string} with placedholders replaced with format arguments
 */
String.prototype.format = function() {
    var a = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return a[n]; });
};

/**
 * Returns true if the string matches the regular expression pattern
 * @param {string|RegExp} pattern to match
 */
String.prototype.matches = function (pattern) {
    return ((pattern.constructor !== RegExp) ? new RegExp(pattern, "gm") : pattern).test(this);
};

if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

String.prototype.toCamelCase = function() {
    return this.replace(/^([A-Z])|\s(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();        
    });
};

/**
 * Converts a camelCase string into Title case
 */
String.prototype.camelToTitleCase = function(){
    return this.replace(/^[a-z]|[A-Z]/g, function(v, i) {
        return i === 0 ? v.toUpperCase() : " " + v.toLowerCase();
    }); 
};

String.prototype.pad = function (c, n) {
    var r = "";
    if (this.length > n) {
        return this; 
    }
    for (var i = 0; i < (n - this.length); i++) {
        r += c;
    }
    r += this.toString(); 
    return r;
};

/**
 * Returns true if it is safe to parse the string as JSON, otherwise false
 */
String.prototype.isJson = function () {
    return (/^[\],:{}\s]*$/.test(this.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
};


/**
 * Converts a Date object into a string matching the format passed in the fmt param
 * @param {string} fmt - format to use when converting the Date object into a string
 * @returns {string} containing formatted date time
 */
Date.prototype.toSerial = function (fmt) {

	var monthName = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	
    return fmt.replace('yyyy', this.getFullYear().toString()).replace('mmm',monthName[this.getMonth()].substr(0,3)).replace('mm', (this.getMonth() + 1).toString().pad("0", 2)).replace('dd', this.getDate().toString().pad("0", 2))
};

/**
 * Returns the number of days in the current month (includes leap year)
 * Example: (new Date(2012,2,0)).daysInMonth(); // would return 31
 */
Date.prototype.daysInMonth = function () {
    return [31, ((!this.isLeapYear) ? 28 : 29), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.getMonth()];
};

/**
 * Returns an object/array from an array where its property equals value.
 * @param {string} property - property to check
 * @param {object} value - value to test
 * @param {bool} firstOnly - only returns first value if true
 */
Array.prototype.where = function(property, value, firstOnly) {
    var res = [];
    for (var i=0, l=this.length; i<l; i++) {
        if (this[i][property] == value) {
            if (firstOnly) { return this[i]; }
            res.push(this[i]);
        }
    }
    return (firstOnly) ? null : res;
};

/**
 * Return the first item in an array or null
 */
Array.prototype.first = function() { 
	return this[0] || null; 
};

/**
 * Returns the last item in an array or null
 */
Array.prototype.last = function() { 
	return (this.length > 0) ? this[this.length - 1] : null; 
};

/**
 * Returns the index of item within an array where the property and value match parameters.
 * @param {string} property - property name to test
 * @param {*} value - value to match
 * Example: [{'id':'one'},{'id':'two'},{'id':'three}].getIndex('id','two');
 */
Array.prototype.getIndex = function (property, value) {
    for (var i=0, l=this.length; i<l; i++) {
        if ((property && this[i][property] === value) || (!property && this[i] === value)) {
            return i;
        }
    }
    return -1;
};

/**
 * Repeatedly executes a function at every (milliseconds) interval until the function returns true (cancelling the interval)
 * @param {number} d - delay in milliseconds before each execution
 * @param {object} b - any object you wish to become the internal this within the executing function
 */
Function.prototype.repeat = function (d, b) {
    var s = this, a = [].slice.call(arguments, 2);
    var f = function () { if (s.apply(b || s, a) === true) { clearInterval(s.__t); } };
    s.__t = window.setInterval(f, d);
};

Function.prototype.delay = function (d /* delay in ms */, b /* bind (the value of this inside calling function) */) {
    /// <summary>
    ///     executes a function with parameters after a predefined delay (milliseconds).
    /// </summary>
    /// <param name="d" type="Int">delay in milliseconds</param>
    /// <param name="b" type="Object">the value of 'this' inside the calling function</param>
    /// <example>
    ///
    ///     function test(){ alert(this); }
    ///
    ///     // causes the test function to alert hello world after 1 second
    ///     test.delay(1000,'hello world');
    ///
    /// </example>
    var s = this, a = [].slice.call(arguments, 2);
    return window.setTimeout(function () { s.apply(b || s, a); }, d);
};

/**
 * Converts a HTML string into DOM elements, removing script tags
 * @param {object} parent - html element to insert new elements into
 */
String.prototype.toDOM = function(parent) {
    
    parent = parent || document.createDocumentFragment();
    
    var el = null,
        tmp = document.createElement("div");

    // inject content into none live element
    tmp.innerHTML = this;
    
    // remove script tags
    var scripts = tmp.getElementsByTagName('script');
    for (var i=scripts.length-1; i>=0; i--) {
        scripts[i].parentElement.removeChild(scripts[i]);
    }
    
    // append elements
    while (el = tmp.firstChild){
        parent.appendChild(el);
    }
    return parent;
};

// wrapped in a closure to allow reuse in node.js
(function(window){

	var navigator = window.navigator || {};

	/***
	* Cross browser helper functions
	* @author John Doherty (doherty.j@cambridgeassessment.org.uk)
	*/
	var helpers = {
        
        polyfills : undefined,
		
		/**
		* returns true if running on mobile device
		*/
		isMobile: (/ipod|ipad|iphone|android/i.test(navigator.userAgent || '')),
        
        /**
         * Returns a new GUID
         */
        newGuid: function(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
                
                var r = Math.random()*16|0, 
                    v = c == 'x' ? r : (r&0x3|0x8);
                    
                return v.toString(16);
            });
        },
		
		/**
		* Return true if the item can be considered a collection
		*/
		isCollection: function(item) {
			return (typeof item.forEach !== "undefined");
		},
	
		/**
		* Returns the value of a key from the current query string 
		*/	
		getQueryParam: function(key) 
		{
			// Find the key and everything up to the ampersand delimiter
			// Make sure key is the full name, not a substring
			var value=RegExp("[?&]"+key+"=[^&]+").exec(window.location.search);
			
			// Return the unescaped value minus everything starting from the equals sign or an empty string
			return unescape(!!value ? value.toString().replace(/^[^=]+./,"") : "");
		},
		
		/**
		* Returns a clone of a plain JSON object (no functions)
		*/
		cloneObject: function(obj){
			return JSON.parse(JSON.stringify(obj));	
		},
		
        /**
         * Safetly sets inner html of an element, removing script tags
         * @param {object} el - html element to set
         * @param {string} html - html string to insert
         */
        setInnerHTML : function(el, html){
            if (el) { 
                helpers.clearEl(el); 
                html.toDOM(el); 
            }
        },
        
		/**
		* Creates, configures & optionally inserts DOM elements via one function call
		* @param {object} parentEl HTML element to insert into, null if no insert is required
		* @param {string} tagName of the element to create
		* @param {object?} attrs key : value collection of element attributes to create (if key is not a string, value is set as expando property)
		* @param {string?} text to insert into element once created
		* @param {string?} html to insert into element once created
		* @returns {object} newly constructed html element
		*/
		createEl: function(parentEl, tagName, attrs, text, html) {
			
			var el = document.createElement(tagName),
				key = '',
				customEl = tagName.indexOf('-') > 0;

			if (attrs) {
				for (key in attrs) {
                    if (key === "class") { el.className = attrs[key]; }             // assign className
					else if (key === 'style') { el.setAttribute('style', attrs[key]); }            // assign styles
					else if (key === "id") { el.id = attrs[key]; }			        // assign id
					else if (key === "name") { el.setAttribute(key, attrs[key]); }  // assign name attribute, even for customEl
					else if (customEl || (key in el)) { el[key] = attrs[key]; }		// assign object properties
					else { el.setAttribute(key, attrs[key]); }				        // assign regular attribute
				}
			}
			
			if (text) { el.appendChild(document.createTextNode(text)); }
            if (html) { helpers.clearEl(el); html.toDOM(el); }
			if (parentEl) { parentEl.appendChild(el); }
			
			return el;
		},
		
		/**
		* Walks up the DOM from the current node and returns an element where the attribute matches the value.
		* @param {object} el - element to indicate the DOM walking starting position
		* @param {string} attr - attribute/property name 
		* @param {string} value - value of the attribute/property to match
		*/
		getParentByAttribute: function (el, attName, attValue) {
	
			attName = (attName === 'class') ? 'className' : attName;
			attValue = (attName === 'className') ? '(^|\\s)' + attValue + '(\\s|$)' : attValue;
			var tmp = el.parentNode;
			while (tmp !== null && tmp.tagName && tmp.tagName.toLowerCase() !== "html") {
				if (tmp[attName] === attValue || tmp.getAttribute(attName) === attValue || (attName === 'className' && tmp[attName].matches(attValue))) {
					return tmp;
				}
				tmp = tmp.parentNode;
			}
			return null;
		},
	
		/**
		* Removes all child elements
		* @param {object} el - dom element to clear
		*/
		clearEl: function(el){
			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}
		},
	
		/**
		* Returns a collection of elements where attribute match values
		* @param {object} attributes to test.
		* @param {string} tagName of the elements to test.
		* @param {string} parentEl to search within, defaults to body.
		*/
		getElementsByAttribute: function(attributes, tagName, parentEl) {
		
			parentEl = parentEl || document;
			tagName = tagName || '*';
		
			var res = [],
				els = parentEl.getElementsByTagName(tagName);
		
			for (var i=0, l=els.length; i<l; i++) {
		
				var el = els[i],
					found = false;
		
				for (var key in attributes) {
					var val = attributes[key];
					key = (key === "class") ? "className" : key;
		
					if (el[key] === val || el.getAttribute(key) === val || (new RegExp('(^|\\s)' + val + '(\\s|$)').test(el[key]))) {
						found = true;
					}
					else {
						found = false;
						break;
					}
				}
				
				if (found || !attributes) {
					res.push(el);
				}
			}
		
			return res;
		},
	
		capitalize: function(string){
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
	
		/**
		* Returns the current style value of an element
		* @param {object} html element to inspect
		* @param {string} property to return
		*/
		getStyle: function(el, prop) {
			
			if (typeof getComputedStyle !== 'undefined') {
				return getComputedStyle(el, null).getPropertyValue(prop);
			} else {
				return el.currentStyle[prop];
			}
		},
		
		/**
		* Cancels the current event
		* @param {object} e - browser event object
		*/
		cancelEvent: function (e) {
			e = e || window.event;
			
			if (e) {
				e.returnValue = false;
				e.cancelBubble = true;
				if (typeof (e.preventDefault) === "function") { e.preventDefault(); }
				if (typeof (e.stopPropagation) === "function") { e.stopPropagation(); }
			}
		},
        
        /**
         * Sends data to the server via a form post in a hidden frame
         * @param {string} url - url to post the data to
         * @param {object} data - JSON key/value object - a hidden field is created for each key
         */
        postViaIframe: function(url, data){
            
            var targetName = '_post_via_iframe_' + Date.now(),
                iframe = helpers.createEl(document.body,'iframe',{
                    'src'   : '',
                    'name'  : targetName,
                    'style' : 'display: none; visibility: hidden;'
                }),
                form = helpers.createEl(document.body, 'form',{
                    'action'    : url, 
                    'enctype'   : 'application/x-www-form-urlencoded', 
                    'method'    : 'POST',
                    'target'    : targetName,
                    'style'     : 'display: none !important'
                });

            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    helpers.createEl(form,'input',{
                        'type':'hidden',
                        'name':key,
                        'value':data[key]
                    });
                }
            }

            form.submit();
        },
		
		/**
		* 
		*/
		parseUrl: function(url) {
			
			var urlRegEx = new RegExp([
					'^(https?:)//',					// protocol
					'(([^:/?#]*)(?::([0-9]+))?)',	// host (hostname and port)
					'(/[^?#]*)',					// pathname
					'(\\?[^#]*|)',					// search
					'(#.*|)$'						// hash
				].join(''));
					
			var match = url.match(urlRegEx);
			
			return match && {
				protocol: match[1],
				host: match[2],
				hostname: match[3],
				port: match[4],
				pathname: match[5],
				search: match[6],
				hash: match[7]
			}
		},
		
		/**
		* Takes a API ID such as https://ca-dev-exampay.cfapps.io/api/testvenue/schema/ and returns a css class name api-testvenue-schema
		* @param {string} id - id of rest endpoint (url)
		*/
		apiIdToCssName: function(id){
			
			// remove any trailing spaces
			id = id.toLowerCase().replace(/^\s|\s$/g,'');
			
			// remove trailing slashes and replace / with -
			return helpers.parseUrl(id).pathname.replace(/^\/|\/$/,'').replace(/\//g,'-')
		},
		
		/**
		* Write values to the console window if present
		* @param {string} value - value to write to the console
		*/
		trace: function(value) {
			if (window.console && window.console.log) {
				window.console.log(value);
			}
		},
		
		/**
		* Returns true if the element has the className assigned
		* @param {element} el - element to check for existance of class name
		* @param {string} cls - css class name to check for
		*/
		hasClass: function(el, cls) {
			return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
		},
	
		/**
		* Adds a className to an element if it does not already exist
		* @param {element} el - element to add css class name to
		* @param {string} cls - css class name to add
		*/
		addClass: function (el, cls) {
			if (!helpers.hasClass(el, cls)) el.className += " " + cls;
		},
	
		/**
		* Removes a className from an element if it does not already exist (checks first to avoid reflows)
		* @param {element} el - element to remove css class name from
		* @param {string} cls - css class name to remove
		*/
		removeClass: function (el, cls) {
	
			if (helpers.hasClass(el, cls)) {
				var reg = new RegExp('\\b' + cls + '\\b');
				el.className = el.className.replace(reg, '').replace('  ',' ');
			}
		},
	
		loadPolyfill: function(files, test, cb) {
            
            helpers.polyfills = helpers.polyfills || 0;
            
			if (!test()) {
				
                //helpers.polyfills += files.length;    
                
				files = Array.isArray(files) ? files : [files];
				
				for (var i=0, l=files.length; i<l; i++) {
					var extension = files[i].replace(/.*?(\.css|\.js)/gi,'$1');
	
					if(extension == ".js") {
						poly = document.createElement('script');
						poly.type = 'text/javascript';
						poly.src = files[i];
					}
					else {
						poly = document.createElement('link');
						poly.rel = 'stylesheet';
						poly.type = 'text/css';
						poly.href = files[i];
					}
	
					poly.onload = function(){
                        helpers.polyfills--;
                        if (cb) cb();
                    };
                    
                    helpers.polyfills++;
                    
					if (document.head) {
						document.head.appendChild(poly);
					} else {
						document.getElementsByTagName('head')[0].appendChild(poly);
					}
				}
			} else {
				cb && cb();
			}
		},
	
		/**
		* Gets a property of an object from a path string (auto resolves json schema paths)
		* @param {object} obj - object to inspect
		* @param {string} prop - property path e.g. 'basics.name'
		* @returns {object} 
		*/
		getPropertyByPath : function(obj, prop, isSchema) {
	
			if (typeof obj === 'undefined') {
				return false;
			}
			
			// is this a schema object?
			isSchema = obj.$schema !== undefined || isSchema;
			
			// all json schema properties are prefixed with either properties or items
			if (isSchema){
				
				// if the object has a properties property, search that
				if (obj.properties &&  prop.indexOf('.properties')<=-1){
					prop = 'properties.' + prop;
				}
				// otherwise check if it has an items property
				else if (obj.items &&  prop.indexOf('.items')<=-1){
					prop = 'items.' + prop;
				}
				
			}
		
			// check if we have any children properties
			var index = prop.indexOf('.');
			
			if (index > -1) {
				
				obj = obj[prop.substring(0, index)];
				prop = prop.substr(index + 1);
				
				return helpers.getPropertyByPath(obj, prop, isSchema);
			}
		
			return obj[prop];
		},
		
		/**
		* Cross browser method to fire events
		*/
		fireEvent: function(el, eventName) {
			if (document.createEvent) {
				var e = document.createEvent('Event');
				e.initEvent(eventName, true, true);
				el.dispatchEvent(e);
			}
			else if (document.createEventObject) {
				el.fireEvent('on' + eventName);
			}
			else if (typeof el['on' + eventName] === 'function') {
				el['on' + eventName]();
			}
		},
	
		validateAgainstSchema: function(schema, prop, value) {
			
			// TODO: Add support for the following
			// min, max (number valies)
			// exclusiveMiimum, exclusiveMaximum (number)
			
			var schemaItem = helpers.getPropertyByPath(schema, prop),
				valLen =  (value + '').length;
			
			if (schemaItem) {
				
				// check confirm input
				if (schemaItem.required && ((schemaItem.format||'').indexOf('confirm-')>-1 && value==='')) {
					return 'Both fields must have a matching value';
				}
				
				// check required status
				if (schemaItem.required && (!value || (Array.isArray(value) && value.length <= 0))) {
					return 'This field must have a value';
				}
				
				if (schemaItem.minItems && (Array.isArray(value) && value.length < schemaItem.minItems)){
					return 'Please select at least ' + schemaItem.minItems + ' item(s)';
				}
				
				if (schemaItem.maxItems && (Array.isArray(value) && value.length > schemaItem.maxItems)){
					return 'Please select a maximum of ' + schemaItem.maxItems + ' item(s)';
				}
				
				if (value && schemaItem.pattern && !value.matches(schemaItem.pattern)) {
					return 'The value is not in the expected format';
				}
				
				if (value && schemaItem.minimum && schemaItem.minimum > value) {
					return 'The value must have at least ' + schemaItem.minimum;
				}
				
				if (value && schemaItem.maxLength && valLen > schemaItem.maxLength){
					return 'The value must have a maximum of '  + schemaItem.maxLength + ' character(s)';
				}
				
				if (value && schemaItem.minLength && valLen < schemaItem.minLength){
					return 'The value must have a minimum of '  + schemaItem.minLength + ' character(s)';
				}
				
			}
			
			return null;
		},
		
		/**
		* Returns JSON Schema property keys in order based on value of .id property value
		*/
		getSortedSchemaKeys: function(schema){
			
			schema = schema.properties || schema;
			
			// get the keys
			var keys = Object.keys(schema);
			
			keys.sort(function(a, b){
				
				var aId = (schema[a].id) ? parseInt(schema[a].id.replace(/[^0-9]+/gi,'') || "0") : 0,
					bId = (schema[b].id) ? parseInt(schema[b].id.replace(/[^0-9]+/gi,'') || "0") : 0;
	
				return (aId - bId); 
			})
			
			return keys;
		},
	
		/**
		* returns the view port dimensions and scroll offsets
		* @returns {object} containing dimensions
		*/
		viewPort: function () {
	
			var d = document,
				b = d.body,
				docEl = d.documentElement,
				w = window;
	
			return {
				h: (w.innerHeight || b.clientHeight || docEl.clientHeight),
				w: (w.innerWidth || b.clientWidth || docEl.clientWidth),
				sX: (b.scrollLeft || docEl.scrollLeft || w.pageXOffset || 0),
				sY: (b.scrollTop || docEl.scrollTop || w.pageYOffset || 0)
			};
		},
	
		/**
		* Returns true for an array or object with no values
		* @param {object} obj - object or array to test
		* @returns {bool} true if item contains content otherwise false
		*/
		isEmptyCollection: function(obj) {
			
			// return true for empty array
			if (Array.isArray(obj) && obj.length<=0) return true;
			
			// return false if object with at least one property
			for (var prop in obj) {
				if(obj.hasOwnProperty(prop)) return false;
			}
		
			return true;
		},
	
		/**
		* cross browser method to add events to elements (allows multiple assignments)
		* @param {element} el - element to add the event to
		* @param {string} type - type of event to listen for
		* @param {function} func - event handler to execute when the event first
		*/
		addEvent: function (el, type, func) {
			if (el.addEventListener) { el.addEventListener(type, func, false); }
			else if (el.attachEvent) { el.attachEvent('on' + type, func); }
		},
		
		/**
		* Returns the first child of an element skipping text nodes
		*/
		getFirstChild: function(el){
			var firstChild = el.firstChild;
			
			while(firstChild != null && firstChild.nodeType == 3){ // skip TextNodes
				firstChild = firstChild.nextSibling;
			}
			
			return firstChild;
		},
	
		/**
		* Insert before returning newly inserted child
		*/
		insertFirstChild: function(parent, newFirstChild) {
			parent.insertBefore(newFirstChild, parent.firstChild);
			return parent.firstChild;
		},
	
		/**
		* Removes nojs and notouch if the device is not touch enabled
		*/
		init : function(){
			// tweak CSS markers
			var htmlEl = document.getElementsByTagName('HTML')[0];
		
			if (htmlEl) {
		
				var css = htmlEl.className || '';

				// remove nojs marker
				css = css.replace(/\bnojs\b/, '');
		
				// remove the notouch class if its supported
				if ('ontouchstart' in document || 'ontouchstart' in window) {
					css = css.replace(/\bnotouch\b/, '');
				}
		
				// update css
				htmlEl.className = css;
			};
			
		},
		
		/**
		* Converts a JSON schema+data into valid CSV string
		* @param {object} schema - json schema used to render column headers
		* @param {obejct} data - data array contining items to render as rows
		*/
		jsonToCSV: function(schema, data, separator, lineTerminator){
			
			schema = ((schema && schema.properties) ? schema.properties : schema || {});
			data = data || [];
			separator = separator || ',';
			lineTerminator = lineTerminator || '\n';
			
			if (separator.indexOf('"')>-1) throw 'Invalid separator';
			if (lineTerminator.indexOf('"')>-1) throw 'Invalid lineTerminator';
			
			var keys = [],
				line = [],
				rows = [],
				headers = [];

			// wraps any value containing separators in quotes
			// need to also escape double quotes
			var escapeValue = function(value){
				if (value.indexOf(separator)>-1 || value.indexOf(lineTerminator)>-1){
					return '"' + value.replace(/"/g,'\"') + '"';
				}
				return value;
			};
				
			// get keys we're interested in
			Object.keys(schema).forEach(function(key){
				if (schema.hasOwnProperty(key) && key !== 'links'){
					keys.push(key);
				}
			});
			
			// build headers
			keys.forEach(function(key){
				headers.push(schema[key].title || key);
			});
			
			// add headers as first rows item
			rows.push(headers.join(separator));
			
			// build rows
			data.forEach(function(item){
				
				line = []; // create new line collection
				
				// add each data item to the current line
				keys.forEach(function(key){
					line.push(escapeValue(item[key] || ''));
				});
				
				// convert line into CSV row and add to rows collection
				rows.push(line.join(separator));
			});
			
			// split rows onto lines and return			
			return rows.join(lineTerminator);
		},
		
		/**
		* merge javascript objects
		*/
		merge: function(obj, src) {
			for (var key in src) {
				if (src.hasOwnProperty(key)) obj[key] = src[key];
			}
			return obj;
		},
	
		/**
		* Returns a new Date constructed from a UTC local date String e.g. 2010-05-22T16:00:00.
		* As JavaScript does not have a concept of floating date-times, the returned object will be a date in the client timezone matching the local date-time.
		* However, this is adequate for display purposes.
		*
		* @param {string} isoString the date in ISO local date-time format
		* @return {Date} a JS Date initialised with the local date-time. Note that this is not a true floating date-time so can't be reliably manipulated in any way.
		*/
		parseIsoLocalDate: function (isoString) {
			var localDate = new Date(isoString);
			return new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), localDate.getUTCHours(), localDate.getUTCMinutes(), localDate.getUTCSeconds());
		}
	
	}
	
	if (typeof module === "object" && module && typeof module.exports === "object") {
		// expose to node
		module.exports = helpers;
	} else {
		// expose to browser
		window.helpers = helpers;
	}

})(this);