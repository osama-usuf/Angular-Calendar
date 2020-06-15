(function () {
'use strict';

angular
.module('NGCalendarApp', ['ngMaterial'])			   // injecting ngMaterial as dependency
.controller('CalendarController', CalendarController)  // main controller for the application
.service('ApiService', ApiService)                     // main service, responsible for hitting the backend and fetching data via the API
.constant('ApiBasePath', "http://localhost:3000");     // base API path, good to have this as a one-time constant

CalendarController.$inject = ['ApiService','$mdDialog'];
function CalendarController(ApiService, $mdDialog) 
{
	var calendar = this;

	// Methods
	calendar.refreshReservations = () => {
		var [numDays, _] = getTotalDays(calendar.curDate.getMonth(), calendar.curYear);
		var firstDay = new Date(calendar.curYear, calendar.curDate.getMonth(), 1);
		var lastDay = new Date(calendar.curYear, calendar.curDate.getMonth(), numDays);
		var resPromise = ApiService.getReservations(dateToUNIXTime(firstDay), dateToUNIXTime(lastDay));
		resPromise.then( (response) => {
			calendar.reservations = response.data["reserved"];
		})
		.catch((error) => {
			console.log("Promise in CalendarController failed. Check if server is running correctly");
		});
	}


	calendar.navMonth = (key) => {
		// Method for updating the calendar view, is fired when nav buttons are clicked
		var [month, year] = getNavMonthYear(key, calendar.curDate.getMonth(), calendar.curYear)
		calendar.curMonth = new Date(year, month, 1).toLocaleDateString('default', { month: 'long' });;
		calendar.curYear = year;
		calendar.curDate.setFullYear(year, month);
		calendar.viewDays = getViewDays(calendar.curDate.getMonth(), calendar.curYear, calendar.curDate);

		var [numDays, _] = getTotalDays(calendar.curDate.getMonth(), calendar.curYear);
		calendar.firstDay = new Date(calendar.curYear, calendar.curDate.getMonth(), 1);
		calendar.lastDay = new Date(calendar.curYear, calendar.curDate.getMonth(), numDays);

		calendar.curDate.setDate(1);
		calendar.refreshReservations();
	}

  	calendar.showConfirm = (event) => {
	    // Appending dialog to document.body to cover sidenav in docs app
	    var confirm = $mdDialog.confirm()
	      .title('Are you sure you want to add a tenant?')
	      .content('You can always reverse this by removing the tenant.')
	      .ariaLabel('Lucky day')
	      .ok('Proceed')
	      .cancel('Go back')
	      .targetEvent(event);
	    $mdDialog.show(confirm).then(function() {
	      calendar.alert = 'The tenant has been added.';
	    }, function() {
	      calendar.alert = 'The tenant has not been added.';
	    }); 
  }

  	calendar.dayClicked = (key) => {
  		if (key['isDay'] != "primary")
  		{
  			calendar.viewDays = getViewDays(calendar.curDate.getMonth(), calendar.curYear, calendar.curDate, key['value']);
  		}
	}

	// Controller Scope variables - used in the view directly for laying out the page
	calendar.curDate = new Date();
	calendar.curMonth = calendar.curDate.toLocaleDateString('default', { month: 'long' });
	calendar.curYear = calendar.curDate.getFullYear();

	calendar.refreshReservations();
	calendar.canRemove = false; // disables the remove tenant button
	calendar.navMonth();
}
})();
