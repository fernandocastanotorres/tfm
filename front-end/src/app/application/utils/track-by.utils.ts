export function trackByIndex<T>(index: number, _item: T): number {
  return index;
}

export function trackById<T extends { id: string | number }>(index: number, item: T): string | number {
  return item.id;
}
