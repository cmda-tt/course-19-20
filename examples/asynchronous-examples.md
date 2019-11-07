# Asynchronous coding examples

These examples are most useful if you already understand what asynchronous means. Research topics like 'asynchronous js', 'promises', and 'callback hell'

## Pasta Promises 🍝
This example shows what a piece of code could look like that makes virtual pasta. It wouldn't make sense to write this code in a synchronous way because each step in making pasta takes time.

If we wrote this code without Promises we would experience "Callback Hell". By working with promises we can use .then() to only execute code when another piece of code is finished.

[Here is an example](https://codepen.io/Razpudding/pen/Keygge) using these concepts.

## Async Pasta ⌚️
One of the challenges with promises is if you want to wait for two different promise chains to finish. You would have to put both promises in an Promise.all array and call .then() on that code.
There's a way to write asynchronous code in synchronous style and that's by using 'async/await'.
Look up the definition and documentation of async/await and then c[heck out this reworked pasta example](https://codepen.io/Razpudding/pen/RJZeJO) that implements it.

Notice how it's much easier to read these asynchronous patterns.

