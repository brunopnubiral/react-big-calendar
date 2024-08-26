import findIndex from 'lodash/findIndex'

export function endOfRange({ dateRange, unit = 'day', localizer }) {
  return {
    first: dateRange[0],
    last: localizer.add(dateRange[dateRange.length - 1], 1, unit),
  }
}

export function eventSegments(event, range, accessors, localizer) {
  let { first, last } = endOfRange({ dateRange: range, localizer })
  let slots = localizer.diff(first, last, 'day')
  let start = localizer.max(
    localizer.startOf(accessors.start(event), 'day'),
    first
  )
  let end = localizer.min(localizer.ceil(accessors.end(event), 'day'), last)
  let padding = findIndex(range, (x) => localizer.isSameDate(x, start))
  let span = localizer.diff(start, end, 'day')
  span = Math.min(span, slots)
  span = Math.max(span - localizer.segmentOffset, 1)
  return {
    event,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  }
}

export function eventLevels(rowSegments, limit = Infinity) {
  let i,
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
  // Removing the sorting of levels to maintain original order
  // for (i = 0; i < levels.length; i++) {
  //   levels[i].sort((a, b) => a.left - b.left)
  // }
  return { levels, extra }
}

export function inRange(e, start, end, accessors, localizer) {
  const event = {
    start: accessors.start(e),
    end: accessors.end(e),
  }
  const range = { start, end }
  return localizer.inEventRange({ event, range })
}

export function segsOverlap(seg, otherSegs) {
  return otherSegs.some(
    (otherSeg) => otherSeg.left <= seg.right && otherSeg.right >= seg.left
  )
}

export function sortWeekEvents(events, accessors, localizer) {
  // Simply return the events in their original order
  return events
}

export function sortEvents(eventA, eventB, accessors, localizer) {
  // Return 0 to maintain the original order of events
  return 0
}
