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

## Output of test command

`npm run test` produces the following output:

```
$ npm run test

> poc-fuzz-rest-api@1.0.0 test ...
> mocha --require babel-polyfill --require babel-register "test/**/*.js"



  Fuzzing REST API
    1) /api/login
    2) /api/profile/:uid
    3) /api/comment


  0 passing (452ms)
  3 failing

  1) Fuzzing REST API
       /api/login:
     Error: Property failed after 5 tests (seed: 1524328189654, path: 4:0:0:1:0:4): [{"password":"'"}]
Shrunk 5 time(s)
Got error: Error: Internal Server Error, got: {"data":"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Error: SQLITE_ERROR: unrecognized token: &quot;&#39;&#39;&#39;&quot;</pre>\n</body>\n</html>\n","status":500}

Stack trace: Error: Internal Server Error, got: {"data":"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Error: SQLITE_ERROR: unrecognized token: &quot;&#39;&#39;&#39;&quot;</pre>\n</body>\n</html>\n","status":500}
    at exports.throwIfHttpFailed (test/asyncHttp.js:38:33)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
      at throwIfFailed (node_modules\fast-check\src\check\runner\utils\utils.ts:146:11)
      at <anonymous>
      at process._tickCallback (internal/process/next_tick.js:188:7)

  2) Fuzzing REST API
       /api/profile/:uid:
     Error: Property failed after 1 tests (seed: 1524328189825, path: 0:1:0:0:0): ["\u0000"]
Shrunk 4 time(s)
Got error: Error: Internal Server Error, got: {"data":"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Error: SQLITE_ERROR: near &quot;=&quot;: syntax error</pre>\n</body>\n</html>\n","status":500}

Stack trace: Error: Internal Server Error, got: {"data":"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Error: SQLITE_ERROR: near &quot;=&quot;: syntax error</pre>\n</body>\n</html>\n","status":500}
    at exports.throwIfHttpFailed (test/asyncHttp.js:38:33)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
      at throwIfFailed (node_modules\fast-check\src\check\runner\utils\utils.ts:146:11)
      at <anonymous>
      at process._tickCallback (internal/process/next_tick.js:188:7)

  3) Fuzzing REST API
       /api/comment:
     Error: Property failed after 17 tests (seed: 1524328189856, path: 16:0:2:3:4:4:4:4): [{"user":{"login":""},"comment":{"postId":0,"commentId":""}}]
Shrunk 7 time(s)
Got error: Error: Internal Server Error, got: {"data":"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Error: Supposed it failed on this case<br> &nbsp; &nbsp;at router.post.wrap (src/server.js:62:61)<br> &nbsp; &nbsp;at node_modules/async-middleware/dist/index.js:18:23<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)<br> &nbsp; &nbsp;at next (node_modules/express/lib/router/route.js:137:13)<br> &nbsp; &nbsp;at Route.dispatch (node_modules/express/lib/router/route.js:112:3)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)<br> &nbsp; &nbsp;at node_modules/express/lib/router/index.js:281:22<br> &nbsp; &nbsp;at Function.process_params (node_modules/express/lib/router/index.js:335:12)<br> &nbsp; &nbsp;at next (node_modules/express/lib/router/index.js:275:10)<br> &nbsp; &nbsp;at Function.handle (node_modules/express/lib/router/index.js:174:3)</pre>\n</body>\n</html>\n","status":500}

Stack trace: Error: Internal Server Error, got: {"data":"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Error: Supposed it failed on this case<br> &nbsp; &nbsp;at router.post.wrap (src/server.js:62:61)<br> &nbsp; &nbsp;at node_modules/async-middleware/dist/index.js:18:23<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)<br> &nbsp; &nbsp;at next (node_modules/express/lib/router/route.js:137:13)<br> &nbsp; &nbsp;at Route.dispatch (node_modules/express/lib/router/route.js:112:3)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)<br> &nbsp; &nbsp;at node_modules/express/lib/router/index.js:281:22<br> &nbsp; &nbsp;at Function.process_params (node_modules/express/lib/router/index.js:335:12)<br> &nbsp; &nbsp;at next (node_modules/express/lib/router/index.js:275:10)<br> &nbsp; &nbsp;at Function.handle (node_modules/express/lib/router/index.js:174:3)</pre>\n</body>\n</html>\n","status":500}
    at exports.throwIfHttpFailed (test/asyncHttp.js:38:33)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
      at throwIfFailed (node_modules\fast-check\src\check\runner\utils\utils.ts:146:11)
      at <anonymous>
      at process._tickCallback (internal/process/next_tick.js:188:7)
```

It detects:
- sql injection in /api/login with counterexample: `{"password":"'"}`
- sql injection in /api/profile/:uid with :uid: `\u0000`
- implementation problem in /api/comment with counterexample: `{"user":{"login":""},"comment":{"postId":0,"commentId":""}}`

