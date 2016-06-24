'use strict';

angular.module('gsnClientApp')
  .controller('DataController', function ($scope, VirtualSensorService, SettingsService, ChartService, $http, moment, $localStorage, $timeout) {

    var sensors;
    //$localStorage.$reset();
    
    $scope.$storage = $localStorage.$default({
		widthSliderVal: 1,
		selectedSensor: [],
		selectedField: [],
		dataOutputRows: [],
		dataOutputChart: [],
		chartIndices: [],
		chartConfig: [],
		lastRefresh: '-',
		lastResults: []
	});
	$scope.timeFormat = SettingsService.timeFormat;
	$scope.timeFormatOptions = SettingsService.timeFormatOptions;
    $scope.columnDefs = [];
    $scope.tuples = [];

    $scope.gridOptions = {
      columnDefs: 'columnDefs',
      data: 'tuples'
    };
	
	$scope.dataOutputChart = $scope.$storage.dataOutputChart;	// output# -> chartID
	$scope.chartIndices = $scope.$storage.chartIndices;
	$scope.chartConfig = $scope.$storage.chartConfig;
	
	$scope.selectedSensor = $scope.$storage.selectedSensor;
  	$scope.selectedField = $scope.$storage.selectedField;
  	$scope.dataOutputRows = $scope.$storage.dataOutputRows;
  	$scope.results = $scope.$storage.lastResults;
  	
  	$scope.selectedConditionSensor = [];
  	$scope.selectedConditionField = [];
    $scope.selectedConditionJoin = [];
    $scope.selectedConditionMinValue = [];
    $scope.selectedConditionMaxValue = [];
    
    $scope.conditionRows = [];
    
  	$scope.numberOfValuesToFetchOptions = SettingsService.numberOfValuesToFetchOptions;
  	$scope.numberOfValuesToFetch = SettingsService.numberOfValuesToFetch;
  	
  	$scope.aggregationOptions = SettingsService.aggregationOptions;
  	$scope.aggregation = SettingsService.aggregation;
  	$scope.aggregationUnitOptions = SettingsService.aggregationUnitOptions;
  	$scope.aggregationUnit = SettingsService.aggregationUnit;
  	
    $scope.conditionJoins = [{name: "and"}, {name: "or"}];
    
    $scope.valuesToFetch = "10";
    
    $scope.fromFormated = "";
    $scope.untilFormated = "";

    $scope.selectedConditionJoin[0] = $scope.conditionJoins[0];
    $scope.selectedConditionMinValue[0] = "-inf";
    $scope.selectedConditionMaxValue[0] = "+inf";
    $scope.dataOutputChart[0] = 0;
    $scope.chartIndices[0] = 0;

    var enableDataLabels = false;
    var myData = [];
    $scope.filterData;

    $scope.chartTypes = ['areaspline', 'spline', 'column', 'area','line'];
    
    $scope.selectedChartType = $scope.chartTypes[0];
	
    $scope.widthSlider = {
		options: {
			floor: 1,
			ceil: 4,
			showSelectionBar: true
		}
	};

  	VirtualSensorService.get(function (data) {
  		var allSensors = {	name: "All",
  							description : "",
  							structureFields : [],

  		};
  		data.sensors.forEach(function(sensor) {
  			$.merge(allSensors.structureFields, sensor.structureFields);
		  });

  		allSensors.structureFields.splice(0,0, "All");
  		allSensors.structureFields = uniq(allSensors.structureFields);
  	
  		data.sensors.splice(0,0,allSensors);

  		sensors = data.sensors;
		
		if ($scope.selectedSensor.length == 0) {
			$scope.dataOutputRows.push(sensors.slice());
			$scope.selectedSensor[0] = allSensors;
			$scope.selectedField[0] = $scope.selectedSensor[0].structureFields[0];
		}
  	//	
      $scope.conditionRows.push(sensors.slice());
  		
  //	
 

      $scope.selectedConditionSensor[0] = $scope.conditionRows[0][0];
      $scope.selectedConditionField[0] = $scope.selectedConditionSensor[0].structureFields[0];


  	});


  	$scope.sensorSelected = function($index) {
  		if ($scope.selectedSensor[$index].structureFields[0] !== "All")
  			$scope.selectedSensor[$index].structureFields.splice(0,0,"All");

  		$scope.selectedField[$index] = $scope.selectedSensor[$index].structureFields[0];
  	};

    $scope.sensorConditionSelected = function($index) {
      if ($scope.selectedConditionSensor[$index].structureFields[0] !== "All")
        $scope.selectedConditionSensor[$index].structureFields.splice(0,0,"All");

      $scope.selectedConditionField[$index] = $scope.selectedConditionSensor[$index].structureFields[0];
    };

  	$scope.addOutput = function() {
  		$scope.dataOutputRows.push(sensors.slice());
  		var len = $scope.dataOutputRows.length;
		
		$scope.dataOutputChart[len-1] = 0;
		$scope.chartIndices[len-1] = len-1;
  		$scope.selectedSensor[len-1] = $scope.dataOutputRows[len-1][0];
  		$scope.selectedField[len-1] = $scope.dataOutputRows[len-1][0].structureFields[0]; 
  	};


  	$scope.addCondition = function() {
      $scope.conditionRows.push(sensors.slice());
      var len = $scope.conditionRows.length;

      $scope.selectedConditionSensor[len-1] = $scope.conditionRows[len-1][0];
      $scope.selectedConditionField[len-1] = $scope.conditionRows[len-1][0].structureFields[0];
      $scope.selectedConditionJoin[len-1] = $scope.conditionJoins[0];
      $scope.selectedConditionMinValue[len-1] = "-inf";
      $scope.selectedConditionMaxValue[len-1] = "+inf";
  	};


  	$scope.numberOfValuesToFetchChanged = function () {
  		SettingsService.setNumberOfValuesOfFetch($scope.numberOfValuesToFetch);
  	};


  	$scope.aggregationChanged = function () {
  		SettingsService.setAggregation($scope.aggregation);
  	};

  	$scope.aggregationUnitChanged = function () {
  		SettingsService.setAggregationUnit($scope.aggregationUnit);
  	};

    $scope.timeFormatChanged = function() {
      SettingsService.setTimeFormat($scope.timeFormat);
    };


  	$scope.removeOutput = function($index) {
		$scope.dataOutputRows.splice($index,1);
		$scope.selectedSensor.splice($index,1);
		$scope.selectedField.splice($index,1);
		$scope.dataOutputChart.splice($index,1);
		$scope.chartIndices.pop();	
  	};

    $scope.removeCondition = function($index) {
      $scope.conditionRows.splice($index,1);
      $scope.selectedConditionSensor.splice($index,1);
      $scope.selectedConditionField.splice($index,1);
      $scope.selectedConditionJoin.splice($index,1);
    };

  	$scope.accordionClicked = function(accordionId) {
  		if ($scope.selectedAccordion === accordionId)
  			$scope.selectedAccordion = !$scope.selectedAccordion;
  		else
  			$scope.selectedAccordion = accordionId;
  	};

    $scope.fromChanged = function() {
		$scope.from_iso = moment($scope.from, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:m:ss", "YYYY-MM-DD HH:mm:s", "YYYY-MM-DD HH:m:s"]);
		
		if (!$scope.from_iso.isValid()) {
			$scope.from_iso = moment().subtract(3, 'days');
		}
		
        var curr_date = $scope.from_iso.date();
        var curr_month = $scope.from_iso.month() + 1;
        var curr_year = $scope.from_iso.year();
        var hh = $scope.from_iso.hour();
        var mm = $scope.from_iso.minute();
        var ss = $scope.from_iso.second();

        $scope.fromFormated = pad(curr_date) + "/" + pad(curr_month) + "/" + pad(curr_year) + " " +pad(hh)+ ":" + pad(mm) + ":" + pad(ss);
    };

     $scope.untilChanged = function() {
		$scope.until_iso = moment($scope.until, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:m:ss", "YYYY-MM-DD HH:mm:s", "YYYY-MM-DD HH:m:s"]);
		
		if (!$scope.until_iso.isValid()) {
			$scope.until_iso = moment();
		}
		
        var curr_date = $scope.until_iso.date();
        var curr_month = $scope.until_iso.month() + 1;
        var curr_year = $scope.until_iso.year();
        var hh = $scope.until_iso.hour();
        var mm = $scope.until_iso.minute();
        var ss = $scope.until_iso.second();

        $scope.untilFormated = pad(curr_date) + "/" + pad(curr_month) + "/" + pad(curr_year) + " " +pad(hh)+ ":" + pad(mm) + ":" + pad(ss);
    };


    $scope.downloadReport = function(format) {
        var request = prepareRequest();
        request["download_format"] = format;

        $.download('/multidata', request);
    };


    $scope.showResulTable = function() {
      var options = createGridOptions($scope.selectedTable);
      $scope.columnDefs = options.columnDefs;
      $scope.tuples = options.data;
    };

    $scope.fetchData = function() {
      var request = prepareRequest();
      request["download_format"] = "xml";
      $http({
              method: 'POST',
              url: '/multidata',
              data: request,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function (data) {
                $scope.$storage.lastResults = parseXMLresponse(data);
                $scope.results = $scope.$storage.lastResults;
                $scope.$storage.lastRefresh = moment().format("YYYY-MM-DD HH:mm:ss");
                $scope.filterData = data;
                $scope.drawByFilter();
            });
    };
    
    $scope.toggleSubchart = function() {
		$scope.subchartEnabled = !$scope.subchartEnabled;
		if ($scope.subchartEnabled) {
			$scope.tSubchart = 'Disable';
		} else {
			$scope.tSubchart = 'Enable';
		}
	}
    
    $scope.toggleZoom = function() {
		$scope.zoomEnabled = !$scope.zoomEnabled;
		if ($scope.zoomEnabled) {
			$scope.tZoom = 'Disable';
		} else {
			$scope.tZoom = 'Enable';
		}
	}
	
	$scope.togglePoints = function() {
		$scope.pointsEnabled = !$scope.pointsEnabled;
		if ($scope.pointsEnabled) {
			$scope.tPoints = 'Disable';
		} else {
			$scope.tPoints = 'Enable';
		}
	}

    function createGridOptions(sensorResult) {
        var options = {};
        var sensor = $.grep(sensors, function(v) { return v.name === sensorResult.name; })[0];
        options["data"] = sensorResult.tuples;
        
        var columnDefs = [];

        for (var i = 0; i < sensorResult.header.length; ++i) {
          var column = {field:sensorResult.header[i], displayName:sensorResult.header[i]};
          if (typeof sensor.fields[sensorResult.header[i].toLowerCase()] !== 'undefined'){
            if(sensor.fields[sensorResult.header[i].toLowerCase()]["type"] .match("^binary:image/jpeg")) {
              column["cellTemplate"] = '<div><a style="position:relative;top:2px;left:150px;" href="{{row.getProperty(col.field)}}" target="_blank"><img src="{{row.getProperty(col.field)}}" width="30" height="30"/></a></div>';
            }
          }
          columnDefs.push(column);
        }
        options["columnDefs"] = columnDefs;

        return options;
    }

	$scope.defaultChartOptions = {
		chart: {
			//renderTo: 'chartdiv',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					// align: 'right', // by default
					// verticalAlign: 'top', // by default
					x: -40,
					y: 10
				}
			}
		},
		
		title: {
			text: ''
		},
		
		useHighStocks: false,

      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        /*
        labels: {
          formatter: function() {
            //return Highcharts.dateFormat('%Y-%m-%d, %H:%M', this.value);            
            return Highcharts.dateFormat('%H:%M', this.value);
          }
        }*/
      },

      yAxis: {
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
      },

      plotOptions: {
        series: {
          pointStart: 1,
          marker: {
            enabled: true,
            symbol: 'circle',
            radius: 2,
            states: {
                hover: {
                    enabled: true
                }
            }
          }
        }
      },
		
      series : [{
          dataGrouping: {
              enabled: false
          }
      }],
      
      global : {
            useUTC : false
      }
    };
    
    // This is for all plots, change Date axis to local timezone
    Highcharts.setOptions(                                            
        $scope.defaultChartOptions
    );

    $scope.drawByFilter = function(data) {
		
      //$scope.toggleLoading();
      
      $scope.chartConfig = [];
      
      // for each selected sensor and field
      for (var i = 0; i < $scope.selectedSensor.length; i++) {
		  // find that field (what if selectedField is All? special case)
		  for (var j = 0; j < $scope.results.length; j++) {
			  if ($scope.results[j].name == $scope.selectedSensor[i].name) {
				  for (var k = 0; k < $scope.results[j].header.length; k++) {
					  if ($scope.results[j].header[k].toLowerCase() == $scope.selectedField[i].toLowerCase()) {
						  var chartId = $scope.dataOutputChart[i];
						  var seriesArray = [];
				  
							myData = ChartService.getDataForChart($scope.results[i], $scope.selectedChartType, new Date($scope.from_iso), new Date($scope.until_iso));
		  
							if ($scope.chartConfig[chartId] == null) {
							// create its config object
								$scope.chartConfig[chartId] = {
									chart: {
										renderTo: 'chartdiv' + chartId
									},
									series: seriesArray,
									func: function(chart) {
										$timeout(function() {
											chart.reflow();
										}, 0);
									}
								};
							} else {
								seriesArray = $scope.chartConfig[chartId].series;
							}
							for (var l = 0; l < myData.length; l++) {
								seriesArray.push(myData[l]);
							}
						}
				}
			  }
			}
		}
      
      /*
      for (var i = 0; i < l; i++) {
		  // find out which chart it is displayed on
		  var chartId = $scope.dataOutputChart[i];
		  var seriesArray = [];
		  
		  myData = ChartService.getDataForChart($scope.results[i], $scope.selectedChartType, new Date($scope.from_iso), new Date($scope.until_iso));
		  
		  for (var j = 0; j < myData.length; j++) {
			  seriesArray.push(myData[j]);
		  }
		  
		  // create its config object
		  $scope.chartConfig[i] = {
			  chart: {
				  renderTo: 'chartdiv' + i
			  },
			  series: seriesArray
		  };
			  
	  }
      //$scope.toggleLoading();*/
	}
	
	if ($scope.$storage.lastRefresh != '-' && $scope.$storage.lastResults.length != 0) {
		$scope.results = $scope.$storage.lastResults;
		$scope.drawByFilter();
	}
    
    
    $scope.seriesTypeChange = function(type) {
      var seriesArray = $scope.chartConfig.series;
      for (var i = 0; i < seriesArray.length; i++) {
        $scope.chartConfig.series[i].type =  type;    
      }
    };
    
    
    $scope.toggleLabels = function () {
      enableDataLabels = !enableDataLabels;
      $scope.chartConfig.series[0].dataLabels.enabled =  enableDataLabels;        
    }

    $scope.toggleLoading = function () {
        this.chartConfig.loading = !this.chartConfig.loading
    }
    
    $scope.refreshSlider = function() {
		$timeout(function() {
			$scope.$broadcast('rzSliderForceRender');
		});
	};
	
	$scope.checkAccord = function() {
		if ($scope.closeAccord) {
			$scope.outputsOpen = false;
		}
	}
	

    function prepareRequest() {
      var request = {};

      request["nb"] = $scope.numberOfValuesToFetch.value;
      
      if (request["nb"] === "SPECIFIED")
        request["nb_value"] = $scope.valuesToFetch;

      request["from"] = $scope.fromFormated;
      request["to"] = $scope.untilFormated;

      request["agg_function"] = $scope.aggregation.value;
      if (request["agg_function"] !== -1){
          request["agg_period"] = $scope.aggregationPeriod;
          request["agg_unit"] = $scope.aggregationUnit.value;
      } 

      request["time_format"] = $scope.timeFormat.value;
      request["reportclass"] = "report-default";
      
      for (var i = 0; i < $scope.selectedSensor.length; i++){
          request["vs["+i+"]"] = $scope.selectedSensor[i].name;
          request["field["+i+"]"] = $scope.selectedField[i];
      }

      for (var i = 0; i < $scope.selectedConditionSensor.length; i++ ){
          request["c_join["+i+"]"] = $scope.selectedConditionJoin[i].name;
          request["c_vs["+i+"]"] = $scope.selectedConditionSensor[i].name;
          request["c_field["+i+"]"] = $scope.selectedConditionField[i];
          request["c_min["+i+"]"] = $scope.selectedConditionMinValue[i];
          request["c_max["+i+"]"] = $scope.selectedConditionMaxValue[i];
      }

      return request;
    };
});



