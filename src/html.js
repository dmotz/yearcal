import './style.scss'

const year = 2019
const startOnDayOfWeek = 1
const rowLength = 14
const nDays =
  365 + (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 1 : 0)
const nWeeks = 52
const weekLen = 7

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

const now = new Date()
const start = new Date(year, 0).getTime()
const dayLen = 1000 * 60 * 60 * 24

const makeDay = (i, isFiller) => {
  if (isFiller) {
    return {isFiller}
  }

  const date = new Date(start + dayLen * i)
  const dayOfWeek = date.getDay()

  return {
    fullDate: date,
    month: date.getMonth(),
    date: date.getDate(),
    dayOfWeek: (dayOfWeek - startOnDayOfWeek + weekLen) % weekLen,
    isWeekend: dayOfWeek === weekendDays[0] || dayOfWeek === weekendDays[1]
  }
}

const makeFillers = n => new Array(n).fill().map(() => makeDay(null, true))

const weeks = new Array(nDays).fill().reduce(
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

    if (i === nDays - 1) {
      week.push.apply(week, makeFillers(rowLength - 1 - day.dayOfWeek))
    }
    return a
  },
  [[]]
)

const rowRatio = weekLen / rowLength
const onePct = (nDays / weekLen) * rowRatio
let lastRem = 0
let pctN = 0

const container = window.document.getElementById('container')
const barThresh = 0.1
const labelThresh = 3

container.innerHTML = `
  ${weeks
    .map((week, weekN) => {
      const isFirstWeek = weekN === 0
      const isFinalWeek = weekN === nWeeks * rowRatio
      const needsPadding = isFirstWeek || isFinalWeek

      let spacerFlex
      let barFlex

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
                  if (pct < barThresh) {
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
                          pct < labelThresh ? 'offset' : ''
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
                    <div class="day ${day.isWeekend ? 'weekend' : ''} ${
                      day.fullDate < now ? 'past' : ''
                    }">

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
