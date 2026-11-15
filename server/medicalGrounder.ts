export const FALLBACK_SPECIALIST_TEXT = 'Ask from a medical specialist.';

export interface VerifiedSource {
  title: string;
  uri: string;
}

export interface GroundedHealthAnswer {
  reply: string;
  sources: VerifiedSource[];
  searchQueries: string[];
  fallbackTriggered: boolean;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'what', 'when', 'where', 'which', 'who', 'whom', 'why', 'how',
  'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'may', 'might',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them',
  'of', 'in', 'on', 'at', 'to', 'for', 'from', 'with', 'by', 'about', 'as', 'into',
  'tell', 'explain', 'give', 'show', 'know', 'understand', 'difference', 'between',
  'vs', 'versus', 'or', 'and', 'if', 'have', 'has', 'had', 'get', 'getting',
  'normal', 'average', 'common', 'warning', 'signs', 'sign', 'symptom', 'symptoms',
  'evaluated', 'doctor', 'physician', 'specialist', 'see', 'check', 'checked',
  'adult', 'adults', 'child', 'children', 'senior', 'elderly', 'person', 'people',
  'mean', 'means', 'meaning', 'cause', 'causes', 'reason', 'reasons', 'please',
  'help', 'need', 'problem', 'problems', 'health', 'issue', 'issues', 'condition',
]);

const QUERY_ALIASES: [RegExp, string][] = [
  [/\b(heat exhaustion|heat stroke|heatstroke)\b/i, 'heat illness'],
  [/\b(high bp|bp|blood pressure)\b/i, 'blood pressure'],
  [/\b(sugar level|blood sugar|glucose)\b/i, 'diabetes blood sugar'],
  [/\b(heart rate|pulse rate)\b/i, 'vital signs'],
  [/\b(flu|influenza)\b/i, 'flu'],
  [/\b(cold|common cold|runny nose)\b/i, 'common cold'],
  [/\b(stomach ache|stomach pain|abdominal pain|belly pain)\b/i, 'abdominal pain'],
  [/\b(head ache|migraine)\b/i, 'headache'],
  [/\b(loose motion|diarrhoea)\b/i, 'diarrhea'],
  [/\b(throwing up|vomiting|nausea)\b/i, 'nausea vomiting'],
  [/\b(rash|itch|itching|hives)\b/i, 'skin rash'],
  [/\b(sprain|twisted ankle|strain)\b/i, 'sprains strains'],
  [/\b(burn|scald)\b/i, 'burns'],
  [/\b(cut|wound|bleeding)\b/i, 'wounds'],
  [/\b(ear ache|earache|ear pain)\b/i, 'earache'],
  [/\b(sore throat|throat pain)\b/i, 'sore throat'],
  [/\b(shortness of breath|trouble breathing)\b/i, 'breathing problems'],
  [/\b(anxiety|panic attack|depression|stress)\b/i, 'mental health'],
  [/\b(pregnant|pregnancy|morning sickness)\b/i, 'pregnancy'],
  [/\b(covid|coronavirus)\b/i, 'covid-19'],
  [/\b(uti|urinary|burning urination)\b/i, 'urinary tract infections'],
];

const EMERGENCY_PATTERNS: RegExp[] = [
  /\b(chest pain|chest tightness|heart attack)\b/i,
  /\b(can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|choking|suffocating)\b/i,
  /\b(face drooping|slurred speech|sudden numbness|sudden weakness on one side|having a stroke|stroke symptoms|mini[- ]stroke)\b/i,
  /\b(severe bleeding|won'?t stop bleeding|coughing up blood|vomiting blood)\b/i,
  /\b(unconscious|unresponsive|passed out|not breathing)\b/i,
  /\b(seizure|convulsion|fits)\b/i,
  /\b(anaphylaxis|throat swelling|severe allergic reaction)\b/i,
  /\b(overdose|poisoning|swallowed poison)\b/i,
  /\b(suicid|kill myself|end my life|self[- ]harm)\b/i,
];

const PERSONAL_DIAGNOSIS_OR_PRESCRIPTION_PATTERNS: RegExp[] = [
  /\b(diagnose me|what disease do i have|do i have cancer|am i having|confirm if i have)\b/i,
  /\b(prescribe|prescription|what medicine should i take|which antibiotic|what pill should i take)\b/i,
  /\b(how many mg|what dose|dosage for me|can i stop taking my|should i double my dose)\b/i,
];

export function isSimpleGreeting(text: string): boolean {
  return /^(hi|hello|hey|namaste|good morning|good afternoon|good evening|thanks|thank you)[!.,\s]*$/i.test(
    text.trim()
  );
}

export function isEmergencyQuery(text: string): boolean {
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}

export function requiresPersonalDiagnosisOrPrescription(text: string): boolean {
  return PERSONAL_DIAGNOSIS_OR_PRESCRIPTION_PATTERNS.some((re) => re.test(text));
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function htmlSummaryToStructuredBlocks(rawHtml: string): string[] {
  const decoded = decodeXmlEntities(rawHtml)
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '');

  const withMarkers = decoded
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return withMarkers
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0);
}

