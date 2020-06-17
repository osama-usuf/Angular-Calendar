function getDayName(day)
{
	// Useful for mapping integers in [0-6] to actual day names
	var day = new Date(1, 1, day+3).toLocaleDateString('default', { weekday: 'long' });
	return day.slice(0, 3);
}

function getTotalDays(oldDate)
{
	// Given month & year, outputs the total number of days
	// in that particular month and the offset for the first day
	// (month, year) -> (numDays, firstDay)
	var date = new moment(oldDate);
	var firstDay = date.startOf('month').format('d');
	var numDays = date.daysInMonth();
	return [numDays, firstDay]
}

function getNavMonthYear(key, oldDate)
{
	var date = new moment(oldDate);
	if (key != 1 && key != -1) return date;
	var date = date.add(key, 'months');
	return date;
}

function listToMatrix(daysArr) 
{
	// Appending day names for final presenting
	var newArr = [];
	var tempDays = [];
	for (var i=0; i< 7; i++) {
		tempDays.push({'value': getDayName(tempDays.length), 'disabled': false, 'isDay': 'primary'});
	}
	newArr.push(tempDays);
	while(daysArr.length) {
		newArr.push(daysArr.splice(0, 7));
	}
	return newArr;
}

function getViewDays(date, value = 1)
{
	//var date = new moment(oldDate); // changing oldDate to date and commenting this line fixes the issue for now
	var accent = "no-accent";

	var nextMonth = getNavMonthYear(1, date);
	var prevMonth = getNavMonthYear(-1, date);

	var [totalDays_curView, firstDay_curView]  = getTotalDays(date); 
	var [totalDays_prevView, firstDay_prevView] = getTotalDays(prevMonth);
	var [totalDays_nextView, firstDay_nextView] = getTotalDays(nextMonth);

	// Figure out initial padding required
	var initPadding = firstDay_curView;
	var arrSize = initPadding + totalDays_curView;
	var daysArr = [];

	// Initial Array padding
	for (var i=0; i < initPadding; i++) {
		daysArr.push({'value':totalDays_prevView - (initPadding-i) + 1, 'disabled': true, 'reserved': false});
	}
	// Populate current month's days
	for (var i=0; i < totalDays_curView; i++) {
		if (i == value - 1) accent = "accent"; else accent = "no-accent";
		daysArr.push({'value':totalDays_curView - (totalDays_curView-i) + 1, 'disabled': false, 'reserved': false, 'selected': accent});
	}
	// Populate final array padding
	var i = 1;
	while (daysArr.length % 7 != 0 || daysArr.length < 7*6) {
		console.log(daysArr.length)
		daysArr.push({'value':i++, 'disabled': true, 'reserved': false});
	}
	return listToMatrix(daysArr);
}