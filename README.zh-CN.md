# Joplin Plugin - Journal

为今天创建或打开一篇日志笔记，或者通过日期选择器打开任意日期的日志。插件支持通过模板生成笔记本层级、向日志笔记插入模板内容、在笔记之间插入日志链接，以及回顾往年同一天的日志。

![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal.png)
![joplin-plugin-journal-screen-shot](https://raw.githubusercontent.com/leenzhu/joplin-plugin-journal/master/joplin-plugin-journal-setting.png)

## 功能特性

- 打开或创建今天的日志笔记。
- 通过日期选择器打开或创建任意日期的日志笔记。
- 为“今天”增加偏移量，让日志日界线可以早于或晚于午夜。
- 在当前选中的笔记本下创建日志笔记。
- 插入今天日志或其他日期日志的链接。
- 插入显示为 `Today` 的日志链接。
- 自动或手动插入模板内容。
- 在笔记标题模板和笔记内容模板中展开模板变量。
- 插入往年同月同日的日志链接（“Memories”）。
- 使用 `{{memories}}` 自动把往年回忆加入内容模板。
- 通过精确匹配标题，或可选地通过标题前缀匹配来支持自定义标题后缀。
- 自动为新建日志添加标签。
- 在日期选择器中高亮已有日志的日期。
- 在移动端为指定操作添加工具栏入口。

## 使用说明

### Journal 菜单

通过 `Tools` -> `Journal` 打开插件菜单。

可用操作包括：

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

如果目标笔记不存在，Journal 会自动创建。

### Memories（往年回忆）

`Insert memories` 会先检查当前笔记是否符合 `Note Name Template`，再从笔记本路径和标题中确定日期。随后，Journal 会查找往年同月同日已有的日志，并在光标位置按年份从新到旧插入链接，每个年份一行。此命令不会创建缺失的笔记。

例如，使用 `Timeline/{{year}}/{{year}}{{month}}{{day}}` 时，在 `Timeline/2026/20260906` 中运行命令可以插入：

```markdown
[20250906 Plum](:/NOTE_ID)
[20230906 Banana](:/NOTE_ID)
[20210906 Cherry](:/NOTE_ID)
```

启用 `Allow custom title suffix` 后，确定日期时会忽略 ` Plum` 之类的自定义后缀，但链接文字仍使用完整标题。同一年存在精确标题和后缀匹配时优先选择精确标题；否则选择最早创建的后缀匹配。

### 快捷键

桌面端默认快捷键：

- `Ctrl+Alt+D`：打开今天的日志
- `Ctrl+Alt+O`：打开其他日期的日志
- `Ctrl+Alt+L`：插入今天日志的链接
- `Ctrl+Alt+T`：插入其他日期日志的链接
- `Ctrl+Alt+I`：插入带 `Today` 标签的今天日志链接
- `Ctrl+Shift+Alt+D`：打开带偏移量的今天日志
- `Ctrl+Shift+Alt+L`：插入带偏移量的今天日志链接
- `Ctrl+Shift+Alt+I`：插入带偏移量且标签为 `Today` 的今天日志链接

你可以通过 `Tools` -> `Options` -> `Keyboard Shortcuts` 自定义快捷键，并搜索 `journal` 来过滤相关命令。

### 笔记创建行为

- Journal 使用 `Note Name Template` 生成笔记本路径和笔记标题。
- `Note Name Template` 中的 `/` 会创建笔记本层级。
- 如果目标笔记已存在，Journal 会直接重新打开，而不是创建重复笔记。
- 如果启用了 `Allow custom title suffix`，Journal 会先查找与生成标题完全相同的笔记；如果找不到，再查找标题以前缀形式匹配的笔记；如果有多条前缀匹配结果，则选择创建时间最早的一条。

### 模板内容

- `Note Template ID` 指向一个笔记，该笔记的正文会作为日志内容模板。
- 插入模板内容时会展开模板变量。
- 如果 `Insert template every time note is opened` 未启用，则只有在目标笔记正文为空时才插入模板。
- `Insert Default Template` 会把当前配置的模板内容手动插入到当前笔记中。
- 仅用于内容模板的变量 `{{memories}}` 会在应用模板时插入相同的往年链接列表；没有匹配记录时会替换为空文本。

### 移动端

在移动端，可以通过设置把以下“打开笔记”操作添加到笔记工具栏：

- `Add Open Today's Note option to menu`
- `Add Open Today's Note (with Offset) option to menu`
- `Add Open Another day's Note option to menu`

插入链接相关操作也会添加到移动端编辑器工具栏。

## 设置项说明

### 核心设置

- `Note Name Template`：定义生成的笔记本路径和笔记标题。
- `Offset for end of Today`：调整带偏移量命令使用的日界线。
- `Open Today's Note when Joplin is started`：启动 Joplin 时自动打开今天的日志。
- `Allow custom title suffix`：允许 Journal 匹配标题以前缀形式包含生成标题的笔记。

### 模板设置

- `Note Template ID`：作为内容模板来源的笔记 ID。
- `Insert template every time note is opened`：每次打开日志笔记时都重新插入模板。

### 命名与格式设置

- `Month Style`
- `Day Style`
- `Weekday Style`
- `WeekNum Style`
- `Month Name`
- `Weekday Name`
- `Quarter Name`

这些设置用于控制数字类和名称类模板变量的输出格式。

### 日历设置

- `Weeks start on Monday`
- `Time Format`
- `Theme Selection`
- `Enable week numbers`
- `Enable Calendar Highlights`

### 标签设置

- `Enable AutoTag`
- `Tag Names`

启用自动标签后，Journal 会把配置的标签添加到新创建的日志笔记上。

## 模板变量

Journal 的模板可用于两个位置：

- `Note Name Template`：控制生成的日志笔记路径和标题。
- `Note Template ID`：指向一个笔记，该笔记正文会作为日志内容模板插入。

下面的日期和时间变量会同时在笔记标题模板和插入的笔记内容模板中展开。`{{memories}}` 仅适用于插入的笔记内容模板。

### 支持的变量

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `{{year}}` | 四位年份。 | `2026` |
| `{{decade}}` | 根据年份推导出的年代标签。 | `2020s` |
| `{{date}}` | `YYYY-MM-DD` 格式的日期。 | `2026-05-29` |
| `{{time}}` | `HH:mm` 格式的时间。 | `14:35` |
| `{{datetime}}` | `YYYY-MM-DD HH:mm` 格式的日期时间。 | `2026-05-29 14:35` |
| `{{month}}` | 月份数字，具体格式取决于 `Month Style`。 | `05` 或 `5` |
| `{{monthName}}` | 来自 `Month Name` 设置的月份标签。 | `05-May` |
| `{{quarter}}` | 季度数字。 | `2` |
| `{{quarterName}}` | 来自 `Quarter Name` 设置的季度标签。 | `Q2` |
| `{{day}}` | 月内日期，具体格式取决于 `Day Style`。 | `09` 或 `9` |
| `{{hour}}` | 24 小时制小时。 | `14` |
| `{{hour12}}` | 12 小时制小时。 | `02` |
| `{{ampm}}` | 大写 AM/PM 标记。 | `PM` |
| `{{min}}` | 分钟。 | `35` |
| `{{weekday}}` | 星期数字，具体格式取决于 `Weekday Style`。 | `05` 或 `5` |
| `{{weekdayName}}` | 来自 `Weekday Name` 设置的星期标签。 | `Thu` |
| `{{weekNum}}` | 按插件当前周数算法计算的周序号。 | `22` |
| `{{memories}}` | 往年同月同日的日志链接，每行一条。仅可用于笔记内容模板。 | `[20250906 Plum](:/NOTE_ID)` |

### 格式说明

- `Note Name Template` 中的 `/` 会创建笔记本层级。
- `Month Name`、`Weekday Name` 和 `Quarter Name` 都是可配置列表，因此最终渲染结果取决于你的设置。
- `Month Style`、`Day Style`、`Weekday Style` 和 `WeekNum Style` 用于控制数字是零填充还是普通数字。
- 日期和时间变量会同时在笔记标题和插入的模板内容中展开。`{{memories}}` 只能用于 `Note Template ID` 指向的笔记，不能用于 `Note Name Template`。

### 默认笔记标题模板

默认的笔记标题模板为：

```text
Journal/{{year}}/{{monthName}}/{{year}}-{{month}}-{{day}}
```

## 示例

示例标题模板：

```text
Journal/{{year}}/{{monthName}}/{{date}}
```

示例内容模板：

```text
# {{date}}

Created at {{time}}
Week {{weekNum}}, {{weekdayName}}

## On this day

{{memories}}
```

## 已知问题

如果你在很短时间内重复创建同一篇笔记（同一笔记本下标题相同的笔记），可能会创建出重复笔记。

当使用默认快捷键 `Ctrl+Alt+D` 创建今天的日志时，如果在 10 秒内再次使用该快捷键，可能会创建重复笔记。这是因为 Joplin 通常需要大约 10 秒来完成索引，之后才能正确搜索到刚创建的笔记。

## 源码

源码地址：
[https://github.com/leenzhu/joplin-plugin-journal](https://github.com/leenzhu/joplin-plugin-journal)
