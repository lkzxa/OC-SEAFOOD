import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
