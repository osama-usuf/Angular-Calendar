ApiService.$inject = ['$http', 'ApiBasePath'];
function ApiService($http, ApiBasePath) {
	this.getReservations = (startDate, endDate) => {
		// Fetches Existing Reservations for the current month
		var response = $http({
			method: "GET",
			url: (ApiBasePath + "/reserve/"+ startDate + "/" + endDate)
		});
		return response;
	};
	this.changeReservation = (tenantName, time, write) => {
		// Fetches Existing Reservations for the current month
		var response = $http({
			method: "POST",
			url: (ApiBasePath + "/reserve/"),
			data: { "tennantName": tenantName, 
					"time": time,
					"reserved": write
				}
		});
		return response;
	};
	// this.removeReservation = (tenantName, time) => {
	// 	// Fetches Existing Reservations for the current month
	// 	var response = $http({
	// 		method: "POST",
	// 		url: (ApiBasePath + "/reserve/"),
	// 		data: { "tennantName": tenantName, 
	// 				"time": time,
	// 				"reserved": false
	// 			}
	// 	});
	// 	return response;
	// };
}