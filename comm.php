<?php

// require_once('FirePHPCore/fb.php');
  
require_once("config.php");
require_once("auth.php");

if (get_magic_quotes_gpc()) {
    $process = array(&$_GET, &$_POST, &$_COOKIE, &$_REQUEST);
    while (list($key, $val) = each($process)) {
        foreach ($val as $k => $v) {
            unset($process[$key][$k]);
            if (is_array($v)) {
                $process[$key][stripslashes($k)] = $v;
                $process[] = &$process[$key][stripslashes($k)];
            } else {
                $process[$key][stripslashes($k)] = stripslashes($v);
            }
        }
    }
    unset($process);
}

// ------------------------------------------- INITIALIZE


  $command = $_POST["command"];
  $subcommand = null;
  if (isset($_POST["subcommand"])) {
    $subcommand = $_POST["subcommand"];
  }

  $host = "localhost";
  if (isset($_POST["host"])) {
    $host = $_POST["host"];
  }
  
  $port = "27017";
  if (isset($_POST["port"])) {
    $port = $_POST["port"];
  }

  $user = null;
  if (isset($_POST["user"])) {
    $user = $_POST["user"];
  }

  $pass = null;
  if (isset($_POST["pass"])) {
    $pass = $_POST["pass"];
  }
  
  $url = null;
  if ($user && $pass) {
    $url = "mongodb://".$user.":".$pass."@".$host.":".$port;
  } else {
    $url = $host.":".$port;
  }

  $mongo = new Mongo($url);
  
  
  function processOutgoingArray($arr) {
    if (!is_array($arr)) {
      return $arr;
    }
    foreach ($arr as $key => $value) {
      if ($value instanceof MongoId) {
        $obj = array("type" => "object", "cls" => "MongoId", "val" => "".$value);
        $arr[$key] = $obj;
      } else if ($value instanceof MongoDate) { 
        $obj = array("type" => "object", "cls" => "MongoDate", "val" => $value->sec);
        $arr[$key] = $obj;
      } else {
        $arr[$key] = processOutgoingArray($value);
      }
    }
    return $arr;
  }
  function processIncomingArray($arr) {
    if (!is_array($arr)) {
      return $arr;
    }
    if (isset($arr["type"]) && $arr["type"] == "object") {
      $type = $arr["cls"];
      $obj = new $type($arr["val"]);
      return $obj;
    }
    foreach ($arr as $key => $value) {
      $arr[$key] = processIncomingArray($value);
    }
    return $arr;
  }
  
  function jsonDecode($data) {
    return processIncomingArray(json_decode($data, true));
  }
  function jsonEncode($data) {
    $data = processOutgoingArray($data);
    return json_encode($data);
  } 
  
  function done($data) {
    echo jsonEncode($data);
    exit();
  }
  
  function error($desc, $data = null) {
    echo("ERROR: ".$desc);
    if (isset($data)) {
      echo ": ";
      print_r($data);
    }
    exit();
  }
   
  if (isset($_POST["database"])) {
    $mongodb = $mongo->selectDB($_POST["database"]);
  }

  if (isset($_POST["collection"])) {
    $mongocollection = $mongodb->selectCollection($_POST["collection"]);
  }


