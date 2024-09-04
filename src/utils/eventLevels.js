import findIndex from 'lodash/findIndex'

export function endOfRange({ dateRange, unit = 'day', localizer }) {
  return {
    first: dateRange[0],
    last: localizer.add(dateRange[dateRange.length - 1], 1, unit),
  }
}

// properly calculating segments requires working with dates in
// the timezone we're working                   with, so we use the localizer
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
  // The segmentOffset is necessary when adjusting for timezones
  // ahead of the browser timezone
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

  for (i = 0; i < levels.length; i++) {
    levels[i].sort((a, b) => a.left - b.left) //eslint-disable-line
  }

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
  return events.sort((a, b) => sortEvents(a, b, accessors, localizer))
}
export function sortEvents(eventA, eventB, accessors) {
  // Mapeo de status a prioridad (orden específico)
  const statusPriority = {
    5: 1, // Prioridad más alta
    7: 2,
    2: 3,
    3: 4,
    4: 5,
    19: 6, // Prioridad más baja
  }

  // Obtener la prioridad del status, default a la prioridad más baja si no se encuentra
  const priorityA = statusPriority[eventA.status] || 7
  const priorityB = statusPriority[eventB.status] || 7

  // Ordenar primero por prioridad de status
  if (priorityA !== priorityB) {
    return priorityA - priorityB
  }

  // Si los status son iguales, ordenar por fecha de inicio
  const startA = accessors.start(eventA)
  const startB = accessors.start(eventB)

  return startA.getTime() - startB.getTime()
}
