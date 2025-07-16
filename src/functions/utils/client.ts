import { GatewayIntentBits, IntentsBitField, Partials } from "discord.js";

const Messages = [
    IntentsBitField.Flags.DirectMessagePolls,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessageTyping,
];

const Guild = [
    IntentsBitField.Flags.GuildExpressions,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.Guilds,
];

const Other = [
    IntentsBitField.Flags.AutoModerationConfiguration,
    IntentsBitField.Flags.AutoModerationExecution,
];

const CustomItents = {
    Messages,
    Guild,
    Other,
    All: Object.values(IntentsBitField.Flags),
} as {  
    Messages: GatewayIntentBits[];
    Guild: GatewayIntentBits[];
    Other: GatewayIntentBits[];
    All: GatewayIntentBits[];
};

const CustomPartials = {
    All: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.SoundboardSound,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User,
    ],
} as {
    All: Partials[];
};

export { CustomItents, CustomPartials };
