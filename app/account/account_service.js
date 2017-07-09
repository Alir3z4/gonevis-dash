"use strict";

/**
 * @desc Class for any user account to get better data easily.
 *       Instantiate this class via backend data of any user.
 */
function Account() {
  return function (data) {
    /**
     * @private
     */
    var self = this;

    /**
     * @desc Backend data
     * @type {object}
     */
    this.get = data;

    /**
     * @desc Get first part of full name if name is available
     * @type {function}
     * @returns {string|boolean}
     */
    this.getFirstName = function () {
      // Check name
      if (self.get.name) {
        // Get first part of name
        var firstName = self.get.name.split(" ")[0];
        if (firstName) {
          return firstName;
        }
      }
      // Name is not set
      return false;
    };
    this.getFullName = function () {
      // Full name
      if (self.get.name) {
        return self.get.name;
      }
      // Username
      return self.get.username;
    };
  };
}

app.service("Account", Account);
