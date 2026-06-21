type OptionResult = { id: string; label: string; count: number };

export function ResultBars({ results, total }: { results: OptionResult[]; total: number }) {
  return (
    <div className="result-list">
      {results.map((result, index) => {
        const percent = total ? Math.round((result.count / total) * 100) : 0;
        return (
          <div className="result" key={result.id}>
            <div className="result-label"><span>{result.label}</span><strong>{percent}%</strong></div>
            <div className="bar-track">
              <div className={`bar-fill ${index === 1 ? "teal" : ""}`} style={{ width: `${percent}%` }} />
            </div>
            <small>{result.count} {result.count === 1 ? "vote" : "votes"}</small>
          </div>
        );
      })}
    </div>
  );
}
