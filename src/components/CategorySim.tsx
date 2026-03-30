import { useState, useCallback, useRef } from 'react';
import { PROFILES, type ProfileName, type SoundKey } from '../lib/sounds';
import { audioEngine } from '../audio/AudioEngine';
import './CategorySim.scss';

interface Props {
  interactionId: string;
  profileName: ProfileName;
}

export function CategorySim({ interactionId, profileName }: Props) {
  const profile = PROFILES[profileName];
  const play = useCallback((key: SoundKey) => {
    const s = profile[key];
    if (s) audioEngine.play(s);
  }, [profile]);

  switch (interactionId) {
    case 'toasts-alerts': return <ToastsSim play={play} />;
    case 'modal': return <ModalSim play={play} />;
    case 'drawer': return <DrawerSim play={play} />;
    case 'popover-tooltip': return <PopoverTooltipSim play={play} />;
    case 'page-nav': return <NavigationSim play={play} />;
    case 'async': return <AsyncSim play={play} />;
    case 'manipulation': return <ManipulationSim play={play} />;
    default: return null;
  }
}

/* ═══ Toasts & Alerts ═══ */

interface Toast { id: number; type: 'success' | 'warning' | 'error' | 'info'; message: string }

const TOAST_MSGS: Record<string, string> = {
  success: 'Changes saved successfully',
  warning: 'Your session expires in 5 minutes',
  error: 'Failed to save. Please try again.',
  info: 'New version available',
};

