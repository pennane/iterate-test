import { Indexed, Keyed } from './model'

export function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), ms))
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function isIterable<T>(x: T | Iterable<T>): x is Iterable<T> {
  return x && (x as any)[Symbol.iterator]
}

export function isAsyncIterable<T>(
  x: T | AsyncIterable<T>
): x is AsyncIterable<T> {
  return x && (x as any)[Symbol.asyncIterator]
}

export function index<T>(i: number, pr: Promise<T>): Indexed<T> {
  return [i, pr.then((v) => [i, v])]
}

export function randomDelay() {
  return wait(random(0, 5000))
}

export function key<T>(key: string, pr: Promise<T>): Keyed<T> {
  return [key, pr.then((v) => [key, v])]
}
