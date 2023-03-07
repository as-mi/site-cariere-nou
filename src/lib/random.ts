/** Randomly chooses an object from a set of options with equal probability. */
export function randomChoice<T>(...options: T[]): T {
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}
