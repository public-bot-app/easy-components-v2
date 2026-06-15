# EasyComponents V2 Builder

A powerful, incredibly easy-to-use wrapper for Discord.js V14+ components. 
It supports standard `ActionRow` construction as well as the new Discord UI V2 Components such as **Containers**, **Labels**, **Checkboxes**, and **RadioGroups**!

---

## 📑 Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Quick Start](#quick-start)
- [Component Methods](#component-methods)
  - [Buttons](#buttons)
  - [Dropdowns (Select Menus)](#dropdowns-select-menus)
  - [Text Inputs](#text-inputs)
  - [V2 Components (Checkboxes & RadioGroups)](#v2-components)
- [Building & Output](#building--output)
  - [Messages (toPayload)](#messages)
  - [Modals (buildModal)](#modals)
  - [V2 Containers (buildContainer)](#v2-containers)
- [Error Handling](#error-handling)

---

## 📦 Installation

```bash
npm install easy-components-v2
```
> **Requirements:** `discord.js` v14.0.0 or higher.

---

## ✨ Features
- **Effortless Component Building:** Add Buttons, Dropdowns, and TextInputs without worrying about ActionRows. The builder handles row splitting (up to 5 buttons per row) automatically!
- **V2 UI Support:** Full support for Discord's newest UI components (`CheckboxGroup`, `RadioGroup`, `LabelBuilder`, `ContainerBuilder`).
- **Smart Modals:** Build modals in a single chain without manually formatting JSON payloads.
- **Smart Optional Fields:** Dropdowns and TextInputs are optional (`required: false`) by default, strictly following safe Discord.js practices!

---

## 🚀 Quick Start

```javascript
const EasyComponentsV2Builder = require('easy-components-v2');

// Build a simple UI with two buttons
const ui = new EasyComponentsV2Builder()
    .addButton({ customId: 'accept', label: 'Accept', style: 3 })
    .addButton({ customId: 'deny', label: 'Deny', style: 4 })
    .toPayload(); // Automatically generates the action rows!

await interaction.reply({ content: 'Choose an option:', ...ui });
```

---

## 🧩 Component Methods

### Buttons
Add standard buttons or link buttons.

```javascript
.addButton(options)
```
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customId`| String | Yes* | The component ID (required if `url` is missing) |
| `label`   | String | Yes* | Text on the button (required if `emoji` is missing) |
| `style`   | Number | No | Discord button style (1-5). Default is `1` (Primary). |
| `emoji`   | String | No | Emoji to display |
| `url`     | String | No | URL for Link buttons |
| `disabled`| Boolean| No | Whether the button is unclickable. Default `false`. |

---

### Dropdowns (Select Menus)
Supports String, User, Role, and Channel dropdowns. 
*Note: Dropdowns are optional by default. Set `required: true` if you want to force selection!*

```javascript
.addStringDropdown(options)
.addUserDropdown(options)
.addRoleDropdown(options)
.addChannelDropdown(options)
```
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customId`| String | Yes | The component ID |
| `options` | Array | Yes | (StringDropdown only) Array of `{label, value, description, emoji}` |
| `label`   | String | No | Optional Label for V2 layouts |
| `placeholder`| String | No | Text when nothing is selected |
| `minValues`| Number | No | Min selections (defaults to 1 if `required: true`, else 0) |
| `maxValues`| Number | No | Max selections |
| `required`| Boolean| No | Whether the user MUST interact with this. Default `false`. |

---

### Text Inputs
Used exclusively for Modals.

```javascript
.addTextInput(options)
```
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customId`| String | Yes | The component ID |
| `label`   | String | Yes | Label displayed above the input |
| `style`   | Number | No | 1 (Short) or 2 (Paragraph). Default `1`. |
| `placeholder`| String | No | Ghost text |
| `value`   | String | No | Pre-filled text |
| `required`| Boolean| No | Whether it must be filled out. Default `false`. |
| `minLength`| Number| No | Minimum chars required |
| `maxLength`| Number| No | Maximum chars allowed |

---

### V2 Components
If your bot is opted into Discord UI V2 elements, you can use these.

```javascript
.addCheckboxGroup(options)
.addRadioGroup(options)
```
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customId`| String | Yes | The component ID |
| `options` | Array | Yes | Array of `{label, value, description, checked}` |
| `required`| Boolean| No | Whether it requires a selection. Default `false`. |

---

## 🛠️ Building & Output

Once you've added your components, you need to compile them into a payload.

### Messages
Use `.toPayload(ephemeral)` when sending message replies.
```javascript
const payload = builder.toPayload(); 
await interaction.reply({ content: 'Hello', ...payload });

// Or ephemeral:
const hiddenPayload = builder.toPayload(true); 
```

### Modals
Modals require a Title and an ID before building.
```javascript
const modalPayload = new EasyComponentsV2Builder()
    .setModalId('feedback_form')
    .setModalTitle('Provide Feedback')
    .addTextInput({ customId: 'q1', label: 'Your thoughts?' })
    .buildModal();

await interaction.showModal(modalPayload);
```

### V2 Containers
For advanced layouts, compile the components into a `ContainerBuilder`.
```javascript
const container = builder.buildContainer();
```

---

## 🚨 Error Handling
`easy-components-v2` has an incredibly safe internal structure. If you forget a required parameter, it will **not** crash your bot. Instead, it logs a clear, human-readable solution to your console and safely falls back.

Example output:
```text
❌ [EasyComponentsV2Builder Error] in addStringDropdown
❓ Reason: Validation Failed
💡 Solution: Add at least one option to the "options" array. Example: options: [{label: "A", value: "a"}]
```
