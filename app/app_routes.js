"use strict";

/**
 * @desc Every child of dash state follows site id that user is into
 */
app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state("dash", {
      url: "/:s",
      abstract: true,
      controller: "DashController",
      template: "<ui-view/>"
    })
    .state("dash.main", {
      url: "/",
      controller: "MainController",
      templateUrl: "main/main_view.html"
    })
    .state("dash.navigation", {
      url: "/navigation",
      controller: "NavigationController",
      templateUrl: "navigation/navigation_view.html"
    })
    .state("dash.dolphin", {
      url: "/dolphin",
      controller: "DolphinController",
      templateUrl: "dolphin/dolphin_view.html"
    })
    .state("dash.comment-list", {
      url: "/comments",
      controller: "CommentController",
      templateUrl: "comment/comment_view.html"
    })
    .state("dash.entry-new", {
      url: "/new",
      controller: "EntryNewController",
      templateUrl: "entry/entry_new/entry_new_view.html"
    })
    .state("dash.entry-list", {
      url: "/entries",
      controller: "EntryListController",
      templateUrl: "entry/entry_list/entry_list_view.html"
    })
    .state("dash.entry-edit", {
      url: "/entry/:entryId",
      controller: "EntryEditController",
      templateUrl: "entry/entry_edit/entry_edit_view.html"
    })
    .state("dash.site-settings", {
      url: "/site-settings",
      controller: "SiteSettingsController",
      templateUrl: "site/site_settings/site_settings_view.html"
    })
    .state("dash.tag-edit", {
      url: "/tag-list/:tagId",
      controller: "TagEditController",
      templateUrl: "tag/tag_edit/tag_edit_view.html"
    })
    .state("dash.tag-list", {
      url: "/tags",
      controller: "TagController",
      templateUrl: "tag/tag_view.html"
    })
    .state("dash.tag-new", {
      url: "/tag-new",
      controller: "TagNewController",
      templateUrl: "tag/tag_new/tag_new_view.html"
    })
    .state("dash.user", {
      url: "/user",
      controller: "UserController",
      templateUrl: "account/user/user_view.html"
    })
    .state("dash.change-password", {
      url: "/change-password",
      controller: "ChangePasswordController",
      templateUrl: "account/change_password/change_password_view.html"
    })
    // Other states that are not a child of dash state
    .state("signin", {
      url: "/login",
      controller: "SigninController",
      templateUrl: "account/signin/signin_view.html"
    })
    .state("signup", {
      url: "/register",
      controller: "SignupController",
      templateUrl: "account/signup/signup_view.html"
    })
    .state("site-new", {
      url: "/new-site",
      controller: "SiteNewController",
      templateUrl: "site/site_new/site_new_view.html"
    });

  $urlRouterProvider.otherwise("/");
})
