// src/components/admin/AdminRoutes.js
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import AdminLayout from './adminLayout';
import Dashboard from './Dashboard';
import Courses from './Courses';
import CourseForm from './CourseForm';
import Users from './Users';
import Settings from './Settings';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route exact path="/admin" component={Dashboard} />
        <Route exact path="/admin/courses" component={Courses} />
        <Route exact path="/admin/courses/new" component={CourseForm} />
        <Route exact path="/admin/courses/:id" component={CourseForm} />
        <Route exact path="/admin/users" component={Users} />
        <Route exact path="/admin/settings" component={Settings} />
        <Redirect to="/admin" />
      </Switch>
    </AdminLayout>
  );
}
