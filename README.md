# Moment Calendar

Provides queryable calendar data structure.

Based on [moment.js](http://momentjs.com).

## Install

```bash
$ npm install moment-calendar
```

## Usage

```javascript
var Calendar = require('moment-calendar');

var calendar = new Calendar({
  // name of the property in event objects containing the start date
  eventStartDate: 'start',
  // name of the property in event objects containing the end date
  eventEndDate: 'end',
  // locale
  locale: 'en'
});

// you can reconfigure an existing calendar
calendar.configure({
  eventStartDate: 'from',
  eventEndDate: 'to',
  locale: 'de'
});

var event = {
  start: new Date(), // begins now
  end: (new Date()).getTime() + (1000 * 60 * 60 * 24) // ends in one day
};

// calendar is an array like object
calendar.push(event);

// returns new calendar containing events within the year 2014
var eventsIn2014 = calendar.findInYear(2014);

// events are always sorted by theire start date

// by chaining you can get as granular as you need
var events = calendar.findInYear(2014).findInMonth(5).findInDate(20);

// you can also query ranges, a new calendar is returned
var eventsInRange = calendar.findInRange('2013-01-01', '2013-12-31');

// returns a list of months, the list items are calendar instances too
var months = calendar.months(2014);

months.forEach(function(month, i) {
  // list of weeks within the month
  var weeks = month.weeks();
  
  weeks.forEach(function(week, i) {
    // list of days within the month
    var days = week.days();
    
    days.forEach(function(day, i) {
      // list of hours within the day
      var hours = day.hours();
      
      hours.forEach(function(hour, i) {
        // list of events within the hour
        var events = day.events();
      });    	
    });
  });
});
```