"use strict";

import app from "../../app";

/**
 * @name PreviewModalController
 *
 * @description
 *
 * ## Purpose
 * It's purpose is to show a preview of a post/page by the given URL.
 *
 * ## Abilities
 * This controller can show the preview in three diffrent screen sizes:
 * - Desktop (large)
 * - Tablet (medium)
 * - Mobile (small)
 *
 * @param {string} URL link of post/page on GoNevis.
 */
function PreviewModalController($scope, URL, $sce) {

  function constructor() {
    $scope.url = $sce.trustAsResourceUrl(URL);
    $scope.currentClass = "modal-lg";

    /**
     * @desc Preview modes
     * @type {array}
     */
    $scope.modes = [{
      icon: "desktop",
      class: "modal-lg"
    }, {
      icon: "tablet",
      class: "modal-md"
    }, {
      icon: "mobile",
      class: "modal-sm"
    }];
  }

  /**
   * @desc Change preview mode
   *
   * @param {string} previewClass
   */
  $scope.changeMode = (previewClass) => {
    $scope.currentClass = previewClass;
  };

  constructor();
}

app.controller("PreviewModalController", PreviewModalController);
