import joplin from 'api';
import { SettingItemType } from 'api/types';

const defaultNoteName = 'Journal/{{year}}/{{monthName}}/{{year}}-{{month}}-{{day}}';
const defaultMonthName = '01-Jan,02-Feb,03-Mar,04-Apr,05-May,06-Jun,07-Jul,08-Aug,09-Sep,10-Oct,11-Nov,12-Dec';
const defaultWeekdayName = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat';
const defaultTagName = 'journal'

function getWeek(d) {
	var date = new Date(d.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
		- 3 + (week1.getDay() + 6) % 7) / 7);
}

function padding(s) {
	return ('0' + s).slice(-2);
}

function tplEngin(tpl, data) {
	const re = /{{([^}]+)?}}/
	let match
	while (match = re.exec(tpl)) {
		let v = data[match[1]];
		if (typeof (v) === "string") {
			v.replace(/{/g, "<");
			v.replace(/}/g, ">"); // trim marker, prevent deadloop if 'v' contains '{{...}}'
		}
		tpl = tpl.replace(match[0], v ? v : `errkey_${match[1]}`);
	}

	return tpl;
}

async function makeNoteName(d) {
	const year = d.getFullYear();
	const month = d.getMonth() + 1;
	const day = d.getDate();
	const hour = d.getHours();
	const min = d.getMinutes();
	const sec = d.getSeconds();
	const weekday = d.getDay();
	const weekNum = getWeek(d)

	const noteTmpl = await joplin.settings.value('NoteTemplate') || defaultNoteName;

	const monthStyle = await joplin.settings.value('MonthStyle') || 'pad_num';
	const dayStyle = await joplin.settings.value('DayStyle') || 'pad_num';
	const weekdayStyle = await joplin.settings.value('WeekdayStyle') || 'pad_num';

	const monthName = await joplin.settings.value('MonthName') || defaultMonthName;
	const weekdayName = await joplin.settings.value('WeekdayName') || defaultWeekdayName;

	const weekNumStyle = await joplin.settings.value('WeekNumStyle') || 'pad_num';
	let monthNames = monthName.split(',');
	if (monthNames.length != 12) {
		monthNames = defaultMonthName.split(',');
	}

	let weekdayNames = weekdayName.split(',');
	if (weekdayNames.length != 7) {
		weekdayNames = defaultWeekdayName.split(',');
	}

	console.log(`Jouranl tmpl: ${noteTmpl}, monthStyle:${monthStyle}, dayStyle:${dayStyle}, weekdayStyle:${weekdayStyle}`);
	let data = {
		year: '',
		month: '',
		monthName: '',
		day: '',
		hour: '',
		min: '',
		sec: '',
		weekday: '',
		weekdayName: '',
		weekNum: '',
		ampm: '',
		hour12: '',
	};
	data.year = '' + year; // convert number to string
	switch (monthStyle) {
		case 'pad_num':
			data.month = padding(month);
			break;
		case 'num':
			data.month = '' + (month);
			break;
		default:
			data.month = 'invalid';
			break;
	}

	switch (dayStyle) {
		case 'pad_num':
			data.day = padding(day);
			break;
		case 'num':
			data.day = '' + day;
			break;
		default:
			data.day = 'invalid';
			break;
	}

	switch (weekdayStyle) {
		case 'pad_num':
			data.weekday = padding(weekday);
			break;
		case 'num':
			data.weekday = '' + (weekday);
			break;
		default:
			data.weekday = 'invalid';
			break;
	}

	switch (weekNumStyle) {
		case 'pad_num':
			data.weekNum = padding(weekNum);
			break;
		case 'num':
			data.weekNum = '' + (weekNum);
			break;
		default:
			data.weekday = 'invalid';
			break;

	}

	data.monthName = monthNames[month - 1];
	data.weekdayName = weekdayNames[weekday];
	data.hour = padding(hour);
	data.min = padding(min);
	data.sec = padding(sec);
	data.ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12
	data.hour12 = padding(hour12 ? hour12 : 12)
	console.log(`Journal tmpl data: `, data);
	const noteName = tplEngin(noteTmpl, data);

	return noteName;
}

