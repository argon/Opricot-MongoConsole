<?php
  require_once("config.php");
?>

<html>
  <head>
    <title>Opricot</title>
      <link rel="stylesheet" type="text/css" href="styles.css" />
      <style type="text/css">.feature_store { <?php if (!$store_enabled) { echo 'display: none;'; } ?> }</style>
      <script type="text/javascript" src="ajax.js"></script>
      <script type="text/javascript" src="mongodb.js"></script>
      <script type="text/javascript" src="console.js"></script>
      <script type="text/javascript" src="commands.internal.js"></script>
      <script type="text/javascript" src="commands.mongo.js"></script>
      <script type="text/javascript" src="commands.db.js"></script>
      <script type="text/javascript" src="commands.collection.js"></script>
      <script type="text/javascript" src="commands.cursor.js"></script>
      <script type="text/javascript" src="ext/json.js"></script>
      <script type="text/javascript">
        var init = function() {
        
          var defaulthost = "<?php echo $defaulthost; ?>";
          var defaultport = "<?php echo $defaultport; ?>";
        
        
          window.jsconsole = new JSConsole(document.getElementById('main_console'), document.getElementById('main_results')); 
          window.mongo = new Mongo(); 
          window.db = null;
          window.coll = null;
          
<?php
  if ($store_enabled) {
    echo "window.store_db = '".$store_db."';\n";
    echo "window.store = new Mongo();\n";
    echo "window.store.setHost('".$store_host."');\n";
    echo "window.store.setPort('".$store_port."');\n";
    if (isset($store_user)) {
      echo "window.store.setUser('".$store_user."');\n";
    }
    if (isset($store_user)) {
      echo "window.store.setPass('".$store_pass."');\n";
    }
    if (isset($_POST["cuser"]) && isset($_POST["cpass"])) {
      if (isset($_POST["cuser"])) {
        echo 'window.store.setAJAXUser("' . $_POST["cuser"] . '");' . "\n";
      }
      if (isset($_POST["cpass"])) {
        echo 'window.store.setAJAXPass("' . $_POST["cpass"] . '");' . "\n";
      }
    }
  }
?>
          
          window.mongo.updateConnectionView = function() {
            window.db = window.mongo.getCurrentDatabase();
            window.coll = null;
            if (window.db) {
              window.coll = window.db.getCurrentCollection();
            } else {
              window.coll = null;
            }
            var el = document.getElementById("main_connection");
            el.innerHTML = "";
            el.appendChild(document.createTextNode("connection: " + window.mongo.host + ":" + window.mongo.port));
            el.appendChild(document.createElement("br"));
            var dbt = "";
            if (window.db) {
              dbt = window.db.getName();
              el.appendChild(document.createTextNode("database: " + window.db.getName()));
            } else {
              el.appendChild(document.createTextNode("database: UNSELECTED"));
            }
            el.appendChild(document.createElement("br"));
            var dbc = "";
            if (window.coll) {
              dbc = window.coll.getName();
              el.appendChild(document.createTextNode("collection: " + window.coll.getName()));
            } else {
              el.appendChild(document.createTextNode("collection: UNSELECTED"));
            }
            el.appendChild(document.createElement("br"));
            el.appendChild(document.createElement("br"));
            document.title = dbt + "." + dbc + " @ " + window.mongo.host + ":" + window.mongo.port + " :: Opricot";
           
          }
          window.mongo.error = function(desc) {
            var item = jsconsole.createItem();
            item.addTitle("Error.");
            item.addText("" + desc);
            jsconsole.addItem(item);              
          }
          
          window.mongo.setHost(defaulthost);
          window.mongo.setPort(defaultport);
          window.mongo.setAJAXUser(null);
          window.mongo.setAJAXPass(null);

<?php
  if (isset($_POST["cuser"]) && isset($_POST["cpass"])) {
    if (isset($_POST["cuser"])) {
      echo 'window.mongo.setAJAXUser("' . $_POST["cuser"] . '");' . "\n";
    }
    if (isset($_POST["cpass"])) {
      echo 'window.mongo.setAJAXPass("' . $_POST["cpass"] . '");' . "\n";
    }
  } else {
    echo "// no authorization in use\n";
  }
?>

          document.getElementById("main").style.display = "block";
          document.getElementById("main_console").select();
          
          var initrun = function() {
            var cmds = "" + window.location.hash;
            if (cmds) {
              cmds = cmds.substring(1);
              var lastchar = cmds.substring(cmds.length -1, cmds.length);
              if (lastchar === "!") {
                cmds = cmds.substring(0, cmds.length -1);
                runCommands(cmds);
              } else {
                fillCommand(cmds);
              }
            } else {
              welcome();
            }
          }
          
          var getMouse = function(evt) {
            if (!evt) { evt = window.event; }
	          var result = {};
	          result.x = -1;
	          result.y = -1;
	          if (!evt) {
	            evt = window.event;	
	          }
	          if (evt.pageX || evt.pageY) 	{
		          result.x = evt.pageX;
		          result.y = evt.pageY;
	          } else if (evt.clientX || evt.clientY) 	{
		          result.x = evt.clientX + document.body.scrollLeft
			          + document.documentElement.scrollLeft;
		          result.y = evt.clientY + document.body.scrollTop
			          + document.documentElement.scrollTop;
	          }
	          
	          result.screenX = evt.screenX * 1;
	          result.screenY = evt.screenY * 1;
	          result.documentX = result.x * 1;
	          result.documentY = result.y * 1;
	          return result;
          }
          
          var main = document.getElementById("main");
          var maintop = document.getElementById("main_top");
          var mainbottom = document.getElementById("main_bottom");
          var grabble = document.getElementById("main_grabble");
          
          
          grabble.onmousedown = function() {
            window._grabbed = true;
            return false;
          }
          document.body.onmouseup = function() {
            window._grabbed = false;           
          }
          document.body.onmousemove = function(e) {
            if (window._grabbed) {
              if (!e) {
                e = window.event;
              }  
              if (e) {
                var y = getMouse(e).documentY;
                var h = document.body.offsetHeight;
                resize(h - y);                
              }
              return false;
            }
          }
          window.onresize = function() { 
            resize();          
          };
          window.setTimeout(function() {
            resize();
            initrun();
          }, 400);
          
          
        }
        
        
      </script>
  </head>
  
