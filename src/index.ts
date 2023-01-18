import joplin from 'api';
import { SettingItemType } from 'api/types';

const defaultNoteName = 'Journal/{{year}}/{{monthName}}/{{year}}-{{month}}-{{day}}';
const defaultMonthName = '01-Jan,02-Feb,03-Mar,04-Apr,05-May,06-Jun,07-Jul,08-Aug,09-Sep,10-Oct,11-Nov,12-Dec';
const defaultWeekdayName = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat';

function padding(s) {
	return ('0' + s).slice(-2);
}

function tplEngin(tpl, data) {
	const re = /{{([^}]+)?}}/
	let match
	while (match = re.exec(tpl)) {
		let v = data[match[1]];
		tpl = tpl.replace(match[0], v ? v : match[0]);
	}

	return tpl;
}

async function makeNoteName(d) {
	const year = d.getUTCFullYear();
	const month = d.getUTCMonth() + 1;
	const day = d.getUTCDate();
	const hour = d.getUTCHours();
	const min = d.getUTCMinutes();
	const sec = d.getUTCSeconds();
	const weekday = d.getUTCDay();


	const noteTmpl = await joplin.settings.value('NoteTemplate') || defaultNoteName;

	const monthStyle = await joplin.settings.value('MonthStyle') || 'pad_num';
	const dayStyle = await joplin.settings.value('DayStyle') || 'pad_num';
	const weekdayStyle = await joplin.settings.value('WeekdayStyle') || 'pad_num';

	const monthName = await joplin.settings.value('MonthName') || defaultMonthName;
	const weekdayName = await joplin.settings.value('WeekdayName') || defaultWeekdayName;

	let monthNames = monthName.split(',');
	if (monthNames.length != 12) {
		monthNames = defaultMonthName.split(',');
	}

	let weekdayNames = weekdayName.split(',');
	if (weekdayNames.length != 7) {
		weekdayNames = defaultWeekdayName.split(',');
	}

	console.log(`tmpl: ${noteTmpl}, monthStyle:${monthStyle}, dayStyle:${dayStyle}, weekdayStyle:${weekdayStyle}`);
	let data = { year: '', month: '', monthName: '', day: '', hour: '', min: '', sec: '', weekday: '', weekdayName: '' };
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

	data.monthName = monthNames[month - 1];
	data.weekdayName = weekdayNames[weekday];
	data.hour = padding(hour);
	data.min = padding(min);
	data.sec = padding(sec);

	console.log(data);
	const noteName = tplEngin(noteTmpl, data);

	return noteName;
}

async function createFolder(folderName, parent) {
	let found
	const founds = await joplin.data.get(["search"], { query: folderName, type: "folder" });

	console.log("Create folder: ", folderName, parent);
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
			console.log(`found note: ${note.title} ${note.id}`);
			return note;
		}
	}
	note = await joplin.data.post(["notes"], null, { title: noteName, parent_id: parent ? parent.id : '' });

	return note;
}

async function createNoteByDate(d) {
	let noteName = await makeNoteName(d);
	console.log("Make noteName: ", noteName);
	let note = await createNote(noteName);
	return note;
}


joplin.plugins.register({
	onStart: async function () {
		console.info('joplin-plugin-journal started!');

		const dialogs = joplin.views.dialogs;
		const dialog = await dialogs.create('journal-dialog');
		await dialogs.addScript(dialog, "./vanilla-calendar.min.css");
		await dialogs.addScript(dialog, "./vanilla-calendar.min.js");
		await dialogs.setButtons(dialog, [
			{ id: "ok", title: "OK" },
			{ id: "cancel", title: "Cancel" },
		]);

		async function getDateByDialog() {
			const iso8601 = await joplin.settings.value('iso8601');
			await dialogs.setHtml(dialog, `<form name="picker" ><div id="datepicker" iso8601=${iso8601}></div><input id="j_date" name="date" type="hidden"></form>`);
			const ret = await dialogs.open(dialog);

			if (ret.id == "ok") {
				console.log("picker get date: ", ret.formData.picker.date);
				const d = new Date(ret.formData.picker.date);
				console.log("picker newDate: ", d);
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
				description: `There are several variables: {{year}}, {{month}}, {{monthName}}, {{day}}, {{weekday}}, {{weekdayName}}, which will be expanded into the actual value when open or create notes. And '/' will make fold hierarchical. The default vaule is: '${defaultNoteName}'`
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
				description: "Padding number: 01, 02, ..., 11, 12, Number: 1,2, 11, 12."
			},
			'MonthName': {
				value: defaultMonthName,
				type: SettingItemType.String,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Month Name',
				description: "Custom {{monthName}}, each name is splitted by ','.",
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
				description: "Padding number: 01, 02, ..., 30, 31, Number: 1,2, ..., 30, 31",
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
				description: "Padding number: 01, 02, ..., 06, 07, Number: 1,2, ..., 6, 7."
			},
			'WeekdayName': {
				value: defaultWeekdayName,
				type: SettingItemType.String,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Weekday Name',
				description: "Custom {{weekdayName}}, each name is splitted by ','. First weekday is 'Sunday'",
			},
			'iso8601': {
				value: true,
				type: SettingItemType.Bool,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Week start on Monday',
				description: "If Checked, the first day of week is Monday, otherwise it is Sunday",
			},

			'OpenAtStartup': {
				value: false,
				type: SettingItemType.Bool,
				section: 'Journal',
				public: true,
				advanced: true,
				label: 'Open today\'s note at application startup',
				description: "If checked, when you start jopin it will open today's note for you, if note not exist, it will create it for you.",
			},

		});

		await joplin.commands.register({
			name: "openTodayNote",
			label: "Journal today",
			execute: async () => {
				const d = new Date();
				const ds = new Date(`${d.getFullYear()}-${padding(d.getMonth() + 1)}-${padding(d.getDate())}`);
				const note = await createNoteByDate(ds);
				await joplin.commands.execute("openNote", note.id);
				await joplin.commands.execute('editor.focus');
			}
		});

		await joplin.commands.register({
			name: "linkTodayNote",
			label: "Journal insert today note link",
			execute: async () => {
				const d = new Date();
				const ds = new Date(`${d.getFullYear()}-${padding(d.getMonth() + 1)}-${padding(d.getDate())}`);
				const note = await createNoteByDate(ds);
				await joplin.commands.execute("insertText", `[${note.title}](:/${note.id})`);
				await joplin.commands.execute('editor.focus');
			}
		});

		await joplin.commands.register({
			name: "linkOtherDayNote",
			label: "Journal insert other day note link",
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
			name: "openOtherdayNote",
			label: "Journal other day",
			execute: async () => {
				let d = await getDateByDialog();
				if (d !== null) {
					const note = await createNoteByDate(d);
					await joplin.commands.execute("openNote", note.id);
					await joplin.commands.execute('editor.focus');
				}
			}
		});

		await joplin.views.menus.create('journal-menu', 'Journal', [
			{ label: "Today's Note", commandName: "openTodayNote", accelerator: "CmdOrCtrl+Alt+D" },
			{ label: "Otherday's Note", commandName: "openOtherdayNote", accelerator: "CmdOrCtrl+Alt+O" },
			{ label: "Link Today's Note", commandName: "linkTodayNote", accelerator: "CmdOrCtrl+Alt+L" },
			{ label: "Link Other day's Note", commandName: "linkOtherDayNote", accelerator: "CmdOrCtrl+Alt+T" },
		]);

		const shouldOpen = await joplin.settings.value('OpenAtStartup')||false;
		if (shouldOpen) {
			setTimeout(async () => {
				await joplin.commands.execute('openTodayNote');
			}, 2000);
		}
	},
});
