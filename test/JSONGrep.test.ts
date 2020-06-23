import {expect} from 'chai';
import {readFileSync} from "fs";
import grep from "../src/JSONGrep";

describe('JSONGrep', () => {
    it('should grep a json string for keys that contain the specified value', async () => {
        const examples: any = [
            ['{"key":"value","key2":"value","key3":"otherValue"}', ['value'], ['key', 'key2']],
            ['{\n\t"key": "value",\n\t"key2": "value",\n\t"key3": "otherValue"\n}', ['value'], ['key', 'key2']],
            ['{"key":45,"key2":45,"key3":46}', [45], ['key', 'key2']],
            ['{\n\t"key": 45,\n\t"key2": 45,\n\t"key3": 46}', [45], ['key', 'key2']],
            ['{"key":"value","key2":"value2","key3":"otherValue"}', ['value', 'value2'], ['key', 'key2']],
            ['{"key":45,"key2":46,"key3":47}', [45, 46], ['key', 'key2']],
            ['{"key":"value","key2":"value2","key3":"otherValue"}', [/value\d?/], ['key', 'key2']],
            ['{"key":45,"key2":46,"key3":47}', [/[4-6]{2}/], ['key', 'key2']],
        ];

        for (const example in examples) {
            const [greppable, args, expected] = examples[example];
            expect(await grep(greppable).keys(...args)).to.eql(
                expected,
                `failed for example ${Number(example) + 1}`
            );
        }
    });

    it('should grep a json string for values that have the specified key', async () => {
        const examples: any = [
            ['[{"key":"value1"},{"key":"value2"},{"otherKey":"otherValue"}]', ['key'], ['value1', 'value2']],
            ['[\n\t{"key":"value1"},\n\t{"key":"value2"},\n\t{"otherKey":"otherValue"}\n\t]', ['key'], ['value1', 'value2']],
            ['[{"key":45},{"key":46},{"otherKey":47}]', ['key'], [45, 46]],
            ['[\n\t{"key":45},\n\t{"key":46},\n\t{"otherKey":47}\n\t]', ['key'], [45, 46]],
            ['{"key":"value","key2":"value2","key3":"otherValue"}', ['key', 'key2'], ['value', 'value2']],
            ['{"key":45,"key2":46,"key3":47}', ['key', 'key2'], [45, 46]],
            ['{"key":"value","key2":"value2","key3":"otherValue"}', [/key\d/], ['value2', 'otherValue']],
            ['{"key":45,"key2":46,"key3":47}', [/key2?/], [45, 46]],
        ];

        for (const example in examples) {
            const [greppable, args, expected] = examples[example];
            expect(await grep(greppable).values(...args)).to.eql(
                expected,
                `failed for example ${Number(example) + 1}`
            );
        }
    });

    it('should support multiple input types', async () => {
        const examples: any = [
            [[{"key": "value1"}, {"key": "value2"}, {"otherKey": "otherValue"}], ['key'], ['value1', 'value2']],
            [Buffer.from(readFileSync(__dirname + '/test.json')), ['key'], ['value1', 'value2']],
            [__dirname + '/test.json', ['key'], ['value1', 'value2']],
        ];

        for (const example in examples) {
            const [greppable, args, expected] = examples[example];
            expect(await grep(greppable).values(...args)).to.eql(
                expected,
                `failed for example ${Number(example) + 1}`
            );
        }
    });

    it('handles input errors', async () => {
        const examples: any = [
            [__dirname + '/invalid.json', ['key'], 'invalid json: Not Found...'],
            ['Not Found', ['key'], 'invalid json: Not Found...'],
        ];

        for (const example in examples) {
            const [greppable, args, expected] = examples[example];
            try {
                await grep(greppable).values(args);
            } catch (e) {
                expect(e).to.eq(expected, `failed for example ${Number(example) + 1}`)
            }
        }

    })
});
