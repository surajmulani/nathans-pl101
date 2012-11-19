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

var evalArgs = function(args, env) {
  return args.map(function (arg) {
    return evalScheem(arg, env);
  });
};

// --- environment operations ---
// lookup variable in an environment
var lookup = function (v, env) {
  if (!env || !env.hasOwnProperty('bindings')) {
    // throw exception if variable not found
    throw("Unbound variable - " + v);
  } else if (env.bindings.hasOwnProperty(v)) {
    return env.bindings[v];
  } else {
    return lookup(v, env.outer);
  }
};

var add_binding = function (_var, value, env) {
  env.bindings[_var] = value;
  return;
};

var update = function (_var, value, env) {
  if (!env || !env.hasOwnProperty('bindings')) {
    throw("Unbound variable - " + v);
  } else if (env.bindings.hasOwnProperty(v)) {
    env.bindings[_var] = value;
  } else {
    return update(_var, value, env.outer);
  }
};

var constants = {
  "#t" : true, "#f" : false, "nil" : []
};

var specialForms = {
  "begin" : function (expr, env) { return evalSequence(expr.slice(1), env); },
  "quote" : function (expr, env) { return expr[1]; },
  "if" : evalIf
};


var initialEnv = { bindings :
  {
    "+" : function (x, y) { return x + y; },
    "-" : function (x, y) { return x - y; },
    "*" : function (x, y) { return x * y; },
    "/" : function (x, y) { return x / y; },
    "cons" : function (x, y) { return [x].concat(y); },
    "car" : function (expr) { return expr[0]; },
    "cdr" : function (expr) { return expr.slice(1); },
    "=" : function (x, y) { return x === y ? '#t' : '#f' },
    "<" : function (x, y) { return x < y ? '#t' : '#f' }
  },
    outer : { }
};


var evalScheem = function (expr, env) {
  env = env || initialEnv;
  if (typeof expr === 'number') {
    return expr;
  } else if (constants.hasOwnProperty(expr)) {
    return constants[expr];
  } else if (typeof expr === 'string') {
    return lookup(expr, env);
  } else if (specialForms.hasOwnProperty(expr[0])) {
    return specialForms[expr[0]](expr, env);
  } else {
    var func = evalScheem(expr[0], env),
        args = evalArgs(expr.slice(1), env);
    return func.apply(null, args);
  }
};

// If used as a Node module, export evalScheem
if (typeof module !== 'undefined') {
  module.exports.evalScheem = evalScheem;
  module.exports.initialEnv = initialEnv;
}
