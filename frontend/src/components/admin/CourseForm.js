/* ────────────────────────────────────────────────────────────
   CourseForm – admin + content‑manager
   ▸ Back button
   ▸ Delete video / sub‑course
   ▸ Whisper AI transcript (Super‑Admin only)
   ────────────────────────────────────────────────────────────*/
import React, { Component } from "react";
import {
  createCourse,
  updateCourse,
  listCourses,
  listEmployees
} from "../../services/adminApi";
import { uploadVideoToCloudinary } from "./cloudinaryUpload";

import {
  FiTrash2,
  FiArrowLeft,
  FiMic
} from "react-icons/fi";

import "./CourseForm.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default class CourseForm extends Component {
  state = {
    title: "",
    instructor: "",
    overallDuration: "",
    status: "Draft",
    subCourses: [
      { title: "", duration: "",lab:"No", videos: [{ title: "", url: "", duration: "" }] }
    ],
    saving: false,
    instructors: []
  };

  /* ---------- fetch course (edit) + instructors ---------- */
  async componentDidMount() {
    const { id } = this.props.match.params;

    /* 1️⃣ load course if editing */
    if (id) {
      const course = (await listCourses()).find((c) => c._id === id);
      if (course) this.setState(course);

      /** 🔒 Guard
       *  Only trigger when the form is opened from CONTENT‑MANAGER side.
       *  In the admin panel (`/admin/...`) there is **no `fromContent` prop**,
       *  so the guard will NOT run for Super Admin.
       */
      if (
        this.props.fromContent &&          // ← important!
        course &&
        course.status === "Published" &&
        this.props.emp?.role !== "super"
      ) {
        alert("Only Super Admin can edit a Published course.");
        return this.props.history.push("/employee/content");
      }
    }

    /* 2️⃣ load instructor dropdown */
    try {
      const emps        = await listEmployees();
      const instructors = emps.filter(e => e.role === "instructor").map(e => e.name);
      this.setState({ instructors });
    } catch (err) {
      console.error("Failed to load instructors:", err);
    }
  }

  /* ---------- helpers ---------- */
  handleChange      = e => this.setState({ [e.target.name]: e.target.value });
  handleSubChange   = (i, f, v) =>
    this.setState(p => setNested(p, ["subCourses", i, f], v));
  handleVideoChange = (s, v, f, val) =>
    this.setState(p => setNested(p, ["subCourses", s, "videos", v, f], val));

  addSubCourse = () =>
    this.setState(p => ({
      subCourses: [
        ...p.subCourses,
        { title: "", duration: "",lab:"No", videos: [{ title: "", url: "", duration: "" }] }
      ]
    }));
  addVideo = s =>
    this.setState(p => {
      p.subCourses[s].videos.push({ title: "", url: "", duration: "" });
      return { subCourses: [...p.subCourses] };
    });
  deleteVideo = (sIdx, vIdx) =>
    this.setState(p => {
      p.subCourses[sIdx].videos.splice(vIdx, 1);
      return { subCourses: [...p.subCourses] };
    });
  deleteSubCourse = sIdx =>
    this.setState(p => {
      p.subCourses.splice(sIdx, 1);
      return { subCourses: [...p.subCourses] };
    });

  /* ---------- Whisper transcript ---------- */
  generateTranscript = async (sIdx, vIdx) => {
    this.handleVideoChange(sIdx, vIdx, "transcribing", true);

    const v = this.state.subCourses[sIdx].videos[vIdx];
    try {
      const res = await fetch("/api/admin/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: v.url })
      });
      const { transcript } = await res.json();
      this.handleVideoChange(sIdx, vIdx, "transcript", transcript);
    } catch (err) {
      alert("Transcription failed: " + err.message);
    }
    this.handleVideoChange(sIdx, vIdx, "transcribing", false);
  };

  /* ---------- submit ---------- */
  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.props.forceDraft) this.setState({ status: "Draft" });

    const { title, overallDuration, subCourses } = this.state;
    if (!title || !overallDuration)
      return alert("Course title & duration required.");

    for (const sc of subCourses) {
      if (!sc.title || !sc.duration)
        return alert("Every sub‑course needs title & duration.");
      for (const v of sc.videos)
        if (!v.title || !v.url || !v.duration)
          return alert("Fill video title / duration and wait for upload.");
    }

    try {
      this.setState({ saving: true });
      const { id } = this.props.match.params;
      id ? await updateCourse(id, this.state) : await createCourse(this.state);

      this.props.history.push(
        this.props.fromContent ? "/employee/content" : "/admin/courses"
      );
    } catch (err) {
      console.error(err);
      alert("Save failed — check console.");
      this.setState({ saving: false });
    }
  };

  /* ---------- render ---------- */
  render() {
    const {
      title, instructor, overallDuration, status,
      subCourses, saving, instructors
    } = this.state;

    /** Transcript button:
     *   • Always shown in the admin panel.
     *   • Shown in content‑manager panel **only** if logged‑in employee is super‑admin.
     */
    const canTranscript =
      !this.props.fromContent || this.props.emp?.role === "super";

    const isEdit = Boolean(this.props.match.params.id);
    const hideStatus = this.props.hideStatus;

    return (
      <div className="container-fluid py-4">
        <div className="card shadow-sm course-card mx-auto">
          <div className="card-body">
            <button className="btn btn-link mb-3 px-0" onClick={() => this.props.history.goBack()}>
              <FiArrowLeft /> Back
            </button>

            <h2 className="mb-4">{isEdit ? "Edit Course" : "Create Course"}</h2>

            {/* ══════════════════════════════ FORM ══════════════════════════════ */}
            <form onSubmit={this.handleSubmit}>
              {/* ---------- top‑level ---------- */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Course Title *</label>
                  <input className="form-control" name="title" value={title}
                         onChange={this.handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Instructor *</label>
                  <select className="form-select" name="instructor"
                          value={instructor} onChange={this.handleChange}
                          disabled={instructors.length === 0} required>
                    <option value="" disabled>
                      {instructors.length ? "Select instructor" : "Loading…"}
                    </option>
                    {instructors.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Overall Duration (min) *
                  </label>
                  <input type="number" className="form-control" name="overallDuration"
                         value={overallDuration} onChange={this.handleChange} required />
                </div>

                {!hideStatus && (
                  <div className="col-md-3 align-self-end">
                    <select className="form-select" name="status"
                            value={status} onChange={this.handleChange}>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ---------- sub‑courses ---------- */}
              <hr className="my-4" />
              <h4 className="mb-3">Sub‑Courses</h4>

              {subCourses.map((sc, sIdx) => (
                <div key={sIdx} className="sub-block border rounded p-3 mb-4">
                  {/* ── header ── */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="row g-3 flex-grow-1">
                      <div className="col-md-6">
                        <label className="form-label">Sub‑Course Title *</label>
                        <input className="form-control" value={sc.title}
                               onChange={e => this.handleSubChange(sIdx, "title", e.target.value)}
                               required />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Duration (min) *</label>
                        <input type="number" className="form-control" value={sc.duration}
                               onChange={e => this.handleSubChange(sIdx, "duration", e.target.value)}
                               required />
                      </div>
                      <div className="col-md-3">
  <label className="form-label">Lab</label>
  <select className="form-select"
          value={sc.lab}
          onChange={e => this.handleSubChange(sIdx, "lab", e.target.value)}>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>

                    </div>

                    <button type="button" className="btn btn-sm btn-outline-danger ms-2"
                            title="Delete sub‑course" onClick={() => this.deleteSubCourse(sIdx)}>
                      <FiTrash2 />
                    </button>
                  </div>

                  {/* ── videos ── */}
                  {sc.videos.map((v, vIdx) => (
                    <div key={vIdx} className="video-row row g-3 mb-3">
                      <div className="col-md-4">
                        <input className="form-control" placeholder="Video Title *"
                               value={v.title}
                               onChange={e =>
                                 this.handleVideoChange(sIdx, vIdx, "title", e.target.value)}
                               required />
                      </div>

                      <div className="col-md-4 d-flex flex-column gap-2">
                        <input type="file" accept="video/*" className="form-control"
                               onChange={async e => {
                                 const file = e.target.files[0];
                                 if (!file) return;
                                 try {
                                   const url = await uploadVideoToCloudinary(file);
                                   this.handleVideoChange(sIdx, vIdx, "url", url);
                                 } catch (err) {
                                   alert("Upload failed: " + err.message);
                                 }
                               }} />
                        {v.url && <video src={v.url} width="100%" controls className="rounded" />}
                      </div>

                      <div className="col-md-2">
                        <input type="number" className="form-control" placeholder="Duration *"
                               value={v.duration}
                               onChange={e =>
                                 this.handleVideoChange(sIdx, vIdx, "duration", e.target.value)}
                               required />
                      </div>

                      <div className="col-md-1 d-flex align-items-center">
                        <button type="button" className="btn btn-outline-danger btn-sm"
                                title="Delete video" onClick={() => this.deleteVideo(sIdx, vIdx)}>
                          <FiTrash2 />
                        </button>
                      </div>

                      {/* ── transcript controls ── */}
                      {v.url && canTranscript && (
                        <div className="col-12">
                          <button type="button"
                                  className="btn btn-outline-primary btn-sm mb-2"
                                  onClick={() => this.generateTranscript(sIdx, vIdx)}
                                  disabled={v.transcribing}>
                            {v.transcribing
                              ? "Transcribing…"
                              : v.transcript
                                ? "Regenerate Transcript"
                                : <>Create Transcript <FiMic /></>}
                          </button>

                          {v.transcript != null && (
                            <textarea className="form-control" rows={4}
                                      value={v.transcript}
                                      onChange={e =>
                                        this.handleVideoChange(sIdx, vIdx, "transcript", e.target.value)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <button type="button" className="btn btn-outline-primary btn-sm"
                          onClick={() => this.addVideo(sIdx)}>
                    + Add Video
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-secondary mb-4"
                      onClick={this.addSubCourse}>
                + Add Sub‑Course
              </button>

              <div className="text-end">
                <button type="submit" className="btn btn-success px-5"
                        disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
            {/* ══════════════════════════════ /FORM ══════════════════════════════ */}
          </div>
        </div>
      </div>
    );
  }
}

/* ---------- deep‑state helper ---------- */
function setNested(state, path, value) {
  const clone = structuredClone(state);
  let ptr = clone;
  path.slice(0, -1).forEach(k => (ptr = ptr[k]));
  ptr[path[path.length - 1]] = value;
  return clone;
}
