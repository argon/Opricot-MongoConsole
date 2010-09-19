/**
 * Experimental JS driver classes for MongoDB.
 *
 * These methods should be standalone in the sense that they:
 *
 * DO NOT talk to the console object
 * DO NOT set global variables
 *
 * All UI -related functionality should be done on the built-in functions.
 * These are only for scripting and implementing the built-in functions.
 *
 */

// ------------------------------------------- UTILS

var convert2JSON = function(val) {
  return JSON.stringify(val);
}

// ------------------------------------------- DATE

var MongoDate = function(val) {
  if (!val) {
    val = new Date();
  }
  if (val instanceof Date) {
    var dt = new Date();
    dt.setTime(val.getTime());
    val = dt;
  } else {
    val = new Date(val);
  }
  this.jsdate = val;  
  return this;
}
var proto = MongoDate.prototype;

proto.toDate = function() {
  var dt = new Date();
  dt.setTime(this.jsdate.getTime());
  return dt;
}

proto.toJSON = function() {
  var r = {};
  r.type = "object";
  r.cls = "MongoDate";
  r.val = Math.round(this.jsdate.getTime() / 1000);
  return r;
}

proto.toString = function() {
  return "" + this.jsdate;
}

// ------------------------------------------- ID

var MongoId = function(strid) {
  this.strid = strid;
  return this;
}
var proto = MongoId.prototype;

proto.toJSON = function() {
  var r = {};
  r.type = "object";
  r.cls = "MongoId";
  r.val = "" + this.strid;
  return r;
}

proto.toString = function() {
  return this.strid;
}


// ------------------------------------------- MONGO

var Mongo = function() {

  this.host = "localhost";
  this.port = 27017;
  this.user = null;
  this.pass = null;
  
  this.db = null;
  
  this.dbobjs = {};
  
  this.ajaxuser = null;
  this.ajaxpass = null;

  this._ajaxqueue = [];
  this._ajaxrunning = false;
}

var proto = Mongo.prototype;

proto.getHost = function() {
  return this.host;
}

proto.getPort = function() {
  return this.host;
}

proto.setHost = function(val) { 
  this.host = val; 
  this.updateConnectionView();
}
proto.setPort = function(val) { 
  this.port = val; 
  this.updateConnectionView(); 
}
proto.setUser = function(val) { 
  this.user = val; 
  this.updateConnectionView(); 
}
proto.setPass = function(val) { 
  this.pass = val; 
  this.updateConnectionView(); 
}

proto.setAJAXUser = function(val) {
  this.ajaxuser = val;
}

proto.setAJAXPass = function(val) {
  this.ajaxpass = val;
}

proto.error = function() {
  // override this
}

proto.updateConnectionView = function() {
  // override this
}

proto.processReturnData = function(data) {
  if (data && typeof(data) == "object") {
    for(var key in data) {
      var val = data[key];
      if (val["type"] == "object") {
        if (val["cls"] == "MongoId") {
          data[key] = new MongoId("" + val["val"]);
        }
        if (val["cls"] == "MongoDate") {
          data[key] = new MongoDate(val["val"] * 1000);
        }
      } else {
        data[key] = this.processReturnData(val);
      }
    }
  }
  return data;
}

proto.ajax = function(cb, vars) {
  this._ajaxqueue.push({cb: cb, vars: vars});
  this._ajaxqueueprocess();
}

proto._ajaxqueueprocess = function() {
  if (this._ajaxrunning) {
    return;
  }
  if (this._ajaxqueue.length > 0) {
    var cmd = this._ajaxqueue.shift();
    this._ajax(cmd.cb, cmd.vars);
  }
} 

