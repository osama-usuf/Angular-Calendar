(function () {
'use strict';

angular
.module('NGCalendarApp', ['ngMaterial'])
.controller('CalendarController', CalendarController)  // main controller for the application
.service('ApiService', ApiService)                     // main service, responsible for hitting the backend and fetching data via the API
.constant('ApiBasePath', "http://localhost:3000");     // base API path, good to have this as a one-time constant

CalendarController.$inject = ['ApiService','$mdDialog'];
function CalendarController(ApiService, $mdDialog) 
{
	var calendar = this;

	var promise = ApiService.getReservations();
	promise.then(function (response) {
		calendar.reservations = response.data["reserved"];
	})
	.catch(function (error) {
		console.log("Promise in CalendarController failed. Check if server is running correctly");
	});

	var curDate = new Date();
	calendar.curMonth = curDate.toLocaleDateString('default', { month: 'long' });
	calendar.curYear = curDate.getFullYear();
	calendar.canRemove = false; // disables the remove tenant button
	calendar.totalDays = 7;
	// Helper functions for calendar functionality

	calendar.viewDays = getViewDays(curDate.getMonth(), calendar.curYear);

	//calendar.viewDays = getViewDays(2, 2020);

	function getTotalDays(month, year)
	{
		// Given month & year, outputs the total number of days
		// in that particular month and the offset for the first day
		// (month, year) -> (numDays, firstDay)
		var firstDay = new Date(year, month, 1).getDay();
		var numDays = 32 - new Date(year, month, 32).getDate();
		return {'numDays': numDays, 'firstDay': firstDay}
	}


	function getViewDays(month, year)
	{
		var totalDays_curView  = getTotalDays(month, year); 
		var nextMonth = month; var prevMonth = month;
		var nextYear =   year; var prevYear  = year;

	 	// Edge cases for next/prev years 
		if 		(month ==  0) 	{ prevYear -= 1; }
		else if (month == 11)	{ nextYear += 1; }

		nextMonth = (nextMonth + 1) % 12;
		prevMonth = (((prevMonth - 1) % 12) + 12) % 12;


		var totalDays_prevView = getTotalDays(prevMonth, prevYear);
		var totalDays_nextView = getTotalDays(nextMonth, nextYear);

		// Figure out initial padding required

		// Create the final view array

		var initPadding = totalDays_curView['firstDay'];
		var arrSize = initPadding + totalDays_curView['numDays'];
		var daysArr = [];

		for (var i=0; i < initPadding; i++)
		{
			daysArr.push({'value':totalDays_prevView['numDays']- (initPadding-i) + 1,
						  'disabled': true});
		}
		for (var i=0; i < totalDays_curView['numDays']; i++)
		{
			daysArr.push({'value':totalDays_curView['numDays'] - (totalDays_curView['numDays'] - i) + 1,
						  'disabled': false});
		}
		var i = 1;
		while (daysArr.length % 7 != 0)
		{
			daysArr.push({'value':i++,
						  'disabled': true});
		}
		console.log(daysArr);
	}

	calendar.getDayName = function(day)
	{
		// Useful for mapping integers in [0-6] to actual day names
		var day = new Date(1, 1, day+3).toLocaleDateString('default', { weekday: 'long' });
		return day.slice(0, 3);
	}

  	calendar.showConfirm = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
      .title('Are you sure you want to add a tenant?')
      .content('You can always reverse this by removing the tenant.')
      .ariaLabel('Lucky day')
      .ok('Proceed')
      .cancel('Go back')
      .targetEvent(ev);
    $mdDialog.show(confirm).then(function() {
      calendar.alert = 'The tenant has been added.';
    }, function() {
      calendar.alert = 'The tenant has not been added.';
    });
  };
}

ApiService.$inject = ['$http', 'ApiBasePath'];
function ApiService($http, ApiBasePath) {
	this.getReservations = function () {
		var response = $http({
			method: "GET",
			url: (ApiBasePath + "/reserve/1577790000/1609153200") // change
		});
		return response;
	};
}
})();
