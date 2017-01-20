

//import {IStateProvider} from "angular-ui-router";
/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
namespace todos
{

    angular.module('todomvc', ['ui.router', 'ngResource'])
        .config(['$stateProvider', '$urlRouterProvider', 'todoStorageProvider', function ( $stateProvider: any, 
              $urlRouterProvider: any, todoStorageProvider: TodoStorageProvider) {
            'use strict';

            todoStorageProvider.setType('local');



            /*one state with parameters */
            $stateProvider.state('status', {
                url: '/:status'
            });

            /*  two states without parameters
            $stateProvider.state('status1', {
                url: '/completed'
            });
            $stateProvider.state('status2', {
                url: '/active'
            });
            */


            $urlRouterProvider.otherwise('/all');

        }])
        .run(['todoStorage', function (store: IStore){
            store.get();
        }]);
    angular.element(document).ready(function () {

        var initInjector: ng.auto.IInjectorService = angular.injector(['ng']);
        var $http: ng.IHttpService = <ng.IHttpService>initInjector.get('$http');

        // Kae: Read template file before bootstrap NG
        $http.get('templates.html').then(function (response: any) {
            document.body.innerHTML += response.data;

            // and then finally bootstrap it:
            angular.bootstrap(document, ['todomvc']);
        }).catch(function () {

        });
    });

}