async function createFolder(folderName, parent) {
	let found
	const founds = await joplin.data.get(["search"], { query: folderName, type: "folder" });

	console.log(`Journal Create folder: ${folderName} with parent:`, parent);
	for (found of founds.items) {
		if (found.parent_id == (parent ? parent.id : found.parent_id)) {
			return found;
		}
	}

	found = await joplin.data.post(['folders'], null, { title: folderName, parent_id: parent ? parent.id : "" });

	return found;
}

async function createNote(notePath) {
	const paths = notePath.split('/');
	let folders = paths.slice(0, -1);
	let noteName = paths[paths.length - 1];
	let parent;

	for (let folder of folders) {
		parent = await createFolder(folder, parent);
	}

	let notes = await joplin.data.get(["search"], { query: `/"${noteName}"`, type: "note" });
	let note
	for (note of notes.items) {
		if (note.parent_id == parent.id && note.title == noteName) {
			console.log(`Journal found note: ${note.title} with id ${note.id}`);
			return note;
		}
	}
	note = await joplin.data.post(["notes"], null, { title: noteName, parent_id: parent ? parent.id : '' });

	return note;
}

async function addNoteTags(noteId) {
	const enableAutoTag = await joplin.settings.value('AutoTag') || false;
	if (!enableAutoTag) {
		return;
	}

	const tagName = await joplin.settings.value('Tags') || defaultTagName;
	const tagNames = tagName.split(",")

	for (let i = 0; i < tagNames.length; i++) {
		const tagTitle = tagNames[i].trim();
		let tagId = "";
		const tagFound = await joplin.data.get(["search"], { query: tagTitle, type: "tag", fields:"id, title"});
		if (tagFound.items.length == 0) {
			console.log("TagName:", tagTitle, "Not found");
			const newTag = await joplin.data.post(["tags"], null, {title: tagTitle});
			console.log("CrateTagName:", tagTitle, newTag);
			tagId = newTag.id;
		}else {
			tagId = tagFound.items[0].id;
		}

		console.log("TagName:", tagTitle, tagId);
		await joplin.data.post(['tags', tagId, 'notes'], null, {
		 	id: noteId
		});
	}
}

async function createNoteByDate(d) {
	let noteName = await makeNoteName(d);
	console.log("Make noteName: ", noteName);
	let note = await createNote(noteName);
	await addNoteTags(note.id);
	return note;
}

