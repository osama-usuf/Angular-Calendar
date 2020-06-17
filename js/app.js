(function() {
	"use strict";

	angular
		.module("NGCalendarApp", ["ngMaterial"]) // injecting ngMaterial as dependency
		.controller("CalendarController", CalendarController) // main controller for the application
		.service("ApiService", ApiService) // main service, responsible for hitting the backend and fetching data via the API
		.constant("ApiBasePath", "http://localhost:3000"); // base API path, good to have this as a one-time constant

	CalendarController.$inject = ["ApiService", "$mdDialog", "$mdToast"];

	function CalendarController(ApiService, $mdDialog, $mdToast) {
		var calendar = this;

		function resPromiseFn(response) {
			calendar.resLoaded = true;
			var res = response.data["reserved"]
			for (var i = 0; i < res.length; i++) {
				res[i]["friendlyTime"] = moment.unix(res[i]["time"]).startOf("day").format("MMMM DD, YYYY");
			}
			calendar.reservations = response.data["reserved"];
		}

		// Methods
		calendar.refreshReservations = () => {
			calendar.resLoaded = false;
			calendar.reservations = [];
			var startTime = moment(calendar.curDate).startOf("month").unix();
			var endTime = moment(calendar.curDate).endOf("month").unix();
			var resPromise = ApiService.getReservations(startTime, endTime);
			resPromise.then(resPromiseFn)
				.catch((error) => {
					calendar.alert = "Couldn't fetch data from the server correctly."
					console.log("resPromise in CalendarController failed. Check if server is running correctly");
					calendar.showAlert();
				});
		}

		calendar.addReservation = () => {
			var promise = ApiService.changeReservation(calendar.tenantName, moment(calendar.curDate).unix(), true);
			promise.then((response) => {
					calendar.refreshReservations();
					calendar.alert = "The tenant has been added.";
					calendar.tenantName = "";
					calendar.showAlert();
				})
				.catch((error) => {
					calendar.alert = "The selected date is already under reservation - refreshing view!";
					calendar.showAlert();
					calendar.refreshReservations(); // Refreshing ~ this is for tackling the write-existing race condition. Even if a failure occurrs due to a booking,	
					// in another window, the reservations list will be refreshed so as to sync with the current backend state. 
					console.log("Promise in add Reservation failed. Check if server is running correctly");
				});
		}

		calendar.removeReservation = (index) => {
			var promise = ApiService.changeReservation(calendar.reservations[index]["tennantName"], calendar.reservations[index]["time"], false);
			promise.then((response) => {
					calendar.refreshReservations();
					calendar.alert = "The tenant has been removed.";
					calendar.showAlert();
				})
				.catch((error) => {
					calendar.alert = "The selected tenant seems to have already been removed - refreshing view!";
					calendar.refreshReservations(); // Refreshing ~ this is for tackling the remove-nonexisting race condition. Even if a failure occurrs due to a booking,	
					// in another window, the reservations list will be refreshed so as to sync with the current backend state. 
					console.log("Promise in remove reservation failed. Check if server is running correctly");
					calendar.showAlert();
				});
		}

		calendar.navMonth = (key) => {
			// Method for updating the calendar view, is fired when nav buttons are clicked

			// Tested Correctly & Completely
			var tempDate = new Date(calendar.curDate.format("YYYY"), calendar.curDate.format("M") - 1, 1);
			calendar.curDate = new moment(tempDate);

			calendar.curDate = getNavMonthYear(key, calendar.curDate);
			calendar.viewDays = getViewDays(calendar.curDate);

			calendar.refreshReservations();
		}

		calendar.showAddConfirm = (event) => {
			// First check if the tennant name field contains a string name
			if (calendar.tenantName == "") {
				calendar.alert = "Please enter a tenant name first."
				calendar.showAlert();
				return;
			}
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
			// Appending dialog to document.body to cover sidenav in docs app
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

		calendar.dayClicked = (key) => {
			if (key["isDay"] != "primary") {
				var tempDate = new Date(calendar.curDate.format("YYYY"), calendar.curDate.format("M") - 1, key["value"]);
				calendar.curDate = new moment(tempDate);
				calendar.viewDays = getViewDays(calendar.curDate, key["value"]);
			}
		}

		calendar.showAlert = function() {

			$mdToast.show(
					$mdToast.simple()
					.textContent(calendar.alert)
					.position('bottom center')
					.hideDelay(3000))
				.then(function() {
					console.log('Toast dismissed.');
				}).catch(function() {
					console.log('Toast failed or was forced to close early by another toast.');
				});
		};
		calendar.curDate = new moment().tz("Asia/Dubai");
		calendar.curMonth = calendar.curDate.format("MMMM");
		calendar.curYear = calendar.curDate.format("YYYY");
		// Controller Scope variables - used in the view directly for laying out the page
		calendar.navMonth();
		calendar.tenantName = "";
	}
})();