function ToastsSim({ play }: { play: (k: SoundKey) => void }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((type: Toast['type']) => {
    const id = ++counter.current;
    const soundKey = `toast${type.charAt(0).toUpperCase() + type.slice(1)}` as SoundKey;
    play(soundKey);
    setToasts((prev) => [...prev, { id, type, message: TOAST_MSGS[type] }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, [play]);

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        <div className="sim-toast-area">
          {toasts.map((t) => (
            <div key={t.id} className={`sim-toast sim-toast-${t.type}`}>
              <span className="sim-toast-icon">{t.type === 'success' ? '\u2713' : t.type === 'error' ? '\u2717' : t.type === 'warning' ? '\u26A0' : 'i'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
        <div className="cat-sim-center">
          <p className="cat-sim-hint">Click a button to trigger a toast</p>
          <div className="cat-sim-buttons">
            <button className="cat-btn success" onClick={() => addToast('success')}>Success</button>
            <button className="cat-btn warning" onClick={() => addToast('warning')}>Warning</button>
            <button className="cat-btn error" onClick={() => addToast('error')}>Error</button>
            <button className="cat-btn info" onClick={() => addToast('info')}>Info</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Modal ═══ */

function ModalSim({ play }: { play: (k: SoundKey) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        {open && (
          <div className="cat-overlay" onClick={() => { setOpen(false); play('modalClose'); }}>
            <div className="sim-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Confirm action</h4>
              <p>Are you sure you want to proceed?</p>
              <div className="sim-modal-actions">
                <button className="cat-btn" onClick={() => { setOpen(false); play('modalClose'); }}>Cancel</button>
                <button className="cat-btn primary" onClick={() => { setOpen(false); play('modalClose'); }}>Confirm</button>
              </div>
            </div>
          </div>
        )}
        <div className="cat-sim-center">
          <p className="cat-sim-hint">Open a modal dialog</p>
          <button className="cat-btn primary" onClick={() => { setOpen(true); play('modalOpen'); }}>Open modal</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Drawer ═══ */

function DrawerSim({ play }: { play: (k: SoundKey) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        {open && (
          <div className="cat-overlay" onClick={() => { setOpen(false); play('drawerClose'); }}>
            <div className="sim-drawer" onClick={(e) => e.stopPropagation()}>
              <h4>Navigation</h4>
              <div className="sim-drawer-links">
                <span>Dashboard</span>
                <span>Settings</span>
                <span>Profile</span>
                <span>Help</span>
              </div>
              <button className="cat-btn" onClick={() => { setOpen(false); play('drawerClose'); }}>Close</button>
            </div>
          </div>
        )}
        <div className="cat-sim-center">
          <p className="cat-sim-hint">Open a side drawer</p>
          <button className="cat-btn primary" onClick={() => { setOpen(true); play('drawerOpen'); }}>Open drawer</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Popover & Tooltip ═══ */

function PopoverTooltipSim({ play }: { play: (k: SoundKey) => void }) {
  const [popover, setPopover] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        <div className="cat-sim-center">
          <p className="cat-sim-hint">Click for popover, hover for tooltip</p>
          <div className="cat-sim-buttons">
            <div className="sim-anchor">
              <button className="cat-btn" onClick={() => { setPopover(!popover); play(popover ? 'popoverHide' : 'popoverShow'); }}>
                {popover ? 'Hide' : 'Show'} popover
              </button>
              {popover && <div className="sim-popover">Settings saved. You can close this.</div>}
            </div>
            <div className="sim-anchor">
              <button
                className="cat-btn"
                onMouseEnter={() => { setTooltip(true); play('tooltipShow'); }}
                onMouseLeave={() => setTooltip(false)}
              >
                Hover me
              </button>
              {tooltip && <div className="sim-tooltip">This is a helpful tip</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Navigation ═══ */

function NavigationSim({ play }: { play: (k: SoundKey) => void }) {
  const [tab, setTab] = useState(0);
  const [depth, setDepth] = useState(0);
  const tabs = ['Overview', 'Settings', 'Billing', 'Team'];
  const crumbs = ['Home', 'Products', 'Category', 'Detail'];

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        <div className="sim-nav-bar">
          {tabs.map((t, i) => (
            <button key={t} className={`sim-tab${tab === i ? ' active' : ''}`} onClick={() => { setTab(i); play('tabSwitch'); }}>
              {t}
            </button>
          ))}
        </div>
        <div className="sim-nav-crumbs">
          {crumbs.slice(0, depth + 1).map((c, i) => (
            <span key={c}>
              {i > 0 && <span className="sim-crumb-sep">/</span>}
              <button className="sim-crumb" onClick={() => { setDepth(i); play('breadcrumb'); }}>{c}</button>
            </span>
          ))}
        </div>
        <div className="sim-nav-body">
          <p>Page: {tabs[tab]}</p>
          <p>Depth: {crumbs[depth]}</p>
        </div>
        <div className="cat-sim-buttons" style={{ marginTop: 'auto' }}>
          <button className="cat-btn" onClick={() => { setDepth((d) => Math.max(0, d - 1)); play('pageBack'); }}>Back</button>
          <button className="cat-btn primary" onClick={() => { setDepth((d) => Math.min(crumbs.length - 1, d + 1)); play('pageForward'); }}>Forward</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Loading & Refresh ═══ */

function AsyncSim({ play }: { play: (k: SoundKey) => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleLoad = useCallback(() => {
    play('loadingStart');
    setLoading(true);
    setDone(false);
    setTimeout(() => { setLoading(false); setDone(true); play('loadingDone'); }, 1800);
  }, [play]);

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        <div className="cat-sim-center">
          <div className="sim-async-status">
            {loading && <span className="sim-spinner" />}
            {loading && <span>Loading data...</span>}
            {done && !loading && <span className="sim-done">\u2713 Data loaded</span>}
            {!loading && !done && <span className="sim-idle">Ready</span>}
          </div>
          <div className="cat-sim-buttons">
            <button className="cat-btn primary" onClick={handleLoad} disabled={loading}>Load data</button>
            <button className="cat-btn" onClick={() => play('refresh')}>Refresh</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Undo, Drag & Copy ═══ */

function ManipulationSim({ play }: { play: (k: SoundKey) => void }) {
  const [items, setItems] = useState(['Apple', 'Banana', 'Cherry', 'Date']);
  const [history, setHistory] = useState<string[][]>([]);
  const dragItem = useRef<number | null>(null);

  const saveHistory = () => setHistory((h) => [...h, [...items]]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    play('undo');
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setItems(prev);
  }, [history, play]);

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    play('dragStart');
  };

  const handleDrop = (idx: number) => {
    if (dragItem.current === null || dragItem.current === idx) return;
    saveHistory();
    play('drop');
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragItem.current!, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    dragItem.current = null;
  };

  return (
    <div className="cat-sim">
      <div className="cat-sim-stage">
        <div className="cat-sim-center">
          <p className="cat-sim-hint">Drag items to reorder. Undo to reverse.</p>
          <div className="sim-drag-list">
            {items.map((item, i) => (
              <div
                key={item}
                className="sim-drag-item"
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
              >
                <span className="sim-drag-handle">\u2261</span>
                {item}
              </div>
            ))}
          </div>
          <div className="cat-sim-buttons">
            <button className="cat-btn" onClick={handleUndo} disabled={history.length === 0}>Undo ({history.length})</button>
            <button className="cat-btn" onClick={() => play('copy')}>Copy list</button>
          </div>
        </div>
      </div>
    </div>
  );
}
