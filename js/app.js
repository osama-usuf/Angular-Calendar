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

	calendar.days = getTotalDays(calendar.curMonth, calendar.curYear);

	function getTotalDays(month, year)
	{
		// Given month & year, outputs the total number of days
		// in that particular month and the offset for the first day
		// (month, year) -> (numDays, firstDay)
		var firstDay = new Date(year, month, 1).toLocaleDateString('default', { weekday: 'long' });
		var numDays = new Date(year, month, 0).getDate();
		return [{'numDays': numDays, 'firstDay': firstDay}]
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
