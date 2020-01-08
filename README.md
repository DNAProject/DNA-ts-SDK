
<h1 align="center">DNA TypeScript SDK </h1>
<h4 align="center">Version V1.1.0 </h4>

- [Overview](#overview)
- [Installation](#installation)
  - [Download Through npm/Yarn](#download-through-npmyarn)
  - [Build from Source Code](#build-from-source-code)
    - [Downloading](#downloading)
    - [Compiling](#compiling)
    - [Testing](#testing)
  - [Use in Project](#use-in-project)
    - [Import](#import)
    - [Require](#require)
    - [In the Browser](#in-the-browser)
- [Contributing](#contributing)
- [License](#license)

## Overview

This is the official DNA TypeScript SDK - a comprehensive library for developing with the DNA blockchain in both TypeScript and JavaScript. It currently supports management of wallets, digital identities and digital assets - as well as the deployment and invocation of smart contracts.

## Installation

### Download Through npm/Yarn

````
npm install 'dna-ts-sdk' --save
````

or

```
yarn add 'dna-ts-sdk'
```

### Build from Source Code

#### Downloading

```
git clone 'https://github.com/DNAProject/DNA-ts-SDK.git'
```

Then install the dependencies with:

```
npm install
```

or

```
yarn
```

#### Compiling

Compile the project with the:

````
npm run build:dev // or npm run build:prod
````

or

```
yarn run build:dev // or yarn run build:prod
```

This will create a compiled version of the SDK in the `lib` directory.

#### Testing

To run the tests in the `test` directory, use:

```
npm run test
```

or

```
yarn run test
```

### Use in Project

#### Import

Using `import` to include the modules from `'DNA-ts-sdk'`:

```
import {Wallet} from 'DNA-ts-sdk';
var wallet = Wallet.create('test');
```

#### Require

Using `require` to include the modules from `'DNA-ts-sdk'`:

````
var DNA = require('DNA-ts-sdk');
var wallet = DNA.Wallet.create('test');
````

#### In the Browser

To use in the browser you must use the compiled version (as listed above).
The `browser.js` file is located in the `lib` directory.
Include it into the project with a `<script>` tag:

````
<script src="./lib/browser.js"></script>
````

Everything will be available under the `DNA` variable, just like in the `require` example above.

```
var wallet = DNA.Wallet.create('test');
```

## Contributing

Contributors are welcome to the `DNA-ts-sdk`. Before beginning, please take a look at our [contributing guidelines](CONTRIBUTING.md). You can open an issue by [clicking here](https://github.com/DNAProject/DNA-ts-sdk/issues/new).

## License

The DNA TypeScript SDK is availabl under the [LGPL-3.0 License](LICENSE).
