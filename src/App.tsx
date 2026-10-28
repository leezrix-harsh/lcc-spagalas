import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Dispatch } from 'react';
import { gameReducer, initialState } from './game/reducer';
import type { GameAction, GameState } from './game/types';
import { audienceState, createChannel, loadState, saveState, type SyncMessage } from './game/sync';
import { playSound } from './audio/sfx';
import { questions } from './data/questions';
import Home from './pages/Home';
import Host from './pages/Host';
import Display from './pages/Display';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}
const GameContext = createContext<GameContextValue | null>(null);

function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('GameContext tidak tersedia.');
  return value;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState, () => loadState() ?? initialState);
  const channel = useMemo(() => createChannel(), []);
  const context = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <GameContext.Provider value={context}>
      <AppContent channel={channel} />
    </GameContext.Provider>
  );
}

function AppContent({ channel }: { channel: BroadcastChannel | null }) {
  const { state, dispatch } = useGame();
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [audience, setAudience] = useState<Partial<GameState>>({});
  const [connected, setConnected] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(0);

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    saveState(state);
    if (route === '#/host') channel?.postMessage({ type: 'state', state: audienceState(state) } satisfies SyncMessage);
  }, [state, channel, route]);

  useEffect(() => {
    if (!channel) return;
    const listener = (event: MessageEvent<SyncMessage>) => {
      const message = event.data;
      if (message.type === 'hello' && route === '#/host') {
        channel.postMessage({ type: 'state', state: audienceState(state) } satisfies SyncMessage);
        setConnected(true);
        setLastHeartbeat(Date.now());
      } else if (message.type === 'heartbeat' && route === '#/host') {
        setConnected(true);
        setLastHeartbeat(Date.now());
      } else if (message.type === 'state' && route === '#/display') {
        setAudience(message.state);
      } else if (message.type === 'sfx' && route === '#/display') {
        void playSound(message.name);
      }
    };
    channel.addEventListener('message', listener);
    return () => channel.removeEventListener('message', listener);
  }, [channel, route, state]);

  useEffect(() => {
    if (route !== '#/display' || !channel) return;
    channel.postMessage({ type: 'hello' } satisfies SyncMessage);
    const heartbeat = window.setInterval(() => channel.postMessage({ type: 'heartbeat', at: Date.now() } satisfies SyncMessage), 2000);
    return () => window.clearInterval(heartbeat);
  }, [channel, route]);

  useEffect(() => {
    if (route !== '#/host') return;
    const check = window.setInterval(() => setConnected(Date.now() - lastHeartbeat < 5000), 1000);
    return () => window.clearInterval(check);
  }, [lastHeartbeat, route]);

  const emitSound = (name: string) => channel?.postMessage({ type: 'sfx', name } satisfies SyncMessage);
  return (
    route === '#/host'
      ? <Host state={state} dispatch={dispatch} questions={questions} connected={connected} emitSound={emitSound} />
      : route === '#/display'
        ? <Display state={audience} onHello={() => channel?.postMessage({ type: 'hello' } satisfies SyncMessage)} />
        : <Home />
  );
}
