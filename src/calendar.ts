import VanillaCalendar from '@uvarov.frontend/vanilla-calendar';
//import '@uvarov.frontend/vanilla-calendar/build/vanilla-calendar.min.css';
//import '@uvarov.frontend/vanilla-calendar/build/themes/light.min.css';
//import '@uvarov.frontend/vanilla-calendar/build/themes/dark.min.css';

function padding(v) {
    return ('0' + v).slice(-2)
}

const d = new Date()
const year = d.getFullYear()
const month = d.getMonth() + 1
const day = d.getDate()
const hour = d.getHours()
const min = d.getMinutes()

const today = `${year}-${padding(month)}-${padding(day)}`
const now = `${padding(hour)}:${padding(min)}`
const date_input = document.querySelector("#j_date") as HTMLInputElement
const time_input = document.querySelector("#j_time") as HTMLInputElement
date_input.value = today
time_input.value = now
const date_ele = document.getElementById('datepicker')
const monday_first = date_ele.getAttribute('iso8601') === 'true';
const timeFmt:any = parseInt(date_ele.getAttribute('timeFmt'),10)
const theme:any = date_ele.getAttribute('theme')
const calendar = new VanillaCalendar('#datepicker', {
    actions: {
       clickDay(e, dates) {
           date_input.value = dates[0]
       },
       changeTime(e, time, hours, minutes, keeping) {
            if (keeping == "PM") {
                hours = (parseInt(hours,10) + 12) + ''
            }
            time_input.value = `${padding(hours)}:${padding(minutes)}`
            console.log(`Vanilla Calendar: time: ${time}`)
            console.log(`Vanilla Calendar: hour: ${hours} minutes: ${minutes}`)
            console.log(`Vanilla Calendar: keeping: ${keeping}`)
       },
    },
    settings: {
       iso8601: monday_first,
       selected: {
           dates: [today],
       },
       visibility: {
        theme: theme,
       },
       selection: {
        time: timeFmt,
      },
    },
});
console.log(calendar)
calendar.init()

const e = document.getElementById("joplin-plugin-content")
e.style.width = "307px"