import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { toPng } from 'html-to-image';
import { Download, Upload, Trash2, PenTool, User, CheckCircle, Sparkles, QrCode, Menu, X, Printer, Shield, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getDominantColor, adjustColorBrightness, getContrastColor } from './utils/colorUtils';
import IDCard from './components/IDCard';

// Local assets
import instLogo from './assets/logo.png';
import defPrincipalSig from './assets/def_principal_sig.png';

const App = () => {
  // --- State ---
  const [formData, setFormData] = useState({
    instituteName: 'PARA MEDICAL INSTITUTE',
    instituteSub: 'SUKKUR @ ROHRI',
    name: 'Muhammad Esa',
    fatherName: 'Khuda Dino',
    cnic: '45502-3342792-5',
    bloodGroup: 'B+Ve',
    dob: '15/10/2004',
    address: 'Rohri, Sukkur, Sindh',
    markOfId: 'Mole on right hand',
    cell: '0300-1234567',
    courseName: 'DIPLOMA IN REHABILITATION SCIENCES',
    email: 'muhammad.esa@example.com'
  });

  const [isPrintMode, setIsPrintMode] = useState(false);

  const [fieldLabels, setFieldLabels] = useState({
    name: 'Student Name',
    fatherName: 'Father Name',
    cnic: 'CNIC Number',
    bloodGroup: 'Blood Group',
    course: 'Course Name',
    id: 'ID Number'
  });

  const [photo, setPhoto] = useState(null);
  const [instituteLogo, setInstituteLogo] = useState(instLogo);
  const [brandColors, setBrandColors] = useState(null); // { primary: '#...', secondary: '#...' }
  const [signatures, setSignatures] = useState({
    student: null,
    principal: defPrincipalSig
  });
  const [selectedTemplate, setSelectedTemplate] = useState('geometric-blue');
  const [backTextColor, setBackTextColor] = useState('#000000');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeSig, setActiveSig] = useState(null); // 'student' or 'principal'

  // --- Persistence Logic ---
  useEffect(() => {
    const savedData = localStorage.getItem('id_generator_data');
    if (savedData) {
      try {
        const { formData: savedForm, fieldLabels: savedLabels, selectedTemplate: savedTemplate } = JSON.parse(savedData);
        if (savedForm) setFormData(savedForm);
        if (savedLabels) setFieldLabels(savedLabels);
        if (savedTemplate) setSelectedTemplate(savedTemplate);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = JSON.stringify({ formData, fieldLabels, selectedTemplate });
    localStorage.setItem('id_generator_data', dataToSave);
  }, [formData, fieldLabels, selectedTemplate]);

  // --- Refs ---
  const sigPadRef = useRef(null);
  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    // Priority 1: brandColors from "Magic Match"
    if (brandColors && brandColors.primary) {
      setBackTextColor(brandColors.primary);
      return;
    }

    // Priority 2: Template Default Colors
    const templateColorMap = {
      'butterfly': '#16a34a',
      'gradient': '#7c3aed',
      'corporate': '#374151',
      'minimalist': '#1f2937',
      'green': '#047857',
      'wave-red-blue': '#001f3f',
      'tech': '#4ade80',
      'creative': '#16a34a',
      'medical': '#16a34a'
    };

    const newColor = templateColorMap[selectedTemplate] || '#000000';
    setBackTextColor(newColor);
  }, [selectedTemplate, brandColors]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLabelChange = (e) => {
    const { name, value } = e.target;
    setFieldLabels(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInstituteLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAutoMatchColors = async () => {
    if (!instituteLogo) return;
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = instituteLogo;
      img.onload = async () => {
        const primary = await getDominantColor(img);
        const secondary = adjustColorBrightness(primary, 40); // Lighter variation
        const accent = adjustColorBrightness(primary, 80); // Very light
        const accentDark = adjustColorBrightness(primary, -20); // Darker
        const contrastText = getContrastColor(primary);
        setBrandColors({ primary, secondary, accent, accentDark, contrastText });
        alert(`Colors Matched! Primary: ${primary}`);
      };
      img.onerror = (e) => {
        console.error("Image loading failed for color extraction", e);
        alert("Could not load image for color extraction. Try a different logo.");
      };
    } catch (e) {
      console.error("Color match failed", e);
      alert("Could not extract colors. Try a different logo.");
    }
  };

  const handleSaveSignature = () => {
    const pad = sigPadRef.current;
    if (!pad) {
      console.error("Signature pad not found");
      return;
    }

    if (pad.isEmpty()) {
      alert("Please draw a signature before saving.");
      return;
    }

    try {
      // Attempt to get trimmed version first
      let signatureData;
      try {
        signatureData = pad.getTrimmedCanvas().toDataURL('image/png');
      } catch (trimError) {
        console.warn("Trimming failed, falling back to full canvas", trimError);
        signatureData = pad.getCanvas().toDataURL('image/png');
      }

      if (!signatureData) throw new Error("Could not generate image data");

      setSignatures(prev => ({
        ...prev,
        [activeSig]: signatureData
      }));

      setActiveSig(null);
      console.log(`Success: Saved signature for ${activeSig}`);
    } catch (error) {
      console.error("Signature process error:", error);
      alert("Sorry, there was a technical error saving your signature. Please try again or refresh the page.");
    }
  };

  const handleAutoSign = () => {
    if (activeSig === 'principal') {
      setSignatures(prev => ({ ...prev, principal: defPrincipalSig }));
      setActiveSig(null);
    } else {
      alert("Auto-sign is currently only available for Principal.");
    }
  };

  const handleDownload = async (side) => {
    const ref = side === 'front' ? cardFrontRef : cardBackRef;
    if (!ref.current) return;

    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `ID_CARD_${side.toUpperCase()}_${formData.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(`Error downloading ${side} card:`, error);
      alert(`Could not download ${side} view. Check console for details.`);
    }
  };

  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear the entire form? This will remove the student photo, signature, and all personal details.")) {
      setFormData(prev => ({
        ...prev,
        name: '',
        fatherName: '',
        cnic: '',
        bloodGroup: '',
        dob: '',
        address: '',
        markOfId: '',
        cell: '',
        courseName: '',
        email: ''
      }));
      setPhoto(null);
      setSignatures(prev => ({ ...prev, student: null }));
      setActiveSig(null);
    }
  };


  return (
    <div className="app-main" style={brandColors ? {
      '--primary': brandColors.primary,
      '--secondary': brandColors.secondary,
      '--wave-primary': brandColors.primary,
      '--wave-secondary': 'white',
      '--contrast-text': brandColors.contrastText || 'white'
    } : {}}>
      <header style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1.5px', padding: '0 40px' }}>
          Identity Management System
        </h1>
        <p style={{ color: 'var(--secondary)', fontSize: '1.2rem', fontWeight: 600 }}>
          Professional Winged ID Designer
        </p>

        <div className="header-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button
            className={`btn ${isPrintMode ? 'btn-danger' : 'btn-primary'}`}
            style={{ padding: '8px 25px', fontSize: '0.9rem' }}
            onClick={() => setIsPrintMode(!isPrintMode)}
          >
            {isPrintMode ? "Close Print View" : "A4 Print Preview"}
          </button>
          {!isPrintMode && (
            <button className="btn btn-secondary desktop-only" style={{ padding: '8px 25px', fontSize: '0.9rem' }} onClick={() => window.print()}>
              Quick Print
            </button>
          )}
        </div>
      </header>

      <div className={`app-container ${isMenuOpen ? 'menu-open' : ''}`}>
        {/* Mobile Backdrop */}
        {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>}

        {/* 1. Form Section */}
        <div className={`form-section ${isMenuOpen ? 'active' : ''}`}>
          <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2>Institute & Student Profile</h2>
            <button
              onClick={handleClearForm}
              className="btn btn-danger"
              style={{ padding: '8px 15px', fontSize: '0.85rem', background: '#fee2e2', color: '#ef4444' }}
              title="Clear all student data"
            >
              <RotateCcw size={16} style={{ marginRight: '5px' }} /> Clear Form
            </button>
          </div>

          {/* Template Selection Section (Ultra Visible) */}
          <div className="form-group" style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '20px',
            borderRadius: '16px',
            border: '2px solid var(--primary)',
            marginBottom: '25px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <label style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 800, marginBottom: '15px' }}>
              <Sparkles size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              CHOOSE YOUR DESIGN
            </label>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '2px solid var(--primary)',
                  background: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <option value="butterfly">🦋 Butterfly Wings (Classic)</option>
                <option value="geometric-blue">🔷 Geometric Blue (Premium)</option>
                <option value="red-black-geo">🎯 Red & Black Geometric (Latest)</option>
                <option value="gradient">🌈 Gradient Design</option>
                <option value="corporate">🏢 Corporate Suite</option>
                <option value="minimalist">◽ Minimalist Modern</option>
                <option value="green">🌿 Classic Green</option>
                <option value="wave-red-blue">🌊 Red & Blue Wave</option>
                <option value="tech">💻 Tech Matrix</option>
                <option value="creative">🎨 Creative Studio</option>
                <option value="medical">🏥 Medical Professional</option>
              </select>
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '10px', color: '#64748b', fontWeight: 500 }}>
              💡 Switch designs anytime—your data will stay safe!
            </p>
          </div>

          <div className="form-group" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
            <label style={{ color: 'var(--primary)' }}>Institute Branding</label>
            <div className="form-group">
              <label>Institute Name</label>
              <input type="text" name="instituteName" value={formData.instituteName} onChange={handleInputChange} placeholder="E.g. CITY HOSPITAL" />
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Subtitle / Address</label>
              <input type="text" name="instituteSub" value={formData.instituteSub} onChange={handleInputChange} placeholder="E.g. MAIN BRANCH" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="file" id="logo-upload" hidden onChange={handleLogoUpload} accept="image/*" />
              <label htmlFor="logo-upload" className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', borderStyle: 'dashed' }}>
                <Upload size={16} /> Upload Logo
              </label>
              <button className="btn" style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none' }} onClick={handleAutoMatchColors}>
                <Sparkles size={16} /> Auto-Match Colors
              </button>
            </div>
          </div>

        </div>

        {/* Personal Information Section */}
        <div className="form-group" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
          <label style={{ color: 'var(--primary)', marginBottom: '15px', display: 'block' }}>👤 Personal Information</label>

          <div className="form-group">
            <label>Student Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>CNIC Number</label>
              <input type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Blood Group</label>
              <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="text" name="dob" value={formData.dob} onChange={handleInputChange} />
            </div>
          </div>

          <hr style={{ margin: '20px 0', borderTop: '1px dashed #cbd5e1' }} />

          <label style={{ color: 'var(--primary)', marginBottom: '15px', display: 'block' }}>📍 Contact Information</label>

          <div className="form-group">
            <label>Residential Address</label>
            <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange}></textarea>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Mark of Identification</label>
              <input type="text" name="markOfId" value={formData.markOfId} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Contact Cell</label>
              <input type="text" name="cell" value={formData.cell} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" />
          </div>

          <hr style={{ margin: '20px 0', borderTop: '1px dashed #cbd5e1' }} />

          <label style={{ color: 'var(--primary)', marginBottom: '15px', display: 'block' }}>🎓 Academic Information</label>

          <div className="form-group">
            <label>Official Course / Role Name</label>
            <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} />
          </div>

          <hr style={{ margin: '20px 0', borderTop: '1px dashed #cbd5e1' }} />

          <label style={{ color: 'var(--primary)', marginBottom: '15px', display: 'block' }}>🛡️ Authentication & Assets</label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <input type="file" id="photo-upload" hidden onChange={handlePhotoUpload} accept="image/*" />
              <label htmlFor="photo-upload" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                <Upload size={16} /> Photo
              </label>
            </div>
            <button
              className="btn"
              style={{
                flex: 1,
                background: signatures.student ? 'var(--accent)' : '#f1f5f9',
                color: signatures.student ? 'var(--primary)' : 'var(--marker)',
                border: signatures.student ? '2px solid var(--secondary)' : '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.85rem'
              }}
              onClick={() => setActiveSig('student')}
            >
              {signatures.student ? <CheckCircle size={16} /> : <PenTool size={16} />}
              {signatures.student ? `Signed` : `Sign Student`}
            </button>
            <button
              className="btn"
              style={{
                flex: 1,
                background: signatures.principal ? 'var(--accent)' : '#f1f5f9',
                color: signatures.principal ? 'var(--primary)' : 'var(--marker)',
                border: signatures.principal ? '2px solid var(--secondary)' : '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.85rem'
              }}
              onClick={() => setActiveSig('principal')}
            >
              {signatures.principal ? <CheckCircle size={16} /> : <PenTool size={16} />}
              {signatures.principal ? `Signed` : `Sign Principal`}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Preview & Print Section */}
      <div className={`preview-section ${isPrintMode ? 'print-mode-active' : ''}`}>

        {isPrintMode ? (
          <div className="a4-print-sheet">
            <div className="print-instructions">
              <h3>🖨️ A4 Print View</h3>
              <p>Press <strong>Ctrl + P</strong> to print. Ensure layout is <strong>Portrait</strong> and <strong>Background Graphics</strong> are ON.</p>
            </div>
            <div className="print-grid">
              {[1, 2].map((i) => (
                <React.Fragment key={i}>
                  <div className="print-item">
                    <IDCard side="front" {...{ formData, fieldLabels, selectedTemplate, signatures, instituteLogo, photo }} />
                  </div>
                  <div className="print-item">
                    <IDCard side="back" {...{ formData, fieldLabels, selectedTemplate, signatures, instituteLogo, photo, backTextColor }} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="preview-container">
            <div className="id-card-wrapper">
              <IDCard side="front" cardRef={cardFrontRef} {...{ formData, fieldLabels, selectedTemplate, signatures, instituteLogo, photo }} />
              <button className="btn btn-primary download-btn" onClick={() => handleDownload('front')}>
                <Download size={18} /> FRONT VIEW
              </button>
            </div>
            <div className="id-card-wrapper">
              <IDCard side="back" cardRef={cardBackRef} {...{ formData, fieldLabels, selectedTemplate, signatures, instituteLogo, photo, backTextColor }} />
              <button className="btn btn-primary download-btn" onClick={() => handleDownload('back')}>
                <Download size={18} /> BACK VIEW
              </button>
            </div>
          </div>
        )}
      </div>

      {activeSig && (
        <div className="sig-pad-overlay">
          <div className="sig-pad-container">
            <h3>Secure Signing: {activeSig.toUpperCase()}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              Please sign inside the box below using your mouse or touch screen.
            </p>
            <div className="sig-pad-canvas-wrapper">
              <SignatureCanvas
                ref={sigPadRef}
                penColor="#000000"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'sigCanvas',
                  style: { background: '#ffffff', cursor: 'crosshair' }
                }}
              />
            </div>
            <div className="sig-actions">
              <button className="btn btn-primary" onClick={handleSaveSignature}>
                <CheckCircle size={18} /> Save Signature
              </button>
              {activeSig === 'principal' && (
                <button
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none' }}
                  onClick={handleAutoSign}
                >
                  <Sparkles size={18} /> Use Default Signature
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => sigPadRef.current?.clear()}>
                <Trash2 size={18} /> Clear
              </button>
              <button
                className="btn btn-danger"
                style={{ background: '#fee2e2', color: '#ef4444' }}
                onClick={() => setActiveSig(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Sticky Action Bar */}
      {!isPrintMode && (
        <div className="mobile-action-bar">
          <button className="action-btn" onClick={() => handleDownload('front')}>
            <Download size={20} />
            <span>Front</span>
          </button>
          <button className="action-btn" onClick={() => handleDownload('back')}>
            <Download size={20} />
            <span>Back</span>
          </button>
          <button className="action-btn print" onClick={() => window.print()}>
            <Printer size={20} />
            <span>Print</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