proto._ajax = function(cb, vars) {
  this._ajaxrunning = true;
  var thisref = this;
  
  var url = "comm.php";
  var post = {};
  post.host = this.host;
  post.port = this.port;
  if (this.user && this.pass) {
    post.user = this.user;
    post.pass = this.pass;
  }
  if (this.ajaxuser && this.ajaxpass) {
    post.cuser = this.ajaxuser;
    post.cpass = this.ajaxpass;
  }

  for (var i in vars) {
    post[i] = vars[i];
  }
  
  var cb2 = function(data) {
    thisref._ajaxrunning = false;
    try {
      var funk = new Function("return " + data + ";");
      var result = funk(); 
      cb(thisref.processReturnData(result));
    } catch(er) {
      thisref.error("Server error (" + er + "): " + data);
      // cb(null);
    }
    thisref._ajaxqueueprocess();
  }
  AJAX.get(url, cb2, post);
}

proto.getDatabases = function(cb) {
  var vars = {};
  vars.command = "showdatabases";
  this.ajax(cb, vars);
}

proto.setDB = function(val) { 
  this.db = val; 
  this.getCurrentDatabase();
  this.updateConnectionView(); 
}

proto.getDatabase = function(name) {
  if (!name) {
    // this.error("No database name specified.");
    return null;
  }
  if (!this.dbobjs[name]) {
    this.dbobjs[name] = new MongoDB(this, name);
  } 
  return this.dbobjs[name];
}

proto.getCurrentDatabase = function() {
  return this.getDatabase(this.db);
}


// ------------------------------------------- DATABASE

var MongoDB = function(mongo, name) {
  this.mongo = mongo;
  this.name = name;
  this.collobjs = {};
  this.collection = null;
}
var proto = MongoDB.prototype;


proto.getName = function() {
  return this.name;
}

proto.getCollections = function(cb) {
  var vars = {};
  vars.database = this.name;
  vars.command = "showcollections";
  this.mongo.ajax(cb, vars);
}


proto.setCollection = function(val) { 
  this.collection = val; 
  this.getCurrentCollection();
  this.mongo.updateConnectionView(); 
}

proto.getCollection = function(name) {
  if (!name) {
    // this.mongo.error("No collection name specified.");
    return null;
  }
  if (!this.collobjs[name]) {
    this.collobjs[name] = new MongoDBCollection(this, name);
  } 
  return this.collobjs[name];
}

proto.getCurrentCollection = function() {
  return this.getCollection(this.collection);
}

proto.repair = function(cb) {
  var vars = {};
  vars.database = this.getName();
  vars.command = "repairdatabase";  
  
  this.mongo.ajax(cb, vars);  
}

proto.dropDatabase = function(cb) {
  var vars = {};
  vars.database = this.getName();
  vars.command = "dropdatabase";  
  
  this.mongo.ajax(cb, vars);  
}


proto.execute = function(cb, code, options) {
  var vars = {};
  vars.database = this.getName();
  vars.command = "execute";  
  // vars.code = escape(code);
  vars.code = code;
  if (options) {
    vars.options = convert2JSON(options);
  }
  
  this.mongo.ajax(cb, vars);  
}

// ------------------------------------------- COLLECTION

var MongoDBCollection = function(db, name) {
  this.db = db;
  this.mongo = db.mongo;
  this.name = name;
}

var proto = MongoDBCollection.prototype;

proto.getName = function() {
  return this.name;
}

proto.getDatabase = function() {
  return this.db;
}

proto.find = function(query, fields) {
  if (!query) {
    query = {};
  }
  var cursor = new MongoCursor(this, query, fields, false);
  return cursor;
}

proto.findOne = function(query, fields) {
  if (!query) {
    query = {};
  }
  var cursor = new MongoCursor(this, query, fields, true);
  return cursor;
}

proto.validate = function(cb) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.command = "validate";  
  
  this.mongo.ajax(cb, vars);  
}


proto.count = function(cb) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.command = "count";  
  
  this.mongo.ajax(cb, vars);  
}

proto.getIndexInfo = function(cb) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.command = "indexinfo";  
  
  this.mongo.ajax(cb, vars);  
}

