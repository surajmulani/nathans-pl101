if (typeof module !== 'undefined') {
  var PEG = require('pegjs'),
      mocha = require('mocha'),
      assert = require('chai').assert,
      path = require('path'),
      fs = require('fs'),
      scheem = require(
          path.join(__dirname, "../scheem.js")),
      evalScheem = scheem.evalScheem,
      initialEnv = scheem.initialEnv,
      clearEnv = scheem.clearEnv;
      parse = PEG.buildParser(fs.readFileSync(
            path.join(__dirname, '../parser.peg'),
            'utf-8')).parse;
} else {
  // Assuming in browser
  var parse = SCHEEM.parse;
  var assert = chai.assert;
}

beforeEach(function () {
  // get a fresh environment for every test
  clearEnv();
});

suite("definitions", function () {
  test("variables", function () {
    evalScheem(["define", "x", 5]);
    evalScheem(["define", "y", ["quote", [3, 4]]]);
    assert.equal(evalScheem("x"), 5);
    assert.deepEqual(evalScheem("y"), [3, 4]);
  });
  test("update with new values", function () {
    evalScheem(["define", "x", 4]);
    assert.equal(evalScheem("x"), 4);
    evalScheem(["define", "x", 10]);
    assert.equal(evalScheem("x"), 10);
  });
  test("functions", function () {
    var def1 = ["define", ["plusone", "x"], ["+", "x", 1]],
        def2 = ["define", ["minus10", "x"], ["-", "x", 10]];
    evalScheem(def1);
    evalScheem(def2);
    assert.equal(evalScheem(["plusone", 2]), 3);
    assert.equal(evalScheem(["minus10", 20]), 10);
  });
  test("zero arity functions", function () {
    evalScheem(["define", ["always3"], 3]);
    evalScheem(["define", ["always-dog"], ["quote", "dog"]]);
    assert.equal(evalScheem(["always3"]), 3);
    assert.equal(evalScheem(["always-dog"]), "dog");
  });
  test("multiple arity functions", function () {
    evalScheem(["define", ["add", "x", "y"], ["+", "x", "y"]]);
    evalScheem(["define", ["add3", "x", "y", "z"], ["+", "x", ["+", "y", "z"]]]);
    assert.equal(evalScheem(["add", 3, 4]), 7);
    assert.equal(evalScheem(["add3", 3, 4, 5]), 12);
  });
});

suite("lambda", function () {
  test("call lambda", function () {
    var lambda1 = ["lambda", ["x"], ["+", "x", 1]];
    var lambda2 = ["lambda", ["y"], "y"];
    assert.equal(evalScheem([lambda1, 1]), 2);
    assert.equal(evalScheem([lambda2, 2]), 2);
  });
  test("zero arity lambda", function () {
    assert.equal(evalScheem([["lambda", [], 2]]), 2);
    assert.equal(evalScheem([["lambda", [], ["+", 3, 4]]]), 7);
  });
  test("nested lambda", function () {
    var nested = ["lambda", ["x"],
                  [["lambda", ["y"], ["+", "x", "y"]], 5]]
    assert.equal(evalScheem([nested, 5]), 10);
  });
});

suite("define-lambda", function () {
  test("variable bound to a lambda", function () {
    var lambda1 = ["lambda", ["x"], ["+", "x", 1]];
    evalScheem(["define", "add-one", lambda1]);
    assert.equal(evalScheem(["add-one", 2]), 3);
  });
});

suite("set!", function () {
  test("updated existing variable", function () {
    evalScheem(["define", "x", 500]);
    evalScheem(["set!", "x", 200]);
    assert.equal(evalScheem("x"), 200);
  });
  test("update global variable from a function", function () {
    evalScheem(["define", ["update-x"], ["set!", "x", 25]]);
    evalScheem(["define", "x", 5]);
    assert.equal(evalScheem("x"), 5);
    evalScheem(["update-x"]);
    assert.equal(evalScheem("x"), 25);
  });
});

suite("recursive functions", function () {
  var factorial = ["define", ["factorial", "n"],
                    ["if", ["=", "n", 1],
                      "n",
                      ["*", "n", ["factorial", ["-", "n", 1]]]]];
  var fib = ["define", ["fib", "n"],
              ["if", ["<", "n", 2],
                  "n",
                  ["+", ["fib", ["-", "n", 1]],
                        ["fib", ["-", "n", 2]]]]];
  test("factorial", function () {
    evalScheem(factorial);
    assert.equal(evalScheem(["factorial", 5]), 120);
  });
  test("fibonacci", function () {
    evalScheem(fib);
    assert.equal(evalScheem(["fib", 10]), 55);
    assert.equal(evalScheem(["fib", 8]), 21);
  });
});

suite("callbacks", function () {
  test("apply-1", function () {
    var func = ["define", ["apply-1", "fn"], ["fn", 1]];
    var add1 = ["define", ["add-1", "x"], ["+", "x", 1]];
    evalScheem(func);
    evalScheem(add1);
    assert.equal(evalScheem(["apply-1", "add-1"]), 2);
  });
});

suite("return values", function () {
  var makeAccount = ["define", ["make-account", "bal"],
                      ["lambda", ["x"],
                        ["begin",
                          ["set!", "bal", ["-", "bal", "x"]],
                          "bal"]]];
  test("make-account", function () {
    evalScheem(makeAccount);
    evalScheem(["define", "a", ["make-account", 100]]);
    assert.equal(evalScheem(["a", 20]), 80);
  })
});

suite("Let", function () {
  test("no bindings", function () {
    assert.equal(evalScheem(["let", [], 5]), 5);
    assert.equal(evalScheem(["let", [], ["quote", "x"]]), "x");
  });
  test("one binding", function () {
    assert.equal(
      evalScheem(["let", [["x", 5]], ["+", "x", 5]]),
      10
      );
  });
  test("let inside lambda", function () {
    assert.equal(
      evalScheem([["lambda", ["x"],
                    ["let", [["y", ["+", "x", 5]]],
                        ["*", "y", 2]]],
                  5]),
      20
      );
  });
});
