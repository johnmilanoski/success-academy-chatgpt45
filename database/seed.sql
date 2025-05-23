-- Add instructor
INSERT INTO instructors (name, email)
VALUES ('John Instructor', 'john@example.com');

-- Add course
INSERT INTO courses (instructor_id, title, description, category, price, visibility, published)
VALUES (1, 'Mastering Web Development', 'A full-stack guide...', 'Programming', 99.99, 'Public', FALSE);

-- Add modules
INSERT INTO modules (course_id, title, position) VALUES
(1, 'Introduction', 1),
(1, 'Frontend Basics', 2),
(1, 'Backend & APIs', 3);

-- Add lessons
INSERT INTO lessons (module_id, title, position) VALUES
(1, 'Welcome to the Course', 1),
(1, 'What You Will Learn', 2),
(2, 'HTML & CSS Overview', 1),
(2, 'JavaScript Fundamentals', 2),
(3, 'Node.js & Express', 1),
(3, 'Connecting to Databases', 2);
