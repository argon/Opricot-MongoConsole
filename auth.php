<?php


  require_once("config.php");

  $cuser = null;
  $cpass = null;
  
  if (isset($_POST["cuser"])) {
    $cuser = $_POST["cuser"];
  }
  if (isset($_POST["cpass"])) {
    $cpass = $_POST["cpass"];
  }
  
  
  if ($forcelogin) {
    if (isset($users[$cuser]) && $users[$cuser] == $cpass) {
      // all ok
    } else {
      require_once("login.php");
      exit();    
    }
  }

?>
