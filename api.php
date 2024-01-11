<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";
session_start();
// var_dump($_POST);

// $_SESSION["user"] = [
//     "id" => 1
// ];
$host = "aitfrkktquschool.mysql.db";
$dbname = "aitfrkktquschool";
$user = "aitfrkktquschool";
$mdp = "9a5qHgU3jVs65D";

try
{
    $bdd = new PDO('mysql:host='.$host.';dbname='.$dbname.';charset=utf8mb4', ''.$user.'', ''.$mdp.'');
    $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (Exception $e)
{
    header('location: /error/bdd&erreur');
}


if($_SERVER['REQUEST_METHOD'] == 'POST'){
    
    if(isset($_POST['action']) && isset($_POST['key'])){
        if($_POST['key'] == "POAJFF8AH20F221NJHP30"){
            
            
            if($_POST["action"] == "getSavedPaths"){
                if(isset($_SESSION["user"])){
                    $req = $bdd->prepare("SELECT * FROM maps_saves WHERE iduser = :user ORDER BY created_at DESC");
                    $req->execute([ ':user' => $_SESSION["user"]['id'] ]);
                    $result = $req->fetchAll();
                    echo json_encode(["paths" => $result]);
                }else{
                    echo json_encode([]);
                }

            }else if($_POST["action"] == "savePath"){

                if(isset($_POST["start"]) && isset($_POST["end"]) && isset($_POST["name"]) && isset($_POST["estimated_time"]) && isset($_SESSION["user"])){
                    $req = $bdd->prepare("INSERT INTO maps_saves (iduser, name, start, end, estimated_time) VALUES (:user, :name, :start, :end, :estimated_time)");
                    if($req->execute([ 
                        ':user' => $_SESSION["user"]['id'], 
                        ':name' => $_POST['name'], 
                        ':start' => $_POST['start'], 
                        ':end' => $_POST['end'], 
                        ':estimated_time' => $_POST['estimated_time']
                    ])){
                        echo 'OK';
                    }else{
                        echo 'NK';
                    }

                }
            
            }else if($_POST["action"] == "deletePath"){
                if(isset($_POST["id"]) && isset($_SESSION["user"])){
                    $req = $bdd->prepare("DELETE FROM maps_saves WHERE id = :id AND iduser = :user");
                    if($req->execute([ 
                        ':id' => $_POST['id'], 
                        ':user' => $_SESSION["user"]['id']
                    ])){
                        echo 'OK';
                    }else{
                        echo 'NK';
                    }
                }
            }else if($_POST["action"] == "login"){
                if(isset($_POST["email"]) && isset($_POST["password"])){
                    $req = $bdd->prepare("SELECT * FROM maps_users WHERE email = :email");
                    $req->execute([ ':email' => $_POST["email"] ]);
                    $result = $req->fetch();
                    if($result){
                        if(sha1($_POST["password"]) == $result["password"]){
                            $_SESSION["user"] = $result;
                            echo 'OK';
                        }else{
                            echo 'NK';
                        }
                    }else{
                        echo 'NK';
                    }
                }
            }else if($_POST['action'] == "getUserConnected"){
                if(isset($_SESSION["user"])){
                    echo json_encode(["status" => "connected", "user" => $_SESSION["user"]]);
                }else{
                    $client_id = "166841410239-ki6er9r9kc8cjk13skoiklrba2lkdo0u.apps.googleusercontent.com";
                    $client = new Google_Client(['client_id' => $client_id]);

                    $redirect_uri = 'https://descartographie.ait37.fr/api.php';
                    $client->setRedirectUri($redirect_uri);
                    // $Login_uri = 'https://descartographie.ait37.fr/api.php?action=loginGoogle';
                    // $client->setLoginUri($Login_uri);
                    //api.php?action=loginGoogle
                    $authUrl = $client->createAuthUrl("email", ['enable_serial_consent' => 'true']);

                    echo json_encode(["status" => "disconnected", "url" => $authUrl]);
                }
            }else if($_POST['action'] == "logout"){
                if(isset($_SESSION["user"])){
                    unset($_SESSION["user"]);
                    echo "OK";
                }else{
                    echo "NK";
                }
            }
        }
    }
    
}

if(isset($_GET["code"])){
    $client_id = "166841410239-ki6er9r9kc8cjk13skoiklrba2lkdo0u.apps.googleusercontent.com";
    $client = new Google_Client(['client_id' => $client_id]);
    $client->setAuthConfig("google/client_secret_166841410239-ki6er9r9kc8cjk13skoiklrba2lkdo0u.apps.googleusercontent.com.json");
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    if(!isset($token['error'])){
        $client->setAccessToken($token['access_token']);
        $user = $client->verifyIdToken($token['id_token']);
        if ($user) {
            $req = $bdd->prepare("SELECT * FROM maps_users WHERE email = :email");
            $req->execute([ ':email' => $user["email"] ]);
            $result = $req->fetch();
            if($result){
                $_SESSION["user"] = $result;
            }else{
                $req = $bdd->prepare("INSERT INTO maps_users (email, name, password) VALUES (:email, :name, :password)");
                if($req->execute([ 
                    ':email' => $user["email"], 
                    ':name' => $user["name"], 
                    ":password" => "googleauth"
                ])){
                    $req = $bdd->prepare("SELECT * FROM maps_users WHERE email = :email");
                    $req->execute([ ':email' => $user["email"] ]);
                    $result = $req->fetch();
                    $_SESSION["user"] = $result;
                }
            }
        }
    }
    header('location: /');
}