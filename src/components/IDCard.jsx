import React from 'react';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const IDCard = ({ side, formData, fieldLabels, selectedTemplate, signatures, instituteLogo, photo, cardRef, backTextColor }) => {
    const isFront = side === 'front';

    // Helper to split name for red accent (first part black, rest red as per image)
    const nameParts = formData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if (isFront) {
        return (
            <div className={`id-card ${selectedTemplate}`} ref={cardRef}>
                <div className="id-card-front text-white">
                    {/* Background Shapes */}
                    <div className="card-bg-layer">
                        {selectedTemplate === 'red-black-geo' ? (
                            <>
                                <div className="rbg-bg-navy-side"></div>
                                <div className="rbg-bg-red-blob"></div>
                                <div className="rbg-bg-accent-pill"></div>
                            </>
                        ) : selectedTemplate === 'geometric-blue' ? (
                            <>
                                <div className="geo-bg-navy-top"></div>
                                <div className="geo-bg-blue-top"></div>
                                <div className="geo-bg-overlay"></div>
                                <div className="geo-bg-accent-bottom"></div>
                            </>
                        ) : (
                            <>
                                <div className="front-bg-navy"></div>
                                <div className="front-bg-red"></div>
                                <div className="front-bg-accent"></div>
                                <div className="front-bg-strip"></div>
                            </>
                        )}
                    </div>

                    {/* Front Branding (Added as per request) */}
                    <div className="front-brand-area">
                        <div className="front-brand-logo">
                            <img src={instituteLogo} alt="Logo" className="front-logo-img" />
                        </div>
                        <div className="front-brand-name">{formData.instituteName}</div>
                        <div className="front-brand-address">{formData.instituteSub}</div>
                    </div>

                    {/* Circular Photo */}
                    <div className="photo-center-wrap">
                        <div className="mesh-container">
                            <div className="mesh-bg"></div>
                            {photo ? (
                                <img src={photo} alt="Student" className="mirror-photo" />
                            ) : (
                                <div className="mirror-photo" style={{ background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 900 }}>PHOTO</div>
                            )}
                        </div>
                    </div>

                    {/* Information */}
                    <div className="info-content">
                        <div className="mirror-name">
                            {firstName} <span>{lastName}</span>
                        </div>
                        <div className="mirror-role">
                            <div className="role-line"></div>
                            {formData.courseName}
                        </div>

                        {/* Front Signatures (Added as per request) */}
                        <div className="front-signature-row">
                            <div className="front-sig-box">
                                <div className="front-sig-display">
                                    {signatures.student && <img src={signatures.student} alt="Student" />}
                                </div>
                                <div className="front-sig-label">STUDENT SIGNATURE</div>
                            </div>
                            <div className="front-sig-box">
                                <div className="front-sig-display principal-sig-box">
                                    {signatures.principal && <img src={signatures.principal} alt="Principal" />}
                                </div>
                                <div className="front-sig-label">PRINCIPAL SIGNATURE</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`id-card ${selectedTemplate}`} ref={cardRef}>
            <div className="id-card-back">
                {/* Background Shapes */}
                <div className="card-bg-layer">
                    {selectedTemplate === 'red-black-geo' ? (
                        <>
                            <div className="rbg-bg-red-back-top"></div>
                            <div className="rbg-bg-red-back-bottom"></div>
                            <div className="rbg-bg-navy-back-mid"></div>
                        </>
                    ) : selectedTemplate === 'geometric-blue' ? (
                        <>
                            <div className="geo-bg-navy-back-top"></div>
                            <div className="geo-bg-blue-back-bottom"></div>
                            <div className="geo-bg-navy-back-bottom"></div>
                        </>
                    ) : (
                        <>
                            <div className="back-bg-red-top"></div>
                            <div className="back-bg-navy-top"></div>
                            <div className="back-bg-red-bottom"></div>
                            <div className="back-bg-accent-strip"></div>
                            <div className="back-bg-navy-bottom"></div>
                        </>
                    )}
                </div>

                {/* Branding */}
                <div className="back-brand-area">
                    <div className="back-brand-logo">
                        <img src={instituteLogo} alt="Logo" className="back-logo-img" />
                    </div>
                    <div className="back-brand-name">{formData.instituteName}</div>
                    <div className="back-brand-slogan">{formData.instituteSub}</div>
                </div>

                {/* Terms/Bullets (Now with specific student details) */}
                <div className="back-copy-list">
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">{fieldLabels.fatherName || 'Father Name'}:</span>
                            <span className="copy-val">{formData.fatherName}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">{fieldLabels.cnic || 'CNIC Number'}:</span>
                            <span className="copy-val">{formData.cnic}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">{fieldLabels.bloodGroup || 'Blood Group'}:</span>
                            <span className="copy-val">{formData.bloodGroup}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">DATE OF BIRTH:</span>
                            <span className="copy-val">{formData.dob || 'MM/DD/YY'}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">RESIDENTIAL ADDRESS:</span>
                            <span className="copy-val">{formData.address}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">IDENTIFICATION MARK:</span>
                            <span className="copy-val">{formData.markOfId}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">CONTACT CELL:</span>
                            <span className="copy-val">{formData.cell}</span>
                        </div>
                    </div>
                    <div className="copy-item">
                        <div className="copy-bullet"></div>
                        <div className="copy-text">
                            <span className="copy-label">EMAIL ADDRESS:</span>
                            <span className="copy-val">{formData.email}</span>
                        </div>
                    </div>
                </div>

                {/* Signature Removed from back as per request */}
            </div>
        </div>
    );
};

export default IDCard;
