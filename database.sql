CREATE TABLE accounts (
    accountID serial PRIMARY KEY NOT NULL,
    username varchar(32) UNIQUE  NOT NULL,
    hashpw char(60) NOT NULL, --hashed password
    role varchar(10) NOT NULL CHECK
        (role='admin' or role='user' ) DEFAULT 'user',
    email varchar(320) UNIQUE NOT NULL,
    emailcode char(16), --emailed code for user verification
    verified bool NOT NULL, --if email is verified
    banneduntil bigint, --if null user is not banned,
    -- unix timestamp in seconds is stored in BIGINT data type,
    -- to avoid problems. (the year 2038 problem)
    resetpwcode char(16), --code for resetting password via email
    pictureid int --profile picture filename, can be null
);
