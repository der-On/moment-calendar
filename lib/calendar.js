var moment = require('moment');
require('moment-range');

function Calendar(options)
{
  this.initialize.apply(this, arguments);
}

Calendar.prototype = new (function() {
  var self = this;

  this.initialize = function(options)
  {
    var self = this;

    this.options = {
      eventStartDate: 'start',
      eventEndDate: 'end',
      locale: 'en'
    };

    this.events = [];
    this.year = null;
    this.month = null;
    this.week = null;
    this.date = null;
    this.day = null;
    this.hour = null;
    this.minute = null;
    this.second = null;

    if (typeof options !== 'object') {
      options = {};
    }

    this.configure(options);

    // mixin a subset of the array methods and map them to the events array
    var methods = ['push', 'pop', 'slice', 'splice', 'shift', 'unshift', 'map', 'filter', 'forEach', 'some', 'every'];

    methods.forEach(function(method) {
      self[method] = function() {
        self.events.sort(sortByStartDate.bind(self));
        return Array.prototype[method].apply(self.events, arguments);
      }
    });
  };

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

    this.year = this.start.year();
    this.month = this.start.month();
    this.week = this.start.weekYear();
    this.date = this.start.date();
    this.day = this.start.day();
    this.hour = this.start.hour();
    this.minute = this.start.minute();
    this.second = this.start.second();

    return this;
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

  function getEventStart(event)
  {
    return moment(event[this.options.eventStartDate]);
  }

  function getEventEnd(event)
  {
    return moment(event[this.options.eventEndDate]);
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
   * Finds all events within a date range
   * @param start String|Date|Moment|Number
   * @param end String|Date|Moment|Number
   * @returns Calendar
   */
  this.findInRange = function(start, end)
  {
    var calendar = new Calendar(this.options);
    calendar.setStart(start);
    calendar.setEnd(end);
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
    var date = new Date(year, 0, 1, 0, 0, 0, 0);
    var start = moment(date).startOf('year');
    var end = moment(date).endOf('year');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the month of the calendar
   * @param month Number
   * @returns Calendar
   */
  this.findInMonth = function(month)
  {
    var date = moment({year: this.year, month: month });
    var start = moment(date).startOf('month');
    var end = moment(date).endOf('month');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the week of the calendar
   * @param week Number
   * @returns Calendar
   */
  this.findInWeek = function(week)
  {
    var date = moment({year: this.year, month: this.month, week: week });
    var start = moment(date).startOf('week');
    var end = moment(date).endOf('week');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the month date of the calendar
   * @param date Number
   * @returns Calendar
   */
  this.findInDate = function(date)
  {
    var date = moment({year: this.year, month: this.month, day: date });
    var start = moment(date).startOf('day');
    var end = moment(date).endOf('day');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the week day of the calendar
   * @param day Number
   * @returns Calendar
   */
  this.findInDay = function(day)
  {
    var date = moment({year: this.year, month: this.month, week: this.week, weekDay: day });
    var start = moment(date).startOf('day');
    var end = moment(date).endOf('day');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the hour of the calendar
   * @param hour Number
   * @returns Calendar
   */
  this.findInHour = function(hour)
  {
    var date = moment({year: this.year, month: this.month, week: this.week, day: this.date, hour: hour });
    var start = moment(date).startOf('hour');
    var end = moment(date).endOf('hour');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the minute of the calendar
   * @param minute Number
   * @returns Calendar
   */
  this.findInMinute = function(minute)
  {
    var date = moment({year: this.year, month: this.month, week: this.week, day: this.date, hour: this.hour, minute: minute });
    var start = moment(date).startOf('minute');
    var end = moment(date).endOf('minute');

    return this.findInRange(start, end);
  };

  /**
   * Finds all events in the minute of the calendar
   * @param second Number
   * @returns Calendar
   */
  this.findInSecond = function(second)
  {
    var date = moment({year: this.year, month: this.month, week: this.week, day: this.date, hour: this.hour, minute: this.minute, second: second });
    var start = moment(date).startOf('second');
    var end = moment(date).endOf('second');

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
})();

module.exports = Calendar;