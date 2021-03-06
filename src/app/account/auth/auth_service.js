"use strict";

import app from "../../app";
import Raven from "raven-js";
import UserSiteRole from "../user/user_site_role";

function AuthService($state, $rootScope, $cookies, $window, $stateParams, API, Account) {

  /**
   * @private
   */
  var self = this;

  /**
   * @const
   */
  const userSiteRole = new UserSiteRole();

  /**
   * @desc Return the currently authenticated user
   *
   * @param {boolean} useInstance Return account instance or raw user data
   *
   * @returns {Account|boolean}
   */
  this.getAuthenticatedUser = function(useInstance) {
    if (!this.isAuthenticated()) {
      return false;
    }

    useInstance = useInstance || false;
    var userData = JSON.parse($cookies.get("user"));

    if (useInstance) {
      return new Account(userData);
    }

    return userData;
  };

  /**
   * @desc Parse JWT from token
   *
   * @param {string} token
   *
   * @returns {object}
   */
  this.parseJwt = function(token) {
    var base64Url = token.split(".")[1];

    if (typeof base64Url === "undefined") {
      $rootScope.$broadcast("gonevisDash.AuthService:SignedOut", true);
      return false;
    }

    var base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse($window.atob(base64));
  };

  /**
   * @desc Store authentiaction token
   *       Note: should be called before this.setAuthenticatedUser()
   *
   * @param {string} token
   */
  this.setToken = function(token) {
    $cookies.put("JWT", token, self.getTokenOption(token));
  };

  /**
   * @desc Return authentiaction token
   *
   * @returns {string}
   */
  this.getToken = function() {
    return $cookies.get("JWT");
  };

  /**
   * @desc Set/update authenticated user data
   *       Note: should be called after this.setToken()
   *
   * @param {object} userData
   * @param {boolean} separateSites Set user data without effecting sites
   */
  this.setAuthenticatedUser = function(userData, separateSites) {
    // Sanitize tour object
    if (!userData.tour) {
      userData.tour = {
        files: true,
        settings: true,
        user: true,
        main: true
      };
    }
    // Separated sites
    if (separateSites) {
      userData.sites = self.getAuthenticatedUser(true).getSites();
    }
    // Store authentication
    $cookies.put("user", JSON.stringify(userData), self.getTokenOption(self.getToken()));
    // Update tracking info
    self.setTrackingInfo();
    // Return account instance
    return self.getAuthenticatedUser(true);
  };

  /**
   * @desc Delete all stored authentiaction data
   */
  this.unAuthenticate = function() {
    $cookies.remove("JWT");
    $cookies.remove("user");
    $cookies.remove("sessionid"); // Set by django admin
    // Remove tracking info
    self.setTrackingInfo(true);
  };

  /**
   * @desc Check if the current user is authenticated
   * @returns {boolean}
   */
  this.isAuthenticated = function() {
    if (!$cookies.get("user")) {
      self.unAuthenticate();
      return false;
    }

    var token = self.getToken();
    var isValid;

    if (token) {
      isValid = Math.round(new Date().getTime() / 1000) <= self.parseJwt(token).exp;
    } else {
      isValid = false;
    }

    if (!isValid) {
      self.unAuthenticate();
    }

    return isValid;
  };

  /**
   * @desc Get token's expiration data.
   *
   * @param {string} token
   * @return {object}
   */
  this.getTokenOption = token => {
    let tokenObject = self.parseJwt(token);
    let options = null;
    // Set token expiration
    if (tokenObject) {
      options = {
        expires: new Date(tokenObject.exp * 1000)
      };
    }
    return options;
  };

  /**
   * @desc Main sign in function
   *
   * @param {string} username
   * @param {object|boolean} password
   * @param {function} success
   * @param {function} fail
   */
  this.signIn = function(username, password, success, fail) {
    API.Signin.post({
        username: username,
        password: password
      },
      function(data) {
        self.setToken(data.token);
        self.setAuthenticatedUser(data.user);
        $rootScope.$broadcast("gonevisDash.AuthService:Authenticated");
        success(data);
      },
      function(data) {
        fail(data);
      }
    );
  };

  /**
   * @desc Clear credentials (sign user out)
   */
  this.signOut = function() {
    self.unAuthenticate();
    $rootScope.$broadcast("gonevisDash.AuthService:SignedOut");
  };

  /**
   * @desc Check and return the ID of the current site
   *
   * @returns {string} Site UUID
   */
  this.getCurrentSite = function() {
    var sites = self.getAuthenticatedUser().sites;
    var siteIndex = $stateParams.s || 0;
    $rootScope.isRestrict = userSiteRole.restrict(sites[siteIndex]);

    return sites[siteIndex] ? sites[siteIndex].id : false;
  };

  /**
   * @desc Update person tracking info
   *
   * @param {boolean} remove Skip and remove
   */
  this.setTrackingInfo = function(remove) {
    if (!Raven.isSetup()) {
      return;
    }

    var person = {};

    if (!remove && self.isAuthenticated()) {
      var user = self.getAuthenticatedUser(true);
      person = {
        name: user.getFullName(),
        username: user.get.username,
        id: user.get.id,
        email: user.get.email,
        link: user.get.get_absolute_uri
      };
    }

    Raven.setUserContext(person);
  };

  /**
   * @desc Check if tour is done
   *
   * @param {string} tour
   *
   * @returns {boolean}
   */
  this.getTourStatus = function(tour) {
    return self.getAuthenticatedUser().tour[tour] === true;
  };

  /**
   * @desc Update status of tour and save
   *
   * @param {string} tour
   * @param {boolean} status
   */
  this.setTourStatus = function(tour, status) {
    // Get user and update tour status
    var user = self.getAuthenticatedUser();
    user.tour[tour] = status;
    // Update from backend
    API.UserUpdate.put({
      tour: user.tour
    }, function(data) {
      // Get user data
      user = data;
    });
    // Update local storage
    self.setAuthenticatedUser(user, true);
  };
}

app.service("AuthService", AuthService);
