(function () {
'use strict';

angular
.module('NGCalendarApp', ['ngMaterial'])			   // injecting ngMaterial as dependency
.controller('CalendarController', CalendarController)  // main controller for the application
.service('ApiService', ApiService)                     // main service, responsible for hitting the backend and fetching data via the API
.constant('ApiBasePath', "http://localhost:3000");     // base API path, good to have this as a one-time constant

CalendarController.$inject = ['ApiService','$mdDialog', '$filter'];
function CalendarController(ApiService, $mdDialog, $filter) 
{
	var calendar = this;
	// Methods
	calendar.refreshReservations = () => {
		var [numDays, _] = getTotalDays(calendar.curDate.getMonth(), calendar.curYear);
		var firstDay = new Date(calendar.curYear, calendar.curDate.getMonth(), 1);
		var lastDay = new Date(calendar.curYear, calendar.curDate.getMonth(), numDays);

		var resPromise = ApiService.getReservations(dateToUNIXTime(firstDay), dateToUNIXTime(lastDay));
		resPromise.then( (response) => {
			var res = response.data["reserved"];
			for (var i=0; i< res.length; i++) {
				res[i]["time2"] = $filter('date')(res[i]["time"] * 1000, 'dd-MM-yyyy hh:MM:ss Z', 'UTC');
			}
			calendar.reservations = res;
		})
		.catch((error) => {
			calendar.alert = "Couldn't fetch data from the server correctly."
			console.log("Promise in CalendarController failed. Check if server is running correctly");
		});
	}

	calendar.getServerTime = () => {
		var resPromise = ApiService.getServerTime();
		resPromise.then( (response) => {

			console.log(response.data);
			var date = new Date(response.data["time"] * 1000);

			calendar.curDate = new Date(date);

			//var now = new Date();
			//var utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
			//calendar.curDate = utc;
			calendar.curMonth = calendar.curDate.toLocaleDateString('default', { month: 'long' });
			calendar.curYear = calendar.curDate.getFullYear();
			calendar.navMonth();
		})
		.catch((error) => {
			calendar.alert = "The server time couldn't be fetched correctly.";
			console.log("Promise in Server Time. Check if server is running correctly");
		});
	}

	calendar.addReservation = () => {
		var resPromise = ApiService.addReservation(calendar.tenantName, dateToUNIXTime(calendar.curDate, 0));
		resPromise.then( (response) => { 
			calendar.refreshReservations();
		})
		.catch((error) => {
			calendar.alert = "The selected date is already under reservation. Please refresh the page to continue!";
			console.log("Promise in add reservation failed. Check if server is running correctly");
		});
	}

	calendar.removeReservation = (index) => {
		var resPromise = ApiService.removeReservation(calendar.reservations[index]["tennantName"], calendar.reservations[index]["time"]);
		resPromise.then( (response) => { 
			calendar.refreshReservations();
		})
		.catch((error) => {
			calendar.alert = "The selected tenant seems to have already been removed. Please refresh the page to continue!";
			console.log("Promise in remove reservation failed. Check if server is running correctly");
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

		calendar.refreshReservations();
	}

  	calendar.showAddConfirm = (event) => {
	    // Appending dialog to document.body to cover sidenav in docs app
	    var confirm = $mdDialog.confirm()
	      .title('Are you sure you want to add a tenant?')
	      .content('You can always reverse this by removing the tenant.')
	      .ariaLabel('Add Confirmation')
	      .ok('Proceed')
	      .cancel('Go back')
	      .targetEvent(event);
	    $mdDialog.show(confirm).then(function() {
	    	calendar.addReservation();
	      calendar.alert = 'The tenant has been added.';
	    }, function() {
	      calendar.alert = 'The tenant has not been added.';
	    }); 
  }

  	calendar.showRemoveConfirm = (event, index) => {
	    // Appending dialog to document.body to cover sidenav in docs app
	    var confirm = $mdDialog.confirm()
	      .title('Are you sure you want to remove this tenant?')
	      .content('You can always reverse this by adding back the tenant.')
	      .ok('Proceed')
	      .ariaLabel('Remove Confirmation')
	      .cancel('Go back')
	      .targetEvent(event);
	    $mdDialog.show(confirm).then(function() {
	    	calendar.removeReservation(index);
	      calendar.alert = 'The tenant has been removed.';
	    }, function() {
	      calendar.alert = 'The tenant has not been removed.';
	    }); 
  }


  	calendar.dayClicked = (key) => {
  		if (key['isDay'] != "primary")
  		{
  			calendar.viewDays = getViewDays(calendar.curDate.getMonth(), calendar.curYear, calendar.curDate, key['value']);
  		}
	}

	// Controller Scope variables - used in the view directly for laying out the page
	calendar.getServerTime();

	calendar.tenantName = "";
}
})();
