interface HighlightTextProps {
  text: string;
  query: string;
  matchStartIndex?: number;
  activeMatchIndex?: number;
}

export function HighlightText({ text, query, matchStartIndex, activeMatchIndex }: HighlightTextProps) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  let currentIndex = matchStartIndex ?? 0;

  return (
    <>
      {parts.map((part, i) => {
        if (regex.test(part)) {
          const isMatchActive = currentIndex === activeMatchIndex;
          currentIndex++;
          
          return (
            <mark 
              key={i} 
              id={isMatchActive ? 'active-search-match' : undefined}
              style={{ 
                backgroundColor: isMatchActive ? '#f97316' : 'var(--accent-primary)', 
                color: 'white', 
                borderRadius: 2, 
                padding: '0 2px' 
              }}
            >
              {part}
            </mark>
          );
        } else {
          return <span key={i}>{part}</span>;
        }
      })}
    </>
  );
}
