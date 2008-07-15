var Browser = {
	a : navigator.userAgent.toLowerCase()
}
Browser = {
	ie : /*@cc_on true || @*/ false,
	ie6 : Browser.a.indexOf('msie 6') != -1,
	ie7 : Browser.a.indexOf('msie 7') != -1,
	opera : !!window.opera,
	safari : Browser.a.indexOf('safari') != -1,
	safari3 : Browser.a.indexOf('applewebkit/5') != -1,
	mac : Browser.a.indexOf('mac') != -1
}
function $(e) {
	if(typeof e == 'string')
    	return document.getElementById(e);
	return e;
}
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
}
// Do not prototype Object or Array if using for-in loops
function indexOf(array, elt /*, from*/) {
	// SpiderMonkey imlementation
	var len = array.length;

	var from = Number(arguments[2]) || 0;
	from = (from < 0) ? Math.ceil(from) : Math.floor(from);
	if(from < 0)
		from += len;

	for(; from < len; from++)
		if(from in array && array[from] === elt)
			return from;

	return -1;
}
function createElement(name, attrs, doc, xmlns) {
	var doc = doc || document;
	var elm;
	if(doc.createElementNS)
		elm = doc.createElementNS(xmlns || "http://www.w3.org/1999/xhtml", name);
	else
		elm = doc.createElement(name);
	if(attrs)
		for(attr in attrs)
			elm.setAttribute(attr, attrs[attr]);
	return elm;
}
function createElementStr(name, attrs) {
	return new NodeStr(name, attrs);
}
function setDisplay(e, display) {
	$(e).style.display = display;
}
function hide(e) {
	setDisplay(e, 'none');
}
function show(e) {
	setDisplay(e, '');
}
function visible(e) {
	return $(e).style.display != 'none';
}
function toggle(e) {
	(visible(e) ? hide : show)(e);
}
function visibleInverse(e) {
	return $(e).style.display != '';
}
function toggleInverse(e, display) {
	setDisplay(e, visibleInverse(e) ? '' : display);
}
function getChildElementsByTagName(e, tagName) {
	var nodes = [];
	for(var i = 0; i < e.childNodes.length; i++)
		if(e.childNodes[i].nodeName.toLowerCase() == tagName)
			nodes.push(e.childNodes[i]);
	return nodes;
}
function getElementsByClassName(className, element, tagName) {
	var regexp = new RegExp('(^|\\s)' + className + '(\\s|$)');
	var tagName = tagName || '*';
	var element = element || document;
	var elements = (tagName == '*' && element.all) ? element.all : element.getElementsByTagName(tagName);
	var found = [];
	for(var i = 0, elm; elm = elements[i]; i++)
		if(regexp.test(elm.className))
			found.push(elm);
	return found;
}
function hasClassName(e, className) {
	return (new RegExp('(^|\\s)' + className + '(\\s|$)').test($(e).className));
}
function addClassName(e, className) {
	var e = $(e);
	if(!hasClassName(e, className))
		e.className += (e.className ? ' ' : '') + className;
}
function removeClassName(e, className) {
	var e = $(e);
	e.className = e.className.replace(new RegExp('(^|\\s+)' + className + '(\\s+|$)'), ' ').trim();
}
function removeChildren(e) {
	while(e.firstChild)
		e.removeChild(e.firstChild);
}
function bind(method, scope, args) {
	if(!args)
		args = [];
	return function() {
		return method.apply(scope, args);
	}
}
function addEvent(obj, evType, fn) {
	if(obj.addEventListener) {
		obj.addEventListener(evType, fn, false);
		return true;
	} else if(obj.attachEvent || Browser.ie)
		return obj.attachEvent('on' + evType, fn);
	return false;
}
function removeEvent(obj, evType, fn) {
	if(obj.removeEventListener) {
		obj.removeEventListener(evType, fn, false);
		return true;
	} else if(obj.detatchEvent || Browser.ie)
		return obj.detachEvent('on' + evType, fn);
	return false;
}
function setBgPos(e, y, x) {
	$(e).style.backgroundPosition = y ? (x ? x + ' ' + y : '0 ' + y) : '0 0';
}
function addStylesheet(href, media) {
	document.getElementsByTagName("head")[0].appendChild(createElement('link', {
		'rel': 'stylesheet',
		'type': 'text/css',
		'media': media || 'screen, projection',
		'href': href
	}));
}

