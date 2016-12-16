namespace todos {

    /**
     * Directive that places focus on the element it is applied to when the
     * expression it binds to evaluates to true
     */
    class TodoFocus implements ng.IDirective {
        restrict = 'A';

        constructor(private $timeout: ng.ITimeoutService) {
        }

        link(scope: ng.IScope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
            scope.$watch(attrs['todoFocus'], <any>angular.bind(this, function (newVal: any) {
                if (newVal) {
                    this.$timeout(function () {
                        el[0].focus();
                    }, 0, false);
                }
            }));
        }

        static factory($timeout: ng.ITimeoutService) {
            return new TodoFocus($timeout);
        }
    }


    angular.module('todomvc')
        .directive('todoFocus', ['$timeout', TodoFocus.factory]);
}