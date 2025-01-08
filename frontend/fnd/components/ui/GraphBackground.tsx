export function GraphBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="50" cy="50" r="1" fill="currentColor" className="text-gray-400" />
                    </pattern>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Smaller, more spread out background dots */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* First cluster of nodes */}
                <g className="animate-[float_12s_ease-in-out_infinite]">
                    <line x1="10%" y1="30%" x2="25%" y2="15%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="25%" y1="15%" x2="35%" y2="25%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="35%" y1="25%" x2="40%" y2="10%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="10%" y1="30%" x2="35%" y2="25%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="25%" y1="15%" x2="40%" y2="10%" className="stroke-gray-400 stroke-[0.5]" />

                    <circle cx="10%" cy="30%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="25%" cy="15%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="35%" cy="25%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="40%" cy="10%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>

                {/* Second cluster of nodes */}
                <g className="animate-[float_15s_ease-in-out_infinite_reverse]">
                    <line x1="70%" y1="40%" x2="85%" y2="45%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="85%" y1="45%" x2="90%" y2="30%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="75%" y1="25%" x2="85%" y2="45%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="70%" y1="40%" x2="90%" y2="30%" className="stroke-gray-400 stroke-[0.5]" />

                    <circle cx="70%" cy="40%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="85%" cy="45%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="90%" cy="30%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="75%" cy="25%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>

                {/* Third cluster of nodes */}
                <g className="animate-[float_10s_ease-in-out_infinite]">
                    <line x1="20%" y1="80%" x2="35%" y2="70%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="35%" y1="70%" x2="45%" y2="85%" className="stroke-gray-400 stroke-[0.5]" />
                    <line x1="20%" y1="80%" x2="45%" y2="85%" className="stroke-gray-400 stroke-[0.5]" />

                    <circle cx="20%" cy="80%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="35%" cy="70%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                    <circle cx="45%" cy="85%" r="2" className="fill-gray-500 filter" filter="url(#glow)" />
                </g>
            </svg>
        </div>
    )
} 