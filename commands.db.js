var showDatabase = function(db, _selected) {
  if (!db) { db = window.db; }
  if (!db) { this.error("Could not find database."); return; }

  var dbname = db.getName();

  var item = jsconsole.createItem();
  var selected = "";
  if (_selected) { selected = " selected"; }
  item.addTitle("Database " + dbname + selected);

  item.addAction("select", function(val) { selectDatabase(val); }, dbname);
  item.addAction("collections", function(val) { selectDatabase(dbname, true); show("collections"); });
  item.addAction("repair", function(val) { selectDatabase(val, true); repairDatabase(); }, dbname);
  item.addAction("drop", function(val) { selectDatabase(val, true); dropDatabase(); }, dbname);

  jsconsole.addItem(item);

}

var showCollections = function(db) {
  if (!db) { db = window.db; }
  if (!db) { this.error("Could not find database."); return; }

  var dbname = db.getName();

  db.getCollections(function(collections) {
    var item = jsconsole.createItem();
    item.addTitle("Collections in " + db.getName());
    for (var i = 0; i < collections.length; i++) {
      item.addAction("select", function(val) { selectCollection(db.getName(), val); }, collections[i]);
      item.addText(" " + collections[i]);
      item.addBR();
    }
    item.addBR();
    item.addAction("create", function(val) { selectDatabase(db.getName(), true), createCollection(); });
    jsconsole.addItem(item);
  });

}

var selectCollection = function(dbname, collname, _auto) {
    var item = jsconsole.createItem();
    if (_auto && window.db && window.db.getName() == dbname && window.coll && window.coll.getName() == collname) {
      return;
    } 
    window.mongo.setDB(dbname);
    var db = mongo.getCurrentDatabase();
    db.setCollection(collname);
    showCollection(null, true);   
}

var execute = function(code, scope) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    db.execute(function(result) {
        var item = jsconsole.createItem();
        item.addTitle("Executed");
        item.addVariable(result);      
        jsconsole.addItem(item);  
    }, code, scope);
}

var dropDatabase = function(silent) {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    if (silent || confirm("Really drop database " + db.getName() + "?")) {
      db.dropDatabase(function(result) {
        var item = jsconsole.createItem();
        item.addTitle("Database drop done");
        item.addVariable(result);      
        jsconsole.addItem(item);  
      });
    }
}

var repairDatabase = function() {
    var db = window.db;
    if (!db) {
      this.error("No database selected.");
      return;
    }
    db.repair(function(result) {
      var item = jsconsole.createItem();
      item.addTitle("Database repair done");
      item.addVariable(result);      
      jsconsole.addItem(item);  
    });
}


var createCollection = function(name) {
  var db = window.db;
  if (!db) {
    this.error("No database selected.");
    return;
  }
  if (!name) {
    name = prompt("Enter collection name");
    if (!name) {
      this.error("Canceled.");
      return;  
    }
  }
  selectCollection(db.getName(), name);
}
