var moment = require('moment');
require('moment-range');

/**
 * Calendar
 * @param options Object
 * @constructor
 */
function Calendar(options)
{
  this.initialize.apply(this, arguments);
}

Calendar.prototype = new (function() {
  var self = this;

  /**
   * Initializes the calendar instance
   * @param options Object
   *
   * **Options**
   *
   * - eventStartDate: (default = 'start') name of the property in event objects containing the start date
   * - eventEndDate: (default = 'end') name of the property in event objects containing the end date
   * - locale: (default = 'en')
   */
  this.initialize = function(options)
  {
    var self = this;

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
    this.year = null;

    /**
     * The starting month (zero based) of this calendar
     * @type Number|null
     */
    this.month = null;

    /**
     * The starting week in the year of this calendar
     * @type Number|null
     */
    this.week = null;

    /**
     * The starting month day of this calendar
     * @type Number|null
     */
    this.date = null;

    /**
     * The starting week day of this calendar
     * @type Number|null
     */
    this.day = null;

    /**
     * The starting hour of this calendar
     * @type Number|null
     */
    this.hour = null;

    /**
     * The starting minute of this calendar
     * @type Number|null
     */
    this.minute = null;

    /**
     * The starting second of this calendar
     * @type Number|null
     */
    this.second = null;

    if (typeof options !== 'object') {
      options = {};
    }

    this.configure(options);

    // mixin a subset of the array methods and map them to the events array
    // TODO: how can we move this into the prototype?
    var methods = ['push', 'pop', 'slice', 'splice', 'shift', 'unshift', 'map', 'filter', 'forEach', 'some', 'every'];

    methods.forEach(function(method) {
      self[method] = function() {
        self.events.sort(sortByStartDate.bind(self));
        return Array.prototype[method].apply(self.events, arguments);
      }
    });
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
    if (event[this.options.eventStartDate]) {
      return moment(event[this.options.eventStartDate]);
    }

    throw new Error('Event has no start date.');
    return null;
  }

  function getEventEnd(event)
  {
    if (event[this.options.eventEndDate]) {
      return moment(event[this.options.eventEndDate]);
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
    var date = moment({year: this.year, month: month });
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
    var date = moment({year: this.year, month: this.month, week: week });
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
    var date = moment({year: this.year, month: this.month, day: date });
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
    var date = moment({year: this.year, month: this.month, week: this.week, weekDay: day });
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
    var date = moment({year: this.year, month: this.month, week: this.week, day: this.date, hour: hour });
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
    var date = moment({year: this.year, month: this.month, week: this.week, day: this.date, hour: this.hour, minute: minute });
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
    var date = moment({year: this.year, month: this.month, week: this.week, day: this.date, hour: this.hour, minute: this.minute, second: second });
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
})();

module.exports = Calendar;