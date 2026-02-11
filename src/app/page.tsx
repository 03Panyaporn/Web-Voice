"use client";

import { useEffect, useRef, useState } from "react";

type ApiResult = {
  transcript?: string;
  answer?: string;
  matches?: Array<any>;
  error?: string;
};

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("พร้อมรับคำสั่ง");
  const [result, setResult] = useState<ApiResult>({});

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("เบราว์เซอร์นี้ไม่รองรับ Web Speech API (แนะนำ Chrome เท่านั้น)");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "th-TH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("กำลังฟัง... พูดคำถามได้เลย");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus("หยุดฟังแล้ว");
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setStatus(`เกิดข้อผิดพลาด: ${e?.error || "unknown"}`);
      setResult({ error: e?.error || "speech error" });
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setStatus("กำลังประมวลผลคำตอบ...");
      setResult({ transcript });

      const resp = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      const data: ApiResult = await resp.json();
      setResult(data);
      setStatus(data.error ? "เกิดข้อผิดพลาด" : "พร้อมรับคำสั่งใหม่");
    };

    recognitionRef.current = rec;
  }, []);

  function start() {
    setResult({});
    try {
      recognitionRef.current?.start();
    } catch {
      // ignore
    }
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return (
    <main 
      className="
        min-h-screen 
        flex items-center justify-center p-4 md:p-8 font-sans
        /* --- 1. พื้นหลังพาสเทล ฟ้า-ม่วง อ่อนๆ --- */
        bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-200
      "
    >
      <div 
        className="
          w-full max-w-5xl 
          bg-white/90 backdrop-blur-sm /* ทำให้กล่องขาวโปร่งแสงนิดๆ ดูนุ่มนวล */
          rounded-3xl 
          shadow-xl 
          overflow-hidden 
          border border-white/50
        "
      >
        
        {/* HEADER */}
        <header className="bg-white/60 border-b border-indigo-100 p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            IT Shop Voice Assistant
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base">
            ผู้ช่วย AI ค้นหาสินค้าอัจฉริยะ (เช่น "มี SSD 1TB ไหม ราคาเท่าไหร่")
          </p>
        </header>

        <div className="p-6 md:p-10 space-y-8">
          
          {/* DISPLAY SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* USER TRANSCRIPT CARD */}
            <div className="flex flex-col rounded-2xl border border-sky-200 bg-sky-50/50 min-h-[400px] shadow-sm">
              <div className="flex items-center gap-3 p-4 border-b border-sky-100 bg-sky-100/40 rounded-t-2xl">
                <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <span className="font-semibold text-sky-800">สิ่งที่คุณพูด</span>
              </div>
              <div className="flex-1 p-6">
                {/* --- 2. ตัวอักษรฝั่งคนพูด (text-lg) --- */}
                <p className="text-lg text-slate-700 leading-relaxed">
                  {result.transcript ? (
                    result.transcript
                  ) : (
                    <span className="text-slate-400 italic font-light">...กดปุ่มไมค์แล้วพูดได้เลย...</span>
                  )}
                </p>
              </div>
            </div>

            {/* AI ANSWER CARD */}
            <div className="flex flex-col rounded-2xl border border-purple-200 bg-purple-50/50 min-h-[400px] shadow-sm">
              <div className="flex items-center gap-3 p-4 border-b border-purple-100 bg-purple-100/40 rounded-t-2xl">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <span className="font-semibold text-purple-800">คำตอบจาก AI</span>
              </div>
              
              <div className="flex-1 p-6">
                {/* --- 2. ตัวอักษรฝั่งคำตอบ ปรับเป็น text-lg เท่ากันแล้ว --- */}
                <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {result.answer ? (
                    result.answer
                  ) : (
                    <span className="text-slate-400 text-lg italic font-light">
                      ข้อมูลสินค้าจะแสดงที่นี่...
                    </span>
                  )}
                </div>

                {result.error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                    ⚠️ {result.error}
                  </div>
                )}

                {/* MATCHES LIST */}
                {result.matches && result.matches.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-purple-200/60">
                    <h3 className="text-sm font-bold text-purple-800 mb-4 uppercase tracking-wider opacity-70">
                      รายการสินค้าที่พบ ({result.matches.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {result.matches.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white/80 p-4 rounded-xl shadow-sm border border-purple-100 hover:border-purple-300 transition-all flex justify-between items-center group">
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                              {item.name || "สินค้าไม่ระบุชื่อ"}
                            </div>
                            {item.desc && <div className="text-xs text-slate-500 mt-1">{item.desc}</div>}
                          </div>
                          {item.price && (
                            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                              {item.price}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col items-center justify-center space-y-6 pt-2">
             {/* Status Badge */}
             <div className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300
                ${isListening ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}
             `}>
               {isListening ? (
                 <span className="flex items-center gap-2">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                   {status}
                 </span>
               ) : (
                 status
               )}
             </div>

            {/* Main Action Buttons */}
            {!isListening ? (
              <button
                onClick={start}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 active:translate-y-0 w-48"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2 transition-transform group-hover:scale-110">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 7.5 7.5 0 006-7.5V9a6 6 0 00-12 0v2.25a6 7.5 7.5 0 006 7.5zM12 18.75a6 7.5 7.5 0 006-7.5V9a6 6 0 00-12 0v2.25a6 7.5 7.5 0 006 7.5zM12 18.75v3.75m-3.75 0h7.5" />
                </svg>
                <span className="text-lg">เริ่มพูด</span>
              </button>
            ) : (
              <button
                onClick={stop}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-rose-500 rounded-full hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-1 active:translate-y-0 w-48"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-2 animate-pulse">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                </svg>
                <span className="text-lg">หยุด</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}