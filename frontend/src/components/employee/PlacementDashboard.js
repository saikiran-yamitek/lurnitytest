import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/LURNITY.jpg";
import { FiUser, FiLogOut, FiUsers, FiCalendar, FiX, FiPlus, FiList } from "react-icons/fi";
import { listPlacements, createPlacementDrive, getStudentsForDrive, deletePlacementDrive } from "../../services/placementApi";
import "./PlacementDashboard.css"

export default function PlacementDashboard() {
  const [form, setForm] = useState({});
  const [popup, setPopup] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [driveToDelete, setDriveToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: "", about: "", website: "", linkedin: "" });
  const [scheduledDrives, setScheduledDrives] = useState([]);
  const [completedDrives, setCompletedDrives] = useState([]);
  const [rankings, setRankings] = useState([]);
const [rankingSortBy, setRankingSortBy] = useState("lab");
const [searchTerm, setSearchTerm] = useState("");
  
  const emp = JSON.parse(localStorage.getItem("empInfo"));
  const history = useHistory();

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
  };

  useEffect(() => {
  if (activeTab === "rankings") {
    fetchRankings(rankingSortBy);
  }
}, [activeTab, rankingSortBy]);


  useEffect(() => {
  if (!emp || !emp.id) {
    alert("Session expired. Please login again.");
    history.replace("/employee/login");
    return;
  }
  fetchDrives();
  fetchCompanies();
}, [emp, history]);


  const fetchDrives = async () => {
    const all = await listPlacements();
    setScheduledDrives(all.filter((d) => d.status === 'SCHEDULED'));
    setCompletedDrives(all.filter((d) => d.status === 'COMPLETED'));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    try {
      const payload = { ...form, createdBy: emp.id };

      if (form._id) {
        await fetch(`/api/placements/${form._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setPopup("✅ Drive Updated");
      } else {
        await createPlacementDrive(payload);
        setPopup("✅ Drive Created");
      }

      setForm({});
      fetchDrives();
      setActiveTab("scheduled");
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      alert("❌ Failed to save drive");
      console.error(err);
    }
  };

  const handleViewStudents = async (driveId) => {
    try {
      const data = await getStudentsForDrive(driveId);
      setStudents(data);
      setSelectedDrive(driveId);
      setShowStudentPopup(true);
      console.log(data)
    } catch (err) {
      alert("❌ Failed to fetch students");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlacementDrive(driveToDelete);
      setPopup("🗑️ Drive deleted");
      fetchDrives();
      setDriveToDelete(null);
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      alert("❌ Failed to delete drive");
      console.error(err);
    }
  };

  const handleEditDrive = (drive) => {
    setForm({
      ...drive,
      lastDateToApply: drive.lastDateToApply?.split("T")[0],
      driveDate: drive.driveDate?.split("T")[0],
    });
    setActiveTab("create");
  };

  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };
  const fetchRankings = async (sortBy = "lab") => {
  const res = await fetch(`/api/rankings?sortBy=${sortBy}`);
  const data = await res.json();
  setRankings(data);
};

  return (
    <div className="placement-dashboard cm-shell">
      <header className="cm-header shadow-sm">
        <img src={logo} alt="Lurnity" className="cm-logo" />
        <h3 className="cm-title flex-grow-1">Placement Cell Dashboard</h3>
        <div className="d-flex align-items-center gap-3">
          <div className="cm-avatar"><FiUser size={20} /></div>
          <span className="cm-user">{emp.name}</span>
          <button className="cm-logout btn btn-outline-light btn-sm" onClick={doLogout}><FiLogOut /></button>
        </div>
      </header>

      <div className="placement-dashboard__tabs">
        <button className={`placement-dashboard__tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          <FiPlus className="me-2" /> Create Drive
        </button>
        <button className={`placement-dashboard__tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`} onClick={() => setActiveTab('scheduled')}>
          <FiList className="me-2" /> Scheduled Drives
        </button>
        <button className={`placement-dashboard__tab-btn ${activeTab === 'companies' ? 'active' : ''}`} onClick={() => setActiveTab('companies')}>
          <FiList className="me-2" /> Companies
        </button>
        <button className={`placement-dashboard__tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          <FiList className="me-2" /> Completed Drives
        </button>
        <button
  className={`placement-dashboard__tab-btn ${activeTab === 'rankings' ? 'active' : ''}`}
  onClick={() => setActiveTab('rankings')}
>
  <FiList className="me-2" /> Rankings
</button>
      </div>

      <main className="placement-dashboard__main container py-4">
        {activeTab === 'create' && (
          <div className="placement-dashboard__create-drive">
            <h4 className="fw-semibold mb-4">Create New Placement Drive</h4>
            <div className="row g-3 mb-5">
              <div className="col-md-4">
                <select className="form-control" onChange={(e) => {
                  const selected = companies.find(c => c._id === e.target.value);
                  if (!selected) return;
                  setForm({
                    ...form,
                    companyId: selected._id,
                    company: selected.name,
                    aboutCompany: selected.about,
                    companyWebsite: selected.website,
                    companyLinkedin: selected.linkedin
                  });
                }}>
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <input className="form-control" name="role" placeholder="Role" value={form.role || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input className="form-control" type="number" name="seats" placeholder="No. of Positions" value={form.seats || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input className="form-control" name="ctc" placeholder="CTC" value={form.ctc || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input className="form-control" name="serviceAgreement" placeholder="Service Agreement" value={form.serviceAgreement || ""} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Last Date to Apply</label>
                <input
                  className="form-control"
                  type="date"
                  name="lastDateToApply"
                  value={form.lastDateToApply || ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Drive Date</label>
                <input
                  className="form-control"
                  type="date"
                  name="driveDate"
                  value={form.driveDate || ""}
                  min={
                    form.lastDateToApply
                      ? new Date(new Date(form.lastDateToApply).getTime() + 86400000)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <textarea className="form-control" name="eligibilityCriteria" placeholder="Eligibility Criteria" value={form.eligibilityCriteria || ""} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6">
                <textarea className="form-control" name="note" placeholder="Note (Optional)" value={form.note || ""} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-4">
                <input className="form-control" name="jobLocation" placeholder="Job Location" value={form.jobLocation || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input className="form-control" name="skillsRequired" placeholder="Skills Required (comma-separated)" value={form.skillsRequired || ""} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <input className="form-control" name="aboutCompany" placeholder="About Company" value={form.aboutCompany || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <input className="form-control" name="companyWebsite" placeholder="Company Website Link" value={form.companyWebsite || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <input className="form-control" name="companyLinkedin" placeholder="Company LinkedIn Profile Link" value={form.companyLinkedin || ""} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <button className="btn btn-success w-100" onClick={handleCreate}><FiCalendar /> Create Drive</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="placement-dashboard__scheduled-drives">
            <h4 className="fw-semibold mb-3">Upcoming Drives</h4>
            <div className="row">
              {scheduledDrives.map((d) => (
                <div className="col-md-6 mb-4" key={d._id}>
                  <div className="placement-dashboard__drive-card card shadow-sm border-0">
                    <div className="card-body">
                      <h5 className="card-title d-flex justify-content-between align-items-center">
                        {d.company} - {d.role}
                        <div>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditDrive(d)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => setDriveToDelete(d._id)}>
                            <FiX />
                          </button>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={async () => {
                              try {
                                const studentRes = await fetch(`/api/placements/${d._id}/students`);
                                const studentList = await studentRes.json();

                                let hasError = false;
                                let errorMsg = "";

                                for (let s of studentList) {
                                  if (!s.remarks || s.remarks.trim() === "") {
                                    hasError = true;
                                    errorMsg = `❌ Cannot end drive: ${s.name} is missing remarks.`;
                                    break;
                                  }
                                  if (s.status === "PLACED" && (!s.offerLetterURL || s.offerLetterURL.trim() === "")) {
                                    hasError = true;
                                    errorMsg = `❌ Cannot end drive: ${s.name} is marked as PLACED but missing offer letter URL.`;
                                    break;
                                  }
                                  if (s.status === "PENDING") {
                                    hasError = true;
                                    errorMsg = `❌ Cannot end drive: ${s.name} has status set to PENDING.`;
                                    break;
                                  }
                                }

                                if (hasError) {
                                  setPopup(errorMsg);
                                  setTimeout(() => setPopup(""), 4000);
                                  return;
                                }

                                await fetch(`/api/placements/${d._id}/complete`, { method: "PUT" });
                                fetchDrives();
                                setPopup("✅ Drive marked as completed");
                                setTimeout(() => setPopup(""), 2000);
                              } catch (err) {
                                console.error(err);
                                setPopup("❌ Failed to end drive");
                                setTimeout(() => setPopup(""), 3000);
                              }
                            }}
                          >
                            End Drive
                          </button>
                        </div>
                      </h5>

                      <p><strong>Drive Date:</strong> {new Date(d.driveDate).toLocaleDateString()}</p>
                      <p><strong>Last Date to Apply:</strong> {new Date(d.lastDateToApply).toLocaleDateString()}</p>
                      <p><strong>Location:</strong> {d.jobLocation}</p>
                      <p><strong>Positions:</strong> {d.seats}</p>
                      <p><strong>Registered:</strong> {d.registered?.length || 0}</p>
                      <p><strong>Placed:</strong> {
                        d.registered?.filter((s) => s.status === "PLACED").length || 0
                      }</p>

                      <p><strong>Unplaced:</strong> {
                        d.registered?.filter((s) => s.status === "NOT PLACED").length || 0
                      }</p>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleViewStudents(d._id)}>
                        <FiUsers className="me-1" /> View Students
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="placement-dashboard__completed-drives">
            <h4 className="fw-semibold mb-3">Completed Drives</h4>
            <div className="row">
              {completedDrives.map((d) => (
                <div className="col-md-6 mb-4" key={d._id}>
                  <div className="placement-dashboard__drive-card card shadow-sm border-0">
                    <div className="card-body">
                      <h5 className="card-title">{d.company} - {d.role}</h5>
                      <p><strong>Drive Date:</strong> {new Date(d.driveDate).toLocaleDateString()}</p>
                      <p><strong>Location:</strong> {d.jobLocation}</p>
                      <p><strong>Positions:</strong> {d.seats}</p>
                      <p><strong>Registered:</strong> {d.registered?.length || 0}</p>
                      <p className="text-success fw-semibold">Status: COMPLETED</p>
                      <button
                        className="btn btn-sm btn-warning mt-2"
                        onClick={async () => {
                          await fetch(`/api/placements/${d._id}/revoke`, { method: "PUT" });
                          fetchDrives();
                          setPopup("🔄 Drive status reverted to Scheduled");
                          setTimeout(() => setPopup(""), 2000);
                        }}
                      >
                        Revoke Drive
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="placement-dashboard__companies">
            <h4 className="fw-semibold mb-4">Manage Companies</h4>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <input className="form-control" name="name" placeholder="Company Name"
                  value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} />
              </div>
              <div className="col-md-8">
                <input className="form-control" name="website" placeholder="Website"
                  value={newCompany.website} onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })} />
              </div>
              <div className="col-md-6">
                <input className="form-control" name="linkedin" placeholder="LinkedIn"
                  value={newCompany.linkedin} onChange={(e) => setNewCompany({ ...newCompany, linkedin: e.target.value })} />
              </div>
              <div className="col-md-6">
                <textarea className="form-control" placeholder="About"
                  value={newCompany.about} onChange={(e) => setNewCompany({ ...newCompany, about: e.target.value })}></textarea>
              </div>
              <div className="col-md-3">
                <button className="btn btn-primary w-100" onClick={async () => {
                  if (newCompany._id) {
                    await fetch(`/api/companies/${newCompany._id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newCompany)
                    });
                    setPopup("✅ Company Updated");
                  } else {
                    await fetch("/api/companies", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newCompany)
                    });
                    setPopup("✅ Company Added");
                  }

                  setNewCompany({ name: "", about: "", website: "", linkedin: "" });
                  fetchCompanies();
                  setTimeout(() => setPopup(""), 3000);
                }}>
                  {newCompany._id ? "Update Company" : "Add Company"}
                </button>
              </div>
            </div>

            <div className="row mt-4">
              <table className="table table-bordered mt-4">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Website</th>
                    <th>LinkedIn</th>
                    <th>About</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td><a href={c.website} target="_blank" rel="noreferrer">{c.website}</a></td>
                      <td><a href={c.linkedin} target="_blank" rel="noreferrer">{c.linkedin}</a></td>
                      <td>{c.about}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setNewCompany(c)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rankings" && (
  <div className="placement-dashboard__rankings">
    <h4 className="fw-semibold mb-3">Student Rankings</h4>

    <div className="mb-3 d-flex align-items-center gap-3">
      <div>
        <label className="me-2 fw-bold">Sort By:</label>
        <select
          value={rankingSortBy}
          onChange={(e) => {
            setRankingSortBy(e.target.value);
            fetchRankings(e.target.value);
          }}
          className="form-select w-auto d-inline-block"
        >
          <option value="lab">Lab Grades</option>
          <option value="degree">Bachelor's CGPA / Percentage</option>
        </select>
      </div>

      {/* 🔍 Search Box */}
      <div>
        <input
          type="text"
          placeholder="Search by student name..."
          className="form-control"
          style={{ width: "250px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Email</th>
          <th>Lab Grade</th>
          <th>CGPA / %</th>
        </tr>
      </thead>
      <tbody>
        {rankings
          .filter((s) =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((s, idx) => (
            <tr key={s._id}>
              <td>{idx + 1}</td>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.labGrade}</td>
              <td>{s.bachelors?.cgpa || s.bachelors?.percentage || "-"}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)}


      </main>

      {popup && (
        <div className={`placement-dashboard__popup ${popup.startsWith("✅") ? "success" : "error"}`}>
          {popup}
        </div>
      )}

      {/* Confirmation Modal */}
      {driveToDelete && (
        <div className="placement-dashboard__modal-overlay">
          <div className="placement-dashboard__modal">
            <div className="placement-dashboard__modal-header">
              <h5 className="text-danger">Confirm Delete</h5>
              <button className="btn btn-sm btn-outline-dark" onClick={() => setDriveToDelete(null)}><FiX /></button>
            </div>
            <div className="placement-dashboard__modal-body">
              <p>Are you sure you want to delete this drive?</p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setDriveToDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentPopup && (
        <div className="placement-dashboard__modal-overlay" onClick={() => setShowStudentPopup(false)}>
          <div className="placement-dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <div className="placement-dashboard__modal-header">
              <h5>Registered Students</h5>
              <button className="btn btn-sm btn-outline-dark" onClick={() => setShowStudentPopup(false)}><FiX /></button>
            </div>
            <div className="placement-dashboard__modal-body">
              {students.length === 0 ? (
                <p>No students registered.</p>
              ) : (
                <table className="table table-striped small">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th>Offer Letter URL</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr key={s._id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={s.status}
                            onChange={(e) => {
                              const updated = [...students];
                              updated[index].status = e.target.value;
                              if (e.target.value !== "PLACED") {
                                updated[index].offerLetterURL = "";
                              }
                              setStudents(updated);
                            }}
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="NOT PLACED">NOT PLACED</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={s.remarks || ""}
                            onChange={(e) => {
                              const updated = [...students];
                              updated[index].remarks = e.target.value;
                              setStudents(updated);
                            }}
                          />
                        </td>
                        <td>
                          {s.status === "PLACED" && (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={s.offerLetterURL || ""}
                              onChange={(e) => {
                                const updated = [...students];
                                updated[index].offerLetterURL = e.target.value;
                                setStudents(updated);
                              }}
                            />
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={async () => {
                              try {
                                await fetch(`/api/placements/${selectedDrive}/students/${s._id}`, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    status: s.status,
                                    remarks: s.remarks,
                                    offerLetterURL: s.offerLetterURL,
                                  }),
                                });
                                setPopup("✅ Student updated");
                                setTimeout(() => setPopup(""), 2000);
                              } catch (err) {
                                console.error("Update failed", err);
                                alert("❌ Failed to update student");
                              }
                            }}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}