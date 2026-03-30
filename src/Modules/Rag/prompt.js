export const DB_SCHEMA = `
CREATE TABLE classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50),
    class_teacher VARCHAR(100)
);

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    student_name VARCHAR(100),
    age INT,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES classes(class_id)
);

CREATE TABLE marks (
    mark_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    subject VARCHAR(50),
    marks INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
`;

export const sqlGeneratorPrompt = `You are a SQL expert. Given the following MySQL database schema and a user's natural language question, generate a valid MySQL SELECT query that answers the question.

SCHEMA:
${DB_SCHEMA}

RULES:
1. Only generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or any data-modifying statement.
2. Return ONLY the raw SQL query, nothing else. No explanations, no markdown, no code fences.
3. Use proper JOINs when the question involves data from multiple tables.
4. If the question cannot be answered with the given schema, return exactly: CANNOT_ANSWER
5. Always use table aliases for clarity when joining.
`;

export const answerGeneratorPrompt = `You are a helpful assistant that answers questions about a school database. You will be given:
1. The user's original question
2. The SQL query that was executed
3. The result rows from the database

Based on this information, provide a clear, concise, natural language answer to the user's question. 
- Be friendly and direct.
- If the result is empty, say that no matching data was found.
- Do not show raw SQL or JSON in your answer.
- Format lists nicely if there are multiple results.
`;
