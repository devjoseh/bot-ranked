import { Collection } from "discord.js";

type TimeoutCallback = (guildId: string, requestId: string) => Promise<void>

class TimeoutManager {
    private static instance: TimeoutManager;
    private timeouts: Collection<string, Map<string, NodeJS.Timeout>>

    private constructor() {
        this.timeouts = new Collection;
    }

    public static getInstance(): TimeoutManager {
        if(!TimeoutManager.instance) {
            TimeoutManager.instance = new TimeoutManager()
        }

        return TimeoutManager.instance;
    }

    public addTimeout(guildId: string, requestId: string, duration: number, callback: TimeoutCallback): void {
        const timer = duration * 1000
        
        if(!this.timeouts.has(guildId)) {
            this.timeouts.set(guildId, new Map());
        }

        const guildTimeouts = this.timeouts.get(guildId)!
        const timeout = setTimeout(async () => {
            await callback(guildId, requestId)
            this.removeTimeout(guildId, requestId)
        }, timer);

        guildTimeouts.set(requestId, timeout)
    }

    public removeTimeout(guildId: string, requestId: string): boolean {
        const guildTimeouts = this.timeouts.get(guildId)
        if(!guildTimeouts) return false;

        const timeout = guildTimeouts.get(requestId)
        if(!timeout) return false;

        clearTimeout(timeout)
        return guildTimeouts.delete(requestId)
    }

    public clearGuildTimeouts(guildId: string): void {
        const guildTimeouts = this.timeouts.get(guildId)
        if(guildTimeouts) {
            guildTimeouts.forEach(timeout => clearTimeout(timeout));
            this.timeouts.delete(guildId)
        }
    }

    public hasTimeout(guildId: string, requestId: string): boolean {
        return !!this.timeouts.get(guildId)?.has(requestId)
    }
}

export default TimeoutManager.getInstance();