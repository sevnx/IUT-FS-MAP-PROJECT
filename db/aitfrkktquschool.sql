-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : aitfrkktquschool.mysql.db
-- Généré le : jeu. 11 jan. 2024 à 12:20
-- Version du serveur : 5.7.42-log
-- Version de PHP : 8.1.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `aitfrkktquschool`
--

-- --------------------------------------------------------

--
-- Structure de la table `maps_saves`
--

CREATE TABLE `maps_saves` (
  `id` int(11) NOT NULL,
  `iduser` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start` varchar(255) NOT NULL,
  `end` varchar(255) NOT NULL,
  `estimated_time` varchar(25) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `maps_saves`
--

INSERT INTO `maps_saves` (`id`, `iduser`, `name`, `start`, `end`, `estimated_time`, `created_at`) VALUES
(42, 45, 'Travail', 'Chatelet', 'Mirabeau', '21:12', '2024-01-11 10:56:44');

-- --------------------------------------------------------

--
-- Structure de la table `maps_users`
--

CREATE TABLE `maps_users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `maps_users`
--

INSERT INTO `maps_users` (`id`, `email`, `name`, `password`, `role`, `created_at`, `updated_at`) VALUES
(41, 'victor.degrolard@gmail.com', 'Victor', '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684', 0, '2024-01-08 19:21:14', '2024-01-08 19:21:14'),
(44, 'corentin.lenclos@gmail.com', 'Corentin L.', 'googleauth', 0, '2024-01-08 19:25:12', '2024-01-08 19:25:14'),
(45, 'sewciooooo@gmail.com', 'sev', 'googleauth', 0, '2024-01-08 19:45:09', '2024-01-08 19:45:14');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `maps_saves`
--
ALTER TABLE `maps_saves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idusertosave` (`iduser`);

--
-- Index pour la table `maps_users`
--
ALTER TABLE `maps_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `maps_saves`
--
ALTER TABLE `maps_saves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `maps_users`
--
ALTER TABLE `maps_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `maps_saves`
--
ALTER TABLE `maps_saves`
  ADD CONSTRAINT `idusertosave` FOREIGN KEY (`iduser`) REFERENCES `maps_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
