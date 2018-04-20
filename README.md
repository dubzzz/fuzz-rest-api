Wikipedia defines Fuzzing as:

> Fuzzing or fuzz testing is an automated software testing technique that involves providing invalid, unexpected, or random data as inputs to a computer program.
> The program is then monitored for exceptions such as crashes, or failing built-in code assertions or for finding potential memory leaks.

This repository derives a property based testing framework called [fast-check](https://github.com/dubzzz/fast-check/) into a fuzzing system.

Steps to run this code locally:

```sh
git clone https://github.com/dubzzz/fuzz-rest-api.git
cd fuzz-rest-api
npm install
npm run start #launch a webserver on port 8080
npm run test  #run the 'fuzzing'
```
