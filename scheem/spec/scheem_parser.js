if (typeof module !== 'undefined') {
  var PEG = require('pegjs'),
      assert = require('chai').assert,
      path = require('path'),
      fs = require('fs'),
      scheemPeg = path.join(__dirname, '../scheem/parser.peg'),
      data = fs.readFileSync(scheemPeg, 'utf-8'),
      parse = PEG.buildParser(data).parse;
} else {
  var parse = SCHEEM.parse;
  var assert = chai.assert;
}

describe("singleton atoms", function () {
  it("should parse 1 as a number", function () {
    assert.deepEqual(parse("1", "INT"), 1);
  });
  it("should parse x as a string", function () {
    assert.deepEqual(parse("x", "ID"), "x");
  });
  it("should parse 123var as a string", function () {
    assert.strictEqual(parse("123var", "ID"), "123var");
  });
  it("should parse var123 as a string", function () {
    assert.deepEqual(parse("var123", "ID"), "var123");
  });
});

describe("simple expressions", function () {
  it("should parse (+ 1 2)", function () {
    assert.deepEqual(parse("(+ 1 2)", "expression"), ["+", 1, 2]);
  });
  it("should parse (* 3 (+ 4 5))", function () {
    assert.deepEqual(parse("(* 3 (+ 4 5))", "expression"), ["*", 3, ["+", 4, 5]]);
  });
});

describe("whitespaces", function () {
  var output = ["+", 3, 4];
  it("should allow for newline", function () {
    assert.deepEqual(parse("(+\n3 4)"), output);
  });
  it("should allow for tabs", function () {
    assert.deepEqual(parse("(+\n3\t4)"), output);
  });
  it("should allow for multiple spaces", function () {
    assert.deepEqual(parse("( + 3   4)"), output);
  });
  it("should allow for multiple whitespaces", function () {
    assert.deepEqual(parse("  (\n+\t3  \t4)"), output);
    assert.deepEqual(parse("   (\n\n\n+\t\n3  \t4)   "), output);
  });
});

describe("comments", function () {
  it("should ignore line comments", function () {
    assert.strictEqual(parse(";; a comment\n1"), 1);
    assert.strictEqual(parse("1\n;; a comment"), 1);
  });
  it("should ignore comments inside an expression", function () {
    var output = ["+", 1, 2];
    assert.deepEqual(parse("(+ 1 ;; comment\n2)"), output);
    assert.deepEqual(parse(";; comment\n (+ 1 2 ;; comment2\n)"), output);
  });
})

describe("quotes", function () {
  it("should parse atoms", function () {
    assert.deepEqual(parse("'x", "QUOTE"), ["quote", "x"]);
    assert.deepEqual(parse("' y", "QUOTE"), ["quote", "y"]);
    assert.deepEqual(parse("'  1", "QUOTE"), ["quote", 1]);
  });
  it("should parse expressions", function () {
    assert.deepEqual(parse("'(+ 3 4)", "QUOTE"), ["quote", ["+", 3, 4]]);
    assert.deepEqual(parse("'\t(+ (* 4 5) 4)", "QUOTE"), ["quote", ["+", ["*", 4, 5], 4]]);
  });
})
