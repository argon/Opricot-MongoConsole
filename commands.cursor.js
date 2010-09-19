var showCursor = function(cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  var item = jsconsole.createItem();
  item.addTitle("Cursor");

  item.addVariable(cur.getQuery());
  item.addBR();

  var type = "find";
  if (cur.isfindone) { type = "findOne"; }
  item.addText(" DATABASE: " +  cur.getCollection().getName());
  item.addText(" COLLECTION: " + cur.getDatabase().getName());
  item.addText(" TYPE: " + type);
  item.addText(" LIMIT: " + cur.getLimit());
  item.addText(" SKIP: " + cur.getSkip());
  item.addBR();
  item.addText(" FIELDS: " + cur.getFields());
  item.addText(" SORT: " + cur.getSort());
  // item.addText(" GROUP: " + cur.getGroup());
  item.addBR();
  item.addBR();

  item.addAction("select", function(cursor) { window.cursor = cursor; print("Active cursor changed."); }, cur);
  item.addAction("results", function(cursor) { results(cursor); }, cur);
  item.addAction("count", function(cursor) { count(cursor); }, cur);
  item.addAction("validate", function(cursor) { validate(cursor); }, cur);
  item.addAction("limit", function(cursor) { 
    var val =prompt("Enter limit value");
    cursor.limit(val * 1);
    showCursor(cursor);
  }, cur);  
  item.addAction("skip", function(cursor) { 
    var val =prompt("Enter skip value");
    cursor.skip(val * 1);
    showCursor(cursor);
  }, cur);  
  item.addAction("sort", function(cursor) { 
    var val = prompt("Enter sort value");
    cursor.sort(val);
    showCursor(cursor);
  }, cur);
  item.addAction("setup", function(cursor) { 
    window.cursor = cursor; 
    print("Active cursor changed.");
    var val = "";
    val = val + "limit(" + cursor.getLimit() + ");\n";
    val = val + "skip(" + cursor.getSkip() + ");\n";
    val = val + "sort(" + JSON.stringify(cursor.getSort()) + ");\n";
    val = val + "showCursor();";    
    jsconsole.fillCommand(val);
  }, cur);
  /*
  item.addAction("group", function(cursor) { 
    var val =prompt("Enter group value");
    cursor.group(val * 1);
    showCursor(cursor);
  }, cur);
  */  
  jsconsole.addItem(item);
}

var limit = function(num, cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.limit(num);
  showCursor(cur);
}

var skip = function(num, cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.skip(num);
  showCursor(cur);
}

var sort = function(val, cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.sort(val);
  showCursor(cur);
}

/*
var group = function(val, cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.group(val);
  showCursor(cur);
}
*/

var results = function(cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  
  var cloneDoc = function(doc) {
    var newdata = {};
    for (var i in doc) {
      if (i != "_id") {
        newdata[i] = doc[i];
      }
    }
    return newdata;
  }
  
  var printDoc = function(item, doc) {
    var id = doc._id;
    item.addAction("DOCUMENT ID " + id, function() { find({_id: new MongoId(id)}); results(); });
    item.addAction("remove", function() { 
      if (confirm("Really remove the document with id " + id + "?")) {
        remove({_id: new MongoId(id)}, true); 
      }
    });
    item.addAction("update", function() { 
      fillCommand("update({_id: new MongoId('" + id + "')}, {$set: {FIELD: VALUE}});");
    });
        
    item.addBR();
    item.addVariable(cloneDoc(doc));
    item.addHTML("<hr />");
  }
  
  cur.getArray(function(results) {
    var item = jsconsole.createItem();
    if (results && results.push) {
      for(var i in results) {
        printDoc(item, results[i]);
      }
    } else {
      item.addVariable(results);
    }
    jsconsole.addItem(item);
  });
}

var count = function(cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.count(function(results) {
    var item = jsconsole.createItem();
    item.addVariable(results);
    jsconsole.addItem(item);
  });
}

var validate = function(cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.validate(function(results) {
    var item = jsconsole.createItem();
    item.addVariable(results);
    jsconsole.addItem(item);
  });
}

var explain = function(cur) {
  if (!cur) { cur = window.cursor; }
  if (!cur) { this.error("Could not find cursor."); return; }
  cur.explain(function(results) {
    var item = jsconsole.createItem();
    item.addVariable(results);
    jsconsole.addItem(item);
  });
}


