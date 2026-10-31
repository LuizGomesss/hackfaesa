export function debounce(callback: () => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  };
  schedule.cancel = () => clearTimeout(timer);
  return schedule;
}
