const {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    TextInputBuilder,
    ModalBuilder,
    ContainerBuilder,
    CheckboxGroupBuilder,
    CheckboxGroupOptionBuilder,
    RadioGroupBuilder,
    RadioGroupOptionBuilder,
    LabelBuilder,
    MessageFlags
} = require('discord.js');

const BuilderError = require('./lib/errors.js');

/**
 * A powerful, easy-to-use wrapper for Discord.js V14+ components.
 * Supports standard ActionRows as well as the new Discord UI V2 Components (Containers, Labels, Checkboxes).
 */
class EasyComponentsV2Builder {
    constructor() {
        this.components = [];
        this.modalId = null;
        this.modalTitle = null;
    }

    /**
     * Parses the 'required' option globally. Default is false.
     * Handles string 'false' safely.
     * @param {any} val The passed value for 'required'
     * @returns {boolean}
     */
    static parseRequired(val) {
        if (val === undefined) return false; // Default false, same as discord.js
        if (val === 'false' || val === false || val === 0) return false;
        return true;
    }

    /**
     * Set the ID of the Modal. Only required if you intend to call .buildModal()
     * @param {string} id The custom ID for the modal
     * @returns {this}
     */
    setModalId(id) {
        if (!id || typeof id !== 'string') {
            BuilderError.handle('setModalId', 'Invalid or missing parameters.', 'You must provide a valid string for the Modal ID. Example: .setModalId("my_modal")');
            return this;
        }
        this.modalId = id;
        return this;
    }

    /**
     * Set the Title of the Modal. Only required if you intend to call .buildModal()
     * @param {string} title The title displayed at the top of the modal
     * @returns {this}
     */
    setModalTitle(title) {
        if (!title || typeof title !== 'string') {
            BuilderError.handle('setModalTitle', 'Invalid or missing parameters.', 'You must provide a valid string for the Modal Title. Example: .setModalTitle("My Title")');
            return this;
        }
        this.modalTitle = title;
        return this;
    }

