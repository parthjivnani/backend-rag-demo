import mysql from 'mysql2/promise';
import 'dotenv/config';

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'school_rag_demo';

  console.log(`Creating database "${dbName}" if it doesn't exist...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  // Create tables
  console.log('Creating tables...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS classes (
      class_id INT PRIMARY KEY AUTO_INCREMENT,
      class_name VARCHAR(50),
      class_teacher VARCHAR(100)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS students (
      student_id INT PRIMARY KEY AUTO_INCREMENT,
      student_name VARCHAR(100),
      age INT,
      class_id INT,
      FOREIGN KEY (class_id) REFERENCES classes(class_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS marks (
      mark_id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT,
      subject VARCHAR(50),
      marks INT,
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `);

  // Clear existing data (in reverse order due to foreign keys)
  await connection.query('DELETE FROM marks');
  await connection.query('DELETE FROM students');
  await connection.query('DELETE FROM classes');

  // Reset auto-increment
  await connection.query('ALTER TABLE classes AUTO_INCREMENT = 1');
  await connection.query('ALTER TABLE students AUTO_INCREMENT = 1');
  await connection.query('ALTER TABLE marks AUTO_INCREMENT = 1');

  // Insert classes
  console.log('Inserting classes...');
  await connection.query(`
    INSERT INTO classes (class_name, class_teacher) VALUES
    ('Class 8A', 'Mrs. Sharma'),
    ('Class 8B', 'Mr. Verma'),
    ('Class 9A', 'Mrs. Gupta'),
    ('Class 9B', 'Mr. Patel'),
    ('Class 10A', 'Mrs. Iyer')
  `);

  // Insert students
  console.log('Inserting students...');
  await connection.query(`
    INSERT INTO students (student_name, age, class_id) VALUES
    ('Rahul', 14, 1),
    ('Priya', 14, 1),
    ('Amit', 14, 2),
    ('Sneha', 15, 3),
    ('Vikram', 15, 3),
    ('Ananya', 15, 4),
    ('Rohan', 16, 5),
    ('Kavya', 16, 5),
    ('Arjun', 14, 2),
    ('Meera', 15, 3)
  `);

  // Insert marks
  console.log('Inserting marks...');
  await connection.query(`
    INSERT INTO marks (student_id, subject, marks) VALUES
    (1, 'Math', 85),
    (1, 'Science', 78),
    (1, 'English', 92),
    (2, 'Math', 90),
    (2, 'Science', 88),
    (2, 'English', 76),
    (3, 'Math', 72),
    (3, 'Science', 65),
    (3, 'English', 80),
    (4, 'Math', 95),
    (4, 'Science', 92),
    (4, 'English', 88),
    (5, 'Math', 60),
    (5, 'Science', 70),
    (5, 'English', 55),
    (6, 'Math', 82),
    (6, 'Science', 79),
    (6, 'English', 91),
    (7, 'Math', 88),
    (7, 'Science', 94),
    (7, 'English', 85),
    (8, 'Math', 76),
    (8, 'Science', 82),
    (8, 'English', 90),
    (9, 'Math', 68),
    (9, 'Science', 72),
    (9, 'English', 74),
    (10, 'Math', 91),
    (10, 'Science', 96),
    (10, 'English', 87)
  `);

  console.log('Seed completed successfully!');
  console.log('Demo data summary:');
  console.log('  - 5 classes (8A, 8B, 9A, 9B, 10A)');
  console.log('  - 10 students');
  console.log('  - 30 marks (3 subjects per student: Math, Science, English)');

  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