// ------------------------------------------- COMMANDS


  if ($command == "showdatabases") {
    if (!isset($mongodb)) {
      $mongodb = $mongo->selectDB("admin");
    }
    $databases = $mongodb->execute('db.getMongo().getDBNames().sort()');
    done($databases["retval"]);
  }

  if ($command == "execute") {
    if (!isset($mongodb)) {
      $mongodb = $mongo->selectDB("admin");
    }
    $val = $_POST["code"];
    $options = null;
    if (isset($_POST["options"])) {
      $options = jsonDecode($_POST["options"]);
      if (!$options) {
        $options = null;
      }
    }    
    if ($options) {
      $val = $mongodb->execute($val, $options);
    } else {
      $val = $mongodb->execute($val);
    }
    done($val["retval"]);
  }

  
  if ($command == "showcollections") {
    $collections = $mongodb->listCollections();
    $result = array();
    foreach ($collections as $collection) {
      $result[] = $collection->getName();
    }
    done($result);
  }

  if ($command == "dropdatabase") {
    // does not seem to work
    $val = $mongodb->drop();
    done($val);
  }

  if ($command == "dropcollection") {
    $val = $mongocollection->drop();
    done($val);
  }

  if ($command == "repairdatabase") {
    $val = $mongodb->repair();
    done($val);
  }

  if ($command == "indexinfo") {
    $val = $mongocollection->getIndexInfo();
    done($val);
  }

  if ($command == "deleteindexes") {
    $val = $mongocollection->deleteIndexes();
    done($val);
  }

  if ($command == "deleteindex") {
    $val = jsonDecode($_POST["key"]);
    $result = $mongocollection->deleteIndex($val);
    done($result);
  }

  if ($command == "ensureindex") {
    $val = jsonDecode($_POST["key"]);
    $options = null;
    if (isset($_POST["options"])) {
      $options = jsonDecode($_POST["options"]);
      if (!$options) {
        $options = null;
      }
    }
    if ($options) {
      $result = $mongocollection->ensureIndex($val, $options);
    } else {
      $result = $mongocollection->ensureIndex($val);
    }
    done($result);
  }

  if ($command == "validate") {
    $val = $mongocollection->validate();
    done($val["result"]);
  }

  if ($command == "count") {
    $count = $mongocollection->count();
    done($count);
  }

  if ($command == "insert") {
    $safe = false;
    if (isset($_POST["safe"]) && $_POST["safe"] === "true") {
      $safe = true;
    }
    $data = jsonDecode($_POST["data"]);
    $result = $mongocollection->insert($data, $safe);
    done($result);
  }

  if ($command == "remove") {
    $justone = false;
    if (isset($_POST["justone"]) && $_POST["justone"] === "true") {
      $justone = true;
    }
    $criteria = jsonDecode($_POST["criteria"]);
    $result = $mongocollection->remove($criteria, $justone);
    done($result);
  }

  if ($command == "update") {
    $criteria = null;
    if (isset($_POST["criteria"])) {
       $val = jsonDecode($_POST["criteria"]);
       if ($val) {
         $criteria = $val;
       }
    }
    $data = null;
    if (isset($_POST["data"])) {
       $val = jsonDecode($_POST["data"]);
       if ($val) {
         $data = $val;
       }
    }
    $options = null;
    if (isset($_POST["options"])) {
       $val = jsonDecode($_POST["options"]);
       if ($val) {
         $options = $val;
       }
    }
    $result = $mongocollection->update($criteria, $data, $options);
    done($result);
  }


  if ($command == "find") {
    $query = jsonDecode($_POST["query"]);
    
    $cursor = null;
    if (isset($_POST["fields"])) {
      $fields = jsonDecode($_POST["fields"]);
      $cursor = $mongocollection->find($query, $fields);
    } else {
      $cursor = $mongocollection->find($query);
    }
        
    if (!isset($cursor)) {
      error("Could not execute query", $mongodb->lastError());
    }
    
    if (isset($_POST["limit"])) {
      $cursor->limit($_POST["limit"] * 1);
    }

    if (isset($_POST["skip"])) {
      $cursor->skip($_POST["skip"] * 1);
    }
    
    if (isset($_POST["sort"])) {
      $val = jsonDecode($_POST["sort"]);
      $cursor->sort($val);
    }

    if ($subcommand == "explain") {
      $result = $cursor->explain();
    } else if ($subcommand == "validate") {
      if ($cursor->hasNext()) { $cursor->getNext(); } 
      $result = $cursor->valid();
    } else if ($subcommand == "count") {
      $result = $cursor->count();
    } else {
      $result = $cursor;
      $result = array();
      while ($cursor->hasNext()) {
          $result[] = $cursor->getNext();
      }
    }
    done($result);
  }


// ------------------------------------------- DONE

  error("Unknown command.");

?>
