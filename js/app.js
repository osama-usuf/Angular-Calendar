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

	function resPromiseFn(response) {
		var res = response.data["reserved"];
		// for (var i=0; i< res.length; i++) {
		// 	res[i]["friendlyTime"] = $filter('date')(res[i]["time"] * 1000, 'dd-MM-yyyy', 'UTC');
		// }
		calendar.reservations = res;
	}

	function timePromiseFn(response) {
		var startTime = response.data["start"];
		var endTime = response.data["end"];
		console.log(startTime, endTime);
		var resPromise = ApiService.getReservations(startTime, endTime);
		resPromise.then(resPromiseFn)
		.catch((error) => {
			calendar.alert = "Couldn't fetch data from the server correctly."
			console.log("resPromise in CalendarController failed. Check if server is running correctly");
		});
	}

	// Methods
	calendar.refreshReservations = () => {
		// var [numDays, _] = getTotalDays(calendar.curDate);
		// var firstDay = new Date(calendar.curYear, calendar.curDate.format('M'), 1);
		// var lastDay = new Date(calendar.curYear, calendar.curDate.format('M'), numDays);

		// // First, fetch the start & end timestamps from the server's /then/:month/:year end-point
		// var timePromise = ApiService.getMonthTime(calendar.curDate.format('M'), calendar.curYear);
		// timePromise.then(timePromiseFn)
		// .catch((error) => {
		// 	calendar.alert = "Couldn't Fetch Time Data From the Server Correctly.";
		// 	console.log("timePromise in CalendarController failed. Check if server is running correctly");
		// });
	}

	calendar.addReservation = () => {
		var promise = ApiService.addReservation(calendar.tenantName, dateToUNIXTime(calendar.curDate, 0));
		promise.then( (response) => { 
			calendar.refreshReservations();
		})
		.catch((error) => {
			calendar.alert = "The selected date is already under reservation - refreshing view!";
			calendar.refreshReservations(); // Refreshing ~ this is for tackling the write-existing race condition. Even if a failure occurrs due to a booking,	
											// in another window, the reservations list will be refreshed so as to sync with the current backend state. 
			console.log("Promise in add Reservation failed. Check if server is running correctly");
		});
	}

	calendar.removeReservation = (index) => {
		var promise = ApiService.removeReservation(calendar.reservations[index]["tennantName"], calendar.reservations[index]["time"]);
		promise.then( (response) => { 
			calendar.refreshReservations();
		})
		.catch((error) => {
			calendar.alert = "The selected tenant seems to have already been removed - refreshing view!";
			calendar.refreshReservations(); // Refreshing ~ this is for tackling the remove-nonexisting race condition. Even if a failure occurrs due to a booking,	
											// in another window, the reservations list will be refreshed so as to sync with the current backend state. 
			console.log("Promise in remove reservation failed. Check if server is running correctly");
		});
	}

	calendar.navMonth = (key) => {
		// Method for updating the calendar view, is fired when nav buttons are clicked

		// Tested Correctly & Completely
		var tempDate = new Date(calendar.curDate.format('YYYY'), calendar.curDate.format('M') - 1, 1);
		calendar.curDate = new moment(tempDate);

		calendar.curDate = getNavMonthYear(key, calendar.curDate);
		calendar.viewDays = getViewDays(calendar.curDate);

		// var [numDays, _] = getTotalDays(calendar.curDate);
		// calendar.firstDay = new Date(calendar.curYear, calendar.curDate.format('M'), 1);
		// calendar.lastDay = new Date(calendar.curYear, calendar.curDate.format('M'), numDays);

		calendar.refreshReservations();
	}

  	calendar.showAddConfirm = (event) => {
	    // First check if the tennant name field contains a string name
	    if (calendar.tenantName == "") {
	    	calendar.alert = 'Please enter a tenant name first.'
	    	return;
	    }
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
  			var tempDate = new Date(calendar.curDate.format('YYYY'), calendar.curDate.format('M') - 1, key['value']);
  			calendar.curDate = new moment(tempDate);
  			calendar.viewDays = getViewDays(calendar.curDate, key['value']);
  		}
	}

	var locale = 'Asia/Dubai';
	calendar.curDate = new moment();
	console.log(moment.unix(calendar.curDate).tz(locale).startOf('day').format('YYY-MM-DD HH:mm'));
	calendar.curMonth = calendar.curDate.format('MMMM');
	calendar.curYear = calendar.curDate.format('YYYY');
	// Controller Scope variables - used in the view directly for laying out the page
	calendar.navMonth();
	calendar.tenantName = "";
}
})();
