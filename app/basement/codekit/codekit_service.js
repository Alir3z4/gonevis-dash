"use strict";

/**
 * @class Codekit
 * @desc Codekit service is a basement filled with useful function and constant data,
 *       It stops repeating code such as functions, static variables, etc...
 *       Using this provider is highly recommended, even got a short name to be used quickly :P
 *
 * @param $timeout
 *
 * @returns [Factory]
 */
function Codekit($timeout) {

  /**
   * @method getIndex
   * @desc Get index of an item in a data
   *
   * @param master {Object} Master data to search in
   * @param search {Object} Item to find it's index in master object
   * @param key {String} Property to compare, default is "id"
   *
   * @returns {Number} Index of the item found in data via the given key
   */
  function getIndex(master, search, key) {
    key = key || "id";

    for (var i in master) {
      if (master[i][key] === search[key]) {
        return i;
      }
    }
    return -1;
  }

  /**
   * @name entryStatuses
   * @desc All statuses available for entries.
   *
   * @type {Array}
   */
  var entryStatuses = [{
    label: "Draft",
    id: 0,
    icon: "edit",
    color: "warning",
    title: "Set as draft (hidden)"
  }, {
    label: "Published",
    id: 1,
    icon: "globe",
    color: "success",
    title: "Set as Published"
  }];

  /**
   * @name teamRoles
   * @desc All roles for team.
   *
   * @type {Array}
   */
  var teamRoles = [
    { id: 0, color: "text-primary", label: "Owner" },
    { id: 1, color: "text-info", label: "Administrator" },
    { id: 2, color: "text-warning", label: "Editor" }
  ];

  /**
   * @name objectTypes
   * @desc API object types
   *
   * @type {Object}
   */
  var objectTypes = {
    comment: 1
  };

  /**
   * @method timeoutSlice
   * @desc Delete an item if has property isDeleted
   *
   * @param master {Object} Master data to search in
   * @param key {String} Deleted property
   */
  function timeoutSlice(master, key, delay) {
    $timeout(function () {
      key = key || "isDeleted";
      delay = delay || 1000;

      for (var i in master) {
        if (master[i][key] === true) {
          master.splice(i, 1);
        }
      }
    }, delay);
  }

  return {
    getIndex: getIndex,
    entryStatuses: entryStatuses,
    teamRoles: teamRoles,
    objectTypes: objectTypes,
    timeoutSlice: timeoutSlice
  };
};

app.factory("Codekit", Codekit);
Codekit.$inject = [
  "$timeout"
];
