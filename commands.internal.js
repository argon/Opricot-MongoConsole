var listMethods = function(proto) {
  var data = {};
  for(var i in proto) {
    var funk = proto[i] + "";
    if (typeof(proto[i]) == "function") {
      funk = funk.substring(0, funk.indexOf("{"));
    }
    data[i] = funk;
  }
  print(data);
}


var error = function(desc) {
    var item = jsconsole.createItem();
    item.addTitle("Error");
    item.addText("" + desc);
    jsconsole.addItem(item);    
}

var print = function(data) {
    var item = jsconsole.createItem();
    item.addVariable(data);
    jsconsole.addItem(item);    
}

var help = function(what, cb) {
  if (what) {
    what = "." + what;
  } else {
    what = "";
  }
  AJAX.get("help" + what + ".html", function(help) {
    AJAX.get("quickactions.html", function(quickactions) {
      help = help.replace("{{QUICKACTIONS}}", quickactions + "<br /><br />");
      jsconsole.printHTML(help);
      if (cb) {
        cb();
      }
    });
  });
}

var welcome = function() {
  help(null, function() {
    showDatabases();
  });
};

var quickActions = function() {
  AJAX.get("quickactions.html", function(data) {
    jsconsole.printHTML(data);
  });
}

var licence = function() {
  AJAX.get("LICENSE.txt", function(data) {
    jsconsole.printHTML("<pre>" + data + "</pre>");
  });
}

var readme = function() {
  AJAX.get("README.txt", function(data) {
    jsconsole.printHTML("<pre>" + data + "</pre>");
  });
}

var fillCommand = function(txt) {
  jsconsole.fillCommand(txt);
}

var runCommands = function(txt) {
  if (txt) {
    fillCommand(txt);
  }
  jsconsole.runCommand();
}

var clearScreen = function() {
  jsconsole.clearResults();
}


var clearCommandHistory = function() {
  var item = jsconsole.createItem();
  item.addTitle("Command history cleared");
  jsconsole.clearHistory();
  jsconsole.addItem(item);  
}

var commandHistory = function(index) {
  var hist = jsconsole.getHistory();
  if (index) {
     var item = hist[index];
     if (item) {
       fillCommand(item);
     }
     return;
  }
  var item = jsconsole.createItem();
  item.addTitle("Command history");
  item.addBR();
  item.addAction("clear all history", function() { clearCommandHistory(); });
  item.addBR();
  for (var i = 0; i < hist.length; i++) {
     var historyitem = hist[i];
      item.addBR();
      item.addAction("get #" + i, function(val) { fillCommand(val); }, historyitem);
      item.addText(historyitem);
  }
  jsconsole.addItem(item);  
}


var resize = function(val) {
 
  var main = document.getElementById("main");
  var maintop = document.getElementById("main_top");
  var mainbottom = document.getElementById("main_bottom");
  var grabble = document.getElementById("main_grabble");

  if (!val || val < 80) {
    val = 120;
    window._grabbed = false;
  }
  main.style.height = document.body.offsetHeight + "px";
  var h = main.offsetHeight;
  var g = grabble.offsetHeight;
  if ((h - g - val) > 10) {
    maintop.style.height = (h - g - val) + "px";
    mainbottom.style.height = val + "px";
  }
  
}

var showLibrary = function() {
  var item = jsconsole.createItem();
  item.addTitle("Script library");
  
  if (!window.store) {
    item.addText("Script library is not configured for this installation.");
    jsconsole.addItem(item);  
    return;
  }

  var db = window.store.getDatabase(window.store_db);
  var coll = db.getCollection("library");
  
  item.addBR();
  item.addAction("Add current script", function() { 
    var code = jsconsole.getCommand();
    var title = prompt("Enter a short description of the current script:");
    if (!title) {
      title = code;
    }
    coll.insert(function() {
      showLibrary();    
    }, {title: title, code: code});
  });
  item.addBR();
  
  var cursor = coll.find({}, ["title", "code"]);
  cursor.sort({title: 1});
  
  cursor.getArray(function(entries) {
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        item.addBR();
        (function() {
          var title = entry.title;
          var code = entry.code;
          var id = new MongoId(entry._id);
          
          item.addAction("get", function(val) { fillCommand(val); }, code);
          item.addAction("update", function(val) {
            code = jsconsole.getCommand();
            coll.update(function() {
              showLibrary();
            }, {"_id": val}, {"$set": {code: code}});            
          }, id);
          item.addAction("delete", function(val) { 
            coll.remove(function() {
              showLibrary();
            }, {"_id": val}, true);
          }, id);
          item.addText(title);
        })();
    }
  });
  jsconsole.addItem(item);  
}

 
