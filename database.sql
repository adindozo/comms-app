CREATE TABLE accounts (
    id serial primary key NOT NULL,
    username varchar(32) NOT NULL,
    hashpassword char(60) NOT NULL,
    role varchar(10) NOT NULL CHECK
        (role='admin' or role='user' ),
    email varchar(320) NOT NULL,
    banned timestamp,
    profilepictureid int references profilepictures (id)


);

CREATE TABLE profilepictures (
    id serial primary key ,
    username varchar(32),
    password char(60)

);

