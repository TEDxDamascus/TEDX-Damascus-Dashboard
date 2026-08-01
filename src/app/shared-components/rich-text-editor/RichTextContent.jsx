export default function RichTextContent({ html, dir = 'ltr', className = '' }) {
  const content = String(html || '').trim();

  if (!content) {
    return <span>—</span>;
  }

  return (
    <div
      className={['blog-article-content rich-text-editor-content', className].filter(Boolean).join(' ')}
      dir={dir}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
