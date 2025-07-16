import { ApplicationCommand, ApplicationCommandOptionChoiceData, ApplicationCommandType, AutocompleteInteraction, CacheType, ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, Collection, CommandInteraction, MessageApplicationCommandData, MessageContextMenuCommandInteraction, UserApplicationCommandData, UserContextMenuCommandInteraction } from "discord.js";
import { ContextName, SlashName } from "./base.types.js";
import { linesBuilder, spaceBuilder } from "#functions";
import { baseStorage } from "./base.storage.js";
import { logger } from "#settings";
import ck from "chalk";

type AutocompleteReturn = Promise<void | undefined | readonly ApplicationCommandOptionChoiceData[]>;

export type CommandType = Exclude<ApplicationCommandType, ApplicationCommandType.PrimaryEntryPoint>;
type Cache<D extends boolean> = D extends false ? "cached" : CacheType;

type ApplicationCommandData<
    N extends string, 
    D extends boolean,
    T extends CommandType
> = 
T extends ApplicationCommandType.User ? 
    UserApplicationCommandData & {
        name: ContextName<N>,
        run(interaction: UserContextMenuCommandInteraction<Cache<D>>): Promise<void>;
    } :
T extends ApplicationCommandType.Message ? 
    MessageApplicationCommandData & {
        name: ContextName<N>,
        run(interaction: MessageContextMenuCommandInteraction<Cache<D>>): Promise<void>;
    } :
    ChatInputApplicationCommandData & {
        name: SlashName<N>,
        run(interaction: ChatInputCommandInteraction<Cache<D>>): Promise<void>;
        autocomplete?(interaction: AutocompleteInteraction<Cache<D>>): AutocompleteReturn;
    }

export type CommandData<
    Name extends string,
    DmPermission extends boolean,
    Type extends CommandType
> = ApplicationCommandData<Name, DmPermission, Type> & {
    type?: Type, 
    dmPermission?: DmPermission;
    global?: boolean
}

export type GenericCommandData = CommandData<any, any, any>;

export async function baseCommandHandler(interaction: CommandInteraction){
	const { onNotFound, middleware, onError } = baseStorage.config.commands;
    const command = baseStorage.commands.get(interaction.commandName);

    if (!command) {
        onNotFound && onNotFound(interaction);
        return;
    };

    let block = false;
    if (middleware) await middleware(interaction, () => block=true);
    if (block) return;

    await command.run(interaction as never)
    .catch(err => {
        if (onError){
            onError(err, interaction);
            return;
        }
        throw err;
    });
}

export async function baseAutocompleteHandler(interaction: AutocompleteInteraction){
    const command = baseStorage.commands.get(interaction.commandName);
    if (command && "autocomplete" in command && command.autocomplete){
        const choices = await command.autocomplete(interaction);
        if (choices && Array.isArray(choices)){
            interaction.respond(choices.slice(0, 25));
        }
    };
}

export async function baseRegisterCommands(client: Client<true>) {
    const guilds = client.guilds.cache.filter(
        ({ id }) => baseStorage.config.commands.guilds.includes(id)
    );

    const messages: string[] = [];

    if (guilds?.size) {
        const [globalCommands, guildCommands] = baseStorage.commands
            .partition(c => c.global === true)
            .map(c => Array.from(c.values()));
        
        await client.application.commands.set(globalCommands)
        .then(commands => {
            if (!commands.size) return;
            messages.push(ck.green(`Foram carregados ${commands.size} comandos globalmente!`));
            if (baseStorage.config.commands.verbose){
                messages.push(...verbooseLogs(commands));
            }
        });
        for (const guild of guilds.values()) {
            await guild.commands.set(guildCommands)
            .then(commands => {
                messages.push(ck.green(`Foram carregados ${commands.size} comandos no servidor ${ck.cyan(guild.name)}!`))
                if (baseStorage.config.commands.verbose){
                    messages.push(...verbooseLogs(commands));
                }
            });
        }
        logger.log(linesBuilder(messages));
        return;
    }
    for (const guild of client.guilds.cache.values()) {
        guild.commands.set([]);
    }
    const commands = Array.from(baseStorage.commands.values());
    await client.application.commands.set(commands)
    .then(commands => {
        messages.push(ck.green(`Foram carregados ${commands.size} comandos globalmente!`));
        if (baseStorage.config.commands.verbose){
            messages.push(...verbooseLogs(commands));
        }
    });

    logger.log(linesBuilder(messages));
}

function verbooseLogs(commands: Collection<string, ApplicationCommand>){
    const u = ck.underline;
    return commands.map(({ id, name, type: commandType, client, createdAt, guild }) => {
        const [icon] = getCommandTitle(commandType);

        return ck.dim.green(spaceBuilder(
            ` └ ${icon}`,
            u.cyan(id),
            "CREATED",
            u.blue(name),
            ck.gray(">"),
            guild 
            ? `${u.blue(guild.name)} guild`
            : `${u.blue(client.user.username)} application`,
            ck.gray(">"),
            "created at:",
            u.greenBright(createdAt.toLocaleTimeString()),
        ));
    });
}

export function baseCommandLog(data: GenericCommandData){
    const [icon, type] = getCommandTitle(data.type);

    baseStorage.loadLogs.commands
    .push(ck.green(`${icon} ${type} ${ck.gray(">")} ${ck.blue.underline(data.name)} ✓`));
};

function getCommandTitle(type: ApplicationCommandType){
    return type === ApplicationCommandType.Message ? ["{☰}", "Message context menu"] :
    type === ApplicationCommandType.User ? ["{☰}", "User context menu"] :
    ["{/}", "Slash command"]
}