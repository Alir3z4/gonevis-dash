'use strict';

/**
 * @ngdoc overview
 * @name gonevisDash
 * @description
 * # gonevisDash
 *
 * Main module of the application.
 */
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('AuthenticationInterceptorService');

    $stateProvider
        .state('main', {
            url: '/',
            controller: 'MainController',
            templateUrl: 'main/main_view.html'
        });
    $urlRouterProvider.otherwise('/');
});