<?php
  require_once("auth.php");
?>display: <?php if ($store_enabled) { echo 'inline'; } else { echo 'none'; } ?>;
  
  <body onload="init();">
    <div id="main" style="display: none;">
      <div id="main_top">
        <div class="ui_box" id="main_results">
        </div>
      </div>
      <div id="main_grabble">
      </div>
      <div id="main_bottom">
        <table id="bottom_table">
          <tbody>
          <tr>
            <td id="main_input_cell">
              <div class="ui_box" id="main_input">
                <textarea tabindex="1" id="main_console">help();</textarea>
              </div>
            </td>
            <td id="main_actions_cell">
              <div class="ui_box" id="main_actions">

                <div id="main_details">
                  <div id="main_connection">
                  </div>

                  <div id="main_footer">
                     Opricot v0.9.2a
                  </div>
                </div>
                
                <button tabindex="2" title="Run the commands in editor." onclick="runCommands(); document.getElementById('main_console').select();" class="ui_button">Run</button>
                <button tabindex="3" title="Show a list of quick actions / command shortcuts." onclick="quickActions(); document.getElementById('main_console').select();" class="ui_button">Actions</button>
                <button tabindex="4" title="Show database list." onclick="showDatabases(); document.getElementById('main_console').select();" class="ui_button">Databases</button>
                <br />
                <button tabindex="5" title="Show help." onclick="help(); document.getElementById('main_console').select();" class="ui_button">Help</button>
                <button tabindex="6" title="Clear the results screen." onclick="clearScreen(); document.getElementById('main_console').select();" class="ui_button">Clear</button>
                <button tabindex="7" title="Show previous commands." onclick="commandHistory(); document.getElementById('main_console').select();" class="ui_button">History</button>
                <button class="ui_button feature_store" tabindex="8" title="Show script library." onclick="showLibrary(); document.getElementById('main_console').select();">Library</button>
                
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  
  </body>
</html>
