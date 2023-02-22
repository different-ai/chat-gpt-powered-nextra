import React, { useState } from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const Modal = ({ children, open, onClose }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 5,
          width: '80%',
          maxWidth: 500,
          maxHeight: '80%',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};


const questions = [
  'How do I get started with Supabase?',
  'How do I run Supabase locally?',
  'How do I connect to my database?',
  'How do I run migrations? ',
  'How do I listen to changes in a table?',
  'How do I setup authentication?',
]

interface NiceSearchBarProps {
  value?: string;
  onChange?: (e: any) => void;
  autoFocus?: boolean;
  placeholder?: string;
  onClick?: () => void;
}

const NiceSearchBar = ({value, onChange, autoFocus, placeholder, onClick}: NiceSearchBarProps) => {
  return (
    // a magnifier icon on the left
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="1rem" height="1rem" viewBox="0 0 16 16" className="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z" />
        <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm0 1a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z" />
      </svg>

      <input
        autoFocus={autoFocus || false}
        placeholder={placeholder || "Search..."}
        onClick={onClick}
        type="text"
        value={value}
        onChange={onChange}
        // border around with smooth corners, a magnifier icon on the left,
        // the search bar taking up the rest of the space
        // focused on load
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', outline: 'none' }}
      />
    </div>
  );
}

const SearchModal = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
    setPrompt("");
    setOutput("");
    setLoading(false);
  }

  const qa = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");
    const response = await fetch("/api/qa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log("Edge function returned.");
    setLoading(false);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setOutput((prev) => prev + chunkValue);
    }

    setLoading(false);
  };
  // a nice looking input search bar with cmd k to open
  // on open, show a modal with a form to enter a prompt
  return <div>
    {/* on click, open modal */}
    <NiceSearchBar onClick={() => setOpen(true)} placeholder="Ask a question..." />
    <Modal open={open} onClose={onClose}>
      <form onSubmit={qa}>
        <NiceSearchBar value={prompt} onChange={(e) => setPrompt(e.target.value)} autoFocus />
        {/* <button type="submit">Ask</button> */}
      </form>
      {/* a spinner alongside a "loading" label when loading */}
      {/* the spinner is centered vertically and horizontally in the parent */}
      {loading && 
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Loading...</span>
          <div style={{ width: '1rem', height: '1rem', border: '1px solid #e5e7eb', borderRadius: '50%', borderTopColor: 'black', animation: 'spin 1s linear infinite' }}></div>
        </div>
      }

      <p>{output}</p>

      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingTop: '0.5rem', paddingBottom: '0.25rem' }}>
            <a href="https://embedbase.xyz" className="underline">
              Powered by Embedbase
            </a>
          </div>
        </div>
      </div>
    </Modal>
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
    component: <SearchModal />
  }
}

export default config
