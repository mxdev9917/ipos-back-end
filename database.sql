CREATE TABLE `Restaurants` (
  `restaurant_ID` int NOT NULL AUTO_INCREMENT,
  `owner_ID` int NOT NULL,
  `restaurant_name` varchar(50) NOT NULL,
  `restaurant_user` varchar(20) NOT NULL,
  `restaurant_password` varchar(255) NOT NULL,
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
  `category_image` varchar(100) NOT NULL,
  `category_kitchen_status` varchar(10) NOT NULL,
  `category_bar_status` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_ID`),
  FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`) ON DELETE CASCADE
);

CREATE TABLE `Foods` (
  `food_ID` INT AUTO_INCREMENT NOT NULL,
  `category_ID` INT NOT NULL,
  `restaurant_ID` INT NOT NULL,
  `food_name` VARCHAR(100) NOT NULL,
  `price` int NOT NULL,
  `food_status` VARCHAR(20) DEFAULT 'active',
  `food_img` VARCHAR(150),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`food_ID`),
  FOREIGN KEY (`category_ID`) REFERENCES `Categories` (`category_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`) ON DELETE CASCADE
);

CREATE TABLE `PathImg`(
  pathImg_ID INT AUTO_INCREMENT NOT NULL,
  pathImg_name VARCHAR(100),
  PRIMARY KEY (`pathImg_ID`),
);

CREATE TABLE `Orders` (
  `order_ID` INT NOT NULL AUTO_INCREMENT,
  `table_ID` INT NOT NULL,
  `user_ID` INT NOT NULL,
  `restaurant_ID` INT NOT NULL,
  `order_status` VARCHAR(20) DEFAULT 'unpaid',
  `total_price` DECIMAL(10, 2),
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_ID`),
  FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`)
);

CREATE TABLE `Menu_items` (
  `menu_items_ID` INT NOT NULL AUTO_INCREMENT,
  `order_ID` INT NOT NULL,
  `food_ID` INT NOT NULL,
  `category_ID` INT NOT NULL,
  `quantity` INT NOT NULL,
  `description` VARCHAR(100),
  `menu_item_status` VARCHAR(20) DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`menu_items_ID`),
  FOREIGN KEY (`order_ID`) REFERENCES `Orders`(`order_ID`) ON DELETE CASCADE,
  FOREIGN KEY (`food_ID`) REFERENCES `Foods`(`food_ID`),
  FOREIGN KEY (`category_ID`) REFERENCES `Categories` (`category_ID`) ON DELETE CASCADE
);

CREATE TABLE `Rates`(
  `rate_ID` INT NOT NULL AUTO_INCREMENT,
  `restaurant_ID` INT NOT NULL,
  `currency` VARCHAR(30) NOT NULL,
  `rate` DECIMAL(10, 2) NOT NULL,
  `rate_status` VARCHAR(20) DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rate_ID`),
  FOREIGN KEY (`restaurant_ID`) REFERENCES `Restaurants` (`restaurant_ID`) ON DELETE CASCADE
);