export default function Suggestions({ text }: { text: string }) {
  return (
    <section className="card p-4">
      <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
      <pre className="whitespace-pre-wrap text-sm">{text}</pre>
    </section>
  );
}