// used for DOM-like creation of object elements in IE
var NodeStr = function(name, attrs) {
	this.name = name;
	if(attrs)
		this.attrs = attrs;
	else
		this.attrs = {};
	this.childNodes = [];
}
NodeStr.prototype = {
	appendChild : function(node) {
		this.childNodes.push(node);
		return node;
	},
	setAttribute : function(name, value) {
		this.attrs[name] = value;
	},
	toString : function() {
		var str = '<' + this.name;
		if(this.attrs)
			for(attr in this.attrs)
				str += ' ' + attr + '="' + this.attrs[attr] + '"';
		str += '>';
		for(child in this.childNodes)
			str += this.childNodes[child];

		return str + '</' + this.name + '>';
	}
}

function selectLanguage(lang) {
	window.location = HTTP.setURLParam('locale', lang);
}

var HTTP = {
	URL_SPACE_REGEXP : /%20/g,
	getURLParams : function(url) {
		var map = {};
		if(url) {
			var queryStart = url.indexOf('?');
			var hashStart = url.indexOf('#');
			if(queryStart != -1) {
				if(hashStart != -1)
					url = url.substring(queryStart + 1, hashStart);
				else
					url = url.substr(queryStart + 1);
			} else
				return map;
		} else
			url = window.location.search.substr(1);
		var entries = url.split('&');
		for(var i = 0; i < entries.length; i++) {
			var entry = entries[i].split('=', 2);
			if(!map[entry[0]])
				map[entry[0]] = [];
			map[entry[0]].push(entry.length == 2 ? decodeURIComponent(entry[1]) : null);
		}
		return map;
	},
	setURLParam : function(parameter, value, url) {
		var hash = '';
		var path;
		if(url) {
			var queryStart = url.indexOf('?');
			var hashStart = url.indexOf('#');
			if(queryStart != -1)
				path = url.substring(0, queryStart);
			else if(hashStart != -1)
				path = url.substring(0, hashStart);
			else
				path = url;
			if(hashStart != -1)
				hash = url.substr(hashStart);
		} else {
			url = false;
			path = window.location.pathname;
			hash = window.location.hash;
		}
		var params = HTTP.getURLParams(url);
		params[parameter] = [value];
		return path + HTTP._createQueryString(params) + hash;
	},
	encodeForm : function(form, post) {
		var pairs = [];
		var inputs = form.getElementsByTagName('input');
		var textareas = form.getElementsByTagName('textarea');
		var selects = form.getElementsByTagName('select');

		for(var i = 0, input; input = inputs[i]; i++)
			if(!input.disabled && input.name && ((input.type != 'radio' && input.type != 'checkbox') || input.checked))
				pairs.push(HTTP._formUrlEncode(input.name, post) + '=' + HTTP._formUrlEncode(input.value, post));

		for(var i = 0, input; input = textareas[i]; i++)
			if(!input.disabled && input.name)
				pairs.push(HTTP._formUrlEncode(input.name, post) + '=' + HTTP._formUrlEncode(input.value, post));

		for(var i = 0, input; input = selects[i]; i++)
			if(!input.disabled && input.name)
				for(var j = 0, option; option = input.options[j]; j++)
					if(option.selected)
						pairs.push(HTTP._formUrlEncode(input.name, post) + '=' + HTTP._formUrlEncode(option.value, post));

		return pairs.join('&');
	},
	_createQueryString : function(map) {
		var search = '';
		for(field in map)
			if(!Object.prototype[field]) {
				var array = map[field];
				for(var i = 0; i < array.length; i++) {
					if(search != '')
						search += '&';
					search += field;
					if(array[i] != null)
						search += '=' + array[i];
				}
			}
		if(search != '')
			search = '?' + search;
		return search;
	},
	_formUrlEncode : function(val, post) {
		if(post)
			return encodeURIComponent(val).replace(HTTP.URL_SPACE_REGEXP, '+');
		return encodeURIComponent(val);
	}
}

