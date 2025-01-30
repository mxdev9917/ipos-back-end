CREATE TABLE `Restaurants` (
  `restaurant_ID` int NOT NULL AUTO_INCREMENT,
  `owner_ID` int NOT NULL,
  `restaurant_name` varchar(50) NOT NULL,
  `restaurant_status` varchar(20) DEFAULT 'pending',
  `restaurant_img` varchar(255) DEFAULT NULL,
  `restaurant_expiry_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`restaurant_ID`),
  KEY `owner_ID` (`owner_ID`),
  CONSTRAINT `Restaurants_ibfk_1` FOREIGN KEY (`owner_ID`) REFERENCES `Owners` (`owner_ID`) ON DELETE CASCADE
);

CREATE TABLE `Owners` (
  `owner_ID` int NOT NULL AUTO_INCREMENT,
  `owner_name` varchar(50) NOT NULL,
  `owner_email` varchar(100) NOT NULL,
  `owner_phone` varchar(15) DEFAULT NULL,
  `owner_status` varchar(20) DEFAULT 'active',
  `owner_password` varchar(255) NOT NULL,
  `owner_img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`owner_ID`)
);

CREATE TABLE `User_admins` (
  `user_admin_ID` int NOT NULL AUTO_INCREMENT,
  `user_admin_name` varchar(50) NOT NULL,
  `user_admin_email` varchar(100) NOT NULL,
  `user_admin_phone` varchar(15) DEFAULT NULL,
  `user_admin_role` varchar(20) NOT NULL,
  `user_admin_password` varchar(255) NOT NULL,
  `user_admin_status` varchar(20) DEFAULT 'active',
  `user_admin_img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_admin_ID`)
);

CREATE TABLE `Users` (
  `user_ID` int NOT NULL AUTO_INCREMENT,
  `restaurant_ID` int NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `user` varchar(50) NOT NULL,
  `user_phone` varchar(15) DEFAULT NULL,
  `user_status` varchar(20) DEFAULT 'active',
  `user_password` varchar(255) NOT NULL,
  `user_role` varchar(50) NOT NULL,
  `user_img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_ID`),
  KEY `restaurant_ID` (`restaurant_ID`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`) ON DELETE CASCADE
);

CREATE TABLE `Categories` (
  `category_ID` int AUTO_INCREMENT NOT NULL,
  `restaurant_ID` int NOT NULL,
  `category` varchar(100) NOT NULL,
  `category_status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_ID`),
  FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`) ON DELETE CASCADE
);

CREATE TABLE `Tables` (
  `table_ID` int AUTO_INCREMENT NOT NULL,
  `restaurant_ID` int NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `table_status` varchar(20) DEFAULT 'empty',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`table_ID`),
  FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`) ON DELETE CASCADE
);