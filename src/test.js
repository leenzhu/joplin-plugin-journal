function tplEngin(tpl, data) {
    const re = /{{([^}]+)?}}/
    let match
    while (match = re.exec(tpl)) {
	tpl = tpl.replace(match[0], data[match[1]])
    }

    return tpl;
}

function makeDate(d) {
    const wkName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let data = {
	year: '' + d.getFullYear(),
	month: ('0' + (d.getMonth() + 1)).slice(-2),
	day: ('0' + d.getDate()).slice(-2),
	hour: ('0' + d.getHours()).slice(-2),
	min: ('0' + d.getMinutes()).slice(-2),
	sec: ('0' + d.getSeconds()).slice(-2), 
	weekday: wkName[d.getDay()],
    }

    return data;
}

let tpl = 'Journal/{{year}}/{{year}}-{{month}}-{{day}}-{{hour}}';

console.log(makeDate(new Date()))
console.log(tplEngin(tpl, makeDate(new Date())))
