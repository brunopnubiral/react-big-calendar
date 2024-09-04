'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.endOfRange = endOfRange
exports.eventLevels = eventLevels
exports.eventSegments = eventSegments
exports.inRange = inRange
exports.segsOverlap = segsOverlap
exports.sortEvents = sortEvents
exports.sortWeekEvents = sortWeekEvents
var _findIndex = _interopRequireDefault(require('lodash/findIndex'))
function endOfRange(_ref) {
  var dateRange = _ref.dateRange,
    _ref$unit = _ref.unit,
    unit = _ref$unit === void 0 ? 'day' : _ref$unit,
    localizer = _ref.localizer
  return {
    first: dateRange[0],
    last: localizer.add(dateRange[dateRange.length - 1], 1, unit),
  }
}
function eventSegments(event, range, accessors, localizer) {
  var _endOfRange = endOfRange({
      dateRange: range,
      localizer: localizer,
    }),
    first = _endOfRange.first,
    last = _endOfRange.last
  var slots = localizer.diff(first, last, 'day')
  var start = localizer.max(
    localizer.startOf(accessors.start(event), 'day'),
    first
  )
  var end = localizer.min(localizer.ceil(accessors.end(event), 'day'), last)
  var padding = (0, _findIndex.default)(range, function (x) {
    return localizer.isSameDate(x, start)
  })
  var span = localizer.diff(start, end, 'day')
  span = Math.min(span, slots)
  span = Math.max(span - localizer.segmentOffset, 1)
  return {
    event: event,
    span: span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  }
}
function eventLevels(rowSegments) {
  var limit =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity
  var i,
    j,
    seg,
    levels = [],
    extra = []
  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i]
    for (j = 0; j < levels.length; j++) if (!segsOverlap(seg, levels[j])) break
    if (j >= limit) {
      extra.push(seg)
    } else {
      ;(levels[j] || (levels[j] = [])).push(seg)
    }
  }
  // Calculamos left y right sin ordenar, manteniendo el orden original
  levels.forEach(function (level) {
    var runningLeft = 0
    level.forEach(function (seg) {
      seg.left = runningLeft
      seg.right = runningLeft + seg.span
      runningLeft = seg.right
    })
  })
  return {
    levels: levels,
    extra: extra,
  }
}
function inRange(e, start, end, accessors, localizer) {
  var event = {
    start: accessors.start(e),
    end: accessors.end(e),
  }
  var range = {
    start: start,
    end: end,
  }
  return localizer.inEventRange({
    event: event,
    range: range,
  })
}
function segsOverlap(seg, otherSegs) {
  return otherSegs.some(function (otherSeg) {
    return otherSeg.left <= seg.right && otherSeg.right >= seg.left
  })
}
function sortWeekEvents(events, accessors, localizer) {
  // Simplemente devolver los eventos en su orden original
  return events
}
function sortEvents(eventA, eventB, accessors, localizer) {
  // Devolver 0 para mantener el orden original de los eventos
  return 0
}
