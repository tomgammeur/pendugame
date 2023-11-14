<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
    <title>Inscription</title>
</head>
<body>
    <h1 class="style">Inscription</h1>
    <form action="register-process.php" method="post">
        <label for="username">Nom d'utilisateur:</label>
        <input type="text" id="username" name="username" required><br>

        <label for="password">Mot de passe:</label>
        <input type="password" id="password" name="password" required><br>

        <button type="submit">S'inscrire</button>
    </form>
</body>
</html>
