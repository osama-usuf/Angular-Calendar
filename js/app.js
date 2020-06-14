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

	calendar.curDate = new Date();
	calendar.curMonth = calendar.curDate.toLocaleDateString('default', { month: 'long' });
	calendar.curYear = calendar.curDate.getFullYear();
	calendar.canRemove = false; // disables the remove tenant button

	calendar.viewDays = getViewDays(calendar.curDate.getMonth(), calendar.curYear);

	calendar.test = null;

	calendar.navMonth = (key) => {
		// Method for updating the calendar view, is fired when nav buttons are clicked
		var [month, year] = getNavMonthYear(key, calendar.curDate.getMonth(), calendar.curYear)
		calendar.curMonth = new Date(year, month, 1).toLocaleDateString('default', { month: 'long' });;
		calendar.curYear = year;
		calendar.curDate.setFullYear(year, month);
		calendar.viewDays = getViewDays(calendar.curDate.getMonth(), calendar.curYear);
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
})();
