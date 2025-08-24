// src/components/admin/CourseForm.js
import React, { Component } from "react";
import {
  createCourse,
  updateCourse,
  listCourses,
  listEmployees,
  listAllSubCourses,
} from "../../services/adminApi";
import { uploadVideoToCloudinary } from "./cloudinaryUpload";

import {
  FiTrash2,
  FiArrowLeft,
  FiMic,
  FiUpload,
  FiPlus,
  FiVideo,
  FiClock,
  FiBook,
  FiUser,
  FiSettings,
  FiSave,
  FiDownload
} from "react-icons/fi";

import "./CourseForm.css";

export default class CourseForm extends Component {
  state = {
    title: "",
    instructor: "",
    overallDuration: "",
    status: "Draft",
    subCourses: [
      { title: "", duration: "", lab: "No", videos: [{ title: "", url: "", duration: "" }] }
    ],
    saving: false,
    instructors: [],
    showImportModal: false,
    allSubCourses: [],
    selectedSubId: "",
    uploading: false
  };

  openImportModal = () => this.setState({ showImportModal: true, selectedSubId: "" });

  importSubCourse = () => {
    const { allSubCourses, selectedSubId } = this.state;
    if (selectedSubId === "") return alert("Select a sub-course to import");

    const subToImport = structuredClone(allSubCourses[selectedSubId]);
    this.setState(p => ({
      subCourses: [...p.subCourses, subToImport],
      showImportModal: false
    }));
  };

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const course = (await listCourses()).find((c) => c._id === id);
      if (course) this.setState(course);

