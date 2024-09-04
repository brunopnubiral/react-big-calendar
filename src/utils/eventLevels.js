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
  let i, j, seg, levels = [], extra = []
  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i]
    for (j = 0; j < levels.length; j++)
      if (!segsOverlap(seg, levels[j])) break
    if (j >= limit) {
      extra.push(seg)
    } else {
      (levels[j] || (levels[j] = [])).push(seg)
    }
  }
  // Calculamos left y right sin ordenar, manteniendo el orden original
  levels.forEach(level => {
    let runningLeft = 0
    level.forEach(seg => {
      seg.left = runningLeft
      seg.right = runningLeft + seg.span
      runningLeft = seg.right
    })
  })
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
  const base = [...events];
  const multiDayEvents = [];
  const standardEvents = [];
  base.forEach((event) => {
    const startCheck = accessors.start(event);
    const endCheck = accessors.end(event);
    if (localizer.daySpan(startCheck, endCheck) > 1) {
      multiDayEvents.push(event);
    } else {
      standardEvents.push(event);
    }
  });
  // Mantener el orden original de los eventos de varios días
  const multiSorted = multiDayEvents.sort((a, b) => {
    const indexA = events.indexOf(a);
    const indexB = events.indexOf(b);
    return indexA - indexB;
  });
  // Mantener el orden original de los eventos estándar
  const standardSorted = standardEvents.sort((a, b) => {
    const indexA = events.indexOf(a);
    const indexB = events.indexOf(b);
    return indexA - indexB;
  });
  return [...multiSorted, ...standardSorted];
}

export function sortEvents(eventA, eventB, accessors, localizer) {
  // Return 0 to maintain the original order of events
  return 0
}
