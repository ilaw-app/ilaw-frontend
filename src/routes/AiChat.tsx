import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoBookOutline, IoChatbubbleOutline, IoCallOutline } from 'react-icons/io5';
import { aiApi } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import type { AiSuggestion } from '../api/types';
import './aiChat.css';

type Message = {
  id: number;
  from: 'ai' | 'user';
  time: string;
  text?: string;
  summary?: string;
  suggestions?: AiSuggestion[];
};

function nowStr() {
  const d = new Date();
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
  return `${h < 12 ? '오전' : '오후'} ${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m}`;
}

function toTimeStr(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
  return `${h < 12 ? '오전' : '오후'} ${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m}`;
}

function SendIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <g clipPath="url(#clip_aic_send)">
        <path d="M12.1067 18.062C12.1383 18.1408 12.1933 18.2081 12.2643 18.2548C12.3353 18.3015 12.4189 18.3254 12.5038 18.3232C12.5888 18.321 12.671 18.2929 12.7395 18.2426C12.808 18.1924 12.8595 18.1223 12.8871 18.042L18.3007 2.2175C18.3274 2.1437 18.3324 2.06384 18.3154 1.98726C18.2983 1.91068 18.2598 1.84054 18.2043 1.78506C18.1488 1.72958 18.0787 1.69104 18.0021 1.67396C17.9255 1.65689 17.8456 1.66197 17.7718 1.68863L1.94736 7.10226C1.86699 7.12983 1.79697 7.18132 1.7467 7.24982C1.69644 7.31833 1.66833 7.40057 1.66615 7.48551C1.66398 7.57046 1.68784 7.65403 1.73453 7.72502C1.78122 7.79601 1.84852 7.85102 1.92737 7.88266L8.53201 10.5312C8.7408 10.6148 8.93049 10.7398 9.08967 10.8987C9.24884 11.0575 9.37419 11.247 9.45815 11.4557L12.1067 18.062Z" stroke="white" strokeWidth="1.66573" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.2014 1.78809L9.08984 10.8988" stroke="white" strokeWidth="1.66573" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip_aic_send"><rect width="19.9888" height="19.9888" fill="white" /></clipPath></defs>
    </svg>
  );
}

const SG_META: Record<AiSuggestion['type'], { tag: string; color: string }> = {
  manual: { tag: '매뉴얼', color: '#9CAF88' },
  qa: { tag: 'Q&A', color: '#9CAF88' },
  agency: { tag: '기관', color: '#9CAF88' },
  hotline: { tag: '긴급전화', color: '#C0492F' },
};

function SuggestionCard({ sg, onPress }: { sg: AiSuggestion; onPress: () => void }) {
  const meta = SG_META[sg.type];
  const phone = sg.type === 'agency' ? sg.contact : sg.type === 'hotline' ? sg.phone : null;
  const Icon =
    sg.type === 'manual' ? IoBookOutline : sg.type === 'qa' ? IoChatbubbleOutline : IoCallOutline;
  return (
    <button type="button" className="aic-sg-card" onClick={onPress}>
      <div className="aic-sg-type-row">
        <Icon size={12} color={meta.color} />
        <span className="aic-sg-type-text" style={{ color: meta.color }}>{meta.tag}</span>
      </div>
      <span className="aic-sg-title">{sg.label}</span>
      {phone && <span className="aic-sg-phone">{phone}</span>}
    </button>
  );
}

const GREETING: Message = {
  id: 0, from: 'ai', time: nowStr(),
  text: '안녕하세요! \n\n저는 여러분의 이야기를 듣고 상황에 맞는 정보를 찾아드리는 아이로 AI 챗봇입니다.\n\n지금 겪고 있는 일이나 궁금한 점을 편하게 물어보세요.\n자세히 알려주시면 상황에 맞는 정보를 더 빠르게 찾아드릴 수 있어요.\n\n<예시>\n"학교에서 친구에게 협박을 받고 있어요. 어떻게 해야 하나요?"\n"집에서 힘든 일이 있는데 도움받을 수 있는 곳이 궁금해요."\n\n⚠️ 심각하거나 긴급한 상황이라면 먼저 112에 신고해주세요.\n💡 또한 정확한 답변이 필요하다면 Q&A 게시판에서 변호사님께 질문할 수 있어요.',
};

