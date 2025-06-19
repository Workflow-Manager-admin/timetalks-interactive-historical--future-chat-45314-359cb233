import React, { useEffect, useState, useRef } from "react";
import "./App.css";

/**
 * Main Container for TimeTalks: Interactive Historical & Future Chat.
 * Implements Character Selection, Daily Time Visitors, Scripted Responses,
 * Badges and Rewards, and Voting System with a modern, clean layout.
 */

// Demo data for available chat characters
const CHARACTERS = [
  {
    id: "cleopatra",
    name: "Cleopatra VII",
    era: "Ancient Egypt",
    avatar: "🦅",
    color: "#F5A623",
    intro: "I am Cleopatra, Queen of the Nile... What mysteries do you seek?",
  },
  {
    id: "tesla",
    name: "Nikola Tesla",
    era: "19th Century",
    avatar: "⚡",
    color: "#4A90E2",
    intro: "Hello, I'm Tesla. Shall we spark a conversation about progress?",
  },
  {
    id: "futurebot",
    name: "Aurora (Future AI, 2124)",
    era: "Future",
    avatar: "🤖",
    color: "#50E3C2",
    intro: "Greetings! Aurora here from 2124, blending knowledge and possibility.",
  },
  {
    id: "genghis",
    name: "Genghis Khan",
    era: "Medieval Steppes",
    avatar: "🐎",
    color: "#F5A623",
    intro: "I ride from the vast Mongol empire. What would you learn from conquerors?",
  },
  {
    id: "ada",
    name: "Ada Lovelace",
    era: "Victorian",
    avatar: "💻",
    color: "#4A90E2",
    intro: "Mathematics, logic, and poetry—how may I assist your inquiry?",
  },
];

// Scripted responses per character
const SCRIPTED_RESPONSES = {
  cleopatra: [
    "Ah, the Nile flows eternally, just as questions do. Tell me more.",
    "Power and wisdom often come at a price. What do you wish to know of rulers?",
    "What is your favorite era of history, young traveller?",
  ],
  tesla: [
    "Let us discuss inventions! Do you enjoy science?",
    "If I had today's technology, I would rewrite the future.",
    "Alternative energy interests me—what powers your mind?",
  ],
  futurebot: [
    "In the year 2124, society is... different. What do you hope to see?",
    "Artificial intelligence for everyone! What's your favorite tech?",
    "Across time, one truth prevails: curiosity drives progress.",
  ],
  genghis: [
    "Strategy and strength shaped my time. What challenges do you face?",
    "A single arrow is easily broken, not ten in a bundle.",
    "What is victory to you?",
  ],
  ada: [
    "Programming the future was but a dream—now, it's life.",
    "Tell me, do numbers fascinate you as much as poetry?",
    "New ideas are the seeds of progress—what is your vision?",
  ],
};

// Demo badges (will unlock as user chats)
const BADGES = [
  { id: "ancient", label: "Ancient Era Visitor", icon: "🏺", condition: (sessions) => sessions.cleopatra },
  { id: "medieval", label: "Medieval Messenger", icon: "⚔️", condition: (sessions) => sessions.genghis },
  { id: "science", label: "Science Seeker", icon: "🔬", condition: (sessions) => sessions.tesla || sessions.ada },
  { id: "futurist", label: "Futurist", icon: "🌌", condition: (sessions) => sessions.futurebot },
  { id: "polyglot", label: "Time Polyglot", icon: "🕰️", condition: (sessions) => Object.values(sessions).filter(Boolean).length >= 3 },
];

// Voting system for chats
const VOTES = ["Insightful", "Funny", "Historical", "Unexpected"];

