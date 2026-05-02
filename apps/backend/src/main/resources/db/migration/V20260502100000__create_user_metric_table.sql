CREATE TABLE user_metric
(
    id          UUID   NOT NULL,
    user_id     UUID   NOT NULL,
    weight DOUBLE,
    body_fat DOUBLE,
    height DOUBLE,
    gender      VARCHAR(50),
    birthdate   BIGINT,
    recorded_at BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_user_metric_user
        FOREIGN KEY (user_id) REFERENCES user (id)
            ON DELETE CASCADE
);