var Form = {
	getForm : function(node) {
		while(node.nodeName.toLowerCase() != 'form')
			node = node.parentNode;
		return node;
	},
	/* Allows an anchor tag or other element to act as a form submission button. Emulates correct
	 * implementation of the DOM Level 2 method HTMLFormElement::submit. All supported browers
	 * implement the submit method consistently incorrect, so duplicate calls to the onsubmit event
	 * listener is not a concern at this time.
	 *
	 * If the parent form has an onsubmit event handler, the handler must return a value that will
	 * resolve to true when the form submission should take place.
	 */
	submit : function(node) {
		var form = Form.getForm(node);
		if(!form.onsubmit || form.onsubmit()) {
			/* Under SSL with server-side HTML generation, submit() will fail when called in
			 * an onclick event handler on anchor tags in IE 6.
			 */
			if(Browser.ie6) {
				window.setTimeout(function() {
					form.submit();
				}, 50);
			} else
				form.submit();
		}
	},
	getFields : function(element) {
		var fields = [];
		var fieldSets = [
			element.getElementsByTagName('input'),
			element.getElementsByTagName('textarea'),
			element.getElementsByTagName('select')
		];

		for(var i = 0, fieldSet; fieldSet = fieldSets[i]; i++)
			for(var j = 0, field; field = fieldSet[j]; j++)
				fields.push(field);

		return fields;
	},
	showFields : function(e) {
		var fields = Form.getFields(e);
		for(field in fields)
			fields[field].disabled = false;
		show(e);
	},
	hideFields : function(e) {
		var fields = Form.getFields(e);
		hide(e);
		for(field in fields)
			fields[field].disabled = true;
	}
}

var CustomSelect = {
	toggleSelect : function(select, optionContainer, visibleClass, hiddenClass, inverse) {
		var optionContainer = $(optionContainer);
		if(inverse ? visibleInverse(optionContainer) : visible(optionContainer))
			CustomSelect._hideSelect(select, optionContainer, hiddenClass, inverse);
		else
			CustomSelect._showSelect(select, optionContainer, visibleClass, inverse);
	},
	hideSelectDelayed : function(index, select, optionContainer, className, inverse, delay) {
		var funcRef = function() {
			CustomSelect._hideSelect(select, optionContainer, className, inverse);
		}
		Timers.set('select' + index, funcRef, delay || 50);
	},
	onblur : function(index, select, optionContainer, className, inverse) {
		if(Browser.opera) // Opera handles focus/blur events differently than other browsers
			return;
		CustomSelect.hideSelectDelayed(index, select, optionContainer, className, inverse);
	},
	cancelHideSelect : function(index) {
		Timers.clear('select' + index);
	},
	cancelHideSelectDelayed : function(index) {
		window.setTimeout(function() {
			CustomSelect.cancelHideSelect(index)
		}, 10);
	},
	_showSelect : function(select, optionContainer, className, inverse) {
		var optionContainer = $(optionContainer);
		$(select).className = className;
		inverse ? setDisplay(optionContainer, 'block') : show(optionContainer);
	},
	_hideSelect : function(select, optionContainer, className, inverse) {
		var optionContainer = $(optionContainer);
		$(select).className = className;
		inverse ? setDisplay(optionContainer, '') : hide(optionContainer);
	}
}
var Timers = {
	set: function(id, code, timeout, allowMultiple) {
		if(Timers[id] != null && !allowMultiple)
			Timers.clear(id);
		Timers[id] = window.setTimeout(code, timeout);
	},
	clear: function(id) {
		window.clearTimeout(Timers[id]);
		Timers[id] = null;
	}
};

