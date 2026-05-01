CREATE TABLE user (
        id UUID NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        description LONGTEXT,
        profile_picture LONGTEXT,
        created_at BIGINT,
        updated BIGINT,
        PRIMARY KEY (id),
        UNIQUE (username)
    )