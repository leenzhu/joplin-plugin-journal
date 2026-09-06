# Joplin Plugin - Journal

Create or open a note for today, or for another date selected from a date picker. The plugin can build a notebook hierarchy from a template, insert template content into journal notes, add links between notes, and revisit journal entries from the same date in previous years.

![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal.png)
![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal-setting.png)

## Features

- Open or create today's journal note.
- Open or create a note for any date from a date picker.
- Apply an offset to "today" so the journal day can end before or after midnight.
- Create notes under the currently selected notebook.
- Insert links to today's note or another day's note.
- Insert links labeled `Today`.
- Insert note template content automatically or manually.
- Expand template variables in both note names and inserted note content.
- Insert links to journal entries from the same month and day in previous years ("memories").
- Add memories automatically to note content templates with `{{memories}}`.
- Match notes by exact generated title, or optionally by generated-title prefix to allow custom title suffixes.
- Add tags automatically to newly created journal notes.
- Highlight dates with existing notes in the date picker.
- Add mobile toolbar entries for selected journal actions.

## Usage

### Journal Menu

Open the plugin from `Tools` -> `Journal`.

Available actions:

- `Open Today's Note`
- `Open Today's Note Under Selected Folder`
- `Open Today's Note (with Offset)`
- `Open Another day's Note`
- `Open Another day's Note Under Selected Folder`
- `Insert link to Today's Note`
- `Insert link to Today's Note (with Offset)`
- `Insert link to Another day's Note`
- `Insert link to Today's Note with Label`
- `Insert link to Today's Note with Label (with Offset)`
- `Insert Default Template`
- `Insert memories`

If the target note does not exist yet, Journal creates it automatically.

### Memories

`Insert memories` checks whether the currently selected note matches `Note Name Template`. If it does, Journal determines its date from the generated notebook path and note title, finds existing journal entries for the same month and day in previous years, and inserts one Markdown link per year at the cursor. Links are ordered from newest to oldest and each link is placed on its own line.

For example, with `Timeline/{{year}}/{{year}}{{month}}{{day}}`, running the command in `Timeline/2026/20260906` can insert:

```markdown
[20250906 Plum](:/NOTE_ID)
[20230906 Banana](:/NOTE_ID)
[20210906 Cherry](:/NOTE_ID)
```

When `Allow custom title suffix` is enabled, suffixes such as ` Plum` are ignored when determining the journal date, but the complete note title is used as the link label. If an exact title and suffixed matches exist for the same year, the exact title is preferred; otherwise the earliest-created suffixed match is used. The command never creates missing notes.

### Keyboard Shortcuts

Default desktop shortcuts:

- `Ctrl+Alt+D`: Open Today's Note
- `Ctrl+Alt+O`: Open Another day's Note
- `Ctrl+Alt+L`: Insert link to Today's Note
- `Ctrl+Alt+T`: Insert link to Another day's Note
- `Ctrl+Alt+I`: Insert link to Today's Note with Label
- `Ctrl+Shift+Alt+D`: Open Today's Note (with Offset)
- `Ctrl+Shift+Alt+L`: Insert link to Today's Note (with Offset)
- `Ctrl+Shift+Alt+I`: Insert link to Today's Note with Label (with Offset)

You can customize shortcuts via `Tools` -> `Options` -> `Keyboard Shortcuts`. Search for `journal` to filter the commands.

### Note Creation Behavior

- Journal generates the note path from `Note Name Template`.
- A `/` in the template creates a notebook hierarchy.
- If the note already exists, Journal reopens it instead of creating a duplicate.
- If `Allow custom title suffix` is enabled, Journal first looks for an exact title match, then falls back to notes whose titles start with the generated title. If multiple prefixed matches exist, the earliest created one is used.

### Template Content

- `Note Template ID` points to a note whose body is used as the content template.
- Template variables are expanded in the inserted content.
- If `Insert template every time note is opened` is disabled, the template is inserted only when the note body is empty.
- `Insert Default Template` manually inserts the configured template into the current note.
- The content-only variable `{{memories}}` inserts the same list of previous-year links when the template is applied. If there are no matching entries, it expands to an empty string.

### Mobile

On mobile, Journal can add selected "open note" actions to the note toolbar through settings:

- `Add Open Today's Note option to menu`
- `Add Open Today's Note (with Offset) option to menu`
- `Add Open Another day's Note option to menu`

Link insertion actions are also added to the mobile editor toolbar.

