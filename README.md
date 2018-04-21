Wikipedia defines Fuzzing as:

> Fuzzing or fuzz testing is an automated software testing technique that involves providing invalid, unexpected, or random data as inputs to a computer program.
> The program is then monitored for exceptions such as crashes, or failing built-in code assertions or for finding potential memory leaks.

This repository derives a property based testing framework called [fast-check](https://github.com/dubzzz/fast-check/) into a fuzzing system.

## Steps to run this code locally:

```sh
git clone https://github.com/dubzzz/fuzz-rest-api.git
cd fuzz-rest-api
npm install
npm run start #launch a webserver on port 8080
npm run test  #run the 'fuzzing'
```

It intentially comes with an unsafe implementation of its APIs.

- /api/login - does not escape incoming parameters from POST
- /api/profile/:uid - considers uid to be an integer while its not

## How does it work?

This Proof-Of-Concept uses the power of property based testing to generate inputs for a REST end-point.
It sends the generated values to this end-point and check for the property - _whatever the data I send I should not receive an Internal Error aka 500_.

Basically defining the REST inputs using fast check is quite simple:
```js
fc.record({
  nameOfFieldOne: fc.string(),
  nameOfFieldTwo: fc.string(),
  nameOfFieldThree: fc.string(),
  //...
  nameOfFieldWithMoreComplexLayout: fc.record({
    subFieldOne: fc.string(),
    //...
  })
})
```

In the above example `nameOfFieldOne`, `nameOfFieldTwo`... are all filled with string values. Depending on your API you may want to be more precise on the types you are using. The benefit of specifying the real types is that you may find bugs deaper in the code.

Nonetheless the two approches are fully complementary.

One solution to have the better of those two worlds is to use `fc.oneof(/*realType*/, fc.string())` everywhere you want to specify real type.

You may also use the helper https://github.com/dubzzz/fuzz-rest-api/blob/master/test/inferPayloadArbitrary.js in order to automatically build the arbitrary from a given payload. With this helper, input `{min: 9, max: 30, label: 'toto'}` will produce the arbitrary `fc.record({min: fc.integer(), max: fc.integer(), label: fc.string()})`.
