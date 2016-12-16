namespace todos {
    'use strict';


    class ApiStore {
        private todos: any[] = [];

        private api = this.$resource('/api/todos/:id', null,
            {
                update: {method: 'PUT'}
            }
        );

        static $inject = ['$resource'];

        constructor(private $resource: any) {

        }

        clearCompleted() {
            var originalTodos = this.todos.slice(0);

            var incompleteTodos = this.todos.filter(function (todo) {
                return !todo.completed;
            });

            angular.copy(incompleteTodos, this.todos);

            return this.api.delete(function () {
            }, function error() {
                angular.copy(originalTodos, this.todos);
            });
        }

        delete(todo: any) {
            var originalTodos = this.todos.slice(0);

            this.todos.splice(this.todos.indexOf(todo), 1);
            return this.api.delete({id: todo.id},
                function () {
                }, function error() {
                    angular.copy(originalTodos, this.todos);
                });
        }

        get() {
            return this.api.query(function (resp: any) {
                angular.copy(resp, this.todos);
            });
        }

        insert(todo: any) {
            var originalTodos = this.todos.slice(0);

            return this.api.save(todo,
                function success(resp: any) {
                    todo.id = resp.id;
                    this.todos.push(todo);
                }, function error() {
                    angular.copy(originalTodos, this.todos);
                })
                .$promise;
        }

        put(todo: any) {
            return this.api.update({id: todo.id}, todo)
                .$promise;
        }

    }
    angular.module('todomvc').service('api', ApiStore);

    class LocalStore {

        private STORAGE_ID = 'todos-angularjs';
        private todos: any[] = [];

        static $inject = ['$q'];

        constructor(private $q: any) {

        }

        _getFromLocalStorage() {
            return JSON.parse(localStorage.getItem(this.STORAGE_ID) || '[]');
        }

        _saveToLocalStorage(todos: any) {
            localStorage.setItem(this.STORAGE_ID, JSON.stringify(todos));
        }

        clearCompleted() {
            var deferred = this.$q.defer();

            var incompleteTodos = this.todos.filter(function (todo: any) {
                return !todo.completed;
            });

            angular.copy(incompleteTodos, this.todos);

            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);

            return deferred.promise;
        }

        delete(todo: any) {
            var deferred = this.$q.defer();

            this.todos.splice(this.todos.indexOf(todo), 1);

            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);

            return deferred.promise;
        }

        get() {
            var deferred = this.$q.defer();

            angular.copy(this._getFromLocalStorage(), this.todos);
            deferred.resolve(this.todos);

            return deferred.promise;
        }

        insert(todo: any) {
            var deferred = this.$q.defer();

            this.todos.push(todo);

            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);

            return deferred.promise;
        }

        put(todo: any, index: number) {
            var deferred = this.$q.defer();

            this.todos[index] = todo;

            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);

            return deferred.promise;
        }
    }
    angular.module('todomvc').service('localStorage', LocalStore);


    /**
     * Services that persists and retrieves todos from localStorage or a backend API
     * if available.
     *
     * They both follow the same API, returning promises for all changes to the
     * model.
     */

    angular.module('todomvc')
        .provider('todoStorage', function ( ) {

            return {
                type: 'local',
                setType: function (type: string) {
                    this.type = type
                },
                // Detect if an API backend is present. If so, return the API module, else
                // hand off the localStorage adapter
                $get: function ($injector: any) {

                    if (this.type === 'api') {
                        return $injector.get('api');
                    }
                    else {
                        return $injector.get('localStorage');
                    }
                }
            }
        });
}