ALTER TABLE workout_template
    ADD COLUMN schedule_type VARCHAR(50),
    ADD COLUMN schedule_interval INT;

CREATE TABLE workout_template_schedule_weekday
(
    workout_template_id UUID        NOT NULL,
    weekday             VARCHAR(50) NOT NULL,
    PRIMARY KEY (workout_template_id, weekday),
    CONSTRAINT fk_wtsw_template
        FOREIGN KEY (workout_template_id) REFERENCES workout_template (id)
            ON DELETE CASCADE
);
