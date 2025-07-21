# Joplin Plugin - Journal (Wisdom Snippet)

Create or open a note for today, or for another date selected from a date picker. This plugin will create a folder hierarchy for you.

![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal.png)
![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal-setting.png)

## Manual

1. Click `Tools` -> `Journal` -> `Open Today's Note` to open a note for today. If the note does not exist, it be will be created as a new note. Default keyboard shortcut is `Ctrl+Alt+D`.
2. Click `Tools` -> `Journal` -> `Open Another day's Note`, to open a calendar to choose a date to journal. Default keyboard shortcut is `Ctrl+Alt+O`.
3. Click `Tools` -> `Journal` -> `Insert a link to Today's Note` to insert a reference link to today's note. If the note does not exist, it will be created. Default keyboard shortcut is `Ctrl+Alt+L`.
4. Click `Tools` -> `Journal` -> `Insert a link to Another day's Note` to insert a reference link to another day's note. If the note does not exist, it will be created. Default keyboard shortcut is `Ctrl+Alt+T`.
5. Every option above with `Today` also has a version with an offset. You can set the offset in the settings, which will shift the end of the day by up to 6 hours in either direction. This is useful if you often create the note for the previous day after midnight or the note for the following day before midnight. Default shortcuts are the same as above with an additional `Shift`.

6. Automatically append a random wisdom snippet to your journal: the plugin reads from the `wisdom.md` file in the plugin directory, selects a random snippet (separate snippets by blank lines), and inserts it as a blockquote at the end of the journal template.

You can customize the keyboard shortcuts via `Tools` -> `Options` -> `Keyboard shortcuts`, and then using `journal` in the search box to filter the keyboard shortcuts for the Journal plugin.

## Known issues

If you create the same note (a note with the same title and in the same folder) too quickly, a duplicate note will be created with the same name.

When using the default shortcut `Ctrl+Alt+D` to create today's note, you should wait more than 10 seconds before using the shortcut again, or it will create a duplicate note. This is because Joplin needs around 10 seconds to build the note's index - it should be found after about 10 seconds.

## Source

You can get the source code here: [https://github.com/leenzhu/joplin-plugin-journal](https://github.com/leenzhu/joplin-plugin-journal)
