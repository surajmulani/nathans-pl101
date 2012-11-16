var PEG = require('pegjs'),
    chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should(),
    path = require('path'),
    fs = require('fs');

var scheemPeg = path.join(__dirname, '../scheem/parser.peg');
var data = fs.readFileSync(scheemPeg, 'utf-8');
var parse = PEG.buildParser(data).parse;

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