export default function AiChat() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = (smooth = true) =>
    setTimeout(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }, 100);

  useEffect(() => {
    if (!isAuthed) return;
    aiApi.history()
      .then((history) => {
        if (!history.length) return;
        const historyMessages: Message[] = history.flatMap((h, i) => [
          { id: -(i * 2 + 1), from: 'user' as const, time: toTimeStr(h.createdAt), text: h.question },
          { id: -(i * 2 + 2), from: 'ai' as const, time: toTimeStr(h.createdAt), text: h.legalAdvice, suggestions: h.suggestions },
        ]);
        // 인사말은 맨 아래(열자마자 보임), 히스토리는 위로 스크롤 시 표시
        setMessages([...historyMessages, GREETING]);
        scrollToEnd(false);
      })
      .catch(() => {});
  }, [isAuthed]);

  const goSuggestion = (sg: AiSuggestion) => {
    if (sg.type === 'manual') return navigate(`/manual-detail?articleId=${sg.id}`);
    if (sg.type === 'qa') return navigate(`/qna/${sg.id}`);
    // agency / hotline → 전화 걸기
    const phone = sg.type === 'agency' ? sg.contact : sg.phone;
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  const handleNewChat = () => {
    setMessages(prev => [...prev, { ...GREETING, id: Date.now(), time: nowStr() }]);
    setInput('');
    setChatEnded(false);
    scrollToEnd();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || chatEnded) return;
    if (text.length > 2000) {
      window.alert('메시지는 2,000자까지 입력할 수 있어요.');
      return;
    }

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: nowStr() }]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    try {
      const data = await aiApi.chat(text);
      const now = nowStr();
      const advice = (data.legalAdvice ?? '').trim();
      const newMsgs: Message[] = [];
      if (advice) newMsgs.push({ id: Date.now() + 2, from: 'ai', time: now, text: advice, suggestions: data.suggestions });
      if (newMsgs.length === 0) newMsgs.push({ id: Date.now() + 1, from: 'ai', time: now, text: '죄송합니다, 답변을 불러오는 중 오류가 발생했습니다.' });
      setMessages(prev => [...prev, ...newMsgs]);

      if (data.chatEnded) setChatEnded(true);
    } catch (e: any) {
      const text =
        e?.status === 429
          ? '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
          : e?.status === 401
          ? '로그인 후 이용할 수 있어요.'
          : e?.status === 400
          ? '메시지는 2,000자까지 입력할 수 있어요.'
          : '죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', time: nowStr(), text }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  return (
    <div className="screen ai-chat">
      {/* Header */}
      <div className="aic-header">
        <div className="aic-header-left">
          <button className="aic-back-btn" onClick={() => navigate(-1)} aria-label="뒤로">
            <IoChevronBack size={22} color="#586144" />
          </button>
          <div>
            <div className="aic-header-title">상황 진단하기</div>
            <div className="aic-header-sub">AI 법률 진단 챗봇</div>
          </div>
        </div>
        {chatEnded && (
          <button className="aic-new-chat-btn" onClick={handleNewChat}>다른질문하기</button>
        )}
      </div>

      {/* Messages */}
      <div className="screen-scroll aic-scroll" ref={scrollRef}>
        {messages.map(msg =>
          msg.from === 'ai' ? (
            <div key={msg.id} className="aic-ai-row">
              <div className="aic-ai-meta">
                <div className="aic-ai-avatar">
                  <img className="aic-ai-avatar-img" src="/assets/chatbot_profile.png" alt="아이로" />
                </div>
                <span className="aic-ai-name">아이로</span>
              </div>

              {msg.summary ? (
                <div className="aic-ai-boxes">
                  <div className="aic-ai-bubble">
                    <div className="aic-summary-header">상황 요약</div>
                    <div className="aic-ai-bubble-text">{msg.summary}</div>
                  </div>
                  {(msg.suggestions ?? []).length > 0 && (
                    <div className="aic-sg-box">
                      <div className="aic-sg-box-header">관련 콘텐츠를 클릭하여 도움 받아보세요!</div>
                      {msg.suggestions!.map((sg, i) => (
                        <SuggestionCard key={i} sg={sg} onPress={() => goSuggestion(sg)} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aic-ai-boxes">
                  <div className="aic-ai-bubble">
                    <div className="aic-ai-bubble-text">{msg.text}</div>
                  </div>
                  {(msg.suggestions ?? []).length > 0 && (
                    <div className="aic-sg-box">
                      <div className="aic-sg-box-header">관련 콘텐츠를 클릭하여 도움 받아보세요!</div>
                      {msg.suggestions!.map((sg, i) => (
                        <SuggestionCard key={i} sg={sg} onPress={() => goSuggestion(sg)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="aic-msg-time">{msg.time}</div>
            </div>
          ) : (
            <div key={msg.id} className="aic-user-col">
              <div className="aic-user-bubble">
                <div className="aic-user-bubble-text">{msg.text}</div>
              </div>
              <div className="aic-msg-time">{msg.time}</div>
            </div>
          )
        )}
        {loading && (
          <div className="aic-ai-row">
            <div className="aic-ai-meta">
              <div className="aic-ai-avatar">
                <img className="aic-ai-avatar-img" src="/assets/chatbot_profile.png" alt="아이로" />
              </div>
            </div>
            <div className="aic-ai-bubble">
              <div className="aic-loading-dots">•  •  •</div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="aic-disclaimer-bar">
        <div className="aic-disclaimer">AI 답변은 참고용입니다. 정확한 법률 판단은 반드시 변호사에게 문의하세요.</div>
      </div>

      {/* Input */}
      <div className="aic-input-bar">
        {chatEnded ? (
          <div className="aic-chat-ended-bar">
            <div className="aic-chat-ended-text">새 문의는 다른질문하기를 누르세요</div>
          </div>
        ) : (
          <div className="aic-input-row">
            <textarea
              className="aic-text-input"
              placeholder="상황을 입력하세요"
              maxLength={2000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              className={`aic-send-btn${input.trim() && !loading ? ' aic-send-btn-active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              <SendIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
