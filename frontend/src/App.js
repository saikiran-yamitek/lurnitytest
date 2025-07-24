import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import "./index.css";

/* ── Public Pages ── */
import LandingPage        from "./components/LandingPage";
import Register           from "./components/Register";
import Login              from "./components/Login";
import Home               from "./components/Home";
import SandboxPlayground  from "./components/SandboxPlayground";
import VideoPlayer        from "./components/VideoPlayer";
import AdminTickets from './components/admin/AdminTickets';
import CertificateViewer from "./components/CertificateViewer";
import AdminCertificatesView from "./components/admin/AdminCertificatesView";
import TestWorkshopsPage from "./components/TestWorkshopsPage";
import StudentProfilePage from "./components/StudentProfilePage";

/* ── Admin ── */
import AdminLogin         from "./components/admin/AdminLogin";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout        from "./components/admin/adminLayout";
import Dashboard          from "./components/admin/Dashboard";
import Courses            from "./components/admin/Courses";
import CourseForm         from "./components/admin/CourseForm";
import Users              from "./components/admin/Users";
import Settings           from "./components/admin/Settings";
import EmployeeForm       from "./components/admin/EmployeeForm";
import Employees          from "./components/admin/Employees";
import AdminWorkshops from "./components/admin/AdminWorkshops";


/* ── Employee (role‑based) ── */
import EmpLogin           from "./components/employee/EmpLogin";
import EmpRoute           from "./components/employee/EmpRoute";
import ContentDashboard   from "./components/employee/ContentDashboard";
import SupportDashboard   from "./components/employee/SupportDashboard";
import InstructorHome     from "./components/employee/InstructorHome";
import ContentCourseForm  from "./components/employee/ContentCourseForm";
import Certificates from "./components/Certificates"; 
import IntroVideo from "./components/IntroVideo";
import LabAdminDashboard from "./components/employee/LabAdminDashboard";
import InchargeDashboard from "./components/employee/InchargeDashboard";


function App() {
  return (
    <BrowserRouter>
      <Switch>
        {/* 🟢 Public Routes */}
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/certificates" component={Certificates} />
        <Route exact path="/admin-login" component={AdminLogin} />
        <Route path="/watch/:courseId/:subIdx/:vidIdx" component={VideoPlayer} />
        <Route path="/sandbox" component={SandboxPlayground} />
        <Route path="/certificate/view/:certId" component={CertificateViewer} />
        <Route path="/intro" component={IntroVideo} />
        <Route path="/test/:courseId/:subCourseIdx" component={TestWorkshopsPage} />
        <Route path="/profile" component={StudentProfilePage} />
   

        {/* 🟡 Employee Auth */}
        <Route exact path="/employee/login" component={EmpLogin} />

        {/* ⚙️  Content‑manager workflow (ORDER MATTERS) */}
        <EmpRoute
          exact
          path="/employee/content/new"
          roles={["content", "super"]}
          component={(p) => (
            <ContentCourseForm {...p} hideStatus forceDraft fromContent />
          )}
        />
        <EmpRoute
          exact
          path="/employee/content/:id"
          roles={["content", "super"]}
          component={(p) => (
            <ContentCourseForm {...p} hideStatus forceDraft fromContent />
          )}
        />
        <EmpRoute
  path="/employee/labincharge"
  roles={["lab incharge", "super"]}
  component={InchargeDashboard}
/>


        <EmpRoute
          exact
          path="/employee/content"
          roles={["content", "super"]}
          component={ContentDashboard}
        />

        {/* 🛟 Support staff */}
        <EmpRoute
          path="/employee/support"
          roles={["support", "super"]}
          component={SupportDashboard}
        />
        <EmpRoute path="/incharge/dashboard" component={InchargeDashboard} />

        {/* 🎓 Instructor (read‑only) */}
        <EmpRoute
          path="/employee/instructor"
          roles={["instructor", "super"]}
          component={InstructorHome}
        />
        <EmpRoute path="/employee/labadmin" roles={["lab administrator", "super"]} component={LabAdminDashboard} />

        {/* 🔒 Admin Protected Routes */}
        <AdminProtectedRoute
          path="/admin"
          component={() => (
            <AdminLayout>
              <Switch>
                <Route exact path="/admin" component={Dashboard} />
                <Route exact path="/admin/tickets" component={AdminTickets} />
                <Route exact path="/admin/courses" component={Courses} />
                <Route exact path="/admin/courses/new" component={CourseForm} />
                <Route path="/admin/courses/:id" component={CourseForm} />
                <Route exact path="/admin/users" component={Users} />
                <Route exact path="/admin/settings" component={Settings} />
                <Route exact path="/admin/employees" component={Employees} />
                <Route exact path="/admin/employees/new" component={EmployeeForm} />
                <Route path="/admin/employees/:id" component={EmployeeForm} />
                <Route path="/admin/certificates/:userId" component={AdminCertificatesView} />
                <Route path="/admin/workshops" component={AdminWorkshops} />


                

                <Redirect to="/admin" />
              </Switch>
            </AdminLayout>
          )}
        />

        {/* 🔚 Catch‑all */}
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
