<?php
var_dump($_POST);
require_once "vendor/autoload.php";

// Get $id_token via HTTPS POST.
$id_token = $_POST['credential'];
var_dump($id_token);

$client = new Google_Client();  // Specify the CLIENT_ID of the app that accesses the backend
$client->setAccessToken("166841410239-ki6er9r9kc8cjk13skoiklrba2lkdo0u.apps.googleusercontent.com");
$payload = $client->verifyIdToken($id_token);
var_dump($payload);
if ($payload) {
  $userid = $payload['sub'];
  // If request specified a G Suite domain:
  //$domain = $payload['hd'];
} else {
  // Invalid ID token
}