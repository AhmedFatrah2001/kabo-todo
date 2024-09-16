CREATE TRIGGER after_task_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF NEW.is_validated = 1 AND OLD.is_validated = 0 THEN
        -- Update tasks_validated
        UPDATE user_performance
        SET tasks_validated = tasks_validated + 1
        WHERE user_id = NEW.responsible_user_id;

        -- Calculate early or late task
        IF NEW.validated_at <= NEW.end_date THEN
            UPDATE user_performance
            SET early_tasks = early_tasks + 1,
                early_hours = early_hours + TIMESTAMPDIFF(HOUR, NEW.validated_at, NEW.end_date)
            WHERE user_id = NEW.responsible_user_id;
        ELSE
            UPDATE user_performance
            SET late_tasks = late_tasks + 1,
                late_hours = late_hours + TIMESTAMPDIFF(HOUR, NEW.end_date, NEW.validated_at)
            WHERE user_id = NEW.responsible_user_id;
        END IF;

        -- Update score
        UPDATE user_performance
        SET score = score + (NEW.importance_level / 10)  -- Add importance factor
            + CASE
                WHEN NEW.validated_at <= NEW.end_date THEN 5  -- Bonus for early or on-time completion
                ELSE -3  -- Penalty for late completion
              END
        WHERE user_id = NEW.responsible_user_id;
    END IF;
END;


CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,  -- The user who gets the notification
    task_id INT,  -- Optional, for task-related notifications
    notification_text VARCHAR(255),  -- The notification message
    is_read BOOLEAN DEFAULT 0,  -- Indicates whether the notification has been read
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the notification was created
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Cascade on user deletion
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE  -- Cascade on task deletion
);

CREATE TRIGGER notify_new_task_assignment
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    DECLARE taskMessage VARCHAR(255);
    SET taskMessage = CONCAT('You have been assigned a new task: ', NEW.task);

    INSERT INTO notifications (user_id, task_id, notification_text)
    VALUES (NEW.responsible_user_id, NEW.id, taskMessage);
END;

DELIMITER $$

CREATE TRIGGER notify_task_validated
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    -- Only trigger when the task is marked as validated (is_validated changes from 0 to 1)
    IF NEW.is_validated = 1 AND OLD.is_validated = 0 THEN
        -- Insert the notification for the user responsible for the task
        INSERT INTO notifications (user_id, task_id, notification_text)
        VALUES (NEW.responsible_user_id, NEW.id, CONCAT('Your task "', NEW.task, '" has been validated.'));
    END IF;
END$$

DELIMITER ;


CREATE TRIGGER notify_task_commented
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    DECLARE commentMessage VARCHAR(255);
    DECLARE taskOwner INT;

    -- Get the responsible user for the task being commented on
    SELECT responsible_user_id INTO taskOwner
    FROM tasks WHERE id = NEW.task_id;

    -- Create the notification for the task owner
    SET commentMessage = CONCAT('Your task "', (SELECT task FROM tasks WHERE id = NEW.task_id), '" has a new comment.');

    INSERT INTO notifications (user_id, task_id, notification_text)
    VALUES (taskOwner, NEW.task_id, commentMessage);
END;
