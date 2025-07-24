import React from "react";
import { Route, Redirect } from "react-router-dom";

/**
 * roles: array of allowed roles, e.g. ["content","super"]
 * All checks are done in localStorage.empInfo
 */
export default function EmpRoute({ component:Comp, roles, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => {
        const info = JSON.parse(localStorage.getItem("empInfo") || "{}");
        return roles.includes(info.role)
          ? <Comp {...props} emp={info}/>
          : <Redirect to="/employee/login" />;
      }}
    />
  );
}
