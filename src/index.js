const year = new Date().getFullYear()
const startOnDayOfWeek = 1
const rowLength = 14
const nDays =
  365 + (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 1 : 0)
const nWeeks = 52
const weekLen = 7
const showMoons = true
const useGradient = true
const elId = 'container'

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

const moons = [
  [17],
  [16],
  [18],
  [16],
  [16],
  [14],
  [13],
  [11],
  [10],
  [9],
  [8],
  [7]
]

const last = a => a[a.length - 1]

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

const color = useGradient ? '#fff' : '#ea4848'
const white = useGradient ? '#000' : '#fff'
const gradientColors = ['#ff984d', '#f0567b', '#9f77ff']
const font = 'Helvetica Neue'
const rowRatio = weekLen / rowLength
const onePct = (nDays / weekLen) * rowRatio
const labelThresh = 3
const dayWidth = 100 / rowLength
const dayHeight = dayWidth * 0.7
const rowMargin = 3
const progressHeight = 2
const forceHairlines = false
const scaleEffect = forceHairlines ? 'vector-effect="non-scaling-stroke"' : ''
const strokeWidth = 0.07
const textStrokeScale = 1
const marginPct = 4
const width = 100 + marginPct * 2
const height =
  (nWeeks * rowRatio + 1) * (dayHeight + progressHeight + rowMargin) +
  marginPct * 2

let lastRem = 0
let pctN = 0

const render = () =>
  `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="
      -${marginPct}
      -${marginPct}
      ${width}
      ${height}
    "
    text-rendering="optimizeLegibility"
  >
  ${
    useGradient
      ? `
        <mask id="mask">
          <rect x="0" y="0" width="${width}" height="${height}" fill="#000"/>
        `
      : ''
  }
  ${weeks
    .map((week, weekN) => {
      const isFirstWeek = weekN === 0
      const isFinalWeek = weekN === nWeeks * rowRatio
      const needsPadding = isFirstWeek || isFinalWeek

      const markers = []

      let fillerDays = 0

      if (needsPadding) {
        fillerDays = week.filter(d => d.isFiller).length
      }

      const xOffset = isFirstWeek ? fillerDays * dayWidth : 0

      let total = isFirstWeek ? xOffset : 0

      if (lastRem) {
        const n = lastRem
        markers.push([0, n, true])
        total += n
      }

      while (total + onePct < 100) {
        const newTotal = total + onePct
        markers.push([total, newTotal, true])
        total = newTotal
      }

      markers.push([total, 100, false])
      lastRem = onePct - (100 - total)

      const width = isFirstWeek
        ? 100 - xOffset
        : isFinalWeek
        ? (rowLength - fillerDays) * dayWidth
        : 100

      const rowHeight = dayHeight + progressHeight

      return `
        <g
          transform="translate(0, ${weekN * rowHeight + rowMargin * weekN})"
        >
          <rect
            width="${width}"
            height="${rowHeight}"
            stroke="${color}"
            stroke-width="${strokeWidth}"
            fill="none"
            ${isFirstWeek ? `x="${xOffset}"` : ''}
            ${scaleEffect}
          />
          <line
            x1="${xOffset}"
            x2="${isFinalWeek ? width : 100}"
            y1="${progressHeight}"
            y2="${progressHeight}"
            stroke="${color}"
            stroke-width="${strokeWidth}"
            ${scaleEffect}
          />
          ${markers
            .map(([start, end, isLabel]) =>
              pctN === 100
                ? ''
                : `
                ${
                  pctN % 2
                    ? `
                      <rect
                        x="${start}"
                        y="0"
                        width="${end - start}"
                        height="${progressHeight}"
                        fill="${color}"
                      />
                      `
                    : ''
                }
                ${
                  isLabel
                    ? end - start < labelThresh
                      ? ++pctN && ''
                      : `
                      <text
                        x="${end - 0.5}"
                        y="${progressHeight - 0.6}"
                        fill="${pctN % 2 ? white : color}"
                        font-family="${font}"
                        font-size="${progressHeight - 0.8}"
                        font-weight="bold"
                        text-anchor="end"
                      >
                        ${++pctN}
                      </text>
                      `
                    : ''
                }
              `
            )
            .join('')}
          ${week
            .map((day, dayN) => {
              const x = dayN * dayWidth
              const isFirst = day.date === 1

              return day.isFiller
                ? ''
                : `
                  ${
                    isFirst
                      ? `
                        <rect
                          x="${x}"
                          y="${progressHeight}"
                          width="${dayWidth}"
                          height="${dayHeight}"
                          fill="${color}"
                        />`
                      : ''
                  }
                  <text
                    x="${x + 1}"
                    y="6"
                    fill="${
                      isFirst
                        ? day.isWeekend
                          ? 'none'
                          : white
                        : day.isWeekend
                        ? 'none'
                        : color
                    }"
                    font-family="${font}"
                    font-size="2"
                    font-weight="bold"
                    ${
                      day.isWeekend
                        ? `
                            stroke="${isFirst ? white : color}"
                            stroke-width="${strokeWidth * textStrokeScale}"
                            letter-spacing="${strokeWidth * textStrokeScale}"
                            ${scaleEffect}
                          `
                        : ''
                    }
                  >
                    ${isFirst ? monthLabels[day.month].toUpperCase() : day.date}
                  </text>
                  ${
                    dayN === 0
                      ? ''
                      : `
                        <line
                          x1="${x}"
                          x2="${x}"
                          y1="${progressHeight}"
                          y2="${rowHeight}"
                          stroke="${color}"
                          stroke-width="${strokeWidth}"
                          ${scaleEffect}
                        />
                      `
                  }
                  ${
                    showMoons && moons[day.month].includes(day.date)
                      ? `
                        <circle
                          r="0.5"
                          cx="${(dayN + 1) * dayWidth - 1.2}"
                          cy="${progressHeight + 1.2}"
                          fill="${isFirst ? white : color}"
                        />
                        `
                      : ''
                  }
                `
            })
            .join('')}
        </g>
        `
    })
    .join('')}
    ${
      useGradient
        ? `
        </mask>
        <defs>
          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            ${gradientColors
              .map(
                (c, i) => `
                <stop
                  stop-color="${c}"
                  offset="${(i / (gradientColors.length - 1)) * 100}%"
                />
              `
              )
              .join('')}
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="${width}"
          height="${height}"
          fill="url(#gradient)"
          mask="url(#mask)"
        />
        `
        : ''
    }
  </svg>
`.replace(/(<.*?>)|\s+/g, (_, s) => (s ? s : ' '))

if (typeof window !== 'undefined') {
  window.document.getElementById(elId).innerHTML = render()
} else {
  console.log(render())
}
