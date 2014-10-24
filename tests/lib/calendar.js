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
  }
};

module.exports = tests;