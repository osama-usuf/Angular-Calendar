ApiService.$inject = ['$http', 'ApiBasePath'];
function ApiService($http, ApiBasePath) {
	this.getReservations = (startDate, endDate) => {
		// Fetches Existing Reservations for the current month
		var response = $http({
			method: "GET",
			url: (ApiBasePath + "/reserve/"+ startDate + "/" + endDate) // change
		});
		return response;
	};
}