/* 
- app.js
- Contains all core functionality relevant for being presented in the view
- Constitutes the viewmodel layer of the application
*/

(function() {
	"use strict";	// for preventing unintentional variable bleeding &/| hoisting

	angular
		.module("NGCalendarApp", ["ngMaterial"]) 				// injecting ngMaterial as dependency
		.controller("CalendarController", CalendarController)	// main controller for the application
		.service("ApiService", ApiService) 						// main service, responsible for hitting the backend and fetching data via the API
		.constant("ApiBasePath", "http://localhost:3000");		// base API path, good to have this as a one-time constant

	CalendarController.$inject = ["ApiService", "$mdDialog", "$mdToast"];

	function CalendarController(ApiService, $mdDialog, $mdToast) {

		var calendar = this; // for better legibility

		// Controller Scope variables - used in the view directly for laying out the page
		calendar.curDate = new moment().tz("Asia/Dubai");	 
		calendar.curMonth = calendar.curDate.format("MMMM");
		calendar.curYear = calendar.curDate.format("YYYY");
		calendar.tenantName = "";

		// Reservation Promise Function, called upon successful execution of ApiService's getReservations() promise
		function resPromiseFn(response) {
			calendar.resLoaded = true;	// variable responsible for the circular loading bar in remove pane - true means promise has resolved
			var res = response.data["reserved"];
			for (var i = 0; i < res.length; i++) {
				// extract the friendly time from the server's unix timestamp, used while presenting
				res[i]["friendlyTime"] = moment.unix(res[i]["time"]).startOf("day").format("MMMM DD, YYYY");
			}
			// place the final dict on the controller scope
			calendar.reservations = response.data["reserved"];
		}

		// Method responsible for refreshing the reservation list, takes use of the ApiService's getReservations() promise
		calendar.refreshReservations = () => {
			calendar.resLoaded = false; // variable responsible for the circular loading bar in remove pane - false means promise is yet to be resolved
			calendar.reservations = []; // clean the previous reservations on the scope, load afresh
			// find the start and end timestamps of the current month, used as arguments to the ApiService's getReservations() promise
			var startTime = moment(calendar.curDate).startOf("month").unix();
			var endTime = moment(calendar.curDate).endOf("month").unix();
			var promise = ApiService.getReservations(startTime, endTime);
			promise.then(resPromiseFn)
				.catch((error) => {
					// promise couldn't be resolved - something is wrong with server communication
					calendar.alert = "Couldn't fetch data from the server correctly. Please restart server and refresh the page.";
					console.log("resPromise in CalendarController failed. Check if server is running correctly");
					calendar.showAlert();
					calendar.resLoaded = true;
				});
		}

		// Method responsible for adding a tenant to the reservation list, takes use of the ApiService's changeReservation() promise
		calendar.addReservation = () => {
			var promise = ApiService.changeReservation(calendar.tenantName, moment(calendar.curDate).unix(), true);
			promise.then((response) => {
					// Tenant was successfully added
					calendar.refreshReservations();
					calendar.alert = "The tenant has been added.";
					calendar.showAlert();
				})
				.catch((error) => {
					// Tenant was not added, race-condition encountered
					calendar.alert = "The selected date is already under reservation - refreshing view!";
					calendar.showAlert();
					calendar.refreshReservations(); // Refreshing ~ this is for tackling the write-existing race condition. 
													// Even if a failure occurrs due to a booking in another window,
													// the reservations list will be refreshed so as to sync with the current backend state. 
					console.log("Promise in addReservation failed. Check if server is running correctly");
				});
		}

		// Method responsible for removing a tenant from the reservation list, also takes use of the ApiService's changeReservation() promise
		calendar.removeReservation = (index) => {
			var promise = ApiService.changeReservation(calendar.reservations[index]["tennantName"], calendar.reservations[index]["time"], false);
			promise.then((response) => {
					// Tenant was successfully removed
					calendar.refreshReservations();
					calendar.alert = "The tenant has been removed.";
					calendar.showAlert();
				})
				.catch((error) => {
					// Tenant was not removed, race-condition encountered
					calendar.alert = "The selected tenant seems to have already been removed - refreshing view!";
					calendar.showAlert();
					calendar.refreshReservations(); // Refreshing ~ this is for tackling the remove-nonexisting race condition. 
													// Even if a failure occurrs due to a booking in another window, 
													// the reservations list will be refreshed so as to sync with the current backend state. 
					console.log("Promise in removeReservation failed. Check if server is running correctly");
				});
		}

		// Method for updating the calendar view, updates the navigation pane as well as the day-view of the calendar
		// Can also be used for initializing view based on current date if a specific key isn't passed
		calendar.navMonth = (key) => {
			// new month, set the current date to the first of the next/prev month/year based on current state
			var tempDate = new Date(calendar.curDate.format("YYYY"), calendar.curDate.format("M") - 1, 1);
			calendar.curDate = new moment(tempDate);
			calendar.curDate = getNavMonthYear(key, calendar.curDate);
			// update the calendar day-view and refresh the reservation list accordingly
			calendar.viewDays = getViewDays(calendar.curDate);
			calendar.refreshReservations();
			calendar.tenantName = "";
		}

		// Method called whenever a day button is clicked, responsible for updating current day state and styling of current day
		calendar.dayClicked = (key) => {
			if (key["isDay"] != "primary") {
				// ensure that a valid day has been clicked, and update the current date and accent view accordingly
				var tempDate = new Date(calendar.curDate.format("YYYY"), calendar.curDate.format("M") - 1, key["value"]);
				calendar.curDate = new moment(tempDate);
				calendar.viewDays = getViewDays(calendar.curDate, key["value"]);
			}
		}

		// Methods for Confirmation Dialogs 
		calendar.showAddConfirm = (event) => {
			// First check if the tennant name field contains a string name, if not exit directly.
			if (calendar.tenantName == "") {
				calendar.alert = "Please enter a tenant name first.";
				calendar.showAlert();
				return;
			}
			// Raise add confirmation dialog using $mdDialog, show corresponding alerts accordingly
			var confirm = $mdDialog.confirm()
				.title("Are you sure you want to add a tenant?")
				.content("You can always reverse this by removing the tenant.")
				.ariaLabel("Add Confirmation")
				.ok("Proceed")
				.cancel("Go back")
				.targetEvent(event);
			$mdDialog.show(confirm).then(function() {
				calendar.addReservation();
			}, function() {
				calendar.alert = "The tenant has not been added.";
				calendar.showAlert();
			});
		}

		calendar.showRemoveConfirm = (event, index) => {
			// Raise remove confirmation dialog using $mdDialog, show corresponding alerts accordingly
			var confirm = $mdDialog.confirm()
				.title("Are you sure you want to remove this tenant?")
				.content("You can always reverse this by adding back the tenant.")
				.ok("Remove")
				.ariaLabel("Remove Confirmation")
				.cancel("Go back")
				.targetEvent(event);
			$mdDialog.show(confirm).then(function() {
				calendar.removeReservation(index);
			}, function() {
				calendar.alert = "The tenant has not been removed.";
				calendar.showAlert();
			});
		}

		// Method for showing toaster alerts
		calendar.showAlert = function() {
			$mdToast.show(
					$mdToast.simple()
					.textContent(calendar.alert)
					.position('bottom right')
					.hideDelay(3000))
				.then(function() {
					console.log('Toast dismissed.');
				}).catch(function() {
					console.log('Toast failed or was forced to close early by another toast.');
				});
		};
		// Finally, call the navMonth method to initialize everything based on current date.
		calendar.navMonth();
	}
})();