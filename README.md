# Joplin Plugin - Journal

Create or open note of today or selected date. This plugin will create hierarchy folder for you.

![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal.png)
![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal-setting.png)

## Manual

1. Click menu `Tools` -> `Journal` -> `Journal today`, it will open note of today, if not exists, it will create a new note for you. Default keyboard shortcut is `Ctrl+Alt+D`.
2. Click menu `Tools` -> `Journal` -> `Journal other day`, it will open a calender, your can choose the date you needed. Default keyboard shortcut is `Ctrl+Alt+O`.
3. Click menu `Tools` -> `Journal` -> `Journal insert today note link`, it will insert a refference of today's note, it the note dosn't exist, it will create it. Default keyboard shortcut is `Ctrl+Alt+L`.
4. Click menu `Tools` -> `Journal` -> `Journal insert other day note link`, it will insert a refference of other day's note, it the note dosn't exist, it will create it. Default keyboard shortcut is `Ctrl+Alt+T`.

You could customize the keyboard shortcuts by `Tools` -> `Options` -> `Keyboard shortcuts`, and then input `journal` in the search box for filtering jouranl's keybord shortcuts.

## Important

Use **insert note link** carefully, 'cause it will make your editor is NOT able to **UNDO**.

## Known issue

If you create the same note (the note with the same title and under the same folder) too quickly, it will create duplicated note with the same name.

When your use the default shortcut `Ctrl+Alt+D` to create today's note, you should wait more than 10 seconds to hit the shortcut again, or it will create note again, since joplin need to build the note's index in 10 seconds, after the index built, journal will found it.

## Source

You can get the source code here: [https://github.com/leenzhu/joplin-plugin-journal](https://github.com/leenzhu/joplin-plugin-journal)
