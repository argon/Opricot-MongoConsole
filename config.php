<?php

// ------------------------------------------- CONFIGURATION


  // Enable/disable password checking
  $forcelogin = false; 

  // Add users and passwords to this array
  $users = array();
  $users["admin"] = "test";

  // Default mongodb host
  $defaulthost = "localhost";
  
  // Default mongodb port
  $defaultport = "27017";
  
  // Enable/disable Opricot features requiring storage on MongoDB (script library)
  $store_enabled = false;
  $store_host = "localhost";
  $store_port = "27017";
  $store_db = "opricot";
  $store_user = null; // note; will be visible to web user
  $store_pass = null; // note; will be visible to web user

?>