joplin.plugins.register({
	onStart: async function () {
		console.info('joplin-plugin-journal started!');

		const dialogs = joplin.views.dialogs;
		const dialog = await dialogs.create('journal-dialog');
		await dialogs.addScript(dialog, "./vanilla-calendar.min.css");
		await dialogs.addScript(dialog, "./light.min.css");
		await dialogs.addScript(dialog, "./dark.min.css");
		await dialogs.addScript(dialog, "./calendar.js");
		await dialogs.setButtons(dialog, [
			{ id: "ok", title: "OK" },
			{ id: "cancel", title: "Cancel" },
		]);

		async function getDatesWithNotes() {
			// Iterate over year of dates
			let now = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60*1000)
			let start = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60*1000)
			start.setDate(start.getDate() - 365)

			let daysWithNotes = []
			for (var d = start; d <= now; d.setDate(d.getDate() + 1)) {
				// Get the name of a note for this day
				let noteName = await makeNoteName(d);
				let parts = noteName.split("/")

				// Look for a note with that name
				const paths = parts.slice(0, -1)
				const noteTitle = parts[parts.length - 1]
				async function traverse(parent_id, depth){
					if(depth == -1){
						return true
					}
					let folder = await joplin.data.get(['folders', parent_id]);
					if(folder.title == paths[depth]){
						return await traverse(folder.parent_id, depth-1)
					}
					return false
				}
				let notes = await joplin.data.get(["search"], { query: noteTitle, type: "note" })
				for(const note of notes.items){
					if(await traverse(note.parent_id, paths.length - 1)){
						daysWithNotes.push(d.toISOString().substring(0, 10))
					}
				}
			}
			return daysWithNotes
		}

		let daysWithNotes = []
		setTimeout(async () => { // Update cached list every 10 minutes
			daysWithNotes = await getDatesWithNotes()
		}, 5000);
		setInterval(async () => { // Update cached list every 10 minutes
			daysWithNotes = await getDatesWithNotes()
		}, 60 * 10 * 1000);
		async function getDateByDialog() {
			const iso8601 = await joplin.settings.value('iso8601');
			const timeFmt = await joplin.settings.value('TimeFmt') || 0;
			const theme = await joplin.settings.value('Theme') || "light"
			const enableWeekNum = await joplin.settings.value('WeekNum') || false

			await dialogs.setHtml(dialog, `<form name="picker"><div id="datepicker" iso8601=${iso8601} timeFmt=${timeFmt} theme=${theme} weekNum=${enableWeekNum}></div><input id="j_date" name="date" type="hidden"><input id="j_time" name="time" type="hidden"><div <div id="days_with_notes" ${daysWithNotes.join("=true ") + "=true"}></div></form>`);
			const ret = await dialogs.open(dialog);

			if (ret.id == "ok") {
				console.log("Journal: picker get date: ", ret.formData.picker.date);
				console.log("Journal: picker get time: ", ret.formData.picker.time);
				const date_time = `${ret.formData.picker.date}T${ret.formData.picker.time}:00`
				console.log("Journal: picker date_time: ", date_time);
				const d = new Date(date_time);
				console.log("Journal: picker date Object: ", d);
				return d;
			} else {
				return null;
			}
		}

		await joplin.settings.registerSection('Journal', {
			label: 'Journal',
			iconName: 'fas fa-calendar-day',
		});

		await joplin.settings.registerSettings({

			'NoteTemplate': {
				value: defaultNoteName,
				type: SettingItemType.String,
				section: 'Journal',
				public: true,
				label: 'Note Name Template',
				description: `There are several variables: {{year}}, {{month}}, {{monthName}}, {{day}}, {{hour}}, {{hour12}}, {{ampm}}, {{min}}, {{weekday}}, {{weekdayName}}, {{weekNum}}, which will expand into the actual value when opening or creating notes. The '/' character will create a hierarchical folder. The default value is: '${defaultNoteName}'.`
			},

			'MonthStyle': {
				value: 'pad_num',
				type: SettingItemType.String,
				section: 'Journal',
				isEnum: true,
				public: true,
				label: 'Month Style',
				options: {
					'pad_num': 'Padding number',
					'num': 'Number',
				},
				description: "Padding number: 01, 02, ..., 11, 12, Number: 1, 2, 11, 12."
			},
			'MonthName': {
				value: defaultMonthName,
				type: SettingItemType.String,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Month Name',
				description: "Custom {{monthName}}, each value is separated by ','.",
			},
			'DayStyle': {
				value: 'pad_num',
				type: SettingItemType.String,
				section: 'Journal',
				isEnum: true,
				public: true,
				label: 'Day Style',
				options: {
					'pad_num': 'Padding number',
					'num': 'Number',
				},
				description: "Padding number: 01, 02, ..., 30, 31, Number: 1, 2, ..., 30, 31.",
			},
			'WeekdayStyle': {
				value: 'pad_num',
				type: SettingItemType.String,
				section: 'Journal',
				isEnum: true,
				public: true,
				label: 'Weekday Style',
				options: {
					'pad_num': 'Padding number',
					'num': 'Number',
				},
				description: "Padding number: 01, 02, ..., 06, 07, Number: 1, 2, ..., 6, 7."
			},
			'WeekdayName': {
				value: defaultWeekdayName,
				type: SettingItemType.String,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Weekday Name',
				description: "Custom {{weekdayName}}, each value is separated by ','. First weekday is 'Sunday'.",
			},
			'iso8601': {
				value: true,
				type: SettingItemType.Bool,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Weeks start on Monday',
				description: "If checked, the first day of week is Monday, otherwise it is Sunday.",
			},

			'OpenAtStartup': {
				value: false,
				type: SettingItemType.Bool,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Open Today\'s Note when Joplin is started',
				description: "If checked, Joplin will open Today's Note at startup. If the note does not exist, it will be created.",
			},
			'TimeFmt': {
				value: 0,
				type: SettingItemType.Int,
				section: 'Journal',
				isEnum: true,
				public: true,
				advanced: true,
				label: 'Time Format',
				options: {
					0: 'Disable',
					12: '12 Hours Format',
					24: '24 Hours Format'
				},
				description: "Select preferred format for time.",
			},
			'Theme': {
				value: "light",
				type: SettingItemType.String,
				section: 'Journal',
				isEnum: true,
				public: true,
				advanced: true,
				label: 'Theme Selection',
				options: {
					"light": 'Light',
					"dark": 'Dark',
				},
				description: "Choose the theme of the calendar.",
			},
			'WeekNum': {
				value: false,
				type: SettingItemType.Bool,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Enable week numbers',
				description: "Show week numbers in calendar.",
			},
			'WeekNumStyle': {
				value: 'pad_num',
				type: SettingItemType.String,
				section: 'Journal',
				isEnum: true,
				public: true,
				advanced: true,
				label: 'WeekNum Style',
				options: {
					'pad_num': 'Padding number',
					'num': 'Number',
				},
				description: "Padding number: 01, 02, ..., 06, 07, Number: 1, 2, ..., 6, 7."
			},
			'AutoTag': {
				value: false,
				type: SettingItemType.Bool,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Enable AutoTag',
				description: "Auto add tag(s) when create new  journal notes",
			},
			'Tags': {
				value: defaultTagName,
				type: SettingItemType.String,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Tag Names',
				description: "Custom tag names, each value is separated by ','. eg",
			},
		});

		await joplin.commands.register({
			name: "openTodayNote",
			label: "Open Today's Note",
			execute: async () => {
				const d = new Date();
				const note = await createNoteByDate(d);
				await joplin.commands.execute("openNote", note.id);
				await joplin.commands.execute('editor.focus');
			}
		});

		await joplin.commands.register({
			name: "openOtherdayNote",
			label: "Open Another day's Note",
			execute: async () => {
				let d = await getDateByDialog();
				if (d !== null) {
					const note = await createNoteByDate(d);
					await joplin.commands.execute("openNote", note.id);
					await joplin.commands.execute('editor.focus');
				}
			}
		});

		await joplin.commands.register({
			name: "linkTodayNote",
			label: "Insert link to Today's Note",
			execute: async () => {
				const d = new Date();
				const note = await createNoteByDate(d);
				await joplin.commands.execute("insertText", `[${note.title}](:/${note.id})`);
				await joplin.commands.execute('editor.focus');
			}
		});

		await joplin.commands.register({
			name: "linkOtherDayNote",
			label: "Insert link to Another day's Note",
			execute: async () => {
				let d = await getDateByDialog();
				if (d !== null) {
					const note = await createNoteByDate(d);
					await joplin.commands.execute("insertText", `[${note.title}](:/${note.id})`);
					await joplin.commands.execute('editor.focus');
				}
			}
		});

		await joplin.commands.register({
			name: "linkTodayNoteWithLabel",
			label: "Insert link to Today's Note with label 'Today'",
			execute: async () => {
				const d = new Date();
				const note = await createNoteByDate(d);
				await joplin.commands.execute("insertText", `[Today](:/${note.id})`);
				await joplin.commands.execute('editor.focus');
			}
		});


		await joplin.views.menus.create('journal-menu', 'Journal', [
			{ label: "Open Today's Note", commandName: "openTodayNote", accelerator: "CmdOrCtrl+Alt+D" },
			{ label: "Open Another day's Note", commandName: "openOtherdayNote", accelerator: "CmdOrCtrl+Alt+O" },
			{ label: "Insert link to Today's Note", commandName: "linkTodayNote", accelerator: "CmdOrCtrl+Alt+L" },
			{ label: "Insert link to Today's Note with Label", commandName: "linkTodayNoteWithLabel", accelerator: "CmdOrCtrl+Alt+I" },
			{ label: "Insert link to Another day's Note", commandName: "linkOtherDayNote", accelerator: "CmdOrCtrl+Alt+T" },
		]);

		const shouldOpen = await joplin.settings.value('OpenAtStartup') || false;
		if (shouldOpen) {
			setTimeout(async () => {
				await joplin.commands.execute('openTodayNote');
			}, 2000);
		}
	},
});
