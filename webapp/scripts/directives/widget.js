'use strict';

angular.module('gsnClientApp')
	.directive('sensorWidget', function() {
		return {
			restrict: 'E',
			scope: {
				sensor: '='
			},
			templateUrl: 'scripts/templates/sensor-widget.html',
			replace: true
		};
	});
