import { useCallback } from "react";
import { useLocation, useSearch } from "wouter";

export function useUrlState(
  key: string,
  defaultValue: number,
): [number, (value: number) => void] {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  const params = new URLSearchParams(searchParams);
  const urlValue = params.get(key);
  const value = urlValue ? Number.parseInt(urlValue, 10) : defaultValue;

  const setValue = useCallback(
    (newValue: number) => {
      const currentParams = new URLSearchParams(globalThis.location.search);
      if (newValue === defaultValue) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, newValue.toString());
      }
      const queryString = currentParams.toString();
      setLocation(
        queryString
          ? `${globalThis.location.pathname}?${queryString}`
          : globalThis.location.pathname,
      );
    },
    [key, setLocation, defaultValue],
  );

  return [value, setValue];
}

export function useUrlStringState(
  key: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  const params = new URLSearchParams(searchParams);
  const value = params.get(key) ?? defaultValue;

  const setValue = useCallback(
    (newValue: string) => {
      const currentParams = new URLSearchParams(globalThis.location.search);
      if (newValue === defaultValue) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, newValue);
      }
      const queryString = currentParams.toString();
      setLocation(
        queryString
          ? `${globalThis.location.pathname}?${queryString}`
          : globalThis.location.pathname,
      );
    },
    [key, setLocation, defaultValue],
  );

  return [value, setValue];
}

export function useUrlBooleanState(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  const params = new URLSearchParams(searchParams);
  const urlValue = params.get(key);
  const value = urlValue ? urlValue === "true" : defaultValue;

  const setValue = useCallback(
    (newValue: boolean) => {
      const currentParams = new URLSearchParams(globalThis.location.search);
      if (newValue === defaultValue) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, newValue.toString());
      }
      const queryString = currentParams.toString();
      setLocation(
        queryString
          ? `${globalThis.location.pathname}?${queryString}`
          : globalThis.location.pathname,
      );
    },
    [key, setLocation, defaultValue],
  );

  return [value, setValue];
}
