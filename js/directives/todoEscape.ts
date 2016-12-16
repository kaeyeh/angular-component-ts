namespace todos {
	'use strict';
/**
 * Directive that executes an expression when the element it is applied to gets
 * an `escape` keydown event.
 */
    class TodoEscape {
        private ESCAPE_KEY: number  = 27;

    	constructor () {

		}
        link (scope:any , elem:any, attrs:any) {
          elem.bind('keydown', angular.bind( this, function (event: any) {
            if (event.keyCode === this.ESCAPE_KEY) {
              scope.$apply(attrs.todoEscape);
            }
          }));

          scope.$on('$destroy', function () {
            elem.unbind('keydown');
          });
        }

        static factory (){
    		return new TodoEscape();
		}
        
    }
angular.module('todomvc')
	.directive('todoEscape', TodoEscape.factory);
}