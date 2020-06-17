/* 
- services.js
- Defines the ApiService, responsible for hitting all back-end endpoints and fetching data
*/

ApiService.$inject = ['$http', 'ApiBasePath'];	// injecting the ApiBasePath constant as defined on app.js' NGCalendarApp module
function ApiService($http, ApiBasePath) {
	this.getReservations = (startDate, endDate) => {
		// Fetches Existing Reservations for the current month
		var response = $http({
			method: "GET",
			url: (ApiBasePath + "/reserve/" + startDate + "/" + endDate)
		});
		return response;
	};

	this.changeReservation = (tenantName, time, write) => {
		// Fetches Existing Reservations for the current month
		// write is a boolean value, passed onto the reserved value in the data to be POST-ed to the server 
		var response = $http({
			method: "POST",
			url: (ApiBasePath + "/reserve/"),
			data: {
				"tennantName": tenantName,
				"time": time,
				"reserved": write
			}
		});
		return response;
	};
};