var Tooltip = {
	container: null,
	contentContainer: null,
	viewportHeight: 0,
	diff: 0,
	showTip: function(content, id) {
		Tooltip.container = $(id || 'tipContainer');
		Tooltip.container.getElementsByTagName('span')[0].innerHTML = content; // TODO use DOM node copy
		Tooltip.viewportHeight = (window.innerHeight) ? window.innerHeight : document.documentElement.clientHeight;
		Tooltip.contentContainer = Tooltip.container.getElementsByTagName('div')[0];

		setDisplay(Tooltip.container, 'block');
	},
	tipPosition: function(callingEvent) {
		if(!Tooltip.container)
			return;
		callingEvent = callingEvent || window.event;

		var mouseX = callingEvent.clientX;
		var mouseY = callingEvent.clientY;

		if(Tooltip.diff == 0) {
			if (mouseY + Tooltip.contentContainer.offsetHeight > Tooltip.viewportHeight)
					Tooltip.diff = (mouseY + Tooltip.contentContainer.offsetHeight) - Tooltip.viewportHeight + 10;
		}

		Tooltip.container.style.top = mouseY + ((self.pageYOffset || document.documentElement.scrollTop) - 1) +10 - Tooltip.diff + "px";
		Tooltip.container.style.left = mouseX + (self.pageXOffset || document.documentElement.scrollLeft) + 10 + "px";

	},
	hideTip: function() {
		hide(Tooltip.container);
		Tooltip.container = null;
		Tooltip.contentContainer = null;
		Tooltip.viewportHeight = 0;
		Tooltip.diff = 0;
	}
}

addEvent(document, 'mousemove', Tooltip.tipPosition); // TODO only attach event when needed, make sure first position is correct

function showPagedContent(container, pageTagName, pageIndex, relative, detectionFunc, activationFunc, deactivationFunc) {
	var detectionFunc = detectionFunc || visible;
	var activationFunc = activationFunc || show;
	var deactivationFunc = deactivationFunc || hide;
	var pages = getChildElementsByTagName($(container), pageTagName);

	for(var i = 0; i < pages.length; i++) {
		if(detectionFunc(pages[i])) {
			var pageIndex = relative ? i + pageIndex : pageIndex;
			if(pageIndex >= 0 && pageIndex < pages.length) {
				deactivationFunc(pages[i]);
				activationFunc(pages[pageIndex]);
				return pageIndex;
			}
			break;
		}
	}
	return null;
}

var Blackout = {
	BLACKOUT_ID : 'blackout',
	node : null,
	open : function(id) {
		Blackout.node = $(id || Blackout.BLACKOUT_ID);
		/*addEvent(window, 'scroll', Blackout._adjust);
		addEvent(window, 'resize', Blackout._adjust);
		Blackout._adjust();*/
		setDisplay(Blackout.node, 'block');
		Blackout.node.style.height = document.documentElement.scrollHeight + 'px';
		if(Browser.ie6)
			addClassName(document.getElementsByTagName('body')[0], 'hiddenFields');
	},
	close : function() {
		hide(Blackout.node);
		/*removeEvent(window, 'scroll', Blackout._adjust);
		removeEvent(window, 'resize', Blackout._adjust);*/
		if(Browser.ie6)
			removeClassName(document.getElementsByTagName('body')[0], 'hiddenFields');
	}/*,
	_adjust : function() {
		//Blackout.node.style.marginTop = document.documentElement.scrollTop + 'px';
		Blackout.node.style.marginLeft = document.documentElement.scrollLeft + 'px';
	}*/
};

function displayCenteredBlock(block) {
	var regex = /(^|\s)position(\s|$)/;
	var cDiv;
	for(var i = 0, div, childDivs = $(block).getElementsByTagName('div'); div = childDivs[i]; i++)
		if(regex.test(div.className)) {
			cDiv = div;
			break;
		}
	if(!cDiv)
		return;
	show(block);
	var yPos = parseInt((document.documentElement.clientHeight - cDiv.offsetHeight) / 2);
	var yScroll = self.pageYOffset || document.documentElement.scrollTop;
	cDiv.style.marginTop = Math.max(yPos + yScroll, 0) + "px";
	Blackout.open(); // must occur after popup positioned to get correct height
}

