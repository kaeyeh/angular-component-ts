var todos;
(function (todos_1) {
    'use strict';
    var ApiStore = (function () {
        function ApiStore($resource) {
            this.$resource = $resource;
            this.todos = [];
            this.api = this.$resource('/api/todos/:id', null, {
                update: { method: 'PUT' }
            });
        }
        ApiStore.prototype.clearCompleted = function () {
            var originalTodos = this.todos.slice(0);
            var incompleteTodos = this.todos.filter(function (todo) {
                return !todo.completed;
            });
            angular.copy(incompleteTodos, this.todos);
            return this.api.delete(function () {
            }, function error() {
                angular.copy(originalTodos, this.todos);
            });
        };
        ApiStore.prototype.delete = function (todo) {
            var originalTodos = this.todos.slice(0);
            this.todos.splice(this.todos.indexOf(todo), 1);
            return this.api.delete({ id: todo.id }, function () {
            }, function error() {
                angular.copy(originalTodos, this.todos);
            });
        };
        ApiStore.prototype.get = function () {
            return this.api.query(function (resp) {
                angular.copy(resp, this.todos);
            });
        };
        ApiStore.prototype.insert = function (todo) {
            var originalTodos = this.todos.slice(0);
            return this.api.save(todo, function success(resp) {
                todo.id = resp.id;
                this.todos.push(todo);
            }, function error() {
                angular.copy(originalTodos, this.todos);
            })
                .$promise;
        };
        ApiStore.prototype.put = function (todo) {
            return this.api.update({ id: todo.id }, todo)
                .$promise;
        };
        return ApiStore;
    }());
    ApiStore.$inject = ['$resource'];
    angular.module('todomvc').service('api', ApiStore);
    var LocalStore = (function () {
        function LocalStore($q) {
            this.$q = $q;
            this.STORAGE_ID = 'todos-angularjs';
            this.todos = [];
        }
        LocalStore.prototype._getFromLocalStorage = function () {
            return JSON.parse(localStorage.getItem(this.STORAGE_ID) || '[]');
        };
        LocalStore.prototype._saveToLocalStorage = function (todos) {
            localStorage.setItem(this.STORAGE_ID, JSON.stringify(todos));
        };
        LocalStore.prototype.clearCompleted = function () {
            var deferred = this.$q.defer();
            var incompleteTodos = this.todos.filter(function (todo) {
                return !todo.completed;
            });
            angular.copy(incompleteTodos, this.todos);
            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);
            return deferred.promise;
        };
        LocalStore.prototype.delete = function (todo) {
            var deferred = this.$q.defer();
            this.todos.splice(this.todos.indexOf(todo), 1);
            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);
            return deferred.promise;
        };
        LocalStore.prototype.get = function () {
            var deferred = this.$q.defer();
            angular.copy(this._getFromLocalStorage(), this.todos);
            deferred.resolve(this.todos);
            return deferred.promise;
        };
        LocalStore.prototype.insert = function (todo) {
            var deferred = this.$q.defer();
            this.todos.push(todo);
            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);
            return deferred.promise;
        };
        LocalStore.prototype.put = function (todo, index) {
            var deferred = this.$q.defer();
            this.todos[index] = todo;
            this._saveToLocalStorage(this.todos);
            deferred.resolve(this.todos);
            return deferred.promise;
        };
        return LocalStore;
    }());
    LocalStore.$inject = ['$q'];
    angular.module('todomvc').service('localStorage', LocalStore);
    var TodoStorageProvider = (function () {
        function TodoStorageProvider() {
            this.type = 'local';
        }
        TodoStorageProvider.prototype.setType = function (type) {
            this.type = type;
        };
        // Detect if an API backend is present. If so, return the API module, else
        // hand off the localStorage adapter
        TodoStorageProvider.prototype.$get = function ($injector) {
            if (this.type === 'api') {
                return $injector.get('api');
            }
            else {
                return $injector.get('localStorage');
            }
        };
        TodoStorageProvider.factory = function () {
            return new TodoStorageProvider();
        };
        return TodoStorageProvider;
    }());
    todos_1.TodoStorageProvider = TodoStorageProvider;
    /**
     * Services that persists and retrieves todos from localStorage or a backend API
     * if available.
     *
     * They both follow the same API, returning promises for all changes to the
     * model.
     */
    angular.module('todomvc').provider('todoStorage', TodoStorageProvider.factory);
})(todos || (todos = {}));
