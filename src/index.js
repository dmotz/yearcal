import './style.scss'

const year = 2019
const startOnDayOfWeek = 1
const rowLength = 14
const days = 365
const weekendDays = [0, 6]

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const moons = [21, 19, 21, 19, 18, 17, 16, 15, 14, 13, 12, 12]

const last = a => a[a.length - 1]

const start = new Date(year, 0).getTime()
const dayLen = 1000 * 60 * 60 * 24

const makeDay = (i, isFiller) => {
  if (isFiller) {
    return {
      isFiller: true
    }
  }

  const date = new Date(start + dayLen * i)
  const dayOfWeek = date.getDay()

  return {
    month: date.getMonth(),
    date: date.getDate(),
    dayOfWeek: (dayOfWeek - startOnDayOfWeek + 7) % 7,
    isWeekend: dayOfWeek === weekendDays[0] || dayOfWeek === weekendDays[1]
  }
}

const makeFillers = n => new Array(n).fill().map(() => makeDay(null, true))

const weeks = new Array(days).fill().reduce(
  (a, _, i) => {
    const day = makeDay(i)
    let week = last(a)

    if (i === 0) {
      week.push.apply(week, makeFillers(day.dayOfWeek))
    }

    if (week.length < rowLength) {
      week.push(day)
    } else {
      week = [day]
      a.push(week)
    }

    if (i === days - 1) {
      week.push.apply(week, makeFillers(rowLength - 1 - day.dayOfWeek))
    }
    return a
  },
  [[]]
)

const rowRatio = 7 / rowLength
const onePct = (365 / 7) * rowRatio
let lastRem = 0
let pctN = 0

const container = window.document.getElementById('container')

container.innerHTML = `
  ${weeks
    .map((week, weekN) => {
      let spacerFlex
      let barFlex

      const isFirstWeek = weekN === 0
      const isFinalWeek = weekN === 52 * rowRatio
      const needsPadding = isFirstWeek || isFinalWeek

      if (isFirstWeek) {
        spacerFlex = week.find(d => !d.isFiller).dayOfWeek
        barFlex = rowLength - spacerFlex
      } else if (isFinalWeek) {
        barFlex = week.findIndex(d => d.isFiller)
        spacerFlex = rowLength - barFlex
      }

      const markers = []

      let padRatio = 1

      if (needsPadding) {
        const dayCount = week.filter(d => !d.isFiller).length
        padRatio = rowLength / dayCount
      }

      let nextPct = (lastRem + onePct) * padRatio

      if (lastRem) {
        markers.push([lastRem * padRatio, true])
      }

      while (nextPct <= 100) {
        markers.push([onePct * padRatio, true])
        nextPct += onePct * padRatio
      }

      if (isFinalWeek) {
        last(markers)[0] =
          100 - markers.slice(0, -1).reduce((a, [c]) => a + c, 0)
      } else {
        const rem = 100 - (nextPct - onePct * padRatio)
        markers.push([rem, false])
        lastRem = onePct - rem
      }

      return `
        <div class="week">
          <div class="progress-row">

            ${
              weekN === 0
                ? `<div class="progress-spacer" style="flex: ${spacerFlex}"></div>`
                : ''
            }

            <div class="progress" ${
              needsPadding ? `style="flex: ${barFlex}"` : ''
            }>
              ${markers
                .map(([pct, isLabel]) => {
                  if (pct < 0.1) {
                    if (isLabel) {
                      pctN++
                    }
                    return ''
                  }
                  return `
                    <div class="progress-marker ${
                      pctN % 2 ? 'progress-dark' : ''
                    }" style="width: ${pct}%">${
                    isLabel
                      ? `<div class="progress-label ${
                          pct < 3 ? 'offset' : ''
                        }">${++pctN}</div>`
                      : ''
                  }
                    </div>
                  `
                })
                .join('')}
            </div>
            ${
              isFinalWeek
                ? `<div class="progress-spacer" style="flex: ${spacerFlex}"></div>`
                : ''
            }
          </div>

          <div class="days">
            ${week
              .map(day =>
                day.isFiller
                  ? '<div class="day filler"></div>'
                  : `
                    <div class="day ${day.isWeekend ? 'weekend' : ''}">

                      ${
                        day.date === 1
                          ? `<div class="label month-label">${
                              monthLabels[day.month]
                            }</div>`
                          : `<div class="label date-label">${day.date}</div>`
                      }
                      ${
                        day.date === moons[day.month]
                          ? '<div class="moon"></div>'
                          : ''
                      }
                    </div>
                  `
              )
              .join('')}
            </div>
          </div>
        `
    })
    .join('')}
`
