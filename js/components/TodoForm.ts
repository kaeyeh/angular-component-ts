(function () {
    'use strict';

    class TodoForm {
        private newTodo: any = '';
        private saving: boolean;

        static $inject = ['todoStorage'];
        // Constructor
        constructor(private store: any) {

        }

        addTodo() {
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
        }

    }

    angular.module('todomvc')
        .component('todoForm', {
            //templateUrl: 'js/components/TodoForm.html',
            templateUrl: 'TodoForm.html',
            controller: TodoForm,
            bindings: {
                store: '<'
            }
        });
})();
