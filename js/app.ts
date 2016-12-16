

//import {IStateProvider} from "angular-ui-router";
/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
namespace todos
{

    angular.module('todomvc', ['ui.router', 'ngResource'])
        .config(['$stateProvider', 'todoStorageProvider', function ( $stateProvider: any, todoStorageProvider: TodoStorageProvider) {
            'use strict';

            todoStorageProvider.setType('local');
            let root = {
                url: ''
            };
            let status = {
                url: '/:status',
                parent: 'root'
            };

            $stateProvider.state('root', root);
            $stateProvider.state('status', status);
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
