import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useIsClient } from "~/hooks";

const DEFILLAMA = "DEFILLAMA";
export const DARK_MODE = "DARK_MODE";

const UPDATABLE_KEYS = [DARK_MODE];

const UPDATE_KEY = "UPDATE_KEY";

const LocalStorageContext = createContext(null);

export function useLocalStorageContext() {
  return useContext(LocalStorageContext);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_KEY: {
      const { key, value } = payload;
      if (!UPDATABLE_KEYS.some((k) => k === key)) {
        throw Error(`Unexpected key in LocalStorageContext reducer: '${key}'.`);
      } else {
        return {
          ...state,
          [key]: value,
        };
      }
    }
    default: {
      throw Error(
        `Unexpected action type in LocalStorageContext reducer: '${type}'.`
      );
    }
  }
}

function init() {
  const defaultLocalStorage = {
    [DARK_MODE]: true,
  };

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DEFILLAMA));
    if (!parsed) {
      return defaultLocalStorage;
    } else {
      return { ...defaultLocalStorage, ...parsed };
    }
  } catch {
    return defaultLocalStorage;
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const updateKey = useCallback((key, value) => {
    dispatch({ type: UPDATE_KEY, payload: { key, value } });
  }, []);

  const values = useMemo(
    () => [{ ...state }, { updateKey }],
    [state, updateKey]
  );

  return (
    <LocalStorageContext.Provider value={values}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function Updater() {
  const [state] = useLocalStorageContext();

  useEffect(() => {
    window.localStorage.setItem(DEFILLAMA, JSON.stringify(state));
  });

  return null;
}

export function useDarkModeManager() {
  const [state, { updateKey }] = useLocalStorageContext();
  const isClient = useIsClient();
  let darkMode = state[DARK_MODE];
  let isDarkMode = isClient ? darkMode : true;

  const toggleDarkMode = useCallback(
    (value) => {
      updateKey(
        DARK_MODE,
        value === false || value === true ? value : !isDarkMode
      );
    },
    [updateKey, isDarkMode]
  );
  return [isDarkMode, toggleDarkMode];
}
