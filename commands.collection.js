var showCollection = function(collection, _selected) {
  if (!collection) { collection = window.coll; }
  if (!collection) { this.error("Could not find collection."); return; }
  
  var db = collection.getDatabase();
  var dbname = db.getName();
  var collname = collection.getName();
    
  var selected = "";
  if (_selected) { selected = " selected"; }

  var item = jsconsole.createItem();
  item.addTitle("Collection " + collname + " in " + dbname + selected);
  item.addAction("select", function(val) { selectCollection(db.getName(), val); }, collname);
  item.addAction("find", function() { selectCollection(dbname, collname, true); fillCommand(function() { find({"FIELD": "VALUE"}, ["FIELD"]); limit(10); results(); });  });
  item.addAction("count", function(val) { selectCollection(db.getName(), val, true);  collectionCount(); }, collname);
  item.addAction("validate", function(val) { selectCollection(db.getName(), val, true);  collectionValidate(); }, collname);
  item.addAction("indexes", function(val) { selectCollection(db.getName(), val, true);  showIndexes(); }, collname);
  item.addAction("drop", function(val) { selectCollection(db.getName(), val, true); dropCollection(); }, collname);
  jsconsole.addItem(item);
}


var find = function(query, fields) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    var cursor = coll.find(query, fields);
    window.cursor = cursor;
    showCursor(cursor);
    return cursor;
}

var findOne = function(query, fields) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    var cursor = coll.findOne(query, fields);
    window.cursor = cursor;
    showCursor(cursor);
    return cursor;
}

var collectionValidate = function() {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.validate(function(result) {
      var item = jsconsole.createItem();
      item.addHTML("<pre>" + result + "</pre>");      
      jsconsole.addItem(item);  
    });
}

var collectionCount = function() {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.count(function(result) {
      var item = jsconsole.createItem();
      item.addVariable(result);      
      jsconsole.addItem(item);  
    });
}

var dropCollection = function(silent) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    if (silent || confirm("Really drop collection " + coll.getName() + " from " + db.getName() + "?")) {
      coll.dropCollection(function(result) {
        var item = jsconsole.createItem();
        item.addTitle("Collection drop done");
        item.addVariable(result);      
        jsconsole.addItem(item);  
      });
    }
}


var insert = function(data, safe) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.insert(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Insert done");
      item.addVariable(result);      
      jsconsole.addItem(item);  
    }, data, safe);
}


var remove = function(criteria, justone) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.remove(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Remove done");
      item.addVariable(result);      
      jsconsole.addItem(item);  
    }, criteria, justone);
}

var update = function(criteria, data, options) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.update(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Update done");
      item.addVariable(result);      
      jsconsole.addItem(item);  
    }, criteria, data, options);
}

var showIndexes = function() {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.getIndexInfo(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Indexes in " + coll.getName());
      for (var i = 0; i < result.length; i++) {
        item.addAction("show", function(val) { print(val); }, result[i]);
        item.addAction("delete", function(val) { selectCollection(db.getName(), coll.getName(), true); deleteIndex(val.key); }, result[i]);
        item.addText(" " + JSON.stringify(result[i].key));
        item.addBR();
      }
      item.addBR();
      item.addAction("create", function(val) { 
        selectCollection(db.getName(), coll.getName(), true);  
        var val = prompt("Enter index key");
        ensureIndex(val); 
      });
      item.addAction("indexinfo", function(val) { selectCollection(db.getName(), coll.getName(), true);  indexInfo(); });  
      item.addAction("deleteall", function(val) { selectCollection(db.getName(), coll.getName(), true); deleteIndexes(); });
      jsconsole.addItem(item);  
    });
    
}


var ensureIndex = function(key, options) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.ensureIndex(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Index creation requested");
      item.addVariable(result);      
      jsconsole.addItem(item);  
      selectCollection(db.getName(), coll.getName(), true);
      showIndexes();
    }, key, options);    
}

var deleteIndex = function(key) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.deleteIndex(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Index delete done");
      item.addVariable(result);      
      jsconsole.addItem(item);  
    }, key);    
}

var deleteIndexes = function() {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.deleteIndexes(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Index delete done");
      item.addVariable(result);      
      jsconsole.addItem(item);  
    });    
}

var indexInfo = function() {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    var coll = db.getCurrentCollection();
    if (!coll) {
      this.error("No collection selected.");
      return;
    }  
    coll.getIndexInfo(function(result) {
      var item = jsconsole.createItem();
      item.addVariable(result);      
      jsconsole.addItem(item);  
    });
}

