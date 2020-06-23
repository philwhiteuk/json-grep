# json-grep

Grep a json object for useful information when you don't know enough about its hierarchy.

## Basic Usage

```
// ...
import grep from 'json-grep';

const keys = await grep('poll-register.json').keys('Jane Doe', 'Exeter', 'EX12 1AA');
// result === ['name', 'address', 'postcode']

// or inversely...

const values = await grep('poll-register.json').values('name', 'age', 'postcode');
// values === ['Jane Doe', 42, 'EX12 1AA']
```

## Advanced Usage

### Support for regex

```
const keys = await grep(json).keys(/EX12.*/);
// result === ['postcode']
```

### Support for multiple input types

```
// string
const json = '{"voters":[{"name":"Jane Doe","age":42,"address":"Exeter","postcode":"EX12 1AA"}]}';
const keys = await grep(json).keys('foo');

// Object
const keys = await grep(myObj).keys('foo');

// Buffer 
const keys = await grep(Buffer.from(myReadStream)).keys('foo');
```

### Working with more complex data structures

Combine with a library like JSONPath Plus (https://www.npmjs.com/package/jsonpath-plus) to reach elements that can then be grepped:

```
// ...
import {JSONPath} from 'jsonpath-plus';

const json = {
    voter_regions: [
        {
            region: 'Devon_Cornwall',
            voters: [
                {
                    name: 'Jane Doe',
                    age: 42,
                    address: 'Exeter',
                    postcode: 'EX12 1AA'
                }
            ]
        },
        {
            region: 'Somerset',
            voters: [
                {
                    name: 'Harry Dunn',
                    age: 19,
                    address: 'Bridgewater',
                    postcode: 'TA14 4FS'
                }
            ]
        }
    ]
};

const voterRegions = new JSONPath({
    path: `$..['voters']`,
    json,
  }
);

const votersByRegion = await grep(voterRegions).values('name', 'age', 'postcode');
// votersByRegion === [['Jane Doe', 42, 'EX12 1AA'],['Harry Dunn', 19, 'TA14 4FS']]
```