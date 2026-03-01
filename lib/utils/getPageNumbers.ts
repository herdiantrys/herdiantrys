/**
 * Returns an array of page numbers to display in a pagination control.
 * Always shows at most `windowSize` (default 5) consecutive pages,
 * clamped so there are no duplicates and no out-of-range values.
 *
 * Examples (totalPages=10, windowSize=5):
 *   currentPage=1  → [1,2,3,4,5]
 *   currentPage=3  → [1,2,3,4,5]
 *   currentPage=6  → [4,5,6,7,8]
 *   currentPage=10 → [6,7,8,9,10]
 */
export function getPageNumbers(currentPage: number, totalPages: number, windowSize = 5): number[] {
    if (totalPages <= 0) return [];
    const half = Math.floor(windowSize / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
        start = 1;
        end = Math.min(windowSize, totalPages);
    }
    if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, totalPages - windowSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
}
