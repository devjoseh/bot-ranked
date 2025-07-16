import { TextInputStyle, TextInputBuilder, ModalSubmitInteraction, ActionRowBuilder, ModalActionRowComponentBuilder } from "discord.js";

interface TextInputData {
    label: string;
    placeholder?: string;
    style?: TextInputStyle;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
}

interface ModalFieldsData {
    [key: string]: TextInputData;
}

interface ModalFieldValues {
    [key: string]: string;
}

export function createRow(...components: ModalActionRowComponentBuilder[]): ActionRowBuilder<ModalActionRowComponentBuilder> {
    return new ActionRowBuilder<ModalActionRowComponentBuilder>({ components })
}

export function createModalInput(data: TextInputData & { customId: string }): ActionRowBuilder<ModalActionRowComponentBuilder> {
    data.style ?? ( data.style = TextInputStyle.Short );
    return createRow(new TextInputBuilder(data));
}

export function createModalFields(data: ModalFieldsData): ActionRowBuilder<ModalActionRowComponentBuilder>[] {
    return Object.entries(data).map(
        ([ customId, data2 ]) => createModalInput(Object.assign({ customId }, data2))
    );
}

export function modalFieldsToRecord(fields: ModalSubmitInteraction | { fields: { fields: any } } | any): ModalFieldValues {
    const reduceFunction = (data: ModalFieldValues, { customId, value }: { customId: string; value: any }) =>
        Object.assign(data, { [customId]: value });

    const modalFields = fields instanceof ModalSubmitInteraction
        ? fields.fields.fields
        : "fields" in fields
        ? fields.fields
        : fields;

    return modalFields.reduce(reduceFunction, {});
}