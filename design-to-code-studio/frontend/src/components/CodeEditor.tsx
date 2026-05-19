interface Props {
  jsx?: string;
  css?: string;
}

export function CodeEditor({ jsx, css }: Props) {
  return (
    <div className="card">
      <h3>Generated Code</h3>
      <div className="code-grid">
        <section>
          <h4>JSX</h4>
          <pre>{jsx || '// JSX will appear here'}</pre>
        </section>
        <section>
          <h4>CSS</h4>
          <pre>{css || '/* CSS will appear here */'}</pre>
        </section>
      </div>
    </div>
  );
}
