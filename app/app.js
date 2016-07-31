'use strict';

/**
 * @ngdoc overview
 * @name gonevisDash
 * @description
 * # gonevisDash
 *
 * Main module of the application.
 */
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    $httpProvider.interceptors.push('AuthenticationInterceptorService');

    $stateProvider
        // Every child of dash state follows site id that user is into
        .state('dash', {
            url: '/:siteId',
            abstract: true,
            controller: 'DashController',
            template: '<ui-view/>'
        })
        .state('dash.main', {
            url: '/',
            controller: 'MainController',
            templateUrl: 'main/main_view.html'
        })
        .state('dash.entry-new', {
            url: '/new',
            controller: 'EntryNewController',
            templateUrl: 'entry_new/entry_new_view.html'
        })
        .state('dash.entry-list', {
            url: '/site',
            controller: 'EntryListController',
            templateUrl: 'entry_list/entry_list.html'
        })
        .state('dash.entry-edit', {
            url: '/site/:entryId',
            controller: 'EntryEditController',
            templateUrl: 'entry_edit/entry_edit_view.html'
        })
        .state('dash.user', {
            url: '/user',
            controller: 'UserController',
            templateUrl: 'user/user_view.html'
        })
        // Other states that are not a child of dash state
        .state('signin', {
            url: '/login',
            controller: 'SigninController',
            templateUrl: 'signin/signin_view.html'
        })
        .state('signup', {
            url: '/register',
            controller: 'SignupController',
            templateUrl: 'signup/signup_view.html'
        });
    $urlRouterProvider.otherwise('/');
});

app.run(function (editableOptions) {
    editableOptions.theme = 'bs3';
});
