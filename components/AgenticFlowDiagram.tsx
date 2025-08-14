import React from 'react';

export const AgenticFlowDiagram: React.FC = () => {
    return (
        <div className="p-4 bg-gray-900/50 rounded-lg overflow-x-auto">
            <h2 className="text-2xl font-bold text-center text-white mb-6">LearnSphere: Updated Agentic AI Workflow</h2>
            <svg width="1400" height="800" viewBox="0 0 1400 800" xmlns="http://www.w3.org/2000/svg" className="font-sans mx-auto">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
                    </marker>
                    <linearGradient id="agentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#818cf8' }} />
                        <stop offset="100%" style={{ stopColor: '#4f46e5' }} />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="2" dy="2" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Phase Titles & Dividers */}
                <text x="225" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#c7d2fe">Phase 1: Scoping &amp; Structuring</text>
                <text x="700" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#c7d2fe">Phase 2: Content Generation</text>
                <text x="1175" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#c7d2fe">Phase 3: Learning &amp; Interaction</text>
                <line x1="475" y1="10" x2="475" y2="780" stroke="#374151" strokeWidth="1" />
                <line x1="925" y1="10" x2="925" y2="780" stroke="#374151" strokeWidth="1" />

                {/* --- Phase 1 Nodes --- */}
                <g transform="translate(150, 60)">
                    <rect x="0" y="0" width="150" height="50" rx="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
                    <text x="75" y="30" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="bold">User Input</text>
                </g>
                <g transform="translate(125, 160)">
                    <rect x="0" y="0" width="200" height="60" rx="10" fill="url(#agentGradient)" filter="url(#shadow)" />
                    <text x="100" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">1. Scoping Agent</text>
                    <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">Uses Google Search</text>
                </g>
                 <g transform="translate(125, 270)">
                    <rect x="0" y="0" width="200" height="60" rx="10" fill="url(#agentGradient)" filter="url(#shadow)" />
                    <text x="100" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">2. Assessment Agent</text>
                    <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">Creates diagnostic quiz</text>
                </g>
                <g transform="translate(150, 380)">
                     <rect x="0" y="0" width="150" height="50" rx="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
                     <text x="75" y="30" textAnchor="middle" fill="#e5e7eb" fontSize="14">User takes quiz</text>
                </g>
                <g transform="translate(125, 480)">
                    <rect x="0" y="0" width="200" height="60" rx="10" fill="url(#agentGradient)" filter="url(#shadow)" />
                    <text x="100" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">3. Evaluation Agent</text>
                    <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">Determines Skill Level</text>
                </g>
                 <g transform="translate(125, 590)">
                    <rect x="0" y="0" width="200" height="60" rx="10" fill="url(#agentGradient)" filter="url(#shadow)" />
                    <text x="100" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">4. Curriculum Architect</text>
                    <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">Designs course structure</text>
                </g>
                
                {/* --- Phase 1 Arrows & Text --- */}
                <line x1="225" y1="110" x2="225" y2="160" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="235" y="135" fill="#a5b4fc" fontSize="12" fontStyle="italic">Topic</text>
                <line x1="225" y1="220" x2="225" y2="270" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="235" y="245" fill="#a5b4fc" fontSize="12" fontStyle="italic">Scope Document</text>
                <line x1="225" y1="330" x2="225" y2="380" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="235" y="355" fill="#a5b4fc" fontSize="12" fontStyle="italic">Assessment Quiz</text>
                <line x1="225" y1="430" x2="225" y2="480" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="235" y="455" fill="#a5b4fc" fontSize="12" fontStyle="italic">Score</text>
                <path d="M300 405 C 400 405, 400 510, 225 510" stroke="#4f46e5" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrow)"/>
                <text x="350" y="450" fill="#a5b4fc" fontSize="12" fontStyle="italic">or Skips</text>
                <line x1="225" y1="540" x2="225" y2="590" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="235" y="565" fill="#a5b4fc" fontSize="12" fontStyle="italic">Skill Level</text>

                {/* --- Phase 2 Nodes --- */}
                 <g transform="translate(575, 80)">
                    <rect x="0" y="0" width="250" height="150" rx="10" fill="#111827" stroke="#374151" strokeWidth="2" />
                    <text x="125" y="25" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="bold">5. Content Generation Swarm</text>
                    <g transform="translate(25, 50)">
                        <rect x="0" y="0" width="200" height="40" rx="5" fill="url(#agentGradient)" />
                        <text x="100" y="25" textAnchor="middle" fill="white" fontSize="12">Lesson Writer Agent</text>
                    </g>
                    <g transform="translate(25, 100)">
                        <rect x="0" y="0" width="200" height="40" rx="5" fill="url(#agentGradient)" />
                        <text x="100" y="25" textAnchor="middle" fill="white" fontSize="12">Example Generator Agent</text>
                    </g>
                </g>
                <g transform="translate(600, 280)">
                    <rect x="0" y="0" width="200" height="60" rx="10" fill="url(#agentGradient)" filter="url(#shadow)" />
                    <text x="100" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">6. Content Assembler</text>
                    <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">Merges content</text>
                </g>
                <g transform="translate(600, 400)">
                    <rect x="0" y="0" width="200" height="60" rx="10" fill="url(#agentGradient)" filter="url(#shadow)" />
                    <text x="100" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">7. Quality Assessor</text>
                    <text x="100" y="45" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">Reviews &amp; polishes</text>
                </g>
                
                {/* --- Phase 2 Arrows & Text --- */}
                <path d="M325 620 C 450 620, 450 155, 575 155" stroke="#4f46e5" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                <text x="400" y="380" fill="#a5b4fc" fontSize="12" fontStyle="italic">Draft Curriculum</text>
                <line x1="700" y1="230" x2="700" y2="280" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="710" y="255" fill="#a5b4fc" fontSize="12" fontStyle="italic">Lesson Contents</text>
                <line x1="700" y1="340" x2="700" y2="400" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="710" y="370" fill="#a5b4fc" fontSize="12" fontStyle="italic">Full Course</text>

                {/* --- Phase 3 Nodes --- */}
                 <g transform="translate(1050, 80)">
                    <ellipse cx="100" cy="35" rx="100" ry="35" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
                    <path d="M 50 35 C 50 70, 150 70, 150 35" fill="none" stroke="#4b5563" strokeWidth="2"/>
                    <text x="100" y="40" textAnchor="middle" fill="#e5e7eb" fontSize="16" fontWeight="bold">Database</text>
                </g>
                <g transform="translate(1025, 200)">
                    <rect x="0" y="0" width="250" height="70" rx="10" fill="#111827" stroke="#374151" strokeWidth="2" />
                    <text x="125" y="30" textAnchor="middle" fill="#e5e7eb" fontSize="16" fontWeight="bold">User Learning View</text>
                    <text x="125" y="55" textAnchor="middle" fill="#d1d5db" fontSize="14">Views Lessons &amp; Quizzes</text>
                </g>
                <g transform="translate(975, 330)">
                    <rect x="0" y="0" width="350" height="230" rx="10" fill="#1f2937" stroke="#4b5563" strokeWidth="1" strokeDasharray="5,5" />
                    <text x="175" y="30" textAnchor="middle" fill="#e5e7eb" fontSize="16" fontWeight="bold">On-Demand Reactive Agents</text>
                    
                    <g transform="translate(25, 60)">
                        <rect x="0" y="0" width="140" height="50" rx="5" fill="url(#agentGradient)" />
                        <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12">Quiz Agent</text>
                    </g>
                     <g transform="translate(185, 60)">
                        <rect x="0" y="0" width="140" height="50" rx="5" fill="url(#agentGradient)" />
                        <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12">Tutor Agent</text>
                    </g>
                    <g transform="translate(25, 140)">
                        <rect x="0" y="0" width="140" height="50" rx="5" fill="url(#agentGradient)" />
                        <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12">Hint Agent</text>
                    </g>
                    <g transform="translate(185, 140)">
                        <rect x="0" y="0" width="140" height="50" rx="5" fill="url(#agentGradient)" />
                        <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" >Resource Finder</text>
                    </g>
                </g>
                
                {/* --- Phase 3 Arrows & Text --- */}
                <path d="M800 430 C 900 430, 900 115, 1050 115" stroke="#4f46e5" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                <text x="850" y="270" fill="#a5b4fc" fontSize="12" fontStyle="italic">Final Course</text>
                <line x1="1150" y1="150" x2="1150" y2="200" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="1160" y="175" fill="#a5b4fc" fontSize="12" fontStyle="italic">Load Course</text>
                <path d="M1150 270 Q1150 300, 1125 330" stroke="#4f46e5" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
                <path d="M1125 530 Q1150 560, 1150 590" stroke="#4f46e5" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
                <text x="1000" y="300" fill="#a5b4fc" fontSize="12" >User Action (e.g. Ask Question)</text>
                <text x="1160" y="565" fill="#a5b4fc" fontSize="12">AI Response</text>

            </svg>
        </div>
    );
};
