-- phpMyAdmin SQL Dump
-- version 4.2.11
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 13, 2015 at 06:32 
-- Server version: 5.6.21
-- PHP Version: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `enc_search2`
--

-- --------------------------------------------------------

--
-- Table structure for table `record`
--

CREATE TABLE IF NOT EXISTS `record` (
`id` int(11) NOT NULL,
  `clientId` text NOT NULL,
  `particulars` text NOT NULL,
  `amount` text NOT NULL,
  `date` text NOT NULL,
  `authorId` text NOT NULL,
  `summary` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `record`
--

INSERT INTO `record` (`id`, `clientId`, `particulars`, `amount`, `date`, `authorId`, `summary`) VALUES
(1, '7232a27677d98ef3024208540702171e', 'df1b2552bc2215deb38d80ebbd222627214cb19222835f4316ed79fe8277dd5cf76d84efe23525ce75a9f341cad8eca3c4794f915618f0061d7040dfc5c584a821c484bca2d415a2ce464a80a46a90f1', '29e6868dabbeca7b0fd689b577862f21', 'dda4e52a39bdb8da1be852850869cf52', 'be61b9857a32127cd1c10893c99c88a3', 'db41f19ab6046636ab4c400634e08a23c5031fdbb2be6f02f1bd0450478a04a3d1d98c1d25d6353c064f9813f4b3436cb877ead28e810da65467b42d235815eb50cda5c0c03fe32938590d049e31af65ba7fa0a5cbcfa155530897b03decafd3e78070660fb36dcbc573ad030fb185d8d7005870fb1752582720b056bfb0bc86d449c69f9c2771c4725842a642d7ed297efd96fcafc5d75af93912d517b4b66f98faff52033fcc01ade91f73a5c6fdd7e2a731b17f722b3b7100bc2a251ff2aac74326a75a0a94607d05551265c2e65a65b7869a1d6d1834c59b4bc0b8f086175b747a6d04542e4381415edc72d9e50d411aba2ab717ce6a6b37337da5e9dd06a37b11978d3fd424f1313e88676b0ba1'),
(2, '7232a27677d98ef3024208540702171e', '3e795a949704f60d351b62c886b75fd3214cb19222835f4316ed79fe8277dd5c718396fa68e4d9db0684c3211827bddbc4794f915618f0061d7040dfc5c584a821c484bca2d415a2ce464a80a46a90f1', 'ed1424df0e786787faa722871d487c98', '9590735bd83327bde211dd9a3433c4d2', 'be61b9857a32127cd1c10893c99c88a3', 'db41f19ab6046636ab4c400634e08a23c5031fdbb2be6f02f1bd0450478a04a399ed1a6cc458aa5bf380f86749d27cfeb877ead28e810da65467b42d235815eb50cda5c0c03fe32938590d049e31af655b1ddf63e0e9428651354348b4aed64ce78070660fb36dcbc573ad030fb185d851ee4a6571c6ae4d0994ecc23f42e716d449c69f9c2771c4725842a642d7ed297efd96fcafc5d75af93912d517b4b66f98faff52033fcc01ade91f73a5c6fdd7e2a731b17f722b3b7100bc2a251ff2aac74326a75a0a94607d05551265c2e65aa14524c8b8abb5c8e10d25ee7a5642ac5b747a6d04542e4381415edc72d9e50d411aba2ab717ce6a6b37337da5e9dd06a37b11978d3fd424f1313e88676b0ba1'),
(3, 'e0d0504e1e6816527cf5f57defbe5880', 'cc286a6abb20d0be501fe8d5fa853c7c50109b5d1c079dd1b8ecdbb6af08fc46c2dbd425479599391e3da65aee577bbde853fc7bd73e706e9b105a0b6aa41f41', '22f048105aaa23d8070d0c0744f4bfdd', '6c92cf197699830992e955ea5dbe463d', 'f303c1b4f633e1fb972b7abc8899b68d', '060d2806b26882d2cc2f8796ae9f0b61b139cf7840ae77ab152e4e0150daabf7af9a5f414a4461e1c932d25f4ea238d3a1ca29c8b238846e23fedd080f32f6066a28f5633a3c3d956fe231a985e177bf83784a76e6b81a0c048bf52ec9bb40e16a6a272559968f2cf3a26fd4c279f5641b73c0df536eab8c50362ec14dc961bf1758042338ef86ee7af72c82f42541b305f4d706636a90574618e63b94d276d4ba7282923924b4532982fef5fdeda2c4ec14135d8551f3d65576261ae2716279094146b144fb5f214f96ea75a46f9cc686a807c8a9553eb2ae08b270ec7028ae17e2d6ba38fe45b9f73aacae71e0e16548e3b434c9804237c3d5f190541bc3e4');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`id` int(11) NOT NULL,
  `email` varchar(40) NOT NULL DEFAULT 'name',
  `name` varchar(100) NOT NULL,
  `consultantId` text NOT NULL,
  `consultant_name` text NOT NULL,
  `enc_password` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `role` varchar(40) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `name`, `consultantId`, `consultant_name`, `enc_password`, `password`, `role`) VALUES
(1, '89ae7d379afd0bc45607b24cad62', '89ae7d37', 'da', '89ae7d37', '89ae7d37', 'b736efda7342c257b42af16d6f7b8da01d5aa165', '88ae712baff612c4511f'),
(2, '78217cd0cf349094253fb37427a00910', '78217cd0cf34', 'da', '722b6ccc', '83a46d2bb5f4', '29ab3d3b00251057c638ba4cdeb998f2cfb7109f', '732867c6ce2e'),
(3, '9b57144783b3cb5cd0cf4a6b8ef494', '9b57144783', 'da', '80590c49', '92a06539b4', 'd94ed771bcecb16e12dc1fd0292358020368b22b', '815a07438387'),
(4, 'f6194aa198b58fd2495bd0887ab7cf59', 'f6194aa198b5', 'da', 'e71746aa', '98a0713cb3ea', '3dc6e696d7fc076747f85c4a6c317e08f2ae48eb', 'e6144da09fb1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `record`
--
ALTER TABLE `record`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `record`
--
ALTER TABLE `record`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
