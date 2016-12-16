var todos;
(function (todos) {
    'use strict';
    /**
     * Directive that executes an expression when the element it is applied to gets
     * an `escape` keydown event.
     */
    var TodoEscape = (function () {
        function TodoEscape() {
            this.ESCAPE_KEY = 27;
        }
        TodoEscape.prototype.link = function (scope, elem, attrs) {
            elem.bind('keydown', angular.bind(this, function (event) {
                if (event.keyCode === this.ESCAPE_KEY) {
                    scope.$apply(attrs.todoEscape);
                }
            }));
            scope.$on('$destroy', function () {
                elem.unbind('keydown');
            });
        };
        TodoEscape.factory = function () {
            return new TodoEscape();
        };
        return TodoEscape;
    }());
    angular.module('todomvc')
        .directive('todoEscape', TodoEscape.factory);
})(todos || (todos = {}));
