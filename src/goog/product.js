// Copyright 2008 Google Inc. All Rights Reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Detects the specific browser and not just the rendering engine.
 *
 */

goog.provide('goog.userAgent.product');

goog.require('goog.userAgent');


/**
 * @define {boolean} Whether the code is running on the Firefox web browser.
 */
goog.userAgent.product.ASSUME_FIREFOX = false;


/**
 * @define {boolean} Whether the code is running on the Camino web browser.
 */
goog.userAgent.product.ASSUME_CAMINO = false;


/**
 * @define {boolean} Whether we know at compile-time that the product is an
 *     iPhone.
 */
goog.userAgent.product.ASSUME_IPHONE = false;


/**
 * @define {boolean} Whether we know at compile-time that the product is an
 *     Android phone.
 */
goog.userAgent.product.ASSUME_ANDROID = false;


/**
 * @define {boolean} Whether the code is running on the Chrome web browser.
 */
goog.userAgent.product.ASSUME_CHROME = false;


/**
 * @define {boolean} Whether the code is running on the Safari web browser.
 */
goog.userAgent.product.ASSUME_SAFARI = false;


/**
 * Whether we know the product type at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.product.PRODUCT_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_OPERA ||
    goog.userAgent.product.ASSUME_FIREFOX ||
    goog.userAgent.product.ASSUME_CAMINO ||
    goog.userAgent.product.ASSUME_IPHONE ||
    goog.userAgent.product.ASSUME_ANDROID ||
    goog.userAgent.product.ASSUME_CHROME ||
    goog.userAgent.product.ASSUME_SAFARI;


/**
 * Right now we just focus on Tier 1-3 browsers at:
 * http://wiki.corp.google.com/twiki/bin/view/Nonconf/ProductPlatformGuidelines
 * As well as the YUI grade A browsers at:
 * http://developer.yahoo.com/yui/articles/gbs/
 *
 * @private
 */
goog.userAgent.product.init_ = function() {

  /**
   * Whether the code is running on the Firefox web browser.
   * @type {boolean}
   * @private
   */
  goog.userAgent.product.detectedFirefox_ = false;

  /**
   * Whether the code is running on the Camino web browser.
   * @type {boolean}
   * @private
   */
  goog.userAgent.product.detectedCamino_ = false;

  /**
   * Whether the code is running on an iPhone or iPod touch.
   * @type {boolean}
   * @private
   */
  goog.userAgent.product.detectedIphone_ = false;

  /**
   * Whether the code is running on the default browser on an Android phone.
   * @type {boolean}
   * @private
   */
  goog.userAgent.product.detectedAndroid_ = false;

  /**
   * Whether the code is running on the Chrome web browser.
   * @type {boolean}
   * @private
   */
  goog.userAgent.product.detectedChrome_ = false;

  /**
   * Whether the code is running on the Safari web browser.
   * @type {boolean}
   * @private
   */
  goog.userAgent.product.detectedSafari_ = false;

  var ua = goog.userAgent.getUserAgentString();
  if (!ua) {
    return;
  }

  // The order of the if-statements in the following code is important.
  // For example, in the WebKit section, we put Chrome in front of Safari
  // because the string 'Safari' is present on both of those browsers'
  // userAgent strings as well as the string we are looking for.
  // The idea is to prevent accidental detection of more than one client.

  if (ua.indexOf('Firefox') != -1) {
    goog.userAgent.product.detectedFirefox_ = true;
  } else if (ua.indexOf('Camino') != -1) {
    goog.userAgent.product.detectedCamino_ = true;
  } else if (ua.indexOf('iPhone') != -1 || ua.indexOf('iPod') != -1) {
    goog.userAgent.product.detectedIphone_ = true;
  } else if (ua.indexOf('Android') != -1) {
    goog.userAgent.product.detectedAndroid_ = true;
  } else if (ua.indexOf('Chrome') != -1) {
    goog.userAgent.product.detectedChrome_ = true;
  } else if (ua.indexOf('Safari') != -1) {
    goog.userAgent.product.detectedSafari_ = true;
  }
};

if (!goog.userAgent.product.PRODUCT_KNOWN_) {
  goog.userAgent.product.init_();
}


/**
 * Whether the code is running on the Opera web browser.
 * @type {boolean}
 */
goog.userAgent.product.OPERA = goog.userAgent.OPERA;


/**
 * Whether the code is running on an IE web browser.
 * @type {boolean}
 */
goog.userAgent.product.IE = goog.userAgent.IE;


/**
 * Whether the code is running on the Firefox web browser.
 * @type {boolean}
 */
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_FIREFOX :
    goog.userAgent.product.detectedFirefox_;


/**
 * Whether the code is running on the Camino web browser.
 * @type {boolean}
 */
goog.userAgent.product.CAMINO = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_CAMINO :
    goog.userAgent.product.detectedCamino_;


/**
 * Whether the code is running on an iPhone or iPod touch.
 * @type {boolean}
 */
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_IPHONE :
    goog.userAgent.product.detectedIphone_;


/**
 * Whether the code is running on the default browser on an Android phone.
 * @type {boolean}
 */
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_ANDROID :
    goog.userAgent.product.detectedAndroid_;


/**
 * Whether the code is running on the Chrome web browser.
 * @type {boolean}
 */
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_CHROME :
    goog.userAgent.product.detectedChrome_;


/**
 * Whether the code is running on the Safari web browser.
 * @type {boolean}
 */
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_SAFARI :
    goog.userAgent.product.detectedSafari_;
