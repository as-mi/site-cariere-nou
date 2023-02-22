import { useEffect, useRef } from "react";

/**
 * Custom hook used for memoizing a value while using a custom comparison function.
 *
 * Based on https://usehooks.com/useMemoCompare/
 *
 * @param value
 * @param compare
 * @returns
 */
const useMemoCompare = <T>(value: T, compare: (a?: T, b?: T) => boolean): T => {
  // Ref for storing previous value
  const storageRef = useRef<T>(value);

  // Retrieve stored value
  const previous = storageRef.current;

  // Pass previous and next value to compare function
  // to determine whether to consider them equal
  const isEqual = compare(previous, value);

  // If not equal, update the storage ref
  useEffect(() => {
    if (!isEqual) {
      storageRef.current = value;
    }
  });

  // Finally, if equal then return the previous value
  return isEqual ? previous : value;
};

export default useMemoCompare;
