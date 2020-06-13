(function () {
'use strict';

angular
.module('NGCalendarApp', ['ngMaterial'])
.controller('CalendarController', CalendarController)  // main controller for the application
.service('ApiService', ApiService)                     // main service, responsible for hitting the backend and fetching data via the API
.constant('ApiBasePath', "http://localhost:3000");     // base API path, good to have this as a one-time constant


CalendarController.$inject = ['ApiService'];
function CalendarController(ApiService) 
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
