function CalendarGroup(start, end, granularity, events)
{
  this.initialize.apply(this, arguments);
}

CalendarGroup.prototype = new (function() {
  this.initialize = function(start, end, granularity, events)
  {
    this.start = start;
    this.end = end;
    this.granularity = granularity;
    this.events = [];
  }
})();

module.exports = CalendarGroup;