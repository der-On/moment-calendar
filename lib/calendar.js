var moment = require('moment');
require('moment-range');

function getEventStart(event)
{
  var date = typeof this.options.eventStartDate === 'function' ?
    this.options.eventStartDate(event) : event[this.options.eventStartDate];

  if (date) {
    return moment(date)
  }

  throw new Error('Event has no start date.');
  return null;
}

function getEventEnd(event)
{
  var date = typeof this.options.eventEndDate === 'function' ?
      this.options.eventEndDate(event) : event[this.options.eventEndDate];

  if (date) {
    return moment(date);
  }

  // fallback to start date
  return getEventStart.call(this, event);
}

function filterByRange(range, event)
{
  var start = getEventStart.call(this, event);
  var end = getEventEnd.call(this, event);
  return (start.within(range) || end.within(range) || moment.range(start, end).overlaps(range));
}

function sortByStartDate(a, b)
{
  var start_a = getEventStart.call(this, a);
  var start_b = getEventStart.call(this, b);

  if (start_a.isSame(start_b)) return 0;
  if (start_a.isBefore(start_b)) return -1;
  if (start_a.isAfter(start_b)) return 1;

  return 0;
}

/**
 * Calendar
 * @param start String|Date|Moment|Number - start date of the calendar
 * @param end String|Date|Moment|Number - end date of the calendar
 * @param options Object
 * @constructor
 */
function Calendar(/*start, end, options]*/)
{
  this.initialize.apply(this, arguments);
}

