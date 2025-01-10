export function GraphBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="150" height="150" patternUnits="userSpaceOnUse">
                        <circle cx="75" cy="75" r="0.5" fill="currentColor" className="text-gray-400" />
                    </pattern>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background dots - make them smaller and more spread out */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* First interconnected cluster */}
                <g className="animate-[float_9s_ease-in-out_infinite]">
                    {/* More random, organic connections */}
                    <line x1="10%" y1="30%" x2="35%" y2="25%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="35%" y1="25%" x2="45%" y2="15%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="45%" y1="15%" x2="55%" y2="28%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="55%" y1="28%" x2="40%" y2="35%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="40%" y1="35%" x2="25%" y2="20%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="25%" y1="20%" x2="15%" y2="40%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="15%" y1="40%" x2="30%" y2="45%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="30%" y1="45%" x2="50%" y2="40%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="50%" y1="40%" x2="60%" y2="25%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="60%" y1="25%" x2="45%" y2="15%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="35%" y1="25%" x2="50%" y2="40%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="25%" y1="20%" x2="45%" y2="15%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="15%" y1="40%" x2="40%" y2="35%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="30%" y1="45%" x2="55%" y2="28%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="10%" y1="30%" x2="30%" y2="45%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="25%" y1="20%" x2="55%" y2="28%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="35%" y1="25%" x2="60%" y2="25%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="40%" y1="35%" x2="60%" y2="25%" className="stroke-gray-400 stroke-[0.3]" />

                    {/* More distributed nodes */}
                    <circle cx="10%" cy="30%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="25%" cy="20%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="35%" cy="25%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="45%" cy="15%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="55%" cy="28%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="40%" cy="35%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="15%" cy="40%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="30%" cy="45%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="50%" cy="40%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="60%" cy="25%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>

                {/* Second cluster */}
                <g className="animate-[float_10s_ease-in-out_infinite_reverse]">
                    <line x1="65%" y1="45%" x2="80%" y2="35%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="80%" y1="35%" x2="95%" y2="42%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="95%" y1="42%" x2="85%" y2="55%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="85%" y1="55%" x2="70%" y2="50%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="70%" y1="50%" x2="75%" y2="40%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="75%" y1="40%" x2="90%" y2="38%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="90%" y1="38%" x2="88%" y2="48%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="88%" y1="48%" x2="75%" y2="45%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="75%" y1="45%" x2="82%" y2="52%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="82%" y1="52%" x2="92%" y2="45%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="65%" y1="45%" x2="88%" y2="48%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="80%" y1="35%" x2="88%" y2="48%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="95%" y1="42%" x2="75%" y2="40%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="85%" y1="55%" x2="90%" y2="38%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="70%" y1="50%" x2="92%" y2="45%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="75%" y1="40%" x2="82%" y2="52%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="90%" y1="38%" x2="65%" y2="45%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="88%" y1="48%" x2="95%" y2="42%" className="stroke-gray-400 stroke-[0.3]" />

                    <circle cx="65%" cy="45%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="80%" cy="35%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="95%" cy="42%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="85%" cy="55%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="70%" cy="50%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="75%" cy="40%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="90%" cy="38%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="88%" cy="48%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="75%" cy="45%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="82%" cy="52%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="92%" cy="45%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>

                {/* Third cluster */}
                <g className="animate-[float_9.5s_ease-in-out_infinite]">
                    <line x1="15%" y1="75%" x2="25%" y2="85%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="25%" y1="85%" x2="35%" y2="80%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="35%" y1="80%" x2="40%" y2="90%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="40%" y1="90%" x2="30%" y2="95%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="30%" y1="95%" x2="20%" y2="88%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="20%" y1="88%" x2="15%" y2="75%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="22%" y1="82%" x2="32%" y2="87%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="32%" y1="87%" x2="38%" y2="85%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="38%" y1="85%" x2="28%" y2="92%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="28%" y1="92%" x2="22%" y2="82%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="15%" y1="75%" x2="35%" y2="80%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="25%" y1="85%" x2="40%" y2="90%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="35%" y1="80%" x2="30%" y2="95%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="20%" y1="88%" x2="38%" y2="85%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="22%" y1="82%" x2="40%" y2="90%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="32%" y1="87%" x2="15%" y2="75%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="28%" y1="92%" x2="35%" y2="80%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="38%" y1="85%" x2="20%" y2="88%" className="stroke-gray-400 stroke-[0.3]" />

                    <circle cx="15%" cy="75%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="25%" cy="85%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="35%" cy="80%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="40%" cy="90%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="30%" cy="95%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="20%" cy="88%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="22%" cy="82%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="32%" cy="87%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="38%" cy="85%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="28%" cy="92%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>

                {/* Fourth cluster */}
                <g className="animate-[float_11s_ease-in-out_infinite_reverse]">
                    <line x1="45%" y1="60%" x2="55%" y2="65%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="55%" y1="65%" x2="65%" y2="62%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="65%" y1="62%" x2="60%" y2="70%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="60%" y1="70%" x2="50%" y2="68%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="50%" y1="68%" x2="48%" y2="75%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="48%" y1="75%" x2="58%" y2="78%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="58%" y1="78%" x2="68%" y2="72%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="68%" y1="72%" x2="62%" y2="65%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="45%" y1="60%" x2="60%" y2="70%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="55%" y1="65%" x2="48%" y2="75%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="65%" y1="62%" x2="58%" y2="78%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="50%" y1="68%" x2="68%" y2="72%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="62%" y1="65%" x2="45%" y2="60%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="58%" y1="78%" x2="55%" y2="65%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="48%" y1="75%" x2="65%" y2="62%" className="stroke-gray-400 stroke-[0.3]" />
                    <line x1="68%" y1="72%" x2="50%" y2="68%" className="stroke-gray-400 stroke-[0.3]" />

                    <circle cx="45%" cy="60%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="55%" cy="65%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="65%" cy="62%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="60%" cy="70%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="50%" cy="68%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="48%" cy="75%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="58%" cy="78%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="68%" cy="72%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="62%" cy="65%" r="1.5" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>

            </svg>
        </div>
    )
} 