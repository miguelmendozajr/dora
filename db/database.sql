CREATE DATABASE IF NOT EXISTS washroom;

USE washroom;

CREATE TABLE machine (
    id INT(10) NOT NULL AUTO_INCREMENT;
    name VARCHAR(45) DEFAULT NULL,
    onUse BOOLEAN DEFAULT 0,
    washing BOOLEAN DEFAULT 0,
    PRIMARY KEY (id);
);

DESCRIBE machine;

INSERT INTO machine VALUES (1, 'Lavadora', 0, 0), (2, 'Secadora', 0, 0);

