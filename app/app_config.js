"use strict";

/**
 * @class Config
 *
 * @param $httpProvider
 * @param $resourceProvider
 * @param $cookiesProvider
 * @param cfpLoadingBarProvider
 */
function Config($httpProvider, $resourceProvider, $cookiesProvider, cfpLoadingBarProvider) {
  // Http
  $httpProvider.interceptors.push("AuthInterceptorService");

  // Resource
  $resourceProvider.defaults.stripTrailingSlashes = false;

  // Cookies
  $cookiesProvider.defaults.domain = location.hostname.split(location.hostname.split(".")[0]).join("");

  // CFP loading bar
  cfpLoadingBarProvider.includeSpinner = false;
}

app.config(Config);
Config.$inject = [
  "$httpProvider",
  "$resourceProvider",
  "$cookiesProvider",
  "cfpLoadingBarProvider"
];