    /**
     * Add a Button component to your UI.
     * @param {Object} options Configuration for the Button
     * @param {string} [options.customId] The custom ID (required if url is not provided)
     * @param {string} [options.label] Text displayed on the button
     * @param {number} [options.style=1] Button style (1=Primary, 2=Secondary, 3=Success, 4=Danger, 5=Link)
     * @param {string} [options.emoji] Emoji to display on the button
     * @param {string} [options.url] URL for link buttons (requires style: 5)
     * @param {boolean} [options.disabled=false] Whether the button should be disabled
     * @returns {this}
     */
    addButton(options = {}) {
        try {
            const { customId, label, style = 1, emoji, url, disabled = false } = options;
            if (!customId && !url) throw new Error('Add a "customId" or a "url" to your button options.');
            if (!label && !emoji) throw new Error('Add at least a "label" or an "emoji" to your button options.');
            
            const btn = new ButtonBuilder();
            if (customId && !url) btn.setCustomId(customId);
            if (url) {
                btn.setURL(url);
                btn.setStyle(5); // Link style is required if URL is set
            } else {
                btn.setStyle(style);
            }
            if (label) btn.setLabel(label);
            if (emoji) btn.setEmoji(emoji);
            btn.setDisabled(disabled);
            this.components.push({ builder: btn, isV2Label: false });
        } catch (err) {
            BuilderError.handle('addButton', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a String Dropdown (Select Menu) component.
     * @param {Object} options Configuration for the dropdown
     * @param {string} options.customId The custom ID of the dropdown
     * @param {string} [options.label] Optional label for V2 Label layout
     * @param {string} [options.description] Optional description for V2 Label layout
     * @param {string} [options.placeholder] Placeholder text when nothing is selected
     * @param {Array<{label: string, value: string, description?: string, emoji?: string}>} options.options The dropdown items
     * @param {number} [options.minValues] Minimum number of items that must be selected
     * @param {number} [options.maxValues] Maximum number of items that can be selected
     * @param {boolean|string} [options.required=false] ob der Dropdown benötigt wird
     * @param {boolean} [options.disabled=false] Whether the dropdown should be disabled
     * @returns {this}
     */
    addStringDropdown(options = {}) {
        try {
            const { customId, label, description, placeholder, options: dropdownOptions = [], minValues, maxValues, disabled = false, required } = options;
            if (!customId) throw new Error('Add a "customId" to your dropdown options.');
            if (!dropdownOptions || dropdownOptions.length === 0) throw new Error('Add at least one option to the "options" array. Example: options: [{label: "A", value: "a"}]');
            
            const isRequired = EasyComponentsV2Builder.parseRequired(required);
            const finalMinValues = minValues !== undefined ? minValues : (isRequired ? 1 : 0);

            if (isRequired && finalMinValues === 0) {
                throw new Error('A required dropdown cannot have minValues set to 0. Either remove "required: true" or set "minValues" to at least 1.');
            }

            const menu = new StringSelectMenuBuilder().setCustomId(customId);
            if (placeholder) menu.setPlaceholder(placeholder);
            menu.setMinValues(finalMinValues);
            if (maxValues !== undefined) menu.setMaxValues(maxValues);
            if (disabled) menu.setDisabled(disabled);
            
            menu.addOptions(dropdownOptions);
            this.components.push({ builder: menu, isV2Label: true, label, description, v2Type: 'StringSelect', isRequired });
        } catch (err) {
            BuilderError.handle('addStringDropdown', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a User Dropdown (Select Menu) component.
     * @param {Object} options Configuration for the dropdown
     * @param {string} options.customId The custom ID of the dropdown
     * @param {string} [options.label] Optional label for V2 Label layout
     * @param {string} [options.description] Optional description for V2 Label layout
     * @param {string} [options.placeholder] Placeholder text when nothing is selected
     * @param {number} [options.minValues] Minimum number of items that must be selected
     * @param {number} [options.maxValues] Maximum number of items that can be selected
     * @param {boolean|string} [options.required=false] ob der Dropdown benötigt wird
     * @param {boolean} [options.disabled=false] Whether the dropdown should be disabled
     * @returns {this}
     */
    addUserDropdown(options = {}) {
        try {
            const { customId, label, description, placeholder, minValues, maxValues, disabled = false, required } = options;
            if (!customId) throw new Error('Add a "customId" to your user dropdown options.');

            const isRequired = EasyComponentsV2Builder.parseRequired(required);
            const finalMinValues = minValues !== undefined ? minValues : (isRequired ? 1 : 0);

            if (isRequired && finalMinValues === 0) {
                throw new Error('A required user dropdown cannot have minValues set to 0. Either remove "required: true" or set "minValues" to at least 1.');
            }

            const menu = new UserSelectMenuBuilder().setCustomId(customId);
            if (placeholder) menu.setPlaceholder(placeholder);
            menu.setMinValues(finalMinValues);
            if (maxValues !== undefined) menu.setMaxValues(maxValues);
            if (disabled) menu.setDisabled(disabled);
            this.components.push({ builder: menu, isV2Label: true, label, description, v2Type: 'UserSelect', isRequired });
        } catch (err) {
            BuilderError.handle('addUserDropdown', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a Role Dropdown (Select Menu) component.
     * @param {Object} options Configuration for the dropdown
     * @param {string} options.customId The custom ID of the dropdown
     * @param {string} [options.label] Optional label for V2 Label layout
     * @param {string} [options.description] Optional description for V2 Label layout
     * @param {string} [options.placeholder] Placeholder text when nothing is selected
     * @param {number} [options.minValues] Minimum number of items that must be selected
     * @param {number} [options.maxValues] Maximum number of items that can be selected
     * @param {boolean|string} [options.required=false] ob der Dropdown benötigt wird
     * @param {boolean} [options.disabled=false] Whether the dropdown should be disabled
     * @returns {this}
     */
    addRoleDropdown(options = {}) {
        try {
            const { customId, label, description, placeholder, minValues, maxValues, disabled = false, required } = options;
            if (!customId) throw new Error('Add a "customId" to your role dropdown options.');

            const isRequired = EasyComponentsV2Builder.parseRequired(required);
            const finalMinValues = minValues !== undefined ? minValues : (isRequired ? 1 : 0);

            if (isRequired && finalMinValues === 0) {
                throw new Error('A required role dropdown cannot have minValues set to 0. Either remove "required: true" or set "minValues" to at least 1.');
            }

            const menu = new RoleSelectMenuBuilder().setCustomId(customId);
            if (placeholder) menu.setPlaceholder(placeholder);
            menu.setMinValues(finalMinValues);
            if (maxValues !== undefined) menu.setMaxValues(maxValues);
            if (disabled) menu.setDisabled(disabled);
            this.components.push({ builder: menu, isV2Label: true, label, description, v2Type: 'RoleSelect', isRequired });
        } catch (err) {
            BuilderError.handle('addRoleDropdown', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a Channel Dropdown (Select Menu) component.
     * @param {Object} options Configuration for the dropdown
     * @param {string} options.customId The custom ID of the dropdown
     * @param {string} [options.label] Optional label for V2 Label layout
     * @param {string} [options.description] Optional description for V2 Label layout
     * @param {string} [options.placeholder] Placeholder text when nothing is selected
     * @param {number} [options.minValues] Minimum number of items that must be selected
     * @param {number} [options.maxValues] Maximum number of items that can be selected
     * @param {Array<number>} [options.channelTypes] Array of channel types allowed to be selected
     * @param {boolean|string} [options.required=false] ob der Dropdown benötigt wird
     * @param {boolean} [options.disabled=false] Whether the dropdown should be disabled
     * @returns {this}
     */
    addChannelDropdown(options = {}) {
        try {
            const { customId, label, description, placeholder, minValues, maxValues, channelTypes, disabled = false, required } = options;
            if (!customId) throw new Error('Add a "customId" to your channel dropdown options.');

            const isRequired = EasyComponentsV2Builder.parseRequired(required);
            const finalMinValues = minValues !== undefined ? minValues : (isRequired ? 1 : 0);

            if (isRequired && finalMinValues === 0) {
                throw new Error('A required channel dropdown cannot have minValues set to 0. Either remove "required: true" or set "minValues" to at least 1.');
            }

            const menu = new ChannelSelectMenuBuilder().setCustomId(customId);
            if (placeholder) menu.setPlaceholder(placeholder);
            menu.setMinValues(finalMinValues);
            if (maxValues !== undefined) menu.setMaxValues(maxValues);
            if (channelTypes) menu.setChannelTypes(channelTypes);
            if (disabled) menu.setDisabled(disabled);
            this.components.push({ builder: menu, isV2Label: true, label, description, v2Type: 'ChannelSelect', isRequired });
        } catch (err) {
            BuilderError.handle('addChannelDropdown', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a Text Input component. This is primarily used for Modals.
     * @param {Object} options Configuration for the Text Input
     * @param {string} options.customId The custom ID of the input
     * @param {string} options.label The label displayed above the input
     * @param {string} [options.description] Optional description for V2 Label layout
     * @param {number} [options.style=1] 1 for Short input, 2 for Paragraph input
     * @param {string} [options.placeholder] Placeholder text
     * @param {string} [options.value] Pre-filled value
     * @param {boolean|string} [options.required=false] Whether the input must be filled
     * @param {number} [options.minLength] Minimum characters required
     * @param {number} [options.maxLength] Maximum characters allowed
     * @returns {this}
     */
    addTextInput(options = {}) {
        try {
            const { customId, label, description, style = 1, placeholder, value, required, minLength, maxLength } = options;
            if (!customId) throw new Error('Add a "customId" to your TextInput options.');
            if (!label) throw new Error('Add a "label" to your TextInput options.');

            const isRequired = EasyComponentsV2Builder.parseRequired(required);

            const input = new TextInputBuilder()
                .setCustomId(customId)
                .setLabel(label)
                .setStyle(style)
                .setRequired(isRequired);
            
            if (placeholder) input.setPlaceholder(placeholder);
            if (value) input.setValue(value);
            if (minLength !== undefined) input.setMinLength(minLength);
            if (maxLength !== undefined) input.setMaxLength(maxLength);

            this.components.push({ builder: input, isV2Label: true, label, description, v2Type: 'TextInput', isRequired });
        } catch (err) {
            BuilderError.handle('addTextInput', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a Checkbox Group (V2 Component)
     * @param {Object} options Configuration for the Checkbox Group
     * @param {string} options.customId The custom ID of the group
     * @param {Array<{label: string, value: string, description?: string, checked?: boolean}>} options.options Checkbox items
     * @param {boolean|string} [options.required=false] Whether the group requires a selection
     * @returns {this}
     */
    addCheckboxGroup(options = {}) {
        try {
            const { customId, options: cbOptions = [], required } = options;
            if (!customId) throw new Error('Add a "customId" to your CheckboxGroup options.');
            if (!cbOptions || cbOptions.length === 0) throw new Error('Add at least one option to the "options" array.');
            if (!CheckboxGroupBuilder) throw new Error('Update your discord.js to a version that supports CheckboxGroupBuilder.');

            const isRequired = EasyComponentsV2Builder.parseRequired(required);
            const group = new CheckboxGroupBuilder().setCustomId(customId);
            
            if (typeof group.setRequired === 'function') {
                group.setRequired(isRequired);
            }

            for (const opt of cbOptions) {
                if (!opt.label || !opt.value) throw new Error('Each Checkbox option in the array must contain a "label" and a "value".');
                const cbOpt = new CheckboxGroupOptionBuilder().setLabel(opt.label).setValue(opt.value);
                if (opt.description) cbOpt.setDescription(opt.description);
                if (opt.checked) cbOpt.setChecked(true);
                group.addOptions(cbOpt);
            }
            this.components.push({ builder: group, isV2Label: false });
        } catch (err) {
            BuilderError.handle('addCheckboxGroup', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Add a Radio Group (V2 Component)
     * @param {Object} options Configuration for the Radio Group
     * @param {string} options.customId The custom ID of the group
     * @param {Array<{label: string, value: string, description?: string, checked?: boolean}>} options.options Radio items
     * @param {boolean|string} [options.required=false] Whether the group requires a selection
     * @returns {this}
     */
    addRadioGroup(options = {}) {
        try {
            const { customId, options: rgOptions = [], required } = options;
            if (!customId) throw new Error('Add a "customId" to your RadioGroup options.');
            if (!rgOptions || rgOptions.length === 0) throw new Error('Add at least one option to the "options" array.');
            if (!RadioGroupBuilder) throw new Error('Update your discord.js to a version that supports RadioGroupBuilder.');

            const isRequired = EasyComponentsV2Builder.parseRequired(required);
            const group = new RadioGroupBuilder().setCustomId(customId);
            
            if (typeof group.setRequired === 'function') {
                group.setRequired(isRequired);
            }

            for (const opt of rgOptions) {
                if (!opt.label || !opt.value) throw new Error('Each Radio option in the array must contain a "label" and a "value".');
                const rgOpt = new RadioGroupOptionBuilder().setLabel(opt.label).setValue(opt.value);
                if (opt.description) rgOpt.setDescription(opt.description);
                if (opt.checked) rgOpt.setChecked(true);
                group.addOptions(rgOpt);
            }
            this.components.push({ builder: group, isV2Label: false });
        } catch (err) {
            BuilderError.handle('addRadioGroup', 'Validation Failed', err.message);
        }
        return this;
    }

    /**
     * Internal method to build ActionRows.
     * Groups up to 5 buttons per row, or places single components into their own rows.
     * @returns {Array<ActionRowBuilder>}
     */
    buildRows() {
        const rows = [];
        let currentButtonRow = new ActionRowBuilder();

        for (const item of this.components) {
            const component = item.builder;
            if (component instanceof ButtonBuilder) {
                if (currentButtonRow.components.length >= 5) {
                    rows.push(currentButtonRow);
                    currentButtonRow = new ActionRowBuilder();
                }
                currentButtonRow.addComponents(component);
            } else {
                if (currentButtonRow.components.length > 0) {
                    rows.push(currentButtonRow);
                    currentButtonRow = new ActionRowBuilder();
                }
                
                if (
                    !(CheckboxGroupBuilder && component instanceof CheckboxGroupBuilder) &&
                    !(RadioGroupBuilder && component instanceof RadioGroupBuilder)
                ) {
                    rows.push(new ActionRowBuilder().addComponents(component));
                }
            }
        }

        if (currentButtonRow.components.length > 0) {
            rows.push(currentButtonRow);
        }

        return rows;
    }

    /**
     * Compile the added components into a Discord Modal response payload.
     * Note: A Modal requires setModalId() and setModalTitle() to be called first.
     * @returns {Object} JSON Modal Payload
     */
    buildModal() {
        try {
            if (!this.modalId || !this.modalTitle) {
                throw new Error("Use setModalId() and setModalTitle() before calling buildModal().");
            }
            if (this.components.length === 0) {
                throw new Error("Add at least one component (like addTextInput) before building the modal.");
            }
            
            const v2Components = [];
            for (const item of this.components) {
                if (item.isV2Label) {
                    const lbl = new LabelBuilder();
                    if (item.label) lbl.setLabel(item.label);
                    if (item.description) lbl.setDescription(item.description);
                    if (item.isRequired !== undefined && typeof lbl.setRequired === 'function') {
                        lbl.setRequired(item.isRequired);
                    }

                    const innerJson = item.builder.toJSON();
                    if (item.isRequired !== undefined) {
                        innerJson.required = item.isRequired;
                    }

                    switch (item.v2Type) {
                        case 'StringSelect': lbl.setStringSelectMenuComponent(innerJson); break;
                        case 'UserSelect': lbl.setUserSelectMenuComponent(innerJson); break;
                        case 'RoleSelect': lbl.setRoleSelectMenuComponent(innerJson); break;
                        case 'ChannelSelect': lbl.setChannelSelectMenuComponent(innerJson); break;
                        case 'TextInput': 
                            delete innerJson.label;
                            lbl.setTextInputComponent(innerJson); 
                            break;
                    }
                    
                    const rawLbl = lbl.toJSON();
                    if (item.isRequired !== undefined) {
                        rawLbl.required = item.isRequired;
                    }
                    v2Components.push(rawLbl);
                } else {
                    v2Components.push(new ActionRowBuilder().addComponents(item.builder).toJSON());
                }
            }

            const rawData = {
                custom_id: this.modalId,
                title: this.modalTitle,
                components: v2Components,
                flags: 32768
            };

            return { toJSON: () => rawData };
        } catch (err) {
            BuilderError.handle('buildModal', 'Validation Failed', err.message);
            // Fallback Modal to prevent Discord crash
            return {
                toJSON: () => ({
                    custom_id: 'error_modal_fallback',
                    title: 'System Error',
                    components: [],
                    flags: 32768
                })
            };
        }
    }

    /**
     * Compile the components into a Discord UI V2 Container.
     * Note: You must be on a Discord.js version that supports ContainerBuilder.
     * @returns {ContainerBuilder|null}
     */
    buildContainer() {
        try {
            if (!ContainerBuilder) throw new Error("Update discord.js to a version that supports ContainerBuilder.");
            const container = new ContainerBuilder();
            
            const rows = this.buildRows();
            if (rows.length > 0) {
                rows.forEach(row => container.addActionRowComponents(row));
            }

            for (const item of this.components) {
                const component = item.builder;
                if (CheckboxGroupBuilder && component instanceof CheckboxGroupBuilder) {
                    if (typeof container.addCheckboxGroupComponents === 'function') {
                        container.addCheckboxGroupComponents(component);
                    } else if (typeof container.addComponents === 'function') {
                        container.addComponents(component);
                    }
                } else if (RadioGroupBuilder && component instanceof RadioGroupBuilder) {
                    if (typeof container.addRadioGroupComponents === 'function') {
                        container.addRadioGroupComponents(component);
                    } else if (typeof container.addComponents === 'function') {
                        container.addComponents(component);
                    }
                }
            }
            
            return container;
        } catch (err) {
            BuilderError.handle('buildContainer', 'Validation Failed', err.message);
            return null; // Fallback
        }
    }

    /**
     * Compile the components into a payload suitable for message replies/edits.
     * @param {boolean} [ephemeral=false] Should the response be ephemeral?
     * @returns {Object} Message Payload object containing components
     */
    toPayload(ephemeral = false) {
        try {
            const payload = {
                components: this.buildRows()
            };
            if (ephemeral) {
                payload.flags = 64;
            }
            return payload;
        } catch (err) {
            BuilderError.handle('toPayload', 'Build Failed', err.message);
            return { components: [], content: 'An error occurred while building the UI.' };
        }
    }
}

module.exports = EasyComponentsV2Builder;
