/* 
- helpers.js
- Consists of essential helper functions that are only implicitly used by core functions from the calendar controller's scope
*/

function getDayName(day) {
	// Useful for mapping integers in [0-6] to their actual names, used in listToMatrix()
	var day = new Date(1, 1, day + 3).toLocaleDateString('default', {
		weekday: 'long'
	});
	return day.slice(0, 3); // Returns only the first three letters of the day name
}

function getTotalDays(oldDate) {
	// Given month & year, outputs the total number of days in that particular month and the offset for the first day
	var date = new moment(oldDate);
	var firstDay = date.startOf('month').format('d');
	var numDays = date.daysInMonth();
	return [numDays, firstDay];
}

function getNavMonthYear(key, oldDate) {
	// Based on input key (1 for next, -1 for prev), outputs the corresponding new navigation date
	var date = new moment(oldDate);
	if (key != 1 && key != -1) return date;
	var date = date.add(key, 'months');
	return date;
}

function listToMatrix(daysArr) {
	// Converts the flat input list (from getViewDays()) into a 2D week-wise matrix, helps better layout the calendar 
	var newArr = [];
	var tempDays = [];
	for (var i = 0; i < 7; i++) {
		// Appending day names against each week, Sunday (0) through Saturday (7)
		tempDays.push({
			'value': getDayName(tempDays.length),
			'disabled': false,
			'isDay': 'primary'
		});
	}
	newArr.push(tempDays);
	while (daysArr.length) {
		// Pushing view days from input daysArr to the final newArr in chunks of 7
		newArr.push(daysArr.splice(0, 7));
	}
	return newArr;
}

function getViewDays(date, value = 1) {
	// Responsible for presenting array-level information of the days to be displayed
	// based on the input month, year, and value (day)

	var accent; // variable used for accenting selected date
	// variables to be used for populating the current month's viewDays
	var nextMonth = getNavMonthYear(1, date);
	var prevMonth = getNavMonthYear(-1, date);
	var [totalDays_curView, firstDay_curView] = getTotalDays(date);
	var [totalDays_prevView, firstDay_prevView] = getTotalDays(prevMonth);
	var [totalDays_nextView, firstDay_nextView] = getTotalDays(nextMonth);

	// daysArr -> 1D array to be filled with current viewDays
	// Key Descriptions :	
	// 'value': The DD component of the date
	// 'disabled': Bool for ensuring only current month's days are enabled
	// 'selected': Bool for ensuring the selected day is accented correctly in the view

	var initPadding = firstDay_curView; // initial days from prev month
	var daysArr = [];
	// Figure out initial padding required in the calendar day-display
	// This is equivalent to figuring out how many days from the previous month's last week line up with the current month's first week
	// Populate prev month's days - initial array padding
	for (var i = 0; i < initPadding; i++) {
		daysArr.push({
			'value': totalDays_prevView - (initPadding - i) + 1,
			'disabled': true
		});
	}
	// Populate current month's days, just append the total days of this month to the array so far
	for (var i = 0; i < totalDays_curView; i++) {
		if (i == value - 1) accent = "accent";
		else accent = "no-accent"; // use the input value to accent the current selected day
		// later interpolated in view
		daysArr.push({
			'value': totalDays_curView - (totalDays_curView - i) + 1,
			'disabled': false,
			'selected': accent
		});
	}
	// Populate final array padding based on remaining days
	var i = 1;
	const numDays = 7;
	const numWeeks = 6;
	while (daysArr.length < numDays * numWeeks) {
		// for consistency, const numDays*num ensures that we'll never underflow the total day count of the viewDays, 
		// this ensures fixed calendar size in the final view 
		daysArr.push({
			'value': i++,
			'disabled': true
		});
	}
	return listToMatrix(daysArr);
}