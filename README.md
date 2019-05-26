# YearCal

### My loose grasp on time

### or: A yearlong calendar in one percent increments

by [Dan Motzenbecker](https://oxism.com)

---

`yearcal.svg` is ready to print. To customize the calendar, read the section
below.

## DIY

To generate your own SVG file, run the `index` script and redirect its output to
a file:

```shell
$ node src/index.js > cal.svg
```

You can also open `index.html` in a browser. `src/html.js` contains an
alternative version that renders the calendar with HTML nodes rather than SVG.

All configuration settings (colors etc.) are exposed in top level constants.

The small circles represent days with full moons and can be disabled.
