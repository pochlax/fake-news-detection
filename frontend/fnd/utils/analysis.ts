// Color utilities
export const getAnalysisColor = (type: string, value: string): string => {
    const colorMap: Record<string, string> = {
        // Tone colors
        'Satirical': 'text-red-600',
        'Sensational': 'text-orange-600',
        'Persuasive': 'text-yellow-600',
        'Optimisitic': 'text-purple-600',
        'Critical': 'text-blue-600',
        'Informative': 'text-green-600',

        // Bias colors
        'None': 'text-green-600',
        'Minimal': 'text-blue-600',
        'Moderate': 'text-yellow-600',
        'Strong': 'text-red-600',

        // Support Claims colors
        'Well-Supported': 'text-green-600',
        'Reasonably-Supported': 'text-blue-600',
        'Speculative/ Anecdotal': 'text-yellow-600',
        'Misleading': 'text-red-600',

        // Trustability colors
        'Trusted': 'text-green-600',
        'Somewhat-Reliable': 'text-blue-600',
        'Questionable': 'text-yellow-600',
        'Untrustable': 'text-red-600',

        // Social Sentiment colors
        'Positive': 'text-green-600',
        'Mixed': 'text-blue-600',
        'Negative': 'text-red-600',
    };
    return colorMap[value] || 'text-gray-600';
};

export const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-600';
    if (score >= 60) return 'bg-blue-100 text-blue-600';
    if (score >= 40) return 'bg-yellow-100 text-yellow-600';
    return 'bg-red-100 text-red-600';
};

export const getProgressBarColor = (score: number): string => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-600';
};

// Score calculation utilities
export const calculateContentScore = (tone: string, bias: string, supportedClaims: string): number => {
    let score = 0;
    let total = 0;

    // Score based on tone (0-100)
    const toneScores: Record<string, number> = {
        'Informative': 100,
        'Optimistic': 80,
        'Persuasive': 60,
        'Critical': 40,
        'Sensational': 20,
        'Satirical': 0
    };
    if (tone && tone in toneScores) {
        score += toneScores[tone];
        total += 100;
    }

    // Score based on bias (0-100)
    const biasScores: Record<string, number> = {
        'None': 100,
        'Minimal': 75,
        'Moderate': 50,
        'Strong': 0
    };
    if (bias && bias in biasScores) {
        score += biasScores[bias];
        total += 100;
    }

    // Score based on supported claims (0-100)
    const claimScores: Record<string, number> = {
        'Well-Supported': 100,
        'Reasonably-Supported': 75,
        'Speculative/ Anecdotal': 25,
        'Misleading': 0
    };
    if (supportedClaims && supportedClaims in claimScores) {
        score += claimScores[supportedClaims];
        total += 100;
    }

    // Calculate percentage (if no categories are available, return 0)
    return total > 0 ? Math.round((score / total) * 100) : 0;
};

export const calculateSourceScore = (authorTrustability: string, publisherTrustability: string): number => {
    let score = 0;
    let total = 0;

    // Score based on author (0-100)
    const authorScores: Record<string, number> = {
        'Trusted': 100,
        'Somewhat-Reliable': 75,
        'Questionable': 50,
        'Untrustable': 25
    };
    if (authorTrustability && authorTrustability in authorScores) {
        score += authorScores[authorTrustability];
        total += 100;
    }

    // Score based on publisher (0-100)
    const publisherScores: Record<string, number> = {
        'Trusted': 100,
        'Somewhat-Reliable': 75,
        'Questionable': 50,
        'Untrustable': 25
    };
    if (publisherTrustability && publisherTrustability in publisherScores) {
        score += publisherScores[publisherTrustability];
        total += 100;
    }

    // Calculate percentage (if no categories are available, return 0)
    return total > 0 ? Math.round((score / total) * 100) : 0;
};