jQuery.download = function(url, data, method) {
    //url and data options required
    if (url && data ){
        //data can be string of parameters or array/object
        data = typeof data == 'string' ? data : decodeURIComponent(jQuery.param(data));
               
        //split params into form inputs
        var inputs = '';
        jQuery.each(data.split('&'), function() {
            var pair = this.split('=');
            inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />';
        });
        
        //send request
        jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
            .appendTo('body').submit().remove();
    };
};


// Utility function
function parseXMLresponse(xml) {
  var nodes = $(xml);
  var results = [];
  $(nodes).children().each( // iterate over results
       function (){
          var sensorResults = {};
          var currentSensor = $(this);
          sensorResults.name = currentSensor.attr("vsname");
          var header = [];
          currentSensor.find("header").children().each(
              function () {
                  var headerField = $(this);
                  header.push(headerField.text());
              }
          );
          sensorResults.header = header;
          sensorResults.tuples = [];
          currentSensor.find("tuple").each(
            function () {
                var tuple = {};
                var t = $(this);
                t.children().each (
                  function(index) {
                    var field = $(this);
                    tuple[sensorResults.header[index]] = field.text();
                  }
                );
                sensorResults.tuples.push(tuple);
            }
          );
          results.push(sensorResults);
  });
  return results;
}

// eliminates duplicates in an array
// $.unique works only for DOM elements!
function uniq(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    
    for(var i = 0; i < len; i++) {
		var item = a[i];
		if (seen[item] !== 1) {
			seen[item] = 1;
			out[j++] = item;
		}
	}
	return out;
}

//Date time utility functions
function pad(value) {
	if (value < 10 && value > -1) return '0' + value;
	else return value;
}

function getDay(date) {
    var day = date.getDate();
    return day < 10 ? '0' + day : day; 
}  

function getMonth(date) {
    var month = date.getMonth()+1;
    return month < 10 ? '0' + month : month;
}  

function getHours(date) {
    var hours = date.getHours();
    return hours < 10 ? '0' + hours : hours; 
}  

function getMinutes(date) {
    var minutes = date.getMinutes();
    return minutes < 10 ? '0' + minutes : minutes; 
}  

function getSeconds(date) {
	var seconds = date.getSeconds();
	return seconds < 10 ? '0' + seconds : seconds;
}
