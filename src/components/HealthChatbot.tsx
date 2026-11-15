import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  SearchCheck,
  Send,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface GroundedSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: GroundedSource[];
  searchQueries?: string[];
  fallbackTriggered?: boolean;
  isError?: boolean;
}

const STARTER_QUESTIONS = [
  'What are warning signs of dehydration?',
  'When should a fever be evaluated by a doctor?',
  'How do I tell heat exhaustion from heat stroke?',
  'What is a normal adult resting blood pressure?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text:
    'Ask me any general health question. Before answering, I check verified medical sources via Google Search. If an answer cannot be verified safely, I will reply: "Ask from a medical specialist."',
};

function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const isBullet = /^[-*•]\s+/.test(trimmed);
        const cleanLine = isBullet ? trimmed.replace(/^[-*•]\s+/, '') : trimmed;
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

        const content = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={pIdx} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              <span>{content}</span>
            </div>
          );
        }

        return <p key={idx}>{content}</p>;
      })}
    </div>
  );
}

interface HealthChatbotProps {
  mode: 'page' | 'drawer';
  onClose?: () => void;
}

export function HealthChatbot({ mode, onClose }: HealthChatbotProps) {
  const { language, patientMode } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome' && !m.isError)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language,
          patientMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to verify an answer right now.');
      }

      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Ask from a medical specialist.',
        sources: Array.isArray(data.sources) ? data.sources : [],
        searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
        fallbackTriggered: Boolean(data.fallbackTriggered),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text:
            err instanceof Error
              ? err.message
              : 'Unable to reach the healthcare assistant. Ask from a medical specialist.',
          isError: true,
          fallbackTriggered: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  const containerHeight = mode === 'drawer' ? 'h-[520px] max-h-[78vh]' : 'h-[600px]';

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg ${containerHeight}`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-sky-800 dark:bg-slate-950 text-white border-b border-sky-900 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600/40 border border-sky-400/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-sky-200" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">Healthcare AI Assistant</p>
            <p className="text-[11px] text-sky-100/90 flex items-center gap-1 truncate">
              <SearchCheck className="w-3 h-3 text-teal-300 shrink-0" aria-hidden="true" />
              <span>Google-Verified Sources · Non-Diagnostic</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            title="Start new conversation"
            aria-label="Reset conversation"
            className="p-1.5 rounded-md text-sky-100 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {mode === 'drawer' ? (
            <Link
              to="/health-assistant"
              onClick={onClose}
              title="Open full-page assistant"
              aria-label="Open full-page assistant"
              className="p-1.5 rounded-md text-sky-100 hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/find-healthcare"
              title="Find nearby clinics"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Find Care</span>
            </Link>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close healthcare chatbot"
              className="p-1.5 rounded-md text-sky-100 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2 shrink-0">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
          Answers are cross-checked via Google Search. Emergencies: call{' '}
          <Link to="/emergency" onClick={onClose} className="font-bold text-red-700 dark:text-red-400 underline">
            112
          </Link>
          .
        </span>
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950/60"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-sm ${
                  isUser
                    ? 'bg-sky-700 dark:bg-sky-600 text-white'
                    : msg.isError
                    ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                    : msg.fallbackTriggered
                    ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5 opacity-80">
                    {msg.fallbackTriggered ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                    )}
                    <span>
                      {msg.fallbackTriggered
                        ? 'Medical Specialist Guidance'
                        : 'Verified Health Info'}
                    </span>
                  </div>
                )}

                {renderFormattedText(msg.text)}

                {/* Verified Medical Sources */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-semibold text-teal-800 dark:text-teal-400 flex items-center gap-1">
                      <SearchCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Verified Medical Sources:
                    </p>
                    <ul className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <li key={i}>
                          <a
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-sky-700 dark:text-sky-400 hover:underline break-all"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span className="line-clamp-1">{src.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action links when fallback or specialist referral appears */}
                {!isUser && msg.fallbackTriggered && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800/60 flex flex-wrap gap-2">
                    <Link
                      to="/find-healthcare"
                      onClick={onClose}
                      className="px-2.5 py-1.5 rounded-md bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-colors"
                    >
                      Find Nearby Specialists
                    </Link>
                    <Link
                      to="/symptom-checker"
                      onClick={onClose}
                      className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors"
                    >
                      Run Symptom Checker
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <SearchCheck className="w-4 h-4 text-sky-700 dark:text-sky-400 animate-spin" />
              <span>Checking verified medical sources via Google…</span>
            </div>
          </div>
        )}

        {/* Starter questions shown when conversation just began */}
        {messages.length === 1 && !loading && (
          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Common Health Questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-600 dark:hover:border-sky-500 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a health question (e.g., fever care, symptoms)…"
          aria-label="Ask a health question"
          maxLength={1200}
          disabled={loading}
          className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send health question"
          className="px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
