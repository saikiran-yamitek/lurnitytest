import React,{useEffect,useState} from "react";
import { Link } from "react-router-dom";
import { listEmployees, deleteEmployee } from "../../services/adminApi";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./employees.css";

export default function Employees(){
  const [emps,setEmps]=useState([]);
  useEffect(()=>{ (async()=>setEmps(await listEmployees()))(); },[]);

  const remove = async id =>{
    if(!window.confirm("Delete employee?")) return;
    await deleteEmployee(id);
    setEmps(e=>e.filter(v=>v._id!==id));
  };

  return(
    <div className="emp-page">
      <h2 className="page-title">Employees</h2>

      <div className="emp-toolbar">
        <Link to="/admin/employees/new" className="new-btn"><FiPlus/> Add Employee</Link>
      </div>

      <div className="emp-card">
        <table>
          <thead>
            <tr><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Gender</th><th>Role</th><th/></tr>
          </thead>
          <tbody>
            {emps.map(e=>(
              <tr key={e._id}>
                <td>{e.name}</td><td>{e.username}</td><td>{e.email}</td>
                <td>{e.phone||"—"}</td><td>{e.gender}</td>
                <td className={`role ${e.role}`}>{e.role}</td>
                <td className="actions">
                  <Link to={`/admin/employees/${e._id}`}><FiEdit2/></Link>
                  <button className="del" onClick={()=>remove(e._id)}><FiTrash2/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>);
}