// Be sure the parameter rxhtml is asserted when making AJAX requests to force XHTML to be returned when HTML normally would be
var InlinePopupForm = {
	open : function(url, container) {
		var container = container || 'popupContainer';
		if(url) {
			// TODO use a method that calls validateXHRResponse
			Sarissa.updateContentFromURI(HTTP.setURLParam('rxhtml', 'true', url), $(container), null, function(oNode, oTargetElement) {
				ampFix(oNode, oTargetElement);
				displayCenteredBlock(oTargetElement);
			});
		} else
			displayCenteredBlock(container);
	},
	submit : function(node, skipReload, successCallback) {
		var container = InlinePopupForm._getContainer(node);
		var form = InlinePopupForm._getForm(container);

		// TODO trigger activity indicator and/or disable buttons

		var callback = function(success) {
			if(success) {
				if(successCallback)
					successCallback();
				if(skipReload)
					InlinePopupForm.close(node);
				else
					// to avoid re-posting forms, don't use window.location.reload()
					// TODO make this reload page in the presence of hash URL component
					window.location.href = window.location.href;
			} else
				displayCenteredBlock(container);
		}

		Sarissa.formPostRequest(HTTP.setURLParam('rxhtml', 'true', form.action), container, form, callback);
	},
	close : function(node, emptyForm) {
		var container = typeof node == 'string' ? $(node) : InlinePopupForm._getContainer(node);
		hide(container);
		Blackout.close();
		if(emptyForm)
			removeChildren(InlinePopupForm._getForm(container));
	},
	_getContainer : function(node) {
		while(node = node.parentNode)
			if(node.className == 'displayForm')
				return node;
	},
	_getForm : function(container) {
		return container.getElementsByTagName('form')[0];
	}
}

/* Callback to correct Opera and Safari problems with HTML entities in src attribute of img tags.
 * Only affects img tags set dynamically after an AJAX request.
 */
function ampFix(oNode, oTargetElement) {
	var tagName = 'img';
	var attrName = 'src';

	if(Browser.safari) {
		var nodes = oTargetElement.getElementsByTagName(tagName);
		for(var i = 0, node; node = nodes[i]; i++)
			if(node.hasAttribute(attrName))
				node.setAttribute(attrName, node.getAttribute(attrName).replace('&#38;', '&'));
	} else if(Browser.opera) {
		var nodes = oTargetElement.getElementsByTagName(tagName);
		for(var i = 0, node; node = nodes[i]; i++)
			if(node.hasAttribute(attrName))
				node.setAttribute(attrName, node.getAttribute(attrName).replace('&amp;', '&'));
	}
}
/* Returns true if the response to an XHR had a valid ready state and HTTP status.
 * If the HTTP status code is an expected error code, reload the current page so that the user sees
 * the login page, error page, or at least sees the XHR failed for some reason.
 * Redirection of an XHR indicates a problem.
 */
Sarissa.validateXHRResponse = function(xmlhttp) {
	if(xmlhttp.readyState != 4)
		return false;
	if(xmlhttp.status) {
		switch(xmlhttp.status) {
			case 301:
			case 302:
			case 307:
			case 403:
			case 404:
			case 500:
			case 503:
				window.location.reload();
				return false;
		}
	}
	return true;
}
/* Performs an AJAX form post operation and calls an optional callback method with a boolean
 * parameter that is true if the response was successful, false otherwise.
 */
