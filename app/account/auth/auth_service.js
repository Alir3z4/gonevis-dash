/*global angular*/
'use strict';

/**
 * Auth Service
 *
 * @class AuthService
 * @namespace gonevisDash.AuthService
 *
 * @param $rootScope
 * @param $http
 * @param $window
 * @param $stateParams
 * @param ENV
 *
 * @returns [Factory]
 */
function AuthService($rootScope, $http, $window, $stateParams, ENV) {
  /**
   * Return the currently authenticated user
   *
   * @method getAuthenticatedUser
   * @returns {object|undefined} Account if authenticated, else `undefined`
   * @memberOf gonevisDash.AuthService
   */
  function getAuthenticatedUser() {
    if ($window.localStorage.getItem('authenticatedUser')) {
      return JSON.parse($window.localStorage.getItem('authenticatedUser'));
    }
  }

  /**
   * parseJwt
   * Parse JWT from token
   *
   * @method parseJwt
   * @param {String }token
   * @memberOf gonevisDash.AuthService
   * @returns {Object} Parsed json
   */
  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');

    return JSON.parse($window.atob(base64));
  }

  /**
   * setToken
   * Set token to localStorage
   *
   * @method setToken
   * @param {String } token
   * @memberOf gonevisDash.AuthService
   * @returns {NaN}
   */
  function setToken(token) {
    $window.localStorage['jwtToken'] = token;
  }

  /**
   * getToken
   * Return token from localStorage
   *
   * @method getToken
   * @memberOf gonevisDash.AuthService
   * @returns {undefined|String|Object}
   */
  function getToken() {
    return $window.localStorage['jwtToken'];
  }

  /**
   * Check if the current user is authenticated
   *
   * @method isAuthenticated
   * @returns {boolean} True is user is authenticated, else false.
   * @memberOf gonevisDash.AuthService
   */
  function isAuthenticated() {
    //return !!$cookies.authenticatedUser;
    var token = getToken();
    var isValid;

    if (token) {
      var params = parseJwt(token);

      isValid = Math.round(new Date().getTime() / 1000) <= params.exp;
    } else {
      isValid = false;
    }

    if (!isValid) {
      unAuthenticate();
    }

    return isValid;
  }

  /**
   * Try to log in with email `email` and password `password`
   *
   * @method login
   * @param {String} email The email entered by the user
   * @param {String} password The password entered by the user
   * @returns {Promise}
   * @memberOf gonevisDash.AuthService
   */
  function login(username, password) {
    return $http.post(ENV.apiEndpoint + 'account/login/', {
      username: username,
      password: password
    });
  }

  /**
   * Try to log the user out
   *
   * @method logout
   * @returns {Promise}
   * @memberOf gonevisDash.AuthService
   */
  function logout() {
    unAuthenticate();
    $rootScope.$broadcast('gonevisDash.AuthService:SignedOut');
  }

  /**
   * Try to register a new user
   *
   * @method register
   * @param {String} username The username entered by the user
   * @returns {Promise}
   * @memberOf gonevisDash.AuthService
   */
  function register(email, username, password) {
    return $http.post(ENV.apiEndpoint + 'account/register/', {
      email: email,
      username: username,
      password: password,
    });
  }

  /**
   * Stringify the account object and store it in a cookie
   *
   * @method setAuthenticatedUser
   * @param {Object} authenticatedUser The account object to be stored
   * @returns {undefined}
   * @memberOf gonevisDash.AuthService
   */
  function setAuthenticatedUser(authenticatedUser) {
    $window.localStorage['authenticatedUser'] = JSON.stringify(authenticatedUser);
  }

  /**
   * Delete the cookie where the account object is stored
   *
   * @method unAuthenticate
   * @returns {undefined}
   * @memberOf gonevisDash.AuthService
   */
  function unAuthenticate() {
    $window.localStorage.removeItem('jwtToken');
    $window.localStorage.removeItem('authenticatedUser');
  }

  function updateAuth(updatedUser) {
    $window.localStorage['authenticatedUser'] = JSON.stringify(updatedUser);
  }

  /**
   * @method getCurrentSite
   * @desc Return the ID of the current sites
   *
   * returns {string} Site id (uuid)
   */
  function getCurrentSite() {
    return getAuthenticatedUser().sites[$stateParams.s].id;
  }

  /**
   * @name AuthService
   * @desc The Factory to be returned
   */
  return {
    parseJwt: parseJwt,
    setToken: setToken,
    getToken: getToken,
    getAuthenticatedUser: getAuthenticatedUser,
    isAuthenticated: isAuthenticated,
    login: login,
    logout: logout,
    register: register,
    setAuthenticatedUser: setAuthenticatedUser,
    unAuthenticate: unAuthenticate,
    updateAuth: updateAuth,
    getCurrentSite: getCurrentSite
  };
}

app.factory('AuthService', AuthService);
AuthService.$inject = ['$rootScope', '$http', '$window', '$stateParams', 'ENV'];