import './style.scss'

const year = 2019
const startOnDay = 1
const days = 365

const start = new Date(year, 0).getTime()
const dayLen = 1000 * 60 * 60 * 24

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

const makeDay = (i, isFiller) => {
  if (isFiller) {
    return {
      isFiller: true
    }
  }

  const date = new Date(start + dayLen * i)

  return {
    month: date.getMonth(),
    date: date.getDate(),
    dayOfWeek: (date.getDay() - startOnDay + 7) % 7
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

    if (week.length < 7) {
      week.push(day)
    } else {
      week = [day]
      a.push(week)
    }

    if (i === days - 1) {
      week.push.apply(week, makeFillers(6 - day.dayOfWeek))
    }
    return a
  },
  [[]]
)

const onePct = 365 / 7
let lastRem = 0
let pctN = 0

const container = window.document.getElementById('container')

container.innerHTML = `
  ${weeks
    .map((week, weekN) => {
      let spacerFlex
      let barFlex

      const needsPadding = weekN === 0 || weekN === 52

      if (weekN === 0) {
        spacerFlex = week.find(d => !d.isFiller).dayOfWeek
        barFlex = 7 - spacerFlex
      } else if (weekN === 52) {
        barFlex = week.findIndex(d => d.isFiller)
        spacerFlex = 7 - barFlex
      }

      const markers = []

      if (weekN === 52) {
        markers.push([100, true])
      } else {
        if (lastRem) {
          markers.push([lastRem, true])
        }

        let nextPct = lastRem + onePct
        let padRatio = 1

        if (weekN === 0) {
          const dayCount = week.filter(d => !d.isFiller).length
          padRatio = 7 / dayCount
          nextPct *= padRatio
        }

        if (nextPct <= 100) {
          const rem = 100 - nextPct
          markers.push([onePct * padRatio, true])
          markers.push([rem, false])
          lastRem = onePct - rem / padRatio
        } else {
          markers.push([100 - lastRem, false])
          lastRem = onePct - (100 - lastRem)
        }
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
              weekN === 52
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
                  <div class="day">

                    ${
                      day.date === 1
                        ? `<div class="label month-label">${monthLabels[
                            day.month
                          ] +
                            ' ' +
                            day.date}</div>`
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
