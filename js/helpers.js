function getDayName(day)
{
	// Useful for mapping integers in [0-6] to actual day names
	var day = new Date(1, 1, day+3).toLocaleDateString('default', { weekday: 'long' });
	return day.slice(0, 3);
}

function getTotalDays(month, year)
{
	// Given month & year, outputs the total number of days
	// in that particular month and the offset for the first day
	// (month, year) -> (numDays, firstDay)
	var firstDay = new Date(year, month, 1).getDay();
	var numDays = 32 - new Date(year, month, 32).getDate();
	return {'numDays': numDays, 'firstDay': firstDay}
}


function getViewDays(month, year)
{
	var totalDays_curView  = getTotalDays(month, year); 
	var nextMonth = month; var prevMonth = month;
	var nextYear =   year; var prevYear  = year;

 	// Edge cases for next/prev years 
	if 		(month ==  0) 	{ prevYear -= 1; }
	else if (month == 11)	{ nextYear += 1; }

	nextMonth = (nextMonth + 1) % 12;
	prevMonth = (((prevMonth - 1) % 12) + 12) % 12;

	var totalDays_prevView = getTotalDays(prevMonth, prevYear);
	var totalDays_nextView = getTotalDays(nextMonth, nextYear);

	// Figure out initial padding required

	// Create the final view array

	var initPadding = totalDays_curView['firstDay'];
	var arrSize = initPadding + totalDays_curView['numDays'];
	var daysArr = [];

	// Initial Array padding
	for (var i=0; i < initPadding; i++) {
		daysArr.push({'value':totalDays_prevView['numDays']- (initPadding-i) + 1,
					  'disabled': true, 
					  'reserved': false});
	}
	// Populate current month's days
	for (var i=0; i < totalDays_curView['numDays']; i++) {
		daysArr.push({'value':totalDays_curView['numDays'] - (totalDays_curView['numDays'] - i) + 1,
					  'disabled': false, 
					  'reserved': false});
	}
	// Populate final array padding
	var i = 1;
	while (daysArr.length % 7 != 0) {
		daysArr.push({'value':i++,
					  'disabled': true, 
					  'reserved': false});
	}

	// Appending day names for final presenting
	var newArr = [];
	var tempDays = [];
	for (var i=0; i< 7; i++) {
		tempDays.push({'value':getDayName(tempDays.length),
				     'disabled': false,
				      'isDay': 'primary'});
	}
	newArr.push(tempDays);
	while(daysArr.length) {
		newArr.push(daysArr.splice(0, 7));
	}
	return newArr;
}