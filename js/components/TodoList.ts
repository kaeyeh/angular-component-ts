namespace todos {

    class TodoList {
        private todos: any;
        private editedTodo: any;
        private originalTodo: any;
        private saveEvent: any;
        private reverted: any;

        static $inject = [
            '$scope',
            '$filter',
            '$transitions',
            '$stateParams',
            'todoStorage'
        ];

        constructor($scope: ng.IScope, private $filter: any, $transitions: any, $stateParams: any, private store: any) {


            this.todos = this.store.todos;
            this.editedTodo = null;

            $scope.$watch(<any>'$ctrl.todos', <any>angular.bind(this, function () {
                this.remainingCount = this.$filter('filter')(this.todos, {completed: false}).length;
                this.completedCount = this.todos.length - this.remainingCount;
                this.allChecked = !this.remainingCount;
            }), true);

            // Monitor the current route for changes and adjust the filter accordingly.
            $transitions.onSuccess({to: 'status'}, angular.bind(this, function (trans: any) {
                var status = this.status = $stateParams.status || '';
                this.statusFilter = (status === 'active') ?
                    {completed: false} : (status === 'completed') ?
                        {completed: true} : {};
            }));

        }

        editTodo(todo: any) {
            this.editedTodo = todo;
            // Clone the original todo to restore it on demand.
            this.originalTodo = angular.extend({}, todo);
        }

        saveEdits(todo: any, event: any) {
            // Blur events are automatically triggered after the form submit event.
            // This does some unfortunate logic handling to prevent saving twice.
            if (event === 'blur' && this.saveEvent === 'submit') {
                this.saveEvent = null;
                return;
            }

            this.saveEvent = event;

            if (this.reverted) {
                // Todo edits were reverted-- don't save.
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
        }

        revertEdits(todo: any) {
            this.todos[this.todos.indexOf(todo)] = this.originalTodo;
            this.editedTodo = null;
            this.originalTodo = null;
            this.reverted = true;
        }

        removeTodo(todo: any) {
            this.store.delete(todo);
        }

        saveTodo(todo: any) {
            this.store.put(todo);
        }

        toggleCompleted(todo: any, completed: any) {
            if (angular.isDefined(completed)) {
                todo.completed = completed;
            }
            this.store.put(todo, this.todos.indexOf(todo))
                .then(function success() {
                }, function error() {
                    todo.completed = !todo.completed;
                });
        }

        clearCompletedTodos() {
            this.store.clearCompleted();
        }

        markAll(completed: any) {
            this.todos.forEach(angular.bind(this, function (todo: any) {
                if (todo.completed !== completed) {
                    this.toggleCompleted(todo, completed);
                }
            }));
        }

    }

    angular.module('todomvc').component('todoList', {

        templateUrl: function ($element:any, $attrs:any) {
            return $attrs.templateUrl;
        },
        controller: TodoList
    });
}
