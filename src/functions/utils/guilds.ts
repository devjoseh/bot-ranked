import { CategoryChannel, ChannelType, Client, Guild, PermissionsBitField, TextChannel, User, VoiceChannel } from "discord.js";

export async function getInvitableGuilds(client: Client<true>) {
    const guilds = await client.guilds.fetch()

    return Array.from(guilds
        .filter(g => g.permissions.has("CreateInstantInvite"))
        .values()
    )
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