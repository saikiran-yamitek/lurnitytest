import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

/* ── Public Pages ── */
import LandingPage        from "./components/LandingPage";
import Login              from "./components/Login";
import Home               from "./components/Home";
import SandboxPlayground  from "./components/SandboxPlayground";
import VideoPlayer        from "./components/VideoPlayer";
import AdminTickets from './components/admin/AdminTickets';
import CertificateViewer from "./components/CertificateViewer";
import AdminCertificatesView from "./components/admin/AdminCertificatesView";
import TestWorkshopsPage from "./components/TestWorkshopsPage";
import StudentProfilePage from "./components/StudentProfilePage";
import Resume from "./components/Resume"
import StudentPlacementDrives from './components/StudentPlacementDrives'
import PracticePage  from "./components/PracticePage";
import CareersPage from './components/CareersPage'
import AICoursePage from './components/AICoursePage';


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
import CohortsManagement from "./components/admin/CohortsManagement"
import Hiring from "./components/admin/Hiring"


/* ── Employee (role‑based) ── */
import EmpLogin           from "./components/employee/EmpLogin";
import EmpRoute           from "./components/employee/EmpRoute";
import ContentDashboard   from "./components/employee/ContentDashboard";
import SupportDashboard   from "./components/employee/SupportDashboard";
import InstructorHome     from "./components/employee/InstructorHome";
import ContentCourseForm  from "./components/employee/ContentCourseForm";
import Certificates from "./components/Certificates"; 

import LabAdminDashboard from "./components/employee/LabAdminDashboard";
import InchargeDashboard from "./components/employee/InchargeDashboard";
import PlacementDashboard from './components/employee/PlacementDashboard';





function App() {
  return (
    <GoogleOAuthProvider clientId="322821846367-514od8575kmib97gji4q88ntskndmo9b.apps.googleusercontent.com">
    <BrowserRouter>
      <Switch>
        {/* 🟢 Public Routes */}
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/register" component={Login} />
        <Route exact path="/login" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/certificates" component={Certificates} />
        <Route exact path="/admin-login" component={AdminLogin} />
        <Route path="/watch/:courseId/:subIdx/:vidIdx" component={VideoPlayer} />
        <Route path="/sandbox" component={SandboxPlayground} />
        <Route path="/certificate/view/:certId" component={CertificateViewer} />
        
        <Route path="/test/:courseId/:subCourseIdx" component={TestWorkshopsPage} />
        <Route path="/profile" component={StudentProfilePage} />
        <Route path="/resume" component={Resume}/>
        <Route path="/placement" component={StudentPlacementDrives} />
        <Route path="/practice/:courseId/:subIdx/:vidIdx" component={PracticePage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/course/ai" component={AICoursePage} />
            

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
        <EmpRoute
          exact
          path="/employee/placement"
          roles={["placement", "super"]}
          component={PlacementDashboard}
        />
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
                <Route path="/admin/resume/:userId" component={Resume} />
                <Route path="/admin/cohorts" component={CohortsManagement} />
                <Route path="/admin/hiring" component={Hiring} />


                

                <Redirect to="/admin" />
              </Switch>
            </AdminLayout>
          )}
        />

        {/* 🔚 Catch‑all */}
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
