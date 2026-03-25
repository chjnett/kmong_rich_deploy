
/**
 * Utility to normalize strings for robust comparison (Korean NFC/NFD, Trimming, Case-insensitivity)
 */
export function normalizeLabel(value: string | null | undefined): string {
    if (!value) return ""
    return value.trim().normalize("NFC")
}

/**
 * Robust comparison of two labels (Category/SubCategory names)
 */
export function compareLabels(label1: string | null | undefined, label2: string | null | undefined): boolean {
    const norm1 = normalizeLabel(label1).toLowerCase()
    const norm2 = normalizeLabel(label2).toLowerCase()
    if (!norm1 && !norm2) return true
    return norm1 === norm2
}
