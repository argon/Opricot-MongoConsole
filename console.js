var JSConsole = function(consolecont, resultscont) {
  this.consolecont = consolecont;
  this.resultscont = resultscont;
  this.history = [];
  if (window.localStorage && window.localStorage.getItem) {
    var hist = window.localStorage.getItem("consolehistory");
    if (hist) {
      try {
        this.history = JSON.parse(hist);
      } catch(er) {
        this.history = [];
      }
    }
  }          
}
var proto = JSConsole.prototype;

proto.getCommand = function() {
  return "" + this.consolecont.value;
}

proto.clearHistory = function() {
  this.history = [];
  if (window.localStorage && window.localStorage.getItem) {
    window.localStorage.setItem("consolehistory", "");
  }
}

proto.getHistory = function(index) {
  return this.history;  
}

proto.putHistory = function(data) {
  if (this.history[0] == data) {
    return;
  }
  this.history.unshift(data);
  if (this.history.length > 32) {
    this.history.pop();
  }
  if (window.localStorage && window.localStorage.getItem) {
    var hist = JSON.stringify(this.history);
    window.localStorage.setItem("consolehistory", hist);
  }  
}

proto.runCommand = function(command) {
  if (!command) {
    command = "" + this.consolecont.value;
  }
  this.putHistory("" + command);
  var result = null;
  try {
    result = window.eval(command);
    if (typeof(result) !== "undefined") {
      if (result && result.noconsoleprint == true) {  
        // Skip unprintable variables
      } else {
        this.printVariable(result);
      }
    }
  } catch(er) {
    this.printVariable("JAVASCRIPT ERROR: " + er.message);
    if (window.console && window.console.log) {
      
      window.console.log(er);
      
    }
  }
}

proto.fillCommand = function(txt) {
  if (typeof(txt) == "function") {
    txt = "" + txt;
    txt = txt.split("\n");
    txt.pop();
    txt.shift();
    for (var i = 0; i < txt.length; i++) {
      txt[i] = txt[i].replace(/^\s+|\s+$/g, '');
    }
    txt = txt.join("\n");    
  }
  this.consolecont.value = txt;
  this.consolecont.select();
}

proto.createItem = function() {
  var item = new JSConsoleItem();
  return item;
}

proto.createAndAddItem = function() {
  var item = new JSConsoleItem();
  this.addItem(item);
  return item;
}

proto.clearResults = function() {
  this.resultscont.innerHTML = "";
}

proto.printText = function(txt) {
  var item = new JSConsoleItem();
  item.addText(txt);
  this.addItem(item);  
}

proto.printHTML = function(txt) {
  var item = new JSConsoleItem();
  item.addHTML(txt);
  this.addItem(item);  
}

proto.printVariable = function(variable) {
  var item = new JSConsoleItem();
  item.addVariable(variable);
  this.addItem(item);  
}

proto.addItem = function(item) {
  var node = item.render();
  this.resultscont.appendChild(node);
  node.scrollIntoView();
}

var JSConsoleItem = function() {
  this.container = document.createElement("div");
  this.container.className = "result";
}
var proto = JSConsoleItem.prototype;

proto.remove = function() {
  this.container.parentNode.removeChild(this.container);
}

proto.render = function() {
  return this.container;
}

proto.addTitle = function(txt) {
  var strong = document.createElement("strong");
  strong.appendChild(document.createTextNode("" + txt));
  this.container.appendChild(strong);
  this.container.appendChild(document.createElement("br"));
  this.container.appendChild(document.createElement("br"));
}

proto.addText = function(txt) {
  this.container.appendChild(document.createTextNode("" + txt));
}
proto.addHTML = function(txt) {
  var node = this.container.appendChild(document.createElement("div"));
  node.innerHTML = "" + txt;
  this.container.appendChild(node);
}

proto.addBR = function() {
  this.container.appendChild(document.createElement("br"));
}

proto.addVariable = function(data) {
  var text = JSON.stringify(data, null, 4);
  // var funk = new Function(text);
  // text = funk + "";
  var pre = this.container.appendChild(document.createElement("pre"));
  pre.appendChild(document.createTextNode("" + text));
  
}

proto.addAction = function(title, cb, p1, p2, p3, p4, p5) {
  var link = document.createElement("a");
  link.setAttribute("href", "#");
  
  link.appendChild(document.createTextNode("" + title));
  link.onclick = function() {
    cb(p1, p2, p3, p4, p5);
  }
  this.container.appendChild(document.createTextNode(" "));
  this.container.appendChild(link);
  this.container.appendChild(document.createTextNode(" "));  
}

