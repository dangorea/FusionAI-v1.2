export interface IterationOption {
  key: string;
  label: string;
  value: string;
}

/**
 * Extracts the additional information from a prompt.
 * It looks for the section between "# Additional information" and "---".
 * If the markers are not found, it returns the entire prompt.
 * Additionally, it collapses extra whitespace and trims the result to a maximum length.
 *
 * @param promptText - The full prompt text from an iteration.
 * @param maxLength - The maximum allowed length of the returned text (default: 200).
 * @returns The manipulated text.
 */
export function extractIterationLabel(
  promptText: string,
  maxLength: number = 200,
): string {
  const additionalMarker = '# Additional information';
  const endMarker = '---';
  const startIdx = promptText.indexOf(additionalMarker);
  let extracted: string;

  if (startIdx === -1) {
    extracted = promptText;
  } else {
    const infoStart = startIdx + additionalMarker.length;
    const endIdx = promptText.indexOf(endMarker, infoStart);
    extracted =
      endIdx === -1
        ? promptText.substring(infoStart)
        : promptText.substring(infoStart, endIdx);
  }

  // Trim and collapse extra whitespace.
  extracted = extracted.trim().replace(/\s+/g, ' ');

  // If the text is longer than maxLength, truncate and append ellipsis.
  if (extracted.length > maxLength) {
    extracted = `${extracted.substring(0, maxLength).trim()}...`;
  }

  return extracted;
}

/**
 * Builds an array of iteration options suitable for history selection.
 * Each option contains a label (the additional information extracted from the prompt)
 * and a value (the iteration's unique _id).
 *
 * @param iterations - An array of code generation iterations.
 * @param maxLength - The maximum allowed length of the returned text (default: 200).s
 * @returns An array of IterationOption objects.
 */
export function buildIterationsHistory(
  iterations: { _id: string; prompt?: string }[],
  maxLength: number = 200,
): IterationOption[] {
  return iterations.map((iteration) => ({
    key: iteration._id,
    label: extractIterationLabel(iteration.prompt || '', maxLength),
    value: iteration._id,
  }));
}
