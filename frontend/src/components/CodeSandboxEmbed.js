import React, { useState, useMemo } from "react";
import { 
  FiCode, FiExternalLink, FiPlay, FiMonitor, FiZap, 
  FiRefreshCw, FiChevronDown, FiSettings, FiLayers,
  FiStar, FiClock, FiCheck
} from "react-icons/fi";
import "./CodeSandboxEmbed.css";

export default function CodeSandboxEmbed({
  template = "react",
  title = "CodeSandbox Playground"
}) {
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(template);
  
  const url = useMemo(() => {
    const params = new URLSearchParams({
      template: selectedTemplate,
      view: "editor",
      fontsize: "14",
      hidenavigation: "1",
      autoresize: "1",
      theme: "light",
      codemirror: "1"
    }).toString();
    return `https://codesandbox.io/embed/new?${params}`;
  }, [selectedTemplate]);

  const [key, setKey] = useState(0);
  
  const changeTemplate = (e) => {
    setLoading(true);
    setSelectedTemplate(e.target.value);
    setKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const templateOptions = [
    { value: "react", label: "React", icon: "⚛️", gradient: "linear-gradient(135deg, #61DAFB, #21CBF3)" },
    { value: "react-ts", label: "React + TypeScript", icon: "🔷", gradient: "linear-gradient(135deg, #3178C6, #235A97)" },
    { value: "vanilla", label: "Vanilla JavaScript", icon: "🟨", gradient: "linear-gradient(135deg, #F7DF1E, #E6CC1A)" },
    { value: "vanilla-ts", label: "Vanilla TypeScript", icon: "🔵", gradient: "linear-gradient(135deg, #3178C6, #235A97)" },
    { value: "node", label: "Node.js", icon: "🟢", gradient: "linear-gradient(135deg, #339933, #26732A)" },
    { value: "vue", label: "Vue 3", icon: "💚", gradient: "linear-gradient(135deg, #4FC08D, #42A874)" },
    { value: "svelte", label: "Svelte", icon: "🧡", gradient: "linear-gradient(135deg, #FF3E00, #CC3200)" },
    { value: "angular", label: "Angular", icon: "🔴", gradient: "linear-gradient(135deg, #DD0031, #B10026)" },
    { value: "nextjs", label: "Next.js", icon: "⚫", gradient: "linear-gradient(135deg, #000000, #333333)" },
  ];

  const getCurrentTemplate = () => {
    return templateOptions.find(opt => opt.value === selectedTemplate) || templateOptions[0];
  };

  return (
    <div className="luxury-codesandbox-wrapper">
      <div className="lcsb-container">
        
        {/* Luxury Header */}
        <div className="lcsb-header">
          <div className="lcsb-header-glow"></div>
          <div className="lcsb-header-content">
            
            {/* Brand Section */}
            <div className="lcsb-brand-section">
              <div className="lcsb-brand-icon">
                <FiCode className="lcsb-brand-icon-svg" />
                <div className="lcsb-brand-icon-glow"></div>
              </div>
              <div className="lcsb-brand-content">
                <h2 className="lcsb-title">{title}</h2>
                <p className="lcsb-subtitle">Premium Development Environment</p>
              </div>
            </div>

            {/* Controls Section */}
            <div className="lcsb-controls-section">
              
              {/* Template Selector */}
              <div className="lcsb-selector-container">
                <div className="lcsb-selector-header">
                  <FiLayers className="lcsb-selector-icon" />
                  <span className="lcsb-selector-label">Framework</span>
                </div>
                
                <div className="lcsb-luxury-dropdown">
                  <div className="lcsb-dropdown-display">
                    <div className="lcsb-template-preview">
                      <span className="lcsb-template-emoji">{getCurrentTemplate().icon}</span>
                      <div 
                        className="lcsb-template-indicator"
                        style={{ background: getCurrentTemplate().gradient }}
                      ></div>
                    </div>
                    <div className="lcsb-template-info">
                      <span className="lcsb-template-name">{getCurrentTemplate().label}</span>
                      <span className="lcsb-template-type">Framework</span>
                    </div>
                    <FiChevronDown className="lcsb-dropdown-chevron" />
                  </div>
                  
                  <select 
                    className="lcsb-hidden-select"
                    value={selectedTemplate} 
                    onChange={changeTemplate}
                  >
                    {templateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lcsb-actions-container">
                <button 
                  className="lcsb-action-btn lcsb-refresh-btn"
                  onClick={() => {
                    setLoading(true);
                    setKey(k => k + 1);
                  }}
                  title="Refresh Environment"
                >
                  <FiRefreshCw className="lcsb-btn-icon" />
                  <div className="lcsb-btn-glow"></div>
                </button>
                
                <a
                  href={url.replace("/embed/", "/")}
                  target="_blank"
                  rel="noreferrer"
                  className="lcsb-action-btn lcsb-primary-btn"
                  title="Open in New Tab"
                >
                  <FiExternalLink className="lcsb-btn-icon" />
                  <span className="lcsb-btn-text">Open Fullscreen</span>
                  <div className="lcsb-btn-glow"></div>
                </a>
              </div>
              
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="lcsb-status-bar">
          <div className="lcsb-status-content">
            <div className="lcsb-status-left">
              <div className="lcsb-status-indicator">
                <div className={`lcsb-status-dot ${loading ? 'loading' : 'ready'}`}>
                  <div className="lcsb-status-dot-inner"></div>
                </div>
                <div className="lcsb-status-info">
                  <span className="lcsb-status-text">
                    {loading ? 'Initializing Environment' : 'Development Ready'}
                  </span>
                  <span className="lcsb-status-subtext">
                    {loading ? 'Please wait...' : 'Ready to code'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="lcsb-status-right">
              <div className="lcsb-environment-badge">
                <div 
                  className="lcsb-env-indicator"
                  style={{ background: getCurrentTemplate().gradient }}
                ></div>
                <div className="lcsb-env-details">
                  <span className="lcsb-env-name">{getCurrentTemplate().label}</span>
                  <div className="lcsb-env-features">
                    <span className="lcsb-feature-tag">
                      <FiZap className="lcsb-feature-icon" />
                      Live
                    </span>
                    <span className="lcsb-feature-tag">
                      <FiCheck className="lcsb-feature-icon" />
                      Auto-Save
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Environment */}
        <div className="lcsb-environment">
          {loading && (
            <div className="lcsb-loading-overlay">
              <div className="lcsb-loading-container">
                <div className="lcsb-loading-animation">
                  <div className="lcsb-loader-ring"></div>
                  <div className="lcsb-loader-ring"></div>
                  <div className="lcsb-loader-ring"></div>
                  <div className="lcsb-loader-core">
                    <FiCode className="lcsb-loader-icon" />
                  </div>
                </div>
                
                <div className="lcsb-loading-content">
                  <h3 className="lcsb-loading-title">Setting up {getCurrentTemplate().label}</h3>
                  <p className="lcsb-loading-description">
                    Preparing your premium development environment with all dependencies...
                  </p>
                  
                  <div className="lcsb-loading-progress">
                    <div className="lcsb-progress-track">
                      <div className="lcsb-progress-fill"></div>
                    </div>
                    <span className="lcsb-progress-text">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <iframe
            key={key}
            src={url}
            title="codesandbox"
            className="lcsb-iframe"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            onLoad={handleIframeLoad}
          />
        </div>

        {/* Premium Footer */}
        <div className="lcsb-footer">
          <div className="lcsb-footer-content">
            <div className="lcsb-footer-left">
              <div className="lcsb-powered-by">
                <span className="lcsb-powered-text">Powered by</span>
                <a 
                  href="https://codesandbox.io" 
                  target="_blank" 
                  rel="noreferrer"
                  className="lcsb-powered-link"
                >
                  CodeSandbox
                </a>
                <div className="lcsb-premium-badge">
                  <FiStar className="lcsb-premium-icon" />
                  <span>Premium</span>
                </div>
              </div>
            </div>
            
            <div className="lcsb-footer-right">
              <div className="lcsb-capabilities">
                <div className="lcsb-capability-item">
                  <FiZap className="lcsb-capability-icon" />
                  <span>Live Preview</span>
                </div>
                <div className="lcsb-capability-item">
                  <FiPlay className="lcsb-capability-icon" />
                  <span>Hot Reload</span>
                </div>
                <div className="lcsb-capability-item">
                  <FiMonitor className="lcsb-capability-icon" />
                  <span>Multi-Device</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
