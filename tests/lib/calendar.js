var Calendar = require('../../index');
var assert = require('assert');

var tests = {
  'creating Calendar': function() {
    assert.doesNotThrow(function() {
      var calendar = new Calendar();
    });
  },
  'using array methods': function() {
    var calendar = new Calendar();

    var now = (new Date()).getTime();

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: now + (i * 3600),
        end: now + (i * 3600) + 3600,
        id: i + 1
      });
    }

    assert.equal(calendar.events.length, 10);

    var event = calendar.shift();
    assert.strictEqual(event.id, 1);
    assert.equal(calendar.events.length, 9);

    event = calendar.pop();
    assert.strictEqual(event.id, 10);
    assert.equal(calendar.events.length, 8);
  },
  'length()': function() {
    var calendar = new Calendar();

    var now = (new Date()).getTime();

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: now + (i * 3600),
        end: now + (i * 3600) + 3600,
        id: i + 1
      });
    }

    assert.equal(calendar.length(), 10);
  },
  'sort by start date': function() {
    var calendar = new Calendar();

    var now = (new Date()).getTime();

    for(var i = 9; i >= 0; i--) {
      calendar.push({
        start: now + (i * 3600),
        end: now + (i * 3600) + 3600,
        id: 10 - i
      });
    }

    var events = calendar.toArray().reverse();

    // events should have been sorted by date now
    events.forEach(function(event, i) {
      assert.equal(event.id, i + 1);
    });
  },
  'findInRange()': function() {
    var calendar = new Calendar();

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: (2000 + i) + '-01-01T00:00:00Z',
        end: (2005 + i) + '-01-01T00:00:00Z',
        id: i + 1
      });
    }

    var results = calendar.findInRange('2009-01-01T00:00:00Z', '2010-01-01T00:00:00Z');
    assert.equal(results.length(), 6);

    results.forEach(function(event, i) {
      assert.equal(event.id, i + 5);
    });
  },
  'findInRange() with eventStartDate and eventEndDate as functions': function() {
    var calendar = new Calendar({
      eventStartDate: function(event) { return event.start; },
      eventEndDate: function(event) { return event.end; }
    });

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: (2000 + i) + '-01-01T00:00:00Z',
        end: (2005 + i) + '-01-01T00:00:00Z',
        id: i + 1
      });
    }

    var results = calendar.findInRange('2009-01-01T00:00:00Z', '2010-01-01T00:00:00Z');
    assert.equal(results.length(), 6);

    results.forEach(function(event, i) {
      assert.equal(event.id, i + 5);
    });
  },
  'findInYear()': function()
  {
    var calendar = new Calendar();

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: (2000 + i) + '-01-01T00:00:00Z',
        end: (2005 + i) + '-01-01T00:00:00Z',
        id: i + 1
      });
    }

    var results = calendar.findInYear(2010);
    assert.equal(results.length(), 5);

    results.forEach(function(event, i) {
      assert.equal(event.id, i + 6);
    });
  },
  'findInMonth()': function()
  {
    var calendar = new Calendar();

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: (2000 + i) + '-01-01T00:00:00Z',
        end: (2005 + i) + '-01-01T00:00:00Z',
        id: i + 1
      });
    }

    calendar.push({
      start: '2016-06-01T00:00:00Z',
      end: '2016-06-02T00:00:00Z',
      id: 11
    });

    var results = calendar.findInYear(2016).findInMonth(5);

    assert.equal(results.length(), 1);
    assert.equal(results.toArray()[0].id, 11);
  },
  'findInDate()': function() {
    var calendar = new Calendar();

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: (2000 + i) + '-01-01T00:00:00Z',
        end: (2005 + i) + '-01-01T00:00:00Z',
        id: i + 1
      });
    }

    calendar.push({
      start: '2016-06-10T00:00:00Z',
      end: '2016-06-12T00:00:00Z',
      id: 11
    });

    calendar.push({
      start: '2016-06-05T00:00:00Z',
      end: '2016-06-07T00:00:00Z',
      id: 12
    });

    var results = calendar.findInYear(2016).findInMonth(5).findInDate(10);

    assert.equal(results.length(), 1);
    assert.equal(results.toArray()[0].id, 11);
  },
  'years()': function() {
    var calendar = new Calendar();
    calendar.setStart('2000-01-01T00:00:00Z');
    calendar.setEnd('2009-11-31T23:59:59Z');

    for(var i = 0; i < 10; i++) {
      calendar.push({
        start: (2000 + i) + '-01-01T00:00:00Z',
        id: i + 1
      });
    }

    var years = calendar.years();
    assert.equal(years.length, 10);

    years.forEach(function(year, i) {
      assert.equal(year.length(), 1);
      assert.equal(year.toArray()[0].id, i + 1);
    });
  },
  'months()': function() {
    var calendar = new Calendar();
    calendar.setStart('2000-01-01T00:00:00Z');
    calendar.setEnd('2000-11-31T23:59:59Z');

    for(var i = 0; i < 12; i++) {
      calendar.push({
        start: {year: 2000, month: i },
        id: i + 1
      });
    }

    var months = calendar.months();
    assert.equal(months.length, 12);

    months.forEach(function(month, i) {
      assert.equal(month.length(), 1);
      assert.equal(month.toArray()[0].id, i + 1);
    });
  },
  'weeks()': function() {
    var calendar = new Calendar();
    calendar.setStart('2014-01-01T00:00:00Z');
    calendar.setEnd('2014-01-31T23:59:59Z');

    for(var i = 0; i < 6; i++) {
      calendar.push({
        start: {year: 2014, month: 0, day: i * 7 },
        id: i + 1
      });
    }

    var weeks = calendar.weeks();
    assert.equal(weeks.length, 5);

    weeks.forEach(function(week, i) {
      assert.equal(week.length(), 1);
      assert.equal(week.toArray()[0].id, i + 1);
    });
  },
  'days()': function() {
    var calendar = new Calendar();
    calendar.setStart('2014-01-01T00:00:00Z');
    calendar.setEnd('2014-01-11T23:59:59Z');

    for(var i = 0; i < 12; i++) {
      calendar.push({
        start: {year: 2014, month: 0, day: i + 1 },
        id: i + 1
      });
    }

    var days = calendar.days();
    assert.equal(days.length, 12);

    days.forEach(function(day, i) {
      assert.equal(day.length(), 1);
      assert.equal(day.toArray()[0].id, i + 1);
    });
  },
  'monthWeeks': function()
  {
    var calendar = new Calendar();
    calendar.setStart('2014-01-01T00:00:00Z');
    calendar.setEnd('2014-01-31T23:59:59Z');

    for(var i = 0; i < 6; i++) {
      calendar.push({
        start: {year: 2014, month: 0, day: i * 7 },
        id: i + 1
      });
    }

    var weeks = calendar.monthWeeks(0);
    assert.equal(weeks.length, 5);

    weeks.forEach(function(week, i) {
      assert.equal(week.length(), 1);
      assert.equal(week.toArray()[0].id, i + 1);
    });
  }
};

module.exports = tests;