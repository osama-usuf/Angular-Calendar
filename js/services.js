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