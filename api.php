<?php
session_start();
// var_dump($_POST);

// $_SESSION["user"] = [
//     "id" => 1
// ];

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    if(isset($_POST['action']) && isset($_POST['key'])){
        if($_POST['key'] == "POAJFF8AH20F221NJHP30"){
            
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
            
            if($_POST["action"] == "getSavedPaths"){
                if(isset($_SESSION["user"])){
                    $req = $bdd->prepare("SELECT * FROM maps_saves WHERE iduser = :user");
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
            
            }else if($_POST["action"] == "removePath"){

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
                    echo json_encode($_SESSION["user"]);
                }else{
                    echo "NK";
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