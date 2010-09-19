var connect = function(host, port, user, pass) {
    if (!host) {
      host = "" + prompt("Enter host", "localhost");
      if (!host) {
        return;
      }
    }
    if (!port) {
      var items = host.split(":");
      if (items[1]) {
        port = items[1] * 1;
        host = items[0];
      } else {
        port = 27017;
      }
    }
    window.mongo.setHost(host);
    window.mongo.setPort(port);
    window.mongo.setUser(user);
    window.mongo.setPass(pass);
    window.mongo.setDB(null);
    window.cursor = null;
    var item = jsconsole.createItem();
    item.addTitle("Connected to " + host + ":" + port);
    quickActions();
    jsconsole.addItem(item);  
}

var show = function(what) { // dbs/databases collections users profile
  if (what == "databases") {
    showDatabases();
  }
  if (what == "collections") {
    showCollections();
  }
}

var showDatabases = function() {
    mongo.getDatabases(function(databases) {
      var item = jsconsole.createItem();
      item.addTitle("Databases");
      for (var i = 0; i < databases.length; i++) {
        item.addAction("select", function(val) { selectDatabase(val); }, databases[i]);
        item.addText(" " + databases[i]);
        item.addBR();
      }
      item.addBR();
      item.addAction("create", function(val) { createDatabase(); });
      jsconsole.addItem(item);
    });
}

var selectDatabase = function(dbname, _auto) {
    var item = jsconsole.createItem();
    if (_auto && window.db && window.db.getName() == dbname) {
      return;
    }    
    window.mongo.setDB(dbname);
    showDatabase(null, true);
}

var use = function(dbname, collname) {
    var item = jsconsole.createItem();
    if (collname) {
      selectCollection(dbname, collname);
    } else {
      selectDatabase(dbname);
    }
}

var createDatabase = function(name) {
  if (!name) {
    name = prompt("Enter database name");
    if (!name) {
      this.error("Canceled");
      return;  
    }
  }
  selectDatabase(name);
}

