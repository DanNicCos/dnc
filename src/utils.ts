const quotes: string[] = [
  "The only way to do great work is to love what you do.",
  "Life is what happens when you're busy making other plans.",
  "Do not watch the clock. Do what it does. Keep going.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "You miss 100% of the shots you don't take.",
  "I have not failed. I've just found 10,000 ways that won't work.",
  "Believe you can and you're halfway there.",
  "Whether you think you can or you think you can’t, you’re right.",
  "Dream big and dare to fail.",
  "It always seems impossible until it's done.",
  "Keep your eyes on the stars, and your feet on the ground.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Act as if what you do makes a difference. It does.",
  "Quality is not an act, it is a habit.",
  "If opportunity doesn’t knock, build a door."
];

let lastIndex: number | null = null;

/**
 * Picks a random quote index different from the last one.
 */
function pickIndex(): number {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * quotes.length);
  } while (idx === lastIndex && quotes.length > 1);
  lastIndex = idx;
  return idx;
}

/**
 * Starts rotating quotes in the element matching `.quote`.
 * @param intervalMs How often to swap (default 30 000ms).
 */
export function startQuoteRotation(intervalMs: number = 30000): void {
  const el = document.querySelector<HTMLElement>('.quote');
  if (!el) {
    console.warn('startQuoteRotation: no element found for selector `.quote`');
    return;
  }

  function update() {
    const quote = quotes[pickIndex()];
    el!.textContent = quote;
  }

  // Initial set, then repeat
  update();
  setInterval(update, intervalMs);
}
