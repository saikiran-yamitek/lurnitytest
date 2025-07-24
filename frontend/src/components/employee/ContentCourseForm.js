import React from "react";
import AdminCourseForm from "../admin/CourseForm";      // reuse your admin form

export default function ContentCourseForm(props){
  return (
    <AdminCourseForm
      {...props}
      hideStatus               // custom prop that hides status field
      forceDraft               // custom prop that forces Draft on submit
    />
  );
}