      if (
        this.props.fromContent &&
        course &&
        course.status === "Published" &&
        this.props.emp?.role !== "super"
      ) {
        alert("Only Super Admin can edit a Published course.");
        return this.props.history.push("/employee/content");
      }
    }

    try {
      const allSubCourses = await listAllSubCourses();
      this.setState({ allSubCourses });
    } catch (err) {
      console.error("Failed to load subcourses:", err);
    }

    try {
      const emps = await listEmployees();
      const instructors = emps
        .filter(e => e.role === "instructor")
        .map(e => e.name);
      this.setState({ instructors });
    } catch (err) {
      console.error("Failed to load instructors:", err);
    }
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });
  handleSubChange = (i, f, v) =>
    this.setState(p => setNested(p, ["subCourses", i, f], v));
  handleVideoChange = (s, v, f, val) =>
    this.setState(p => setNested(p, ["subCourses", s, "videos", v, f], val));

  addSubCourse = () =>
    this.setState(p => ({
      subCourses: [
        ...p.subCourses,
        { title: "", duration: "", lab: "No", videos: [{ title: "", url: "", duration: "" }] }
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

  render() {
    const {
      title, instructor, overallDuration, status,
      subCourses, saving, instructors, uploading
    } = this.state;

    const canTranscript =
      !this.props.fromContent || this.props.emp?.role === "super";

    const isEdit = Boolean(this.props.match.params.id);
    const hideStatus = this.props.hideStatus;

    return (
      <div className="course-form-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => this.props.history.goBack()}>
              <FiArrowLeft />
              <span>Back</span>
            </button>
            
            <div className="title-section">
              <div className="page-title-container">
                <FiBook className="page-icon" />
                <h1 className="page-titlepo">
                  {isEdit ? "Edit Course" : "Create New Course"}
                </h1>
              </div>
              <p className="page-subtitle">
                {isEdit ? "Update course content and settings" : "Build engaging course content"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="form-card">
          {saving && (
            <div className="saving-overlay">
              <div className="saving-content">
                <div className="saving-spinner"></div>
                <p>Saving course...</p>
              </div>
            </div>
          )}

          <form onSubmit={this.handleSubmit}>
            {/* Basic Course Information */}
            <div className="form-section">
              <div className="section-header">
                <h3>
                  <FiSettings className="section-icon" />
                  Course Information
                </h3>
                <p className="section-description">
                  Basic details about your course
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FiBook className="label-icon" />
                    Course Title *
                  </label>
                  <input 
                    className="form-control" 
                    name="title" 
                    value={title}
                    onChange={this.handleChange} 
                    placeholder="Enter course title"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiUser className="label-icon" />
                    Instructor *
                  </label>
                  <select 
                    className="form-select" 
                    name="instructor"
                    value={instructor} 
                    onChange={this.handleChange}
                    disabled={instructors.length === 0} 
                    required
                  >
                    <option value="" disabled>
                      {instructors.length ? "Select instructor" : "Loading instructors..."}
                    </option>
                    {instructors.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiClock className="label-icon" />
                    Overall Duration (minutes) *
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="overallDuration"
                    value={overallDuration} 
                    onChange={this.handleChange} 
                    placeholder="Total duration"
                    required 
                  />
                </div>

                {!hideStatus && (
                  <div className="form-group">
                    <label className="form-label">
                      <FiSettings className="label-icon" />
                      Status
                    </label>
                    <select 
                      className="form-select" 
                      name="status"
                      value={status} 
                      onChange={this.handleChange}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Courses Section */}
            <div className="form-section">
              <div className="section-header">
                <h3>
                  <FiVideo className="section-icon" />
                  Course Content
                </h3>
                <p className="section-description">
                  Organize your course into modules and lessons
                </p>
              </div>

              <div className="subcourses-container">
                {subCourses.map((sc, sIdx) => (
                  <div key={sIdx} className="subcourse-block">
                    <div className="subcourse-header">
                      <div className="subcourse-info">
                        <div className="subcourse-number">
                          Module {sIdx + 1}
                        </div>
                        <div className="subcourse-actions">
                          <button 
                            type="button" 
                            className="delete-subcourse-btn"
                            title="Delete module" 
                            onClick={() => this.deleteSubCourse(sIdx)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="subcourse-content">
                      <div className="form-grid subcourse-grid">
                        <div className="form-group">
                          <label className="form-label">Module Title *</label>
                          <input 
                            className="form-control" 
                            value={sc.title}
                            onChange={e => this.handleSubChange(sIdx, "title", e.target.value)}
                            placeholder="Enter module title"
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Duration (minutes) *</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={sc.duration}
                            onChange={e => this.handleSubChange(sIdx, "duration", e.target.value)}
                            placeholder="Duration"
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Has Lab Component</label>
                          <select 
                            className="form-select"
                            value={sc.lab}
                            onChange={e => this.handleSubChange(sIdx, "lab", e.target.value)}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>

                      {/* Videos Section */}
                      <div className="videos-section">
                        <h4 className="videos-title">
                          <FiVideo className="videos-icon" />
                          Video Lessons
                        </h4>
                        
                        <div className="videos-container">
                          {sc.videos.map((v, vIdx) => (
                            <div key={vIdx} className="video-block">
                              <div className="video-header">
                                <span className="video-number">Lesson {vIdx + 1}</span>
                                <button 
                                  type="button" 
                                  className="delete-video-btn-header"
                                  title="Delete video" 
                                  onClick={() => this.deleteVideo(sIdx, vIdx)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>

                              <div className="video-content">
                                <div className="video-grid">
                                  <div className="form-group video-title-group">
                                    <label className="form-label">Video Title *</label>
                                    <input 
                                      className="form-control" 
                                      placeholder="Enter video title"
                                      value={v.title}
                                      onChange={e =>
                                        this.handleVideoChange(sIdx, vIdx, "title", e.target.value)}
                                      required 
                                    />
                                  </div>

                                  <div className="form-group video-duration-group">
                                    <label className="form-label">Duration (min) *</label>
                                    <input 
                                      type="number" 
                                      className="form-control" 
                                      placeholder="Duration"
                                      value={v.duration}
                                      onChange={e =>
                                        this.handleVideoChange(sIdx, vIdx, "duration", e.target.value)}
                                      required 
                                    />
                                  </div>
                                </div>

                                <div className="video-upload-section">
                                  <label className="form-label">Video File *</label>
                                  <div className="upload-container">
                                    <input 
                                      type="file" 
                                      accept="video/*" 
                                      className="file-input"
                                      onChange={async e => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        try {
                                          this.setState({ uploading: true });
                                          const url = await uploadVideoToCloudinary(file);
                                          this.handleVideoChange(sIdx, vIdx, "url", url);
                                        } catch (err) {
                                          alert("Upload failed: " + err.message);
                                        } finally {
                                          this.setState({ uploading: false });
                                        }
                                      }} 
                                    />
                                    <div className="upload-placeholder">
                                      <FiUpload className="upload-icon" />
                                      <span>Choose video file or drag & drop</span>
                                    </div>
                                  </div>
                                  
                                  {v.url && (
                                    <div className="video-preview">
                                      <video src={v.url} controls className="video-player" />
                                    </div>
                                  )}
                                </div>

                                {/* Transcript Section */}
                                {v.url && canTranscript && (
                                  <div className="transcript-section">
                                    <div className="transcript-header">
                                      <button 
                                        type="button"
                                        className="transcript-btn"
                                        onClick={() => this.generateTranscript(sIdx, vIdx)}
                                        disabled={v.transcribing}
                                      >
                                        <FiMic />
                                        {v.transcribing
                                          ? "Transcribing..."
                                          : v.transcript
                                            ? "Regenerate Transcript"
                                            : "Generate Transcript"}
                                      </button>
                                    </div>

                                    {v.transcript != null && (
                                      <div className="transcript-editor">
                                        <label className="form-label">Transcript</label>
                                        <textarea 
                                          className="form-control transcript-textarea"
                                          rows={4}
                                          value={v.transcript}
                                          onChange={e =>
                                            this.handleVideoChange(sIdx, vIdx, "transcript", e.target.value)}
                                          placeholder="Video transcript will appear here..."
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                          type="button" 
                          className="add-video-btn"
                          onClick={() => this.addVideo(sIdx)}
                        >
                          <FiPlus />
                          Add Video Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-actions">
                <button 
                  type="button" 
                  className="add-subcourse-btn"
                  onClick={this.addSubCourse}
                >
                  <FiPlus />
                  Add New Module
                </button>

                <button 
                  type="button"
                  className="import-subcourse-btn"
                  onClick={this.openImportModal}
                >
                  <FiDownload />
                  Import Module
                </button>
              </div>
            </div>

            {/* Submit Section */}
            <div className="submit-section">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={saving}
              >
                <FiSave />
                {saving ? "Saving Course..." : "Save Course"}
              </button>
            </div>
          </form>
        </div>

        {/* Import Modal */}
        {this.state.showImportModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Import Module</h3>
                <p>Select a module from existing courses to import</p>
              </div>
              
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Available Modules</label>
                  <select 
                    className="form-select"
                    value={this.state.selectedSubId}
                    onChange={e => this.setState({ selectedSubId: e.target.value })}
                  >
                    <option value="">-- Select Module --</option>
                    {this.state.allSubCourses.map((sc, i) => (
                      <option key={i} value={i}>
                        {sc.title} ({sc.parentCourse})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="modal-btn cancel-btn" 
                  onClick={() => this.setState({ showImportModal: false })}
                >
                  Cancel
                </button>
                <button 
                  className="modal-btn import-btn"
                  onClick={this.importSubCourse}
                >
                  <FiDownload />
                  Import Module
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function setNested(state, path, value) {
  const clone = structuredClone(state);
  let ptr = clone;
  path.slice(0, -1).forEach(k => (ptr = ptr[k]));
  ptr[path[path.length - 1]] = value;
  return clone;
}
