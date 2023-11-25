
CREATE DATABASE railway;

USE railway;
     
CREATE TABLE machine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    cycle_id INT
);
  
CREATE TABLE user (
    phone VARCHAR(14) PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE cycle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,
    startedAt TIMESTAMP,
    user_phone VARCHAR(14),
    warning BOOLEAN DEFAULT 0,
    FOREIGN KEY (machine_id) REFERENCES machine(id),
    FOREIGN KEY (user_phone) REFERENCES user(phone)
);

ALTER TABLE machine ADD FOREIGN KEY (cycle_id) REFERENCES cycle(id);

INSERT INTO machine (name) VALUES ('Lavadora');
INSERT INTO user (phone, name) VALUES ('01010101010', 'Miguel Mendoza');