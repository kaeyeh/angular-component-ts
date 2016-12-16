/*global angular */

/**
 * Directive that places focus on the element it is applied to when the
 * expression it binds to evaluates to true
 */
angular.module('todomvc')
	.directive('todoFocus', function todoFocus($timeout) {
		'use strict';

		return function (scope: any, elem: any, attrs: any) {
			scope.$watch(attrs.todoFocus, function (newVal: any) {
				if (newVal) {
					$timeout(function () {
						elem[0].focus();
					}, 0, false);
				}
			});
		};
	});