Sarissa.formPostRequest = function(sFromUrl, oTargetElement, oSrcForm, callback, skipCache, ignoreStylesheets) {
	try {
		var SUCCESS_CONTENT_TYPE = 'application/x-success';
		var xmlhttp = new XMLHttpRequest();
		var xsltproc = null;
		var parameters = '';
		if(oTargetElement)
			Sarissa.updateCursor(oTargetElement, 'wait');
		xmlhttp.open('POST', sFromUrl, true);
		function sarissa_dhtml_loadHandler() {
			if(Sarissa.validateXHRResponse(xmlhttp)) {
				if(!ignoreStylesheets) {
					var stylesheetPath = Sarissa.getXMLStylesheet(xmlhttp.responseXML);
					if(stylesheetPath) {
						xsltproc = new XSLTProcessor();
						var xslDoc = Sarissa.getDomDocument();
						xslDoc.async = false;
						xslDoc.load(stylesheetPath);
						xsltproc.importStylesheet(xslDoc);
					}
				}
				var contentType = xmlhttp.getResponseHeader('Content-Type').split(';')[0];
				var success = contentType == SUCCESS_CONTENT_TYPE;
				if(!success && oTargetElement)
					Sarissa.updateContentFromNode(xmlhttp.responseXML, oTargetElement, xsltproc, ampFix);

				if(callback)
					callback(success);
			}
		}
		xmlhttp.onreadystatechange = sarissa_dhtml_loadHandler;

		if(oSrcForm)
			parameters = HTTP.encodeForm(oSrcForm, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.setRequestHeader('Connection', 'close');

		if(skipCache)
			xmlhttp.setRequestHeader('If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT');

		xmlhttp.send(parameters);
	} catch(e) {
		// Exception likely due to session expiration, see TODO above
		window.location.reload();
	} finally {
        if(oTargetElement)
			Sarissa.updateCursor(oTargetElement, 'auto');
    }
    return false;
}

/* Performs an update identical to Sarissa.updateContentFromURI with the exception of providing a
 * parameter for a callback that will be called when a successful custom content type is returned.
 *
 * TODO reduce duplication between formPostRequest and this method
 */
Sarissa.updateContentConditionally = function(sFromUrl, oTargetElement, xsltproc, callback, onSuccessCallback, skipCache, ignoreStylesheets) {
    try{
    	var SUCCESS_CONTENT_TYPE = 'application/x-success';
        Sarissa.updateCursor(oTargetElement, "wait");
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", sFromUrl, true);
        function sarissa_dhtml_loadHandler() {
            if(Sarissa.validateXHRResponse(xmlhttp)) {
            	if(!xsltproc && !ignoreStylesheets) {
            		var stylesheetPath = Sarissa.getXMLStylesheet(xmlhttp.responseXML);
            		if(stylesheetPath) {
	            		xsltproc = new XSLTProcessor();
						var xslDoc = Sarissa.getDomDocument();
						xslDoc.async = false;
						xslDoc.load(stylesheetPath);
						xsltproc.importStylesheet(xslDoc);
					}
            	}
            	var contentType = xmlhttp.getResponseHeader('Content-Type').split(';')[0];
            	if(contentType == SUCCESS_CONTENT_TYPE && onSuccessCallback) {
					onSuccessCallback();
					return;
				}
                Sarissa.updateContentFromNode(xmlhttp.responseXML, oTargetElement, xsltproc, callback);
            }
        }
        xmlhttp.onreadystatechange = sarissa_dhtml_loadHandler;
        if(skipCache) {
             var oldage = "Sat, 1 Jan 2000 00:00:00 GMT";
             xmlhttp.setRequestHeader("If-Modified-Since", oldage);
        }
        xmlhttp.send("");
    }
    catch(e){
        Sarissa.updateCursor(oTargetElement, "auto");
        throw e;
    }
};

// specific to address-dynamic.xsl
function showCountryAddressForm(country, countryLists, initialCountry) {
	if(initialCountry) { // only provided when editing main contact
		if(country != initialCountry) {
			show(Legal.TOU_BLOCK_ID);
			// from Account creation.js
			viewTerms(country);
		} else {
			hide(Legal.TOU_BLOCK_ID);
			// from Account creation.js
			hideAll();
		}
		InlinePopupForm.open();
	}

	var firstNameField = $('fieldId.address.firstname');
	var lastNameFields = [$('fieldId.us.address.lastname'), $('fieldId.eu.address.lastname')];
	var pageIndex = 0;

	for(var i = 0; i < countryLists.length; i++) {
		if(countryLists[i].indexOf(country) != -1) {
			pageIndex = i;
			break;
		}
	}

	showPagedContent('addressFields', 'div', pageIndex, false, visible, Form.showFields, Form.hideFields);

	if(pageIndex == 0) {
		var fields = Form.getFields($('addressSubdivUS'));
		for(field in fields)
			fields[field].disabled = true; // force nested page to reset correctly
		showPagedContent('addressSubdivUS', 'div', {'USA':1, 'CAN':2}[country] || 0, false, visible, Form.showFields, Form.hideFields);
	}

	// hack to ensure last name field (visibility varies by country) matches disabled state of first name field (never hidden)
	// KOR addresses do not offer last name field
	if(firstNameField)
		for(field in lastNameFields)
			if(lastNameFields[field])
				lastNameFields[field].disabled = firstNameField.disabled;
}

function showCardTip() {
	Tooltip.showTip($('cvvCodeHelp' + ({
		'AX':'Amex',
		'DI':'Disc'
	}[$('selectCCtype').value] || '')).innerHTML);
}

function showIssueNumber() {
	({
		'SO':show,
		'SW':show
	}[$('selectCCtype').value] || hide)('issueNumber');
}

function paddingZero(num, length){
	if(length)
		return new String(Math.pow(10,length) + num).substr(1);
	else
		return  num;
}
/**
*yyyy-MM-dd HH:mm:ss
**/
function printLocalizedTime(target, timestamp, pattern, month_list, day_list){
	var dateObj;
	var str;

	dateObj= new Date() ;

	if(timestamp)
		dateObj.setTime(timestamp);

	if(pattern){
		str = pattern.replace(/yyyy/g, dateObj.getFullYear()).replace(/yy/g, dateObj.getYear())
							.replace(/MM/g, paddingZero(dateObj.getMonth() + 1, 2))
							.replace(/dd/g, paddingZero(dateObj.getDate(), 2))
							.replace(/HH/g, paddingZero(dateObj.getHours(), 2))
							.replace(/hh/g, paddingZero(dateObj.getHours() > 12 ? dateObj.getHours() - 12 : dateObj.getHours(), 2))
							.replace(/mm/g, paddingZero(dateObj.getMinutes(), 2))
							.replace(/ss/g, paddingZero(dateObj.getSeconds(), 2));

		if(month_list){
			var months = month_list.split(" ");
			var m = months && months.length > 0 ? months[dateObj.getMonth()] : dateObj.getMonth() + 1;
			str = str.replace(/Month/g, m)
						.replace(/month/g, m.length > 3 ? m.substr(0, 3) : m);
		}

		/**
		* Notice
		* Must Keep a Replacement Ordering
		* (ex. If string replaced /DAY/g at first time, It replace next regExp /day/g one more. That return string such as "ThueThu")
		*/
		if(day_list){
			var days = day_list.split(" ");
			var w = days && days.length > 0 ? days[dateObj.getDay()] : "";
			str = str.replace(/day/g, w.length > 3 ? w.substr(0, 3) : w)
						.replace(/Day/g, w);
		}
	}
	else
		str = dateObj.toString();

	$(target).innerHTML = str;

	return str;
}

/* Korean Zipcode functions */

function searchZipcode(){
	var form = $('searchZip');
	if(form.keyword.value == "")
		return false;

	if(form.isModify.value == '1')
		form.action = "summary.xml";
	form.submit();
}


function setAddress(zipcode, zipcodeEle, address1, addressEle) {
	zipcodeEle = zipcodeEle.split('.');
	addressEle = addressEle.split('.');

	var targ = document.getElementsByTagName('input');

	for (hj = 0; hj < targ.length; hj++) {
		if (targ[hj].id!=null && targ[hj].id!='') {
			var comp = targ[hj].id.split('.');
			if ((comp[0] == zipcodeEle[0]) && (comp[comp.length-1] == zipcodeEle[zipcodeEle.length - 1]))
				targ[hj].value = zipcode;
			else if ((comp[0] == addressEle[0]) && (comp[comp.length-1] == addressEle[addressEle.length - 1]))
				targ[hj].value = address1;
		}
	}

	zipcodePopup.close();
}


// TODO these functions should test if popup nodes exist instead of using URL
var zipcodePopup = {
	open : function() {
		var currentURL = location.href;
		currentURL = currentURL.split('/');
		currentURL = currentURL[currentURL.length-1].split('.')[0];

		if (currentURL == 'summary') {
			displayCenteredBlock('zipcodePopup');
			document.getElementById('keyword').focus();
			hide('modifyAddressBySummary');
		} else {
			displayCenteredBlock('zipcodePopup');
			document.getElementById('keyword').focus();
			hide('popupContainer');
		}
	},
	close : function() {
		var currentURL = location.href;
		currentURL = currentURL.split('/');
		currentURL = currentURL[currentURL.length-1].split('.')[0];

		if (currentURL == 'contact') {
			hide('zipcodePopup');
			Blackout.close();
		} else if (currentURL == 'summary') {
			displayCenteredBlock('modifyAddressBySummary');
			hide('zipcodePopup');
		} else {
			displayCenteredBlock('popupContainer');
			hide('zipcodePopup');
		}
	}
}