Calendar.prototype = new (function() {
  var self = this;

  /**
   * Initializes the calendar instance
   * @param start String|Date|Moment|Number - start date of the calendar
   * @param end String|Date|Moment|Number - end date of the calendar
   * @param options Object
   *
   * **Options**
   *
   * - eventStartDate: (default = 'start') name of the property in event objects containing the start date
   * - eventEndDate: (default = 'end') name of the property in event objects containing the end date
   * - locale: (default = 'en')
   */
  this.initialize = function(/*[start, end, options]*/)
  {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var options = args.pop() || {};
    var end = args.pop() || null;
    var start = args.pop() || null;

    this.options = {
      eventStartDate: 'start',
      eventEndDate: 'end',
      locale: 'en'
    };

    /**
     * List of events in this calendar
     * @type Array
     */
    this.events = [];

    /**
     * The starting year of this calendar
     * @type Number|null
     */
    this.yearStart = null;

    /**
     * The starting month (zero based) of this calendar
     * @type Number|null
     */
    this.monthStart = null;

    /**
     * The starting week in the year of this calendar
     * @type Number|null
     */
    this.weekStart = null;

    /**
     * The starting month day of this calendar
     * @type Number|null
     */
    this.dateStart = null;

    /**
     * The starting week day of this calendar
     * @type Number|null
     */
    this.dayStart = null;

    /**
     * The starting hour of this calendar
     * @type Number|null
     */
    this.hourStart = null;

    /**
     * The starting minute of this calendar
     * @type Number|null
     */
    this.minuteStart = null;

    /**
     * The starting second of this calendar
     * @type Number|null
     */
    this.secondStart = null;

    if (typeof options !== 'object') {
      options = {};
    }

    this.configure(options);

    if (start) this.setStart(start);
    if (end) this.setEnd(end);
  };

  /**
   * (Re-)Configures the calendar
   * @param options Object
   * @returns this
   */
  this.configure = function(options)
  {
    this.options.locale = options.locale || this.options.locale;
    this.options.eventStartDate = options.eventStartDate || this.options.eventStartDate;
    this.options.eventEndDate = options.eventEndDate || this.options.eventEndDate;

    moment.locale(this.options.locale);

    return this;
  };

  /**
   * Sets the start date of a calendar
   * @param start String|Date|Moment|Number
   * @returns this
   */
  this.setStart = function(start)
  {
    this.start = moment(start);
    if (this.start && this.end) {
      this.range = moment.range(this.start, this.end);
    }

    this.yearStart = this.start.year();
    this.monthStart = this.start.month();
    this.weekStart = this.start.weekYear();
    this.dateStart = this.start.date();
    this.dayStart = this.start.day();
    this.hourStart = this.start.hour();
    this.minuteStart = this.start.minute();
    this.secondStart = this.start.second();

    return this;
  };

  /**
   * Returns start date
   * @returns Moment
   */
  this.getStart = function() {
    return this.start;
  };

  /**
   * Sets the end date of a calendar
   * @param end String|Date|Moment|Number
   * @returns this
   */
  this.setEnd = function(end)
  {
    this.end = moment(end);

    if (this.start && this.end) {
      this.range = moment.range(this.start, this.end);
    }

    return this;
  };

  /**
   * Returns end date
   * @returns Moment
   */
  this.getEnd = function() {
    return this.end;
  };

  /**
   * Finds all events within a date range
   * @param start String|Date|Moment|Number
   * @param end String|Date|Moment|Number
   * @returns Calendar
   */
  this.findInRange = function(start, end)
  {
    var calendar = new Calendar(start, end, this.options);
    calendar.events = this.events.filter(filterByRange.bind(this, calendar.range));
    calendar.events.sort(sortByStartDate.bind(calendar));

    return calendar;
  };

  /**
   * Finds all events in the year of the calendar
   * @param year Number
   * @returns Calendar
   */
  this.findInYear = function(year)
  {
    var date = moment({year: year});
    var start = date.clone().startOf('year');
    var end = date.clone().endOf('year');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the month of the calendar
   * @param month Number
   * @returns Calendar
   */
  this.findInMonth = function(month)
  {
    var date = moment({year: this.yearStart, month: month });
    var start = date.clone().startOf('month');
    var end = date.clone().endOf('month');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the week of the calendar
   * @param week Number
   * @returns Calendar
   */
  this.findInWeek = function(week)
  {
    var date = moment({year: this.yearStart, month: this.monthStart, week: week });
    var start = date.clone().startOf('week');
    var end = date.clone().endOf('week');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the month date of the calendar
   * @param date Number
   * @returns Calendar
   */
  this.findInDate = function(date)
  {
    var date = moment({year: this.yearStart, month: this.monthStart, day: date });
    var start = date.clone().startOf('day');
    var end = date.clone().endOf('day');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the week day of the calendar
   * @param day Number
   * @returns Calendar
   */
  this.findInDay = function(day)
  {
    var date = moment({year: this.yearStart, month: this.monthStart, week: this.weekStart, weekDay: day });
    var start = date.clone().startOf('day');
    var end = date.clone().endOf('day');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the hour of the calendar
   * @param hour Number
   * @returns Calendar
   */
  this.findInHour = function(hour)
  {
    var date = moment({year: this.yearStart, month: this.monthStart, week: this.weekStart, day: this.dateStart, hour: hour });
    var start = date.clone().startOf('hour');
    var end = date.clone().endOf('hour');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the minute of the calendar
   * @param minute Number
   * @returns Calendar
   */
  this.findInMinute = function(minute)
  {
    var date = moment({year: this.yearStart, month: this.monthStart, week: this.weekStart, day: this.dateStart, hour: this.hourStart, minute: minute });
    var start = date.clone().startOf('minute');
    var end = date.clone().endOf('minute');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the minute of the calendar
   * @param second Number
   * @returns Calendar
   */
  this.findInSecond = function(second)
  {
    var date = moment({year: this.yearStart, month: this.monthStart, week: this.weekStart, day: this.dateStart, hour: this.hourStart, minute: this.minuteStart, second: second });
    var start = date.clone().startOf('second');
    var end = date.clone().endOf('second');

    return this.findInRange(start, end);
  };

  /**
   * Returns an array reprasantatino of the calendar events
   * @returns Array
   */
  this.toArray = function()
  {
    var events = this.events.slice();
    events.sort(sortByStartDate.bind(this));
    return events;
  };

  /**
   * Returns the number of events in the calendar
   * @returns Number
   */
  this.length = function()
  {
    return this.events.length;
  };

  /**
   * Returns a calendar within a given year
   * @param year Number
   * @return Calendar
   */
  this.year = this.findInYear;

  /**
   * Returns a list of calendars ranging over a single year
   * @returns Array
   */
  this.years = function()
  {
    var self = this;
    var years = [];
    if (!this.start || !this.end) {
      console.warn('Calendar has no start or end. Please assign them before using years().');
      return years;
    }

    var start = this.start.clone().startOf('year');
    var end = this.end.clone().startOf('year');
    var range = moment().range(start, end);

    range.by('years', function(start) {
      var end = start.clone().endOf('year');
      years.push(self.findInRange(start, end));
    });
    return years;
  };

  /**
   * Returns a calendar within a given month
   * @param month Number
   * @return Calendar
   */
  this.month = this.findInMonth;

  /**
   * Returns a list of calendars ranging over a single month
   * @returns Array
   */
  this.months = function()
  {
    var self = this;
    var months = [];
    if (!this.start || !this.end) {
      console.warn('Calendar has no start or end. Please assign them before using months().');
      return months;
    }
    var start = this.start.clone().startOf('month');
    var end = this.end.clone().startOf('month');
    var range = moment().range(start, end);

    range.by('months', function(start) {
      var end = start.clone().endOf('month');
      months.push(self.findInRange(start, end));
    });
    return months;
  };

  /**
   * Returns a calendar within a given week
   * @param week Number
   * @return Calendar
   */
  this.week = this.findInWeek;

  /**
   * Returns a list of calendars ranging over a single week
   * @returns Array
   */
  this.weeks = function()
  {
    var self = this;
    var weeks = [];
    if (!this.start || !this.end) {
      console.warn('Calendar has no start or end. Please assign them before using weeks().');
      return weeks;
    }
    var start = this.start.clone().startOf('week');
    var end = this.end.clone().startOf('week');
    var range = moment().range(start, end);

    range.by('weeks', function(start) {
      var end = start.clone().endOf('week');
      weeks.push(self.findInRange(start, end));
    });
    return weeks;
  };

  /**
   * Returns a calendar within a given day of the month
   * @param day Number
   * @return Calendar
   */
  this.day = this.findInDate;

  /**
   * Returns a list of calendars ranging over a single day
   * @returns Array
   */
  this.days = function()
  {
    var self = this;
    var days = [];
    if (!this.start || !this.end) {
      console.warn('Calendar has no start or end. Please assign them before using days().');
      return days;
    }
    var start = this.start.clone().startOf('day');
    var end = this.end.clone().startOf('day');
    var range = moment().range(start, end);

    range.by('days', function(start) {
      var end = start.clone().endOf('day');
      days.push(self.findInRange(start, end));
    });
    return days;
  };

  /**
   * Returns a list of calendars ranging over all full weeks of a month
   * @param month Number
   * @returns Array
   */
  this.monthWeeks = function(month)
  {
    var self = this;
    var weeks = [];
    if (!this.start || !this.end) {
      console.warn('Calendar has no start or end. Please assign them before using monthWeeks().');
      return weeks;
    }

    var start = moment({year: this.yearStart, month: month}).startOf('month').startOf('week');
    var end = moment({year: this.yearStart, month: month}).endOf('month').endOf('week');

    return this.findInRange(start, end).weeks();
  };

  /**
   * Sets the events array
   * @param events Array
   * @return this
   */
  this.setEvents = function(events)
  {
    this.events = events;

    return this;
  }
})();

// mixin a subset of the array methods and map them to the events array
var methods = ['push', 'pop', 'slice', 'splice', 'shift', 'unshift', 'map', 'filter', 'forEach', 'some', 'every'];

methods.forEach(function(method) {
  Calendar.prototype[method] = function() {
    this.events.sort(sortByStartDate.bind(this));
    return Array.prototype[method].apply(this.events, arguments);
  }
});

module.exports = Calendar;
