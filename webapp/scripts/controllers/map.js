'use strict';

angular.module('gsnClientApp')
	.controller('MapController', function ($scope, VirtualSensorService,SettingsService, $timeout, uiGmapGoogleMapApi, uiGmapIsReady) {
		$scope.inet_on = inet_connection;
		$scope.inet_done = inet_check_done;
		$scope.loaded = false;
		$scope.windowOptions = {
			disableAutoPan : false
		};
		
		$scope.map = {
			center: {
				latitude: 45.3431,
				longitude: 14.4092
			},
			zoom: 9
		};
		
		uiGmapGoogleMapApi.then(function(maps) {
			$scope.loaded = true;
		}, function(error) {
			console.log('Error while loading google maps api');
		});
		
		uiGmapIsReady.promise(1).then(function(instances) {
			instances.forEach(function(inst) {
				var map = inst.map;
				var uuid = map.uiGmap_id;
				var mapInstanceNumber = inst.instance; // Starts at 1.
				// everything OK
			});
		}, function(error) {
			console.log('Error while loading google map');
			$scope.loaded = false;
		});
	  /*
	  $scope.map = {
		  center: {
			  latitude: latitude_var,
			  longitude: longitude_var
			  },
			zoom: 9,
			  sensors : []
			  };*/


/*
	SettingsService.sensors.forEach(function(sensor) {
		if (sensor.fields["latitude"] !== undefined && sensor.fields["longitude"] !== undefined && sensor.visible==true) {
			$scope.map.sensors.push({
				"latitude": sensor.fields["latitude"].value,
				"longitude": sensor.fields["longitude"].value,
				"showWindow" : true,
				"title" : sensor.name,
				"selected" : false,
				"model": sensor,
				"url": '/views/mapTemplate.html'
			});
		}
	});*/

    // selected sensors
    $scope.selection = [];

    // helper method
    $scope.selectedSensors = function selectedSensors() {
       //return filterFilter($scope.map.sensors, { selected: true });

       console.log('ssssshuhu');
    };

    // watch sensors for changes
    /*$scope.$watch('map.sensors|filter:{selected:true}', function (nv) {
      $scope.selection = nv.map(function (sensor) {
        return sensor.name;
      });
    }, true);

    var onMarkerClicked = function (marker) {
      marker.showWindow = true;
      $scope.$apply();
      //window.alert("Marker: lat: " + marker.latitude + ", lon: " + marker.longitude + " clicked!!")
    };*/

});



