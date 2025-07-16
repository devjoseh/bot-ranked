import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, Client, codeBlock, ColorResolvable, EmbedBuilder, Guild, GuildMember, InteractionReplyOptions, PermissionsBitField, Role, StringSelectMenuBuilder, TextChannel, User, VoiceChannel } from "discord.js";
import { channelManager, Database, RoleRecord, RoleType, supabase } from "#database";
import { moment, settings } from  '#settings'
import { icon, parseMs } from '#functions'
import TimeoutManager from './timeout.js'

export async function getInvitableGuilds(client: Client<true>) {
    const guilds = await client.guilds.fetch()

    return Array.from(guilds
        .filter(g => g.permissions.has("CreateInstantInvite"))
        .values()
    )
}

export function getGuildRole(guild:Guild, roles:RoleRecord[], type:RoleType) {
    return guild.roles.cache.get(roles.find(role => role.type === type)?.roleId || "") as Role;
}

const f = PermissionsBitField.Flags

export async function createCategory(guild:Guild, categoryName:string): Promise<CategoryChannel> {
    const category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [ f.ViewChannel ]
            }
        ]
    })

    return category;
}

export async function createChannel(
    guild: Guild, 
    user: User,
    channelName: string,
    channelType: ChannelType.GuildText | ChannelType.GuildVoice,
    categoryId: string,
    topic?: string,
    allowedRolesIds?: string[]
): Promise<TextChannel | VoiceChannel> {
    const permissionOverwrites = [
        {
            id: user.id,
            allow: [ f.ViewChannel, f.SendMessages, f.AttachFiles, f.ReadMessageHistory, f.SendVoiceMessages ]
        },
        {
            id: guild.roles.everyone,
            deny: [ f.ViewChannel ]
        }
    ];

    if (allowedRolesIds && allowedRolesIds.length > 0) {
        for (const roleId of allowedRolesIds) {
            permissionOverwrites.push({
                id: roleId,
                allow: [ f.ViewChannel, f.SendMessages, f.AttachFiles, f.ReadMessageHistory, f.SendVoiceMessages,f.ManageMessages 
                ]
            });
        }
    }

    const channel = await guild.channels.create({
        name: channelName,
        type: channelType,
        parent: categoryId,
        topic: topic,
        permissionOverwrites
    });

    if (topic && channel.isTextBased() && channel.type === ChannelType.GuildText) {
        await (channel as TextChannel).setTopic(topic);
    }

    return channel;
}

export async function startRequestTimeout(
    guild: Guild,
    requestId: string, 
    timeoutDuration:number, 
    groupData: Partial<Database["public"]["Tables"]["teams"]["Insert"]>
) {
    const { client } = guild;

    TimeoutManager.addTimeout(guild.id, requestId, timeoutDuration, async (guildId) => {
        const [
            reqMentoringChannelData,
            { data: group }
        ] = await Promise.all([
            channelManager.get(guildId, "solicitacoes_mentorias"),
            supabase
                .from("teams")
                .select(`
                    name,
                    code,
                    team_guild_channels (
                        text_id
                    ),
                    mentoring_requests (
                        user_id,
                        message_id,
                        description
                    )
                `)
                .match({ id: groupData.id })
                .eq("teams.team_guild_channels.server_id", guildId)
                .eq("teams.mentoring_requests.server_id", guildId)
                .single()
        ])

        const groupChannels = group!.team_guild_channels[0]
        const groupRequest = group!.mentoring_requests

        await supabase
        .from("mentoring_requests")
        .delete()
        .match({ team_id: groupData.id, server_id: guildId })

        const member = guild.members.cache.get(groupRequest?.user_id || "") as GuildMember | null;

        const mentoringChannel = guild.channels.cache.get(reqMentoringChannelData!.channelId) as TextChannel;
        const groupTextChannel = guild.channels.cache.get(groupChannels!.text_id) as TextChannel;

        const message = await mentoringChannel.messages.fetch(groupRequest!.message_id).catch(() => null)
        if(message) {
            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder({
                    customId: `mentoria/aceitar/${groupData.code}`,
                    label: "Mentoria Ignorada",
                    style: ButtonStyle.Secondary,
                    emoji: icon.alert,
                    disabled
                })
            )

            const embed = new EmbedBuilder()
            .setTitle(`${icon.warning} Mentoria Ignorada ${icon.warning}`)
            .setDescription(`### A solicitação de mentoria enviada pela equipe \`${groupData.name}\` não foi aceita dentro do prazo por nenhum mentor.`)
            .setColor(settings.colors.yellow as ColorResolvable)
            .setFooter({ text: settings.messages.footer, iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: `${icon.team} Equipe:`, value: `${icon.arrow_default_a} ${groupData.name}` },
                { name: `${icon.userid} Solicitação realizada por:`, value: `${icon.arrow_default_a} ${member ? member?.nickname || member?.user.username : "Não encontrado"}` },
                { name: `${icon.planilha_1} Descrição da solicitação:`, value: `${codeBlock(groupRequest!.description)}` },
            )
            
            await message.edit({ embeds: [embed], components: [row] })
        }

        groupTextChannel.send({ content: `${icon.warning} A solicitação de mentoria da equipe não foi aceita por nenhum mentor. Verifique se existe algum mentor online no momento e tente novamente. Descrição da solicitação: ${codeBlock(groupRequest!.description)}` })
    })
}

export async function acceptRequest(requestId: string, guildId: string) {
    if(TimeoutManager.hasTimeout(guildId, requestId)) {
        TimeoutManager.removeTimeout(guildId, requestId)
    }
}

type FeedbackItem = {
    feedback: string;
    finalized_at: number;
    mentor_id: string;
    request_date: number;
    duration: number;
};

export async function returnFeedbackEmbed(
    client: Client<true>,
    feedbacks: FeedbackItem[],
    page: number,
    teamId: string
) {
    feedbacks.sort((a, b) => b.finalized_at - a.finalized_at);

    const maxItems = 10;
    const pages = Math.ceil(feedbacks.length / maxItems);

    const pagePrefix = `feedback/navigate`;

    const currentItems = feedbacks.slice(
        page * maxItems,
        (page + 1) * maxItems
    );

    const components = [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder({
                customId: `feedback/show`,
                placeholder: `Selecione o feedback que deseja ver`,
                options: currentItems.map((feedback) => ({
                    label: feedback.feedback.substring(0, 100),
                    description: `${moment(feedback.finalized_at).format("DD/MM [às] HH:mm")} - ${parseMs(feedback.duration)} de mentoria`,
                    value: `${teamId}/${feedback.mentor_id}/${feedback.request_date}`,
                })),
            })
        ),

        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
                customId: `${pagePrefix}/${page - 1}/${teamId}`,
                emoji: icon.chevronleft,
                disabled: page === 0,
                style: ButtonStyle.Secondary,
            }),
            new ButtonBuilder({
                customId: `${pagePrefix}/00/${teamId}`,
                emoji: icon.house,
                disabled: page === 0,
                style: ButtonStyle.Secondary,
            }),
            new ButtonBuilder({
                customId: `${pagePrefix}/${page + 1}/${teamId}`,
                emoji: icon.chevronrightlogo,
                disabled: page >= pages - 1,
                style: ButtonStyle.Secondary,
            })
        ),
    ];

    const embed = new EmbedBuilder()
        .setColor(settings.colors.default as ColorResolvable)
        .setFooter({
            text: `Página ${page + 1}/${pages} — ${
                settings.messages.footer
            }`,
            iconURL: client.user.displayAvatarURL(),
        });
    return {
        embeds: [embed],
        components,
    } satisfies InteractionReplyOptions;
}