proto.insert = function(cb, data, safe) {
  
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  
  vars.data = convert2JSON(data);
  if (safe) {
    vars.safe = "true";
  }
    
  vars.command = "insert";  
  
  this.mongo.ajax(cb, vars);  
}


proto.remove = function(cb, criteria, justone) {
  
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  
  vars.criteria = convert2JSON(criteria);
  if (justone) {
    vars.justone = "true";
  }
    
  vars.command = "remove";  
  
  this.mongo.ajax(cb, vars);  
}

proto.update = function(cb, criteria, data, options) {
  
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  
  vars.criteria = convert2JSON(criteria);
  vars.data = convert2JSON(data);
  vars.options = convert2JSON(options);
    
  vars.command = "update";  
  
  this.mongo.ajax(cb, vars);  
}

proto.deleteIndex = function(cb, key) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.key = convert2JSON(key);
  vars.command = "deleteindex";  

  this.mongo.ajax(cb, vars);  
}

proto.ensureIndex = function(cb, key, options) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.key = convert2JSON(key);
  vars.options = convert2JSON(options);
  vars.command = "ensureindex";  

  this.mongo.ajax(cb, vars);  
}

proto.deleteIndexes = function(cb) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.command = "deleteindexes";  
  
  this.mongo.ajax(cb, vars);  
}

proto.dropCollection = function(cb) {
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.getName();
  vars.command = "dropcollection";  
  
  this.mongo.ajax(cb, vars);  
}

// ------------------------------------------- CURSOR


var MongoCursor = function(collection, query, fields, isfindone) {
  this.collection = collection;
  this.db = collection.db;
  this.mongo = this.db.mongo;
  
  this.query = query;

  this.isfindone = isfindone;
  
  this.fieldsval = null;
  if (fields) {
    if (!fields.push) {
      fields = [fields];
    }
    this.fieldsval = fields;
  }
  this.sortval = null;
  this.skipval = null;
  this.groupval = null;
  this.limitval = null;  
  
  this.noconsoleprint = true;
}

var proto = MongoCursor.prototype;


proto.run = function(cb, subcommand) {
  if (this.isfindone) {
    this.limit(1);
  }

  var json = convert2JSON(this.query);
  
  var vars = {};
  vars.database = this.db.getName();
  vars.collection = this.collection.getName();
  vars.query = json;
  
  if (this.fieldsval !== null) {
    vars.fields = convert2JSON(this.fieldsval);
  }
  if (this.limitval) {
    vars.limit = this.limitval * 1;
  }
  if (this.skipval) {
    vars.skip = this.skipval * 1;
  }
  if (this.sortval !== null) {
    vars.sort = convert2JSON(this.sortval);
  }
    
  vars.command = "find";  
  vars.subcommand = subcommand;
  
  this.mongo.ajax(cb, vars);  
}

proto.getDatabase = function() {
  return this.db;
}

proto.getCollection = function() {
  return this.collection;
}

proto.getQuery = function() {
  return this.query;
}

proto.getFields = function() {
  return this.fieldsval;
}

proto.getArray = function(cb) {
  this.run(function(results) {
    cb(results);
  }, "find");
}

proto.count = function(cb) {
  this.run(function(results) {
    cb(results);
  }, "count");
}

proto.explain = function(cb) {
  this.run(function(results) {
    cb(results);
  }, "explain");
}

proto.validate = function(cb) {
  this.run(function(results) {
    cb(results);
  }, "validate");
}

proto.skip = function(val) {
  this.skipval = val;
  return this;
}
proto.getSkip = function() {
  return this.skipval;
}

proto.sort = function(val) {
  this.sortval = val;
  return this;
}
proto.getSort = function() {
  return this.sortval;
}

/*
proto.group = function(val) {
  this.groupval = val;
  return this;
}

proto.getGroup = function() {
  return this.groupval;
}
*/

proto.limit = function(val) {
  this.limitval = val;
  return this;
}
proto.getLimit = function() {
  return this.limitval;
}

