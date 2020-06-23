import {existsSync, readFileSync} from 'fs';
import {resolve as resolvePath} from 'path';

interface GrepOptions {
    keysPattern?: string;
    valuesPattern?: string;
    result: 'keys' | 'values'
}

type Greppable = string | Buffer | Object;

export class JSONGrep {
    private data: Promise<string>;

    constructor(data: Greppable) {
        this.data = new Promise(async (resolve, reject) => {
            switch (typeof data) {
                case 'string':
                    let json: string;
                    try {
                        json = data;
                        JSON.parse(data)
                        resolve(Promise.resolve(data));
                    } catch (_) {
                    }

                    try {
                        const path = resolvePath(data);
                        if (existsSync(path)) {
                            const file = readFileSync(path, 'utf-8');
                            json = file;
                            JSON.parse(file);
                            resolve(file);
                        }
                    } catch (_) {
                    }

                    reject(`invalid json: ${json.slice(0, 50)}...`);
                    break
                case 'object':
                    if (data instanceof Buffer) {
                        resolve(Promise.resolve(data.toString('utf-8')))
                    } else {
                        resolve(Promise.resolve(JSON.stringify(data)));
                    }
                    break

            }
        });
        return this;
    }

    public async keys(...searchStrings: (string | number | RegExp)[]): Promise<(string | number)[]> {
        return JSONGrep.grep(await this.data, {
            valuesPattern: searchStrings.map(p => JSONGrep.escapeRegExp(p)).join('|'),
            result: 'keys'
        })
    }

    public async values(...searchStrings: (string | number | RegExp)[]): Promise<(string | number)[]> {
        return JSONGrep.grep(await this.data, {
            keysPattern: searchStrings.map(p => JSONGrep.escapeRegExp(p)).join('|'),
            result: 'values'
        })
    }

    private static grep(json: string, {keysPattern = `[a-zA-Z0-9_\-]*`, valuesPattern = `"?[^",]*[",]`, result}: GrepOptions): (string | number)[] {
        const regExp: RegExp = new RegExp(`"?(${keysPattern})"?:\\s*"?(${valuesPattern})"?`, 'g');
        const matches = json.match(regExp);
        if (!matches) {
            return [];
        }

        return matches.map((match) => {
            const [key, value] = this.strip(match).split(':');
            switch (result) {
                case 'keys':
                    return key;
                case 'values':
                    return Number(value) || this.strip(value);
            }
        });
    }

    private static strip(s: string): string {
        return String(s).replace(/[",}\]\s]/g, '');
    }

    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
    private static escapeRegExp(s: string | number | RegExp): string {
        if (s instanceof RegExp) {
            return s.source;
        }

        return String(s).replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}

export default (greppable: Greppable) => new JSONGrep(greppable);