import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const SearchBar = () => {
  const [query, setQuery] = React.useState<string>('');
  const [results, setResults] = React.useState<any[]>([]);
  console.log(results);
  const search = async (query: string) => {
    setQuery(query);
    fetch("/api/embedbase", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then((data) => setResults(
      // similaritties: [{id: data}, {id2: data2}, ...]
      // to {id: data, id2: data2, ...}
      Object.assign({}, ...data.similarities.map((item: any) => ({[item.id]: item})))));
  };
  // this is a search bar
  return <div>
    <input type="text" placeholder="Search..." 
      value={query}
      onChange={(e) => search(e.target.value)} />
    {/* display results way below, very nice ui like algolia */}
    <ul style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      width: '100%',
      backgroundColor: 'white',
      zIndex: 100,
      listStyle: 'none',
      padding: 0,
      margin: 0,
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    }}>
      {Object.values(results).map((result) => (
        <li key={result.id}>
          {/* overflow ellipsis */}
          <a href={result.id}>{result.data?.slice(0, 10)}...</a>
        </li>
      ))}
    </ul>
  </div>
};

const config: DocsThemeConfig = {
  logo: <span>My Project</span>,
  project: {
    link: 'https://github.com/shuding/nextra-docs-template',
  },
  chat: {
    link: 'https://discord.com',
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  footer: {
    text: 'Nextra Docs Template',
  },
  search: {
    component: <SearchBar/>,
  }
}

export default config
