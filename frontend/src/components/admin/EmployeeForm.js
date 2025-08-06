import React,{useEffect,useState} from "react";
import { useParams,useHistory } from "react-router-dom";
import { getEmployee, saveEmployee } from "../../services/adminApi";
import "./employees.css";

export default function EmployeeForm(){
  const {id}=useParams();
  const hist=useHistory();
  const [emp,setEmp]=useState({
    name:"",email:"",username:"",password:"",
    phone:"",gender:"Male",role:"content"
  });

  useEffect(()=>{ if(id)(async()=>setEmp(await getEmployee(id)))(); },[id]);
  const handle=k=>e=>setEmp({...emp,[k]:e.target.value});
  const save=async e=>{ e.preventDefault(); await saveEmployee(id,emp); hist.push("/admin/employees"); };

  return(
    <div className="emp-form-page">
      <h2 className="page-title">{id?"Edit":"New"} Employee</h2>
      <form className="emp-form" onSubmit={save}>
        <label>Name      <input value={emp.name}      onChange={handle("name")}      required/></label>
        <label>Email     <input type="email" value={emp.email}     onChange={handle("email")}     required/></label>
        <label>Username  <input          value={emp.username}  onChange={handle("username")} required/></label>
        {!id&&<label>Password <input type="password" value={emp.password} onChange={handle("password")} required/></label>}
        <label>Phone     <input          value={emp.phone}     onChange={handle("phone")}/></label>
        <label>Gender
          <select value={emp.gender} onChange={handle("gender")}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </label>
        <label>Role
          <select value={emp.role} onChange={handle("role")}>
            <option value="content">Content Manager</option>
            <option value="support">Support Staff</option>
            <option value="super">Super Admin</option>
            <option value="instructor">Instructor</option>
              <option value="lab administrator">Lab Administrator</option>
  <option value="lab incharge">Lab Incharge</option>
  <option value="placement">Placement</option>
          </select>
        </label>
        <button className="save-btn">Save</button>
      </form>
    </div>);
}
