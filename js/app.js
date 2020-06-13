(function () {
'use strict';

angular.module('NGCalendarApp', ['ui.bootstrap'])
.controller('CalendarController', CalendarController)  // main controller for the application
.service('ApiService', ApiService)                     // main service, responsible for hitting the backend and fetching data via the API
.constant('ApiBasePath', "http://localhost:3000");     // base API path, good to have this as a one-time constant


CalendarController.$inject = ['ApiService'];
function CalendarController(ApiService) {
  var calendar = this;
  var promise = ApiService.getReservations();

  promise.then(function (response) {
    calendar.reservations = response.data["reserved"];
  })
  .catch(function (error) {
    console.log("Promise in CalendarController failed.");
  });
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
