export default function ApiDocsPage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <h1>📘 API Documentation</h1>
      <p>This documentation covers the authentication APIs for students and teachers.</p>

      <hr style={{ margin: "1.5rem 0" }} />

      <h2>🔐 Student Login</h2>
      <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "6px" }}>
        <code>
          POST /api/auth/student-login{'\n'}
          Content-Type: application/json{'\n\n'}
          {'{\n  "studentId": "S1234",\n  "password": "yourPassword"\n}'}
        </code>
      </pre>

      <h2>🔐 Teacher Login</h2>
      <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "6px" }}>
        <code>
          POST /api/auth/teacher-login{'\n'}
          Content-Type: application/json{'\n\n'}
          {'{\n  "teacherId": "T5678",\n  "password": "yourPassword"\n}'}
        </code>
      </pre>

      <h2>🔒 Authenticated Access</h2>
      <p>Add this header to any protected route:</p>
      <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "6px" }}>
        <code>Authorization: Bearer &lt;your_jwt_token&gt;</code>
      </pre>

      <hr style={{ margin: "2rem 0" }} />

      <h2>📄 Swagger YAML</h2>
      <p>
        <a
          href="/swagger.yaml"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          🔗 Download swagger.yaml
        </a>
      </p>
      <p>
        Or view it in the{" "}
        <a
          href="https://editor.swagger.io/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Swagger Editor
        </a>
        .
      </p>
    </div>
  );
}