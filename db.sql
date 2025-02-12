SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `twitchapi`
--
CREATE DATABASE IF NOT EXISTS `twitchapi` DEFAULT CHARACTER SET utf8mb4;
USE `twitchapi`;

-- --------------------------------------------------------

--
-- Table structure for table `blacklist_users`
--

CREATE TABLE `blacklist_users` (
  `id` int NOT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `watch_time`
--

CREATE TABLE `watch_time` (
  `id` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `session_start` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_watch_time` int DEFAULT '0',
  `points` int DEFAULT '0',
  `last_seen` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blacklist_users`
--
ALTER TABLE `blacklist_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `watch_time`
--
ALTER TABLE `watch_time`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blacklist_users`
--
ALTER TABLE `blacklist_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `watch_time`
--
ALTER TABLE `watch_time`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;