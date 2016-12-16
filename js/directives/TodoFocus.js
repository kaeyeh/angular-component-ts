var todos;
(function (todos) {
    /**
     * Directive that places focus on the element it is applied to when the
     * expression it binds to evaluates to true
     */
    var TodoFocus = (function () {
        function TodoFocus($timeout) {
            this.$timeout = $timeout;
            this.restrict = 'A';
        }
        TodoFocus.prototype.link = function (scope, el, attrs) {
            scope.$watch(attrs['todoFocus'], angular.bind(this, function (newVal) {
                if (newVal) {
                    this.$timeout(function () {
                        el[0].focus();
                    }, 0, false);
                }
            }));
        };
        TodoFocus.factory = function ($timeout) {
            return new TodoFocus($timeout);
        };
        return TodoFocus;
    }());
    angular.module('todomvc')
        .directive('todoFocus', ['$timeout', TodoFocus.factory]);
})(todos || (todos = {}));
