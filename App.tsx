import { useState, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ELEMENTS } from './data/elements';
import { INTERACTION_GROUPS } from './data/categories';
import { type ProfileName } from './lib/sounds';
import { ContentPage } from './components/ContentPage';
import { DemoPage } from './components/DemoPage';
import { ElementDetail } from './components/ElementDetail';
import { CategoryDetail } from './components/CategoryDetail';
import './App.scss';

export default function App() {
  const [profileName, setProfileName] = useState<ProfileName>('default');

  const handleProfileChange = useCallback((name: ProfileName) => {
    setProfileName(name);
  }, []);

  return (
    <div className="app-layout">
      <nav className="left-nav">
        <div className="nav-section">
          <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Get Started</NavLink>
          <NavLink to="/demo" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Demo</NavLink>
        </div>

        <hr className="nav-divider" />

        <div className="nav-section">
          <span className="nav-heading">HTML Elements</span>
          {ELEMENTS.map((el) => (
            <NavLink
              key={el.id}
              to={`/element/${el.id}`}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {el.label}
            </NavLink>
          ))}
        </div>

        {INTERACTION_GROUPS.map((group) => (
          <div key={group.heading}>
            <hr className="nav-divider" />
            <div className="nav-section">
              <span className="nav-heading">{group.heading}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/interaction/${item.id}`}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <main className="center-main">
        <Routes>
          <Route path="/about" element={<ContentPage profileName={profileName} />} />
          <Route path="/get-started" element={<Navigate to="/about" replace />} />
          <Route path="/demo" element={<DemoPage profileName={profileName} />} />
          <Route path="/element/:elementId" element={
            <ElementDetail profileName={profileName} onProfileChange={handleProfileChange} />
          } />
          <Route path="/interaction/:interactionId" element={
            <CategoryDetail profileName={profileName} onProfileChange={handleProfileChange} />
          } />
          <Route path="*" element={<Navigate to={`/element/${ELEMENTS[0].id}`} replace />} />
        </Routes>
      </main>
    </div>
  );
}