// Generate a daily visitor (picks a random non-current character)
function getDailyVisitor(selectedId) {
  const pool = CHARACTERS.filter((c) => c.id !== selectedId);
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

// PUBLIC_INTERFACE
function App() {
  // State: character, chat history, badges, sessions, voting
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [chat, setChat] = useState([
    {
      from: CHARACTERS[0].name,
      avatar: CHARACTERS[0].avatar,
      text: CHARACTERS[0].intro,
      time: new Date(),
      system: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState({}); // Tracks spoken-with per character for badges
  const [dailyVisitor, setDailyVisitor] = useState(null);
  const [visitorActive, setVisitorActive] = useState(false);
  const [vote, setVote] = useState(null);

  const chatEndRef = useRef(null);

  // Scroll chat to bottom when updated
  useEffect(() => {
    chatEndRef.current && chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Set daily visitor on character change/mount (simulate each visit)
  useEffect(() => {
    setDailyVisitor(getDailyVisitor(selectedChar.id));
    setVisitorActive(true);
  }, [selectedChar]);

  // First message from daily visitor (after "travelling")
  useEffect(() => {
    if (dailyVisitor && visitorActive) {
      setTimeout(() => {
        setChat((oldChat) => [
          ...oldChat,
          {
            from: dailyVisitor.name,
            avatar: dailyVisitor.avatar,
            text: dailyVisitor.intro,
            time: new Date(),
            system: false,
          },
        ]);
        setVisitorActive(false);
        setSessions((s) => ({ ...s, [dailyVisitor.id]: true }));
      }, 1200);
    }
    // eslint-disable-next-line
  }, [dailyVisitor, visitorActive]);

  // Character switching resets chat
  const handleCharacterSelect = (char) => {
    setSelectedChar(char);
    setChat([
      {
        from: char.name,
        avatar: char.avatar,
        text: char.intro,
        time: new Date(),
        system: false,
      },
    ]);
    setVote(null);
    setVisitorActive(true);
    setSessions((s) => ({ ...s, [char.id]: true }));
  };

  // Handle sending user message
  const handleSend = (e) => {
    e && e.preventDefault();
    if (!input.trim()) return;
    const userMsg = {
      from: "You",
      avatar: "🧑",
      text: input.trim(),
      time: new Date(),
      system: false,
    };
    setChat((oldChat) => [...oldChat, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const responses = SCRIPTED_RESPONSES[selectedChar.id];
      const idx = Math.floor(Math.random() * responses.length);
      setChat((oldChat) => [
        ...oldChat,
        {
          from: selectedChar.name,
          avatar: selectedChar.avatar,
          text: responses[idx],
          time: new Date(),
          system: false,
        },
      ]);
    }, 800);
  };

  // User votes on the session (simple per-run)
  const handleVote = (v) => setVote(v);

  // List earned badges
  const earnedBadges = BADGES.filter((b) => b.condition(sessions));

  // Theme CSS variables (overrides base)
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--primary', '#4A90E2');
    r.style.setProperty('--secondary', '#50E3C2');
    r.style.setProperty('--accent', '#F5A623');
    r.style.setProperty('--chat-bg', '#F7FAFE');
    r.style.setProperty('--chat-bubble-user', '#50E3C2');
    r.style.setProperty('--chat-bubble-bot', '#4A90E2');
    r.style.setProperty('--badge-bg', '#F5A62322');
    r.style.setProperty('--border-color', '#E6E6E6');
    r.style.setProperty('--sidebar-bg', '#F5F7FB');
    r.style.setProperty('--sidebar-accent', '#E8F5FB');
    r.style.setProperty('--sidebar-active', '#E2F2EE');
    r.style.setProperty('--app-bg', '#FAFBFD');
  }, []);

  return (
    <div className="main-app" style={{ minHeight: "100vh", background: "var(--app-bg)" }}>
      {/* App bar */}
      <nav
        className="navbar"
        style={{
          background: "var(--primary)",
          color: "#fff",
          borderBottom: "2px solid var(--secondary)",
          zIndex: 22,
        }}
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div className="logo" style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
              <span
                className="logo-symbol"
                style={{
                  color: "var(--accent)",
                  fontSize: "1.3em",
                  marginRight: 4
                }}
              >
                ⏳
              </span>{" "}
              TimeTalks
            </div>
            <div>
              {earnedBadges.map((b) => (
                <span key={b.id} className="badge-pill" title={b.label} style={{
                  background: "var(--badge-bg)",
                  color: "var(--accent)",
                  borderRadius: 18,
                  margin: "0 5px",
                  padding: "3px 10px",
                  fontWeight: 500,
                  fontSize: "1rem"
                }}>
                  {b.icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Layout: Sidebar left, main chat middle, badges/votes right (optional) */}
      <div className="main-content"
        style={{
          display: "flex",
          minHeight: "100vh",
          marginTop: 68,
          background: "var(--app-bg)",
        }}>
        {/* Character Selection Sidebar */}
        <aside
          style={{
            background: "var(--sidebar-bg)",
            minWidth: 220,
            padding: "28px 12px 0 0",
            borderRight: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{
            fontWeight: 600,
            marginBottom: 14,
            marginLeft: 18,
            color: "var(--primary)",
            fontSize: "1.1em",
            letterSpacing: ".02em"
          }}>
            Characters
          </div>
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className={`sidebar-char${selectedChar.id === char.id ? " selected" : ""}`}
              style={{
                background: selectedChar.id === char.id ? "var(--sidebar-active)" : "transparent",
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "8px 14px",
                marginLeft: 7,
                marginRight: 9,
                fontWeight: 500,
                border: selectedChar.id === char.id ? `2px solid var(--secondary)` : "2px solid transparent"
              }}
              onClick={() => handleCharacterSelect(char)}
            >
              <span style={{
                fontSize: "1.5em",
                marginRight: 10,
                filter: selectedChar.id === char.id ? "drop-shadow(0 0 2px var(--accent))" : "none"
              }}>{char.avatar}</span>
              <div>
                {char.name}
                <div style={{ fontSize: "0.83em", opacity: 0.65 }}>{char.era}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* Chat interface */}
        <main
          className="chat-area"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: "var(--chat-bg)",
            padding: "28px 0 0 0",
            position: "relative",
          }}
        >
          {/* Daily visitor notification (when active) */}
          {visitorActive && dailyVisitor && (
            <div className="visitor-popup" style={{
              background: "var(--secondary)",
              color: "#fff",
              fontWeight: 500,
              borderRadius: 10,
              maxWidth: 370,
              margin: "9px auto",
              textAlign: "center",
              fontSize: "1.13em",
              padding: "12px 18px",
              boxShadow: "0 2px 8px #50e3c259"
            }}>
              ⏰ Daily Visitor: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{dailyVisitor.name}</span> is dropping by...
            </div>
          )}

          {/* Chat messages */}
          <div
            className="chat-messages"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 0 3px 0",
              marginBottom: 4,
              display: "flex",
              flexDirection: "column",
              gap: 11,
            }}
          >
            {chat.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: msg.from === "You" ? "flex-end" : "flex-start",
                  paddingRight: msg.from === "You" ? 25 : 0,
                  paddingLeft: msg.from !== "You" ? 25 : 0,
                  transition: "background .18s"
                }}
              >
                {/* Avatar */}
                {msg.from !== "You" && (
                  <span
                    style={{
                      fontSize: "1.48em",
                      marginRight: 10,
                      marginLeft: 2,
                      filter: msg.from !== "You" ? "drop-shadow(0 1px 2px #0001)" : ""
                    }}
                  >{msg.avatar}</span>
                )}
                {/* Bubble */}
                <div
                  className="chat-bubble"
                  style={{
                    background: msg.from === "You" ? "var(--chat-bubble-user)" : "var(--chat-bubble-bot)",
                    color: "#fff",
                    padding: "10px 16px",
                    maxWidth: "74%",
                    borderRadius: "14px",
                    borderBottomRightRadius: msg.from === "You" ? "4px" : "14px",
                    borderBottomLeftRadius: msg.from !== "You" ? "4px" : "14px",
                    marginLeft: msg.from === "You" ? 0 : 3,
                    marginRight: msg.from === "You" ? 3 : 0,
                    fontSize: "1.05em",
                    boxShadow: "0 2px 8px #0001"
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: "0.72em",
                      opacity: 0.5,
                      marginTop: 3,
                      textAlign: "right",
                    }}
                  >
                    {msg.from}
                  </div>
                </div>
                {/* User avatar */}
                {msg.from === "You" && (
                  <span
                    style={{
                      fontSize: "1.48em",
                      marginLeft: 10,
                    }}
                  >🧑</span>
                )}
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat input */}
          <form
            className="chat-input"
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid var(--border-color)",
              background: "#fff",
              padding: "0.5em 1.8em",
              position: "sticky",
              bottom: 0,
              zIndex: 12,
              gap: 8,
              boxShadow: "0 -2px 8px #0001"
            }}
            onSubmit={handleSend}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Say something to ${selectedChar.name}...`}
              style={{
                flex: 1,
                fontSize: "1.1em",
                border: "none",
                background: "transparent",
                outline: "none",
                padding: "11px 7px",
                marginRight: 8
              }}
              autoFocus
              autoComplete="off"
            />
            <button
              className="btn"
              style={{
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                letterSpacing: ".01em",
                borderRadius: 8
              }}
              type="submit"
              tabIndex={0}
            >
              Send
            </button>
          </form>
        </main>

        {/* Side panel: badges + voting */}
        <aside
          style={{
            minWidth: 200,
            maxWidth: 240,
            background: "var(--sidebar-bg)",
            padding: "28px 0 0 16px",
            borderLeft: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{
            fontWeight: 600,
            marginBottom: 7,
            color: "var(--accent)",
            fontSize: "1.1em"
          }}>
            Your Badges
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 38,
          }}>
            {earnedBadges.length === 0 && (
              <span style={{ color: "#aaa", fontSize: "0.98em" }}>No badges yet</span>
            )}
            {earnedBadges.map((b) => (
              <div key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 500,
                  color: "var(--accent)",
                  background: "var(--badge-bg)",
                  borderRadius: 9,
                  padding: "5px 12px 3px 9px",
                  gap: 9
                }}>
                <span style={{ fontSize: "1.3em" }}>{b.icon}</span>
                <span style={{
                  fontSize: "1.04em",
                  color: "#AA8D40",
                  letterSpacing: ".01em"
                }}>{b.label}</span>
              </div>
            ))}
          </div>
          <div style={{
            fontWeight: 600,
            color: "var(--primary)",
            fontSize: "1.05em",
            marginBottom: 8,
            marginTop: 14
          }}>
            Conversation Vote
          </div>
          <div>
            {vote ? (
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--secondary)",
                  fontSize: "1.13em",
                  background: "var(--sidebar-accent)",
                  padding: "7px 15px",
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                You rated this: {vote}!
              </span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {VOTES.map((v) => (
                  <button
                    key={v}
                    className="btn"
                    style={{
                      background: "var(--secondary)",
                      color: "#fff",
                      fontWeight: 500,
                      borderRadius: 7,
                      cursor: "pointer",
                      fontSize: "1em"
                    }}
                    onClick={() => handleVote(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      {/* End layout */}
    </div>
  );
}

export default App;
