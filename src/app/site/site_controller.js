"use strict";

import app from "../app";

function SiteController($scope, $rootScope, $state, $stateParams, $window, toaster,
                        API, ModalsService, AuthService, DolphinService, Codekit, $translate, $timeout) {

  var site = AuthService.getCurrentSite();
  let currentView;

  /**
   * @desc Set current tab's form data.
   *
   * @param {object} currentTab
   */
  function setCurrentTabFormData(currentTab) {
    angular.forEach(currentTab.form, (value, key) => {
      currentTab.form[key] = $scope.site[key];
    })
  }

  /**
   * @desc Get site settings.
   */
  function getSiteSettings() {
    API.SiteSettings.get({ siteId: site }, function(data) {
      $scope.site = data;
      Codekit.setTitle($scope.site.title);
      $scope.initialled = true;

      setCurrentTabFormData($scope.currentTab);
    });
  }

  function constructor() {
    $scope.codekit = Codekit;
    currentView = $stateParams.view ? $stateParams.view : "settings";

    // Check permission
    if ($rootScope.isRestrict) {
      return false;
    }
    $scope.user = AuthService.getAuthenticatedUser(false);
    $scope.site = $scope.user.sites[$stateParams.s];
    $scope.dolphinService = DolphinService;
    $scope.postPerPage = new Array(25);
    $scope.maxCustomDomains = 5;
    $scope.hideDelete = true; // Should remove this later

    API.Eskenas.get({},
      function (data) {
        $scope.plans = data.results;
      });

    // Get site settings
    getSiteSettings();

    // Get site template config
    API.SiteTemplateConfig.get({ siteId: site }, function(data) {
      $scope.siteTemplate = data.template_config;
      $scope.siteTemplate.hasFields = !Codekit.isEmptyObj($scope.siteTemplate.fields);
    });

    $translate(["SETTINGS", "APPEARANCE", "ADVANCED", "UPGRADE"]).then(function (translations) {
      // List of tabs
      $scope.tabs = [{
        view: "settings",
        label: translations.SETTINGS,
        form: {
          title: "",
          description: ""
        }
      }, {
        view: "appearance",
        label: translations.APPEARANCE,
        form: {
          font_name: "",
          font_url: ""
        }
      }, {
        view: "advanced",
        label: translations.ADVANCED,
        form: {
          meta_description: "",
          paginate_by: "",
          commenting: false,
          voting: false,
          search_engine_visibility: false,
          remove_branding: false,
          footer_text: "",
          google_analytics_enabled: false,
          google_analytics_code: ""
        }
      }, {
        view: "upgrade",
        label: translations.UPGRADE,
        form: {
          meta_description: "",
          paginate_by: "",
          commenting: false,
          voting: false,
          search_engine_visibility: false,
          remove_branding: false,
          footer_text: "",
          google_analytics_enabled: false,
          google_analytics_code: ""
        }
      }];

      // Set current tab
      angular.forEach($scope.tabs, (tab, index) => {
        if (tab.view === currentView) {
          $scope.setCurrentTab($scope.tabs[index]);
        }
      });
    });

    // Get current subscription
    API.Subscription.get({ siteId: site },
      data => {
        if (data.subscription) {
          $scope.currentPlan = data.subscription.plan.id;
        }
      })
  }

  /**
   * @desc Set current tab
   *
   * @param {object} tab
   */
  $scope.setCurrentTab = function(tab) {
    // Check current tab
    if ($scope.currentTab === tab) {
      return;
    }

    if ($scope.initialled) {
      setCurrentTabFormData(tab);
    }

    // Change URL
    $state.go('dash.site.settings', { view: tab.view });

    // Set current tab
    $scope.currentTab = tab;
    currentView = tab.view;

    $timeout(() => {
      let activeTab = angular.element("li.current");
      console.log()
      // console.log(w1)
      angular.element("span.indicator").css({
        "left": activeTab[0].offsetLeft,
        "width": activeTab.width()
      });
    })
  };

  /**
   * @desc Payment
   *
   * @param {object} plan
   */
  $scope.pay = function (plan) {
    if (plan.id === $scope.currentPlan) {
      return;
    }
    let payments = new cp.CloudPayments({ language: "en-US" });
    payments.charge({ // options
        publicId: 'pk_b2b11892e0e39d3d22a3f303e2690',
        description: plan.description,
        amount: Number(plan.price),
        currency: 'USD',
        invoiceId: '1234567',
        accountId: $scope.user.email,
        data: {
          plan_id: plan.id,
          site_id: site,
          user_id: $scope.user.id
        }
      },
      function (options) { // success
        // Show toaster
        $('#checkout-result').text('Payment was successful');
      },
      function (reason, options) { // fail
        $('#checkout-result').text('Payment failed');
      });
  };

  /**
   * @desc update site via api call
   *
   * @param {string} key
   * @param {string} value
   */
  $scope.updateSite = function(media, value) {
    let payload = {};

    // Check for changed properties
    if (!media) {
      angular.forEach($scope.currentTab.form, (value, key) => {
        if (!angular.equals($scope.site[key], $scope.currentTab.form[key])) {
          payload[key] = value;
        }
      })
    } else {
      payload[media] = value;
    }

    // Show toaster
    $translate('UPDATING_BLOG').then(function (updatingBlog) {
      toaster.info(updatingBlog);
    });

    API.SiteUpdate.put({ siteId: site }, payload,
      function(data) {
        if (!media) {
          angular.forEach(payload, (value, key) => {
            $scope.site[key] = data[key];
            $scope.user.sites[$stateParams.s][key] = data[key];
          })
        } else {
          if (media === "cover_image" || media === "logo") {
            $scope.site.media[media] = data.media[media];
            $scope.user.sites[$stateParams.s].media[media] = data.media[media];
          }
        }

        AuthService.setAuthenticatedUser($scope.user);

        $rootScope.$broadcast("gonevisDash.SiteController:update");

        // Clear all toasters
        toaster.clear();
        // Show toaster
        $translate(["DONE", "BLOG_UPDATED"]).then(function(translations) {
          toaster.info(translations.DONE, translations.BLOG_UPDATED);
        });
      },
      function() {
        $translate(["ERROR", "BLOG_UPDATE_ERROR"]).then(function(translations) {
          toaster.error(translations.ERROR, translations.BLOG_UPDATE_ERROR);
        });
      }
    );
  };

  /**
   * @desc Delete site via API call
   */
  $scope.deleteSite = function() {
    // How sure? Like confirm-a-confirm sure?
    const text = $translate.instant("DELETE_BLOG_PROMPT");
    if ($window.prompt(text) !== $scope.site.title) {
      return;
    }

    API.Site.delete({ siteId: site },
      function() {
        // Remove site from user object
        $scope.user.sites.splice($stateParams.s, 1);
        // Update local user object
        AuthService.setAuthenticatedUser($scope.user);
        // Announce site removal
        $rootScope.$broadcast("gonevisDash.SiteController:remove");
        $translate(["DONE", "BLOG_DELETED"]).then(function(translations) {
          toaster.success(translations.DONE, translations.BLOG_DELETED);
        });
        // Go to main or new site page if has no other sites
        $state.go($scope.user.sites.length > 0 ? "dash.main" : "site-new");
      },
      function() {
        $translate(["ERROR", "BLOG_DELETE_ERROR"]).then(function(translations) {
          toaster.error(translations.ERROR, translations.BLOG_DELETE_ERROR);
        });
      }
    );
  };

  /**
   * @desc Select image for logo/cover
   *
   * @param {string} image Image property of site (logo, cover, etc)
   */
  $scope.selectImage = function(image) {
    $scope.editing = image;
    $scope.dolphinService.viewSelection("siteImage");
  };

  /**
   * @desc Save template config
   */
  $scope.saveConfig = function() {
    $scope.loadingTemplate = true;

    API.SetSiteTemplateConfig.put({
        siteId: site
      }, {
        config_fields: $scope.siteTemplate.fields
      },
      function() {
        $scope.loadingTemplate = false;
        $translate(["DONE", "BLOG_TEMPLATE_UPDATED"]).then(function(translations) {
          toaster.info(translations.DONE, translations.BLOG_TEMPLATE_UPDATED);
        });
      },
      function(data) {
        $scope.loadingTemplate = false;
        $translate(["ERROR", "BLOG_TEMPLATE_UPDATE_ERROR"]).then(function(translations) {
          toaster.error(translations.ERROR, data.detail ? data.detail : translations.BLOG_TEMPLATE_UPDATE_ERROR);
        });
      }
    );
  };

  /**
   * @desc Open modal
   */
  $scope.siteTemplates = function() {
    ModalsService.open("siteTemplates", "SiteTemplatesModalController", {
      site: $scope.site,
      currentTemplate: $scope.siteTemplate
    });
  };

  /**
   * @desc Open themes modal
   */
  $scope.siteTemplates = function() {
    ModalsService.open("siteTemplates", "SiteTemplatesModalController", {
      site: $scope.site,
      currentTemplate: $scope.siteTemplate
    });
  };

  /**
   * @desc Add/set new custom domain for the site (instead of the current sub domain)
   */
  $scope.addDomain = function() {
    // Domain url
    const domain = $window.prompt($translate.instant("ENTER_DOMAIN_ADDRESS"));

    // Check if cancelled
    if (domain === null) {
      return;
    }

    API.SetCustomDomain.put({ siteId: site }, { domain: domain },
      function() {
        $translate(["CUSTOM_DOMAIN_SET", "SUPPLY_URL_TO_DNS"], {"absolute_uri": $scope.site.absolute_uri}).then(
          function (translations) {
            toaster.success(translations.CUSTOM_DOMAIN_SET, translations.SUPPLY_URL_TO_DNS);
        });
        getSiteSettings();
      },
      function() {
        $translate(["ERROR", "DOMAIN_TAKEN_INVALID"]).then(function(translations) {
          toaster.error(translations.ERROR, translations.DOMAIN_TAKEN_INVALID);
        });
      }
    );
  };

  /**
   * @desc Delete a custom domain
   *
   * @param {string} domain
   */
  $scope.deleteDomain = function(domain) {
    // How sure? Like confirm-a-confirm sure?
    if (!$window.confirm($translate.instant('CUSTOM_DOMAIN_DELETE_PROMPT', {domain: domain.domain}))) {
      return;
    }

    API.RemoveCustomDomain.put({ siteId: site }, { domain_id: domain.id }, function() {
      $translate(["DONE", "DELETED_CUSTOM_DOMAIN"], {domain: domain.domain}).then(function(translations) {
        toaster.success(translations.DONE, translations.DELETED_CUSTOM_DOMAIN);
      });
      getSiteSettings();
    });
  };

  /**
   * @desc Image selection callback
   *
   * @param {Event} event
   * @param {Dolphin} dolphin
   * @param {string} source
   */
  $scope.$on("gonevisDash.Dolphin:select", function(data, dolphin, source) {
    if (source === "siteImage") {
      $scope.site.media[$scope.editing] = dolphin ? dolphin.get.id : null;
      $scope.updateSite($scope.editing, dolphin ? dolphin.get.id : null);
    }
  });

  /**
   * @desc Set template callback
   *
   * @param {Event} event
   * @param {object} data
   */
  $scope.$on("gonevisDash.SiteTemplatesModalController:setTemplate", function(event, data) {
    $scope.loadingTemplate = true;

    API.SiteSetTemplate.put({
        siteId: site
      }, {
        site_template_id: data.template.id
      },
      function() {
        $scope.loadingTemplate = false;
        $scope.siteTemplate = data.template.config;
        $scope.siteTemplate.hasFields = !Codekit.isEmptyObj(
          $scope.siteTemplate.fields
        );

        $translate(["DONE", "BLOG_TEMPLATE_UPDATED"]).then(function(translations) {
          toaster.info(translations.DONE, translations.BLOG_TEMPLATE_UPDATED);
        });
      },
      function() {
        $translate(["ERROR", "BLOG_TEMPLATE_UPDATE_ERROR"]).then(function(translations) {
          toaster.error(translations.ERROR, translations.BLOG_TEMPLATE_UPDATE_ERROR);
        });
      }
    );
  });

  constructor();
}

app.controller("SiteController", SiteController);
