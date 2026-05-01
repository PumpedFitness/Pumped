CREATE TABLE exercise
(
    id                UUID         NOT NULL,
    name              VARCHAR(255) NOT NULL,
    description       LONGTEXT,
    exercise_category VARCHAR(50)  NOT NULL,
    created_at        BIGINT       NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE exercise_muscle_group
(
    exercise_id  UUID        NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    PRIMARY KEY (exercise_id, muscle_group),
    CONSTRAINT fk_emg_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercise (id)
            ON DELETE CASCADE
);

CREATE TABLE exercise_equipment
(
    exercise_id UUID        NOT NULL,
    equipment   VARCHAR(50) NOT NULL,
    PRIMARY KEY (exercise_id, equipment),
    CONSTRAINT fk_ee_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercise (id)
            ON DELETE CASCADE
);

CREATE TABLE workout_template
(
    id          UUID         NOT NULL,
    user_id     UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description LONGTEXT,
    created_at  BIGINT       NOT NULL,
    updated_at  BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_wt_user
        FOREIGN KEY (user_id) REFERENCES user (id)
            ON DELETE CASCADE
);

CREATE TABLE workout_template_exercise
(
    id                  UUID        NOT NULL,
    workout_template_id UUID        NOT NULL,
    exercise_id         UUID        NOT NULL,
    order_index         INT         NOT NULL,
    sets                INT         NOT NULL,
    target_reps         VARCHAR(50) NOT NULL,
    target_weight DOUBLE,
    rest_seconds        INT,
    notes               LONGTEXT,
    created_at          BIGINT      NOT NULL,
    updated_at          BIGINT      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_wte_template
        FOREIGN KEY (workout_template_id) REFERENCES workout_template (id)
            ON DELETE CASCADE
);

CREATE TABLE workout_session
(
    id                  UUID         NOT NULL,
    user_id             UUID         NOT NULL,
    workout_template_id UUID,
    name                VARCHAR(255) NOT NULL,
    started_at          BIGINT       NOT NULL,
    ended_at            BIGINT,
    notes               LONGTEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_ws_user
        FOREIGN KEY (user_id) REFERENCES user (id)
            ON DELETE CASCADE,
    CONSTRAINT fk_ws_template
        FOREIGN KEY (workout_template_id) REFERENCES workout_template (id)
            ON DELETE SET NULL
);

CREATE TABLE workout_session_set
(
    id                 UUID   NOT NULL,
    workout_session_id UUID   NOT NULL,
    exercise_id        UUID   NOT NULL,
    set_index          INT    NOT NULL,
    reps               INT    NOT NULL,
    weight DOUBLE,
    rest_seconds       INT,
    duration_seconds   INT,
    notes              LONGTEXT,
    performed_at       BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_wss_session
        FOREIGN KEY (workout_session_id) REFERENCES workout_session (id)
            ON DELETE CASCADE
);

