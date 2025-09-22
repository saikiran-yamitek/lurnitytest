import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import "../Certificates.css";
import {
  FiArrowLeft,
  FiDownload,
  FiLinkedin
} from "react-icons/fi";
const API = process.env.REACT_APP_API_URL;

const AdminCertificatesView = () => {
  const { userId } = useParams();
  const [certificates, setCertificates] = useState([]);
  const hist = useHistory();

  useEffect(() => {
    fetch(`${API}/api/certificates/user/${userId}`)
      .then((res) => res.json())
      .then(setCertificates)
      .catch((err) => console.error("Failed to load certificates:", err));
  }, [userId]);

  const handleDownload = (certId, title) => {
    fetch(`${API}/api/certificates/${certId}/pdf`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title}_Certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => alert("Download failed: " + err.message));
  };

  return (
    <div className="page-wrapper">
      <main className="cert-main">
        <header className="cert-header">
          <h2>🎓 User Certificates</h2>
        </header>

        {certificates.length === 0 ? (
          <p className="cert-empty">No certificates found.</p>
        ) : (
          <div className="cert-grid">
            {certificates.map((cert) => (
              <div className="cert-card" key={cert.id}>
                <h3>{cert.subCourseTitle}</h3>
                <p><strong>Issued on:</strong> {new Date(cert.issueDate).toLocaleDateString()}</p>
                <div className="cert-actions">
                  <button
                    className="cert-link"
                    onClick={() => hist.push(`/certificate/view/${cert.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="cert-download"
                    onClick={() => handleDownload(cert.id, cert.subCourseTitle)}
                  >
                    <FiDownload /> Download
                  </button>
                  <button
                    className="cert-linkedin"
                    onClick={() => alert("Coming soon: LinkedIn integration!")}
                  >
                    <FiLinkedin /> Add to LinkedIn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="cert-back-btn" onClick={() => hist.goBack()}>
          <FiArrowLeft size={18} /> Back to Users
        </button>
      </main>
    </div>
  );
};

export default AdminCertificatesView;