function extractMedicalSearchTerms(question: string): { query: string; keywords: string[] } {
  let normalized = question.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  for (const [pattern, replacement] of QUERY_ALIASES) {
    if (pattern.test(normalized)) {
      normalized = `${normalized} ${replacement}`;
    }
  }

  const tokens = normalized
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  const uniqueKeywords = Array.from(new Set(tokens));
  if (uniqueKeywords.length === 0) {
    return { query: '', keywords: [] };
  }

  // Prefer alias target if one matched, otherwise top 4 medical keywords
  const aliasMatches = QUERY_ALIASES.filter(([re]) => re.test(question)).map(([, rep]) => rep);
  const query = aliasMatches.length > 0 ? aliasMatches[0] : uniqueKeywords.slice(0, 4).join(' ');
  return { query, keywords: uniqueKeywords };
}

interface MedlineDoc {
  url: string;
  title: string;
  altTitles: string[];
  blocks: string[];
  score: number;
}

function selectRelevantBlocks(blocks: string[], question: string, keywords: string[]): string {
  const qLower = question.toLowerCase();
  const wantsSigns = /(sign|symptom|warning|feel|tell|exhaustion|stroke)/i.test(qLower);
  const wantsDoctorWhen = /(when|doctor|emergency|call|seek|evaluate|serious)/i.test(qLower);
  const wantsNormal = /(normal|range|level|resting|measure|number|mmhg)/i.test(qLower);

  const cleanBlocks = blocks.filter((b) => !/^what (is|are) [^?]{2,50}\?$/i.test(b));
  const sourceBlocks = cleanBlocks.length > 0 ? cleanBlocks : blocks;

  const scored = sourceBlocks.map((block, index) => {
    const bLower = block.toLowerCase();
    let score = index === 0 ? 5 : 1;
    if (block.startsWith('- ')) score += 1;
    for (const kw of keywords) {
      if (bLower.includes(kw)) score += 3;
    }
    if (wantsSigns && /(symptom|sign|thirst|sweat|dizz|confusion|cramp|headache|dry mouth|dark|faint)/i.test(bLower)) {
      score += 6;
    }
    if (wantsDoctorWhen && /(call|doctor|emergency|medical help|healthcare provider|seek|immediately|lasts|103|104|39\.4|40|fever)/i.test(bLower)) {
      score += 6;
    }
    if (wantsNormal && /(normal|120|80|systolic|diastolic|mmhg|pressure|measure)/i.test(bLower)) {
      score += 8;
    }
    return { block, index, score };
  });

  const selectedIndices = new Set<number>();
  if (sourceBlocks.length > 0) selectedIndices.add(0);

  const includeWithAttachedBullets = (idx: number) => {
    selectedIndices.add(idx);
    // If this block is a bullet item, pull its preceding lead-in line if it ends with ':'
    if (sourceBlocks[idx]?.startsWith('- ')) {
      let lead = idx - 1;
      while (lead >= 0 && sourceBlocks[lead].startsWith('- ')) lead -= 1;
      if (lead >= 0 && sourceBlocks[lead].endsWith(':')) {
        selectedIndices.add(lead);
      }
    }
    // If this block ends with ':', pull consecutive bullet items immediately after it
    if (sourceBlocks[idx]?.endsWith(':')) {
      let next = idx + 1;
      let count = 0;
      while (next < sourceBlocks.length && sourceBlocks[next].startsWith('- ') && count < 6) {
        selectedIndices.add(next);
        next += 1;
        count += 1;
      }
    }
  };

  const topBlocks = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  let totalChars = 0;
  for (const item of topBlocks) {
    if (totalChars > 950 && selectedIndices.size >= 3) break;
    includeWithAttachedBullets(item.index);
    totalChars = Array.from(selectedIndices).reduce(
      (acc, i) => acc + (sourceBlocks[i]?.length ?? 0),
      0
    );
  }

  // Drop dangling lead-in lines ending with ':' if no bullet items follow them in selection
  const ordered = Array.from(selectedIndices).sort((a, b) => a - b);
  const filtered = ordered.filter((idx, pos) => {
    const text = sourceBlocks[idx];
    if (!text.endsWith(':')) return true;
    const nextSelectedIdx = ordered[pos + 1];
    return nextSelectedIdx !== undefined && sourceBlocks[nextSelectedIdx]?.startsWith('- ');
  });

  return filtered.map((idx) => sourceBlocks[idx]).join('\n');
}

export async function searchVerifiedMedlinePlus(
  question: string
): Promise<GroundedHealthAnswer> {
  if (isSimpleGreeting(question)) {
    return {
      reply:
        'Hello! Please ask any general health question (for example about symptoms, fever care, dehydration, or vital signs), and I will verify the answer from trusted medical sources.',
      sources: [],
      searchQueries: [],
      fallbackTriggered: false,
    };
  }

  if (isEmergencyQuery(question)) {
    return {
      reply:
        'This sounds like it could be a medical emergency. **Call 112** (or your local emergency number) or go to the nearest Emergency Department immediately.\n\nAsk from a medical specialist.',
      sources: [
        {
          title: 'MedlinePlus – Recognizing Medical Emergencies (NIH)',
          uri: 'https://medlineplus.gov/recognizingmedicalemergencies.html',
        },
      ],
      searchQueries: ['medical emergencies warning signs'],
      fallbackTriggered: true,
    };
  }

  if (requiresPersonalDiagnosisOrPrescription(question)) {
    return {
      reply: FALLBACK_SPECIALIST_TEXT,
      sources: [],
      searchQueries: [],
      fallbackTriggered: true,
    };
  }

  const { query, keywords } = extractMedicalSearchTerms(question);
  if (!query || keywords.length === 0) {
    return {
      reply: FALLBACK_SPECIALIST_TEXT,
      sources: [],
      searchQueries: [],
      fallbackTriggered: true,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(
      query
    )}&retmax=8`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return {
        reply: FALLBACK_SPECIALIST_TEXT,
        sources: [],
        searchQueries: [query],
        fallbackTriggered: true,
      };
    }

    const xml = await res.text();
    const docMatches = [...xml.matchAll(/<document[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/document>/g)];

    const parsedDocs: MedlineDoc[] = [];
    for (const match of docMatches) {
      const docUrl = match[1];
      const body = match[2];

      const rawTitle = body.match(/<content name="title">([\s\S]*?)<\/content>/)?.[1] ?? '';
      const title = decodeXmlEntities(rawTitle)
        .replace(/<span[^>]*>/gi, '')
        .replace(/<\/span>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

      const altTitles = [...body.matchAll(/<content name="altTitle">([\s\S]*?)<\/content>/g)].map(
        (m) =>
          decodeXmlEntities(m[1])
            .replace(/<span[^>]*>/gi, '')
            .replace(/<\/span>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim()
      );

      const rawSummary = body.match(/<content name="FullSummary">([\s\S]*?)<\/content>/)?.[1] ?? '';
      const blocks = htmlSummaryToStructuredBlocks(rawSummary);
      if (!title || blocks.length === 0) continue;

      const titleLower = title.toLowerCase();
      const altLower = altTitles.join(' ').toLowerCase();
      const fullTextLower = `${titleLower} ${altLower} ${blocks.join(' ').toLowerCase()}`;

      let score = 0;
      for (const kw of keywords) {
        if (titleLower === kw) score += 25;
        else if (titleLower.includes(kw)) score += 14;
        if (altLower.includes(kw)) score += 9;
        if (fullTextLower.includes(kw)) score += 2;
      }

      // Bonus if the multi-word query phrase appears directly in the title or altTitle
      if (titleLower === query.toLowerCase()) score += 35;
      else if (titleLower.includes(query.toLowerCase())) score += 18;
      else if (altLower.includes(query.toLowerCase())) score += 12;

      // Prefer core topic pages over sub-guides when user isn't specifically asking how to prevent
      if (titleLower.startsWith('how to prevent') && !question.toLowerCase().includes('prevent')) {
        score -= 10;
      }
      if (title.split(/\s+/).length <= 3 && titleLower.includes(query.toLowerCase())) {
        score += 6;
      }

      parsedDocs.push({
        url: docUrl,
        title,
        altTitles,
        blocks,
        score,
      });
    }

    parsedDocs.sort((a, b) => b.score - a.score);
    const best = parsedDocs[0];

    // Require strong title/altTitle relevance so non-medical or obscure queries fall back safely
    if (!best || best.score < 12) {
      return {
        reply: FALLBACK_SPECIALIST_TEXT,
        sources: [],
        searchQueries: [query],
        fallbackTriggered: true,
      };
    }

    const bodyText = selectRelevantBlocks(best.blocks, question, keywords);
    if (!bodyText) {
      return {
        reply: FALLBACK_SPECIALIST_TEXT,
        sources: [],
        searchQueries: [query],
        fallbackTriggered: true,
      };
    }

    const formattedReply = `**${best.title}** (Verified via NIH MedlinePlus)\n\n${bodyText}\n\n*Note: General medical reference only, not a personal diagnosis. For individualized advice, ask from a medical specialist.*`;

    const topSources: VerifiedSource[] = parsedDocs
      .filter((d) => d.score >= 10)
      .slice(0, 3)
      .map((d) => ({
        title: `MedlinePlus (NIH): ${d.title}`,
        uri: d.url,
      }));

    return {
      reply: formattedReply,
      sources: topSources,
      searchQueries: [query],
      fallbackTriggered: false,
    };
  } catch {
    return {
      reply: FALLBACK_SPECIALIST_TEXT,
      sources: [],
      searchQueries: [query],
      fallbackTriggered: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}