## Settings

### Core Settings

- `Note Name Template`: Defines the generated notebook path and note title.
- `Offset for end of Today`: Shifts the boundary used by offset-based commands.
- `Open Today's Note when Joplin is started`: Automatically opens today's note at startup.
- `Allow custom title suffix`: Lets Journal match notes whose titles start with the generated title.

### Template Settings

- `Note Template ID`: The source note used as the content template.
- `Insert template every time note is opened`: Reinserts the template every time the note is opened.

### Naming and Formatting Settings

- `Month Style`
- `Day Style`
- `Weekday Style`
- `WeekNum Style`
- `Month Name`
- `Weekday Name`
- `Quarter Name`

These settings control how numeric and named template variables are rendered.

### Calendar Settings

- `Weeks start on Monday`
- `Time Format`
- `Theme Selection`
- `Enable week numbers`
- `Enable Calendar Highlights`

### Tag Settings

- `Enable AutoTag`
- `Tag Names`

When auto-tagging is enabled, Journal adds the configured tags to newly created notes.

## Template Variables

Journal templates can be used in two places:

- `Note Name Template`: controls the generated journal note path and title.
- `Note Template ID`: points to a note whose body will be inserted as the journal note content template.

The date and time variables below are expanded in both the note name template and the inserted note content template. `{{memories}}` is available only in the inserted note content template.

### Supported Variables

| Variable | Description | Example |
| --- | --- | --- |
| `{{year}}` | Four-digit year. | `2026` |
| `{{decade}}` | Decade label derived from the year. | `2020s` |
| `{{date}}` | Date in `YYYY-MM-DD` format. | `2026-05-29` |
| `{{time}}` | Time in `HH:mm` format. | `14:35` |
| `{{datetime}}` | Date and time in `YYYY-MM-DD HH:mm` format. | `2026-05-29 14:35` |
| `{{month}}` | Month number. The exact format depends on `Month Style`. | `05` or `5` |
| `{{monthName}}` | Month label from the `Month Name` setting. | `05-May` |
| `{{quarter}}` | Quarter number. | `2` |
| `{{quarterName}}` | Quarter label from the `Quarter Name` setting. | `Q2` |
| `{{day}}` | Day of month. The exact format depends on `Day Style`. | `09` or `9` |
| `{{hour}}` | Hour in 24-hour format. | `14` |
| `{{hour12}}` | Hour in 12-hour format. | `02` |
| `{{ampm}}` | Uppercase meridiem marker. | `PM` |
| `{{min}}` | Minutes. | `35` |
| `{{weekday}}` | Weekday number. The exact format depends on `Weekday Style`. | `05` or `5` |
| `{{weekdayName}}` | Weekday label from the `Weekday Name` setting. | `Thu` |
| `{{weekNum}}` | Week number based on the plugin's current week-number calculation. | `22` |
| `{{memories}}` | Links to journal entries from the same month and day in previous years, one per line. Available only in the note content template. | `[20250906 Plum](:/NOTE_ID)` |

### Formatting Notes

- A `/` in `Note Name Template` creates a notebook hierarchy.
- `Month Name`, `Weekday Name`, and `Quarter Name` are user-configurable lists, so the rendered text depends on your settings.
- `Month Style`, `Day Style`, `Weekday Style`, and `WeekNum Style` control whether numeric values are zero-padded or plain numbers.
- Date and time variables are expanded in both note names and inserted note content. `{{memories}}` works only in the note referenced by `Note Template ID` and cannot be used in `Note Name Template`.

### Default Note Name Template

The default note name template is:

```text
Journal/{{year}}/{{monthName}}/{{year}}-{{month}}-{{day}}
```

## Examples

Example note name template:

```text
Journal/{{year}}/{{monthName}}/{{date}}
```

Example inserted note content template:

```text
# {{date}}

Created at {{time}}
Week {{weekNum}}, {{weekdayName}}

## On this day

{{memories}}
```

## Known issues

If you create the same note (a note with the same title and in the same folder) too quickly, a duplicate note will be created with the same name.

When using the default shortcut `Ctrl+Alt+D` to create today's note, you should wait more than 10 seconds before using the shortcut again, or it will create a duplicate note. This is because Joplin needs around 10 seconds to build the note's index - it should be found after about 10 seconds.

## Source

You can get the source code here: [https://github.com/leenzhu/joplin-plugin-journal](https://github.com/leenzhu/joplin-plugin-journal)
