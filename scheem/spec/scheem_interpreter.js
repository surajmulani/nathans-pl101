if (typeof module !== 'undefined') {
  // If using Node.js, load required modules.
  var PEG = require('pegjs'),
      mocha = require('mocha'),
      assert = require('chai').assert,
      path = require('path'),
      fs = require('fs'),
      evalScheem = require(
          path.join(__dirname, '../scheem.js')).evalScheem,
      parse = PEG.buildParser(fs.readFileSync(
            path.join(__dirname, '../parser.peg'), 'utf-8')).parse;
} else {
  // Assuming in browser
  var parse = SCHEEM.parse;
  var assert = chai.assert;
}

suite("numbers", function () {
  test("interpretation", function () {
    assert.equal(evalScheem(3), 3);
    assert.equal(evalScheem(100), 100);
  });
  test("add two plus two", function () {
    assert.equal(evalScheem(["+", 2, 2]), 4);
  });
  test("subtraction", function () {
    assert.equal(evalScheem(["-", 4, 3]), 1);
  });
  test("division", function () {
    assert.equal(evalScheem(["/", 4, 2]), 2);
  });
  test("multiplication", function () {
    assert.equal(evalScheem(["*", 2, 10]), 20);
  });
});

suite("variables", function () {
  var env = { bindings : { 'x' : 4, 'y' : 5 }, outer : { } };
  var env2 = { bindings : {}, outer : env };
  test("lookup variables", function () {
    assert.equal(evalScheem("x", env), 4);
    assert.equal(evalScheem("y", env), 5);
  });
  test("add & subtract variables", function () {
    assert.equal(evalScheem(["+", "x", "y"], env), 9);
    assert.equal(evalScheem(["-", "x", 2], env), 2);
  });
  test("lookup outer environment", function () {
    assert.equal(evalScheem("x", env), 4);
    assert.equal(evalScheem("y", env), 5);
  });
});

suite("quotes", function () {
  test("quoted numbers", function () {
    assert.equal(evalScheem(["quote", 2]), 2);
    assert.equal(evalScheem(["quote", 12]), 12);
  });
  test("quoted expressions", function () {
    assert.deepEqual(
      evalScheem(["quote", [2, 3]]), [2, 3]);
    assert.deepEqual(
      evalScheem(["quote", ['dog', 42]]), ['dog', 42]);
  });
});

suite("cons", function () {
  var cons1 = ["cons", 2, "nil"];
  var cons2 = ["cons", 3, 4];
  var cons3 = ["cons", 3, ["cons", 4, "nil"]];
  var cons4 = ["cons", 4, ["cons", 5, ["cons", 10, "nil"]]];
  test("construction", function () {
    assert.deepEqual(evalScheem(cons1), [2]);
    assert.deepEqual(evalScheem(cons2), [3, 4]);
    assert.deepEqual(evalScheem(cons3), [3, 4]);
    assert.deepEqual(evalScheem(cons4), [4, 5, 10]);
  });
  test("car", function () {
    assert.equal(evalScheem(["car", cons1]), 2);
    assert.equal(evalScheem(["car", cons2]), 3);
    assert.equal(evalScheem(["car", cons3]), 3);
    assert.equal(evalScheem(["car", cons4]), 4);
  });
  test("cdr", function () {
    assert.deepEqual(evalScheem(["cdr", cons1]), []);
    assert.deepEqual(evalScheem(["cdr", cons2]), [4]);
    assert.deepEqual(evalScheem(["cdr", cons3]), [4]);
    assert.deepEqual(evalScheem(["cdr", cons4]), [5, 10]);
  });
});

suite("if statements", function () {
  test("branches", function () {
    assert.equal(evalScheem(["if", "#t", 3, 4]), 3);
    assert.equal(evalScheem(["if", "#f", 3, 4]), 4);
  });
  test("nested statements", function () {
    assert.equal(
      evalScheem(["if", "#t", ["if", "#f", 3, 100], 20]), 100);
  });
});

suite("begin", function () {
  test("return last statement", function () {
    assert.equal(evalScheem(["begin", 3, 4]), 4);
    assert.equal(evalScheem(["begin", ["quote", 3]]), 3);
  });
  test("nested", function () {
    assert.equal(
      evalScheem(["begin", ["begin", 3, 4], ["begin", 5, 6]]), 6);
  });
});

suite("comparison", function () {
  test("less than", function () {
    assert.equal(evalScheem(["<", 2, 3]), "#t");
    assert.equal(evalScheem(["<", 4, 4]), "#f");
    assert.equal(evalScheem(["<", 4, 2]), "#f");
  });
  test("equality", function () {
    assert.equal(evalScheem(["=", 2, 2]), "#t");
    assert.equal(evalScheem(["=", 2, 3]), "#f");
    assert.equal(evalScheem(["=", 2, 1]), "#f");
  });
});
