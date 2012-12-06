// evaluator
// Whenever hit "Run", reads in the input from codemirror, parses it, evaluates
// it and prints it to the output.

var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode:  "scheme",
  theme: "default",
  lineNumbers: true,
  matchBrackets: true,
  gutter: true
});

var output = CodeMirror(document.getElementById("output"), {
  mode: "scheme",
  theme: "default",
  matchBrackets: true,
  readOnly: true
});

var evaluate = function (expression) {
  var parsed = SCHEEM.parse(expression),
      result = evalScheem(parsed);
  return JSON.stringify(result);
};

$("#run").click(function () {
  var result = evaluate(editor.getValue());
  output.setValue(result);
});


// --- Examples ---

var reindent = function () {
  for (var i = 0; i <= editor.lineCount(); i += 1) {
    editor.indentLine(i);
  }
};

// Slide down or slide up a list of examples associated with the
// heading.
$("#examples li h4").click(function (event) {
  event.preventDefault();
  $(this).parent().next('ul').slideToggle();
});

// load an example on clicking it.
$("a.example").click(function (event) {
  var programId = $(this).attr('id'); // figure out how to get the program.
  editor.setValue(examples[programId]);
  reindent();
});

// ..by default, hide all the lists living under different kinds of examples.
$("#examples ul").hide();


// all examples

var examples = {};

// arithmetic
var arith1 = "(/ (+ 20 (+ 100 6)) 3)";
examples.arith1 = arith1;

// lists
var map = "(map (lambda (x) (* x x)) '(3 4 5))";
examples.map = map;

// functions
var square = "(begin\n \
              (define (square x) (* x x))\n \
              (square 12))";

var lambda = "((lambda (x) (* x x)) 32)";
examples.square = square;
examples.lambda = lambda;

// moar.
var factorial = "(begin\n \
                 (define (fact n)\n \
                  (if (< n 2)\n \
                   n\n \
                   (* n (fact (- n 1)))))\n \
                 (fact 5))";
var fibonacci = "(begin\n \
                 (define (fib n)\n \
                  (if (< n 2)\n \
                   n\n \
                   (+ (fib (- n 1)) (fib (- n 2)))))\n \
                 (fib 10))";

examples.factorial = factorial;
examples.fibonacci = fibonacci;
