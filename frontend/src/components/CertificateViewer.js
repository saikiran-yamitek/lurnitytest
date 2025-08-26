import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./CertificateViewer.css";
import certificateBg from "../assets/certificate-bg.png";
import sign1 from "../assets/signature.png";
import sign2 from "../assets/signature2.png";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const API = process.env.REACT_APP_API_URL;
const CertificateViewer = () => {
  const { certId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const certRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/certificates/${certId}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then(setCertificate)
      .catch(console.error);
  }, [certId]);

  const handleDownload = async () => {
    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${certificate.subCourseTitle}_Certificate.pdf`);
  };

  if (!certificate)
    return <div className="loading">🎓 Loading your certificate...</div>;

  return (
    <div className="cert-view-container">
      <div className="cert-wrapper" ref={certRef}>
        <img src={certificateBg} alt="Certificate Background" className="cert-bg" />

        <div className="cert-content">
          <h1 className="cert-title">
            CERTIFICATE<br /><span className="pop">OF COMPLETION</span>
          </h1>

          <p className="cert-subline">Proudly presented to</p>
          <h2 className="cert-name">{certificate.userName}</h2>

          <p className="cert-description">For successfully completing the course</p>
          <h3 className="cert-course">{certificate.subCourseTitle}</h3>

          <p className="cert-date">
            Issued on -: {new Date(certificate.issueDate).toLocaleDateString()}
          </p>

          <div className="cert-signatures">
            <div className="sign-block">
              <img src={sign2} alt="Sign1" />
              <p><strong>ARUN GUNJARI</strong><br />CEO, LURNITY</p>
            </div>
            <div className="sign-block">
              <img src={sign1} alt="Sign2" />
              <p><strong>PRUDHVI RAJ A</strong><br />CEO, LURNITY</p>
            </div>
          </div>
        </div>
      </div>

      <button className="cert-download-btn" onClick={handleDownload}>
        Download as PDF
      </button>
    </div>
  );
};

export default CertificateViewer;
