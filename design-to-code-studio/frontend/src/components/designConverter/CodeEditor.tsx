interface CodeEditorProps {
  jsx?: string;
  css?: string;
}

export function CodeEditor({ jsx, css }: CodeEditorProps) {
  return (
    <section className="panel editor">
      <div>
        <p className="section-label">3. Generated code</p>
        <h3>React JSX + CSS</h3>
      </div>
      <div className="editor__grid">
        <article>
          <h4>JSX</h4>
          <pre>{jsx || '// JSX will appear here'}</pre>
        </article>
        <article>
          <h4>CSS</h4>
          <pre>{css || '/* CSS will appear here */'}</pre>
        </article>
      </div>
    </section>
  );
}
