class AsyncLock {
    private _queue: Array<() => void> = [];
    private _locked = false;

    async acquire(): Promise<void> {
        return new Promise((resolve) => {
            if(!this._locked) {
                this._locked = true;
                resolve()
            } else {
                this._queue.push(resolve)
            }
        })
    }

    release(): void {
        if(this._queue.length > 0) {
            // Se tiver alguém na fila, libera o próximo
            const nextResolve = this._queue.shift()
            nextResolve && nextResolve();
        } else {
            this._locked = false;
        }
    }
}

const teamLocks = new Map<string, AsyncLock>();

export function getTeamLock(key:string): AsyncLock {
    if(!teamLocks.has(key)) {
        teamLocks.set(key, new AsyncLock())
    }

    return teamLocks.get(key)!
}