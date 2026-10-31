export interface ParsedQrPin {
  pin: string;
  name?: string;
}

export function parseQrContent(raw: string): ParsedQrPin | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. JSON payload: {"app":"11:11","pin":"1234","name":"..."}
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed.pin === 'string') {
      const cleanPin = parsed.pin.replace(/[^0-9]/g, '');
      if (cleanPin.length === 4) {
        return {
          pin: cleanPin,
          name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : undefined,
        };
      }
    }
  } catch {
    // Not valid JSON, continue to string matchers
  }

  // 2. Query param in URL: ?pin=1234 or &pin=1234 or #pin=1234
  const queryMatch = trimmed.match(/[?&#]pin=(\d{4})/i);
  if (queryMatch) {
    return { pin: queryMatch[1] };
  }

  // 3. Exact 4-digit PIN: "1234" or "#1234"
  const exactMatch = trimmed.match(/^#?(\d{4})$/);
  if (exactMatch) {
    return { pin: exactMatch[1] };
  }

  // 4. Any 4-digit number in the string
  const fourDigitMatch = trimmed.match(/\b(\d{4})\b/);
  if (fourDigitMatch) {
    return { pin: fourDigitMatch[1] };
  }

  return null;
}
