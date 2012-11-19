var evalArith = function (expr, env) {
  switch (expr[0]) {
    case "+":
      return evalScheem(expr[1], env) + evalScheem(expr[2], env);
    case "-":
      return evalScheem(expr[1], env) - evalScheem(expr[2], env);
    case "/":
      return evalScheem(expr[1], env) / evalScheem(expr[2], env);
    case "*":
      return evalScheem(expr[1], env) * evalScheem(expr[2], env);
  }
};

var evalSequence = function (seq, env) {
  if (seq.length === 1) {
    return evalScheem(seq[0], env);
  } else {
    evalScheem(seq[0], env);
    return evalSequence(seq.slice(1), env);
  }
};

var evalIf = function (expr, env) {
  var eq = evalScheem(expr[1], env);
  return eq ? evalScheem(expr[2], env) : evalScheem(expr[3], env);
};

var evalCons = function (expr, env) {
  return [evalScheem(expr[1], env)].concat(
      evalScheem(expr[2], env));
};

// lookup variable in an environment
var lookup = function (v, env) {
  if (!env || !env.hasOwnProperty('bindings')) {
    // throw exception if variable not found
    throw("Failed to lookup variable - " + v);
  } else if (env.bindings.hasOwnProperty(v)) {
    return env.bindings[v];
  } else {
    return lookup(v, env.outer);
  }
};

var constants = {
  "#t" : true, "#f" : false, "nil" : []
};

var primitiveApplications = {
  "+" : evalArith,
  "-" : evalArith,
  "*" : evalArith,
  "/" : evalArith,
  "quote" : function (expr, env) { return expr[1]; },
  "begin" : function (expr, env) { return evalSequence(expr.slice(1), env); },
  "if" : evalIf,
  "cons" : evalCons,
  "car" : function (expr, env) { return evalScheem(expr[1])[0]; },
  "cdr" : function (expr, env) { return evalScheem(expr[1]).slice(1); },
  "=" : function (expr, env) {
    var eq = (evalScheem(expr[1], env) === evalScheem(expr[2], env));
    return eq ? '#t' : '#f';
  },
  "<" : function (expr, env) {
    var eq = (evalScheem(expr[1], env) < evalScheem(expr[2], env));
    return eq ? '#t' : '#f';
  }
};


var evalScheem = function (expr, env) {
  if (typeof expr === 'number') {
    return expr;
  } else if (constants.hasOwnProperty(expr)) {
    return constants[expr];
  } else if (typeof expr === 'string') {
    return lookup(expr, env);
  } else if (primitiveApplications.hasOwnProperty(expr[0])) {
    return primitiveApplications[expr[0]](expr, env);
  } else {
    throw("Illegal expression: " + expr);
  }
};

// If used as a Node module, export evalScheem
if (typeof module !== 'undefined') {
  module.exports.evalScheem = evalScheem;
}
