var todos;
(function (todos) {
    angular.module('todomvc', ['ui.router', 'ngResource'])
        .config(['$stateProvider', 'todoStorageProvider', function ($stateProvider, todoStorageProvider) {
            'use strict';
            todoStorageProvider.setType('local');
            var root = {
                url: ''
            };
            var status = {
                url: '/:status',
                parent: 'root'
            };
            $stateProvider.state('root', root);
            $stateProvider.state('status', status);
        }])
        .run(['todoStorage', function (store) {
            store.get();
        }]);
    angular.element(document).ready(function () {
        var initInjector = angular.injector(['ng']);
        var $http = initInjector.get('$http');
        $http.get('templates.html').then(function (response) {
            document.body.innerHTML += response.data;
            angular.bootstrap(document, ['todomvc']);
        }).catch(function () {
        });
    });
})(todos || (todos = {}));
angular.module('todomvc')
    .directive('todoFocus', function todoFocus($timeout) {
    'use strict';
    return function (scope, elem, attrs) {
        scope.$watch(attrs.todoFocus, function (newVal) {
            if (newVal) {
                $timeout(function () {
                    elem[0].focus();
                }, 0, false);
            }
        });
    };
});
angular.module('todomvc')
    .directive('todoEscape', function () {
    'use strict';
    var ESCAPE_KEY = 27;
    return function (scope, elem, attrs) {
        elem.bind('keydown', function (event) {
            if (event.keyCode === ESCAPE_KEY) {
                scope.$apply(attrs.todoEscape);
            }
        });
        scope.$on('$destroy', function () {
            elem.unbind('keydown');
        });
    };
});
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
    angular.module('todomvc')
        .provider('todoStorage', function () {
        return {
            type: 'local',
            setType: function (type) {
                this.type = type;
            },
            $get: function ($injector) {
                if (this.type === 'api') {
                    return $injector.get('api');
                }
                else {
                    return $injector.get('localStorage');
                }
            }
        };
    });
})(todos || (todos = {}));
(function () {
    'use strict';
    var TodoForm = (function () {
        function TodoForm(store) {
            this.store = store;
            this.newTodo = '';
        }
        TodoForm.prototype.addTodo = function () {
            var newTodo = {
                title: this.newTodo.trim(),
                completed: false
            };
            if (!newTodo.title) {
                return;
            }
            this.saving = true;
            this.store.insert(newTodo)
                .then(angular.bind(this, function success() {
                this.newTodo = '';
            }))
                .finally(angular.bind(this, function () {
                this.saving = false;
            }));
        };
        return TodoForm;
    }());
    TodoForm.$inject = ['todoStorage'];
    angular.module('todomvc')
        .component('todoForm', {
        templateUrl: 'TodoForm.html',
        controller: TodoForm,
        bindings: {
            store: '<'
        }
    });
})();
var todos;
(function (todos) {
    var TodoList = (function () {
        function TodoList($scope, $filter, $transitions, store) {
            this.$filter = $filter;
            this.store = store;
            this.todos = this.store.todos;
            this.editedTodo = null;
            $scope.$watch('$ctrl.todos', angular.bind(this, function () {
                this.remainingCount = this.$filter('filter')(this.todos, { completed: false }).length;
                this.completedCount = this.todos.length - this.remainingCount;
                this.allChecked = !this.remainingCount;
            }), true);
            $transitions.onSuccess({ to: 'status' }, angular.bind(this, function (trans) {
                var status = this.status = trans._targetState._params.status || '';
                this.statusFilter = (status === 'active') ?
                    { completed: false } : (status === 'completed') ?
                    { completed: true } : {};
            }));
        }
        TodoList.prototype.editTodo = function (todo) {
            this.editedTodo = todo;
            this.originalTodo = angular.extend({}, todo);
        };
        TodoList.prototype.saveEdits = function (todo, event) {
            if (event === 'blur' && this.saveEvent === 'submit') {
                this.saveEvent = null;
                return;
            }
            this.saveEvent = event;
            if (this.reverted) {
                this.reverted = null;
                return;
            }
            todo.title = todo.title.trim();
            if (todo.title === this.originalTodo.title) {
                this.editedTodo = null;
                return;
            }
            this.store[todo.title ? 'put' : 'delete'](todo)
                .then(function success() {
            }, angular.bind(this, function error() {
                todo.title = this.originalTodo.title;
            }))
                .finally(angular.bind(this, function () {
                this.editedTodo = null;
            }));
        };
        TodoList.prototype.revertEdits = function (todo) {
            this.todos[this.todos.indexOf(todo)] = this.originalTodo;
            this.editedTodo = null;
            this.originalTodo = null;
            this.reverted = true;
        };
        TodoList.prototype.removeTodo = function (todo) {
            this.store.delete(todo);
        };
        TodoList.prototype.saveTodo = function (todo) {
            this.store.put(todo);
        };
        TodoList.prototype.toggleCompleted = function (todo, completed) {
            if (angular.isDefined(completed)) {
                todo.completed = completed;
            }
            this.store.put(todo, this.todos.indexOf(todo))
                .then(function success() {
            }, function error() {
                todo.completed = !todo.completed;
            });
        };
        TodoList.prototype.clearCompletedTodos = function () {
            this.store.clearCompleted();
        };
        TodoList.prototype.markAll = function (completed) {
            this.todos.forEach(angular.bind(this, function (todo) {
                if (todo.completed !== completed) {
                    this.toggleCompleted(todo, completed);
                }
            }));
        };
        return TodoList;
    }());
    TodoList.$inject = [
        '$scope',
        '$filter',
        '$transitions',
        'todoStorage'
    ];
    angular.module('todomvc').component('todoList', {
        templateUrl: 'TodoList.html',
        controller: TodoList,
        bindings: {
            store: '<'
        }
    });
})(todos || (todos = {}));
//# sourceMappingURL=app.js.map