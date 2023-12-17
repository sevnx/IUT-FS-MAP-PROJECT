<?php
$dsn = "mysql:host=localhost;dbname=maps";
$username = "root";
$password = "";

$id = $_POST['id'];
$name = $_POST['name'];
$email = $_POST['email'];

$pdo = new PDO($dsn, $username, $password);

$sql = "INSERT INTO users (id, name, email, created_at, updated_at) VALUES (:id, :name, :email, NOW(), NOW())";
$stmt = $pdo->prepare($sql);

$stmt->bindParam(':id', $id);
$stmt->bindParam(':name', $name);
$stmt->bindParam(':email', $email);

if ($stmt->execute()) {
    echo "User data inserted successfully";
} else {
    echo "Error: " . $sql . "<br>" . $stmt->errorInfo();
}

$pdo = null;
?>