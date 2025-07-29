import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import {
  listUsers, deleteUser, updateUser,
  listCourses, exportCSV, logTransaction, generateReceipt
} from '../../services/adminApi';

import {
  FiDownloadCloud, FiEdit2, FiSave, FiX,
  FiTrash2, FiFileText
} from 'react-icons/fi';

import './Users.css';

class Users extends Component {
  state = {
    users: [], filtered: [], courses: [],
    editId: null, form: {}, search: ''
  };

  async componentDidMount() {
    const [users, courses] = await Promise.all([listUsers(), listCourses()]);
    this.setState({ users, filtered: users, courses });
  }

  /* ---------- edit helpers ---------- */
  startEdit = u => this.setState({ editId: u._id, form: { ...u } });
  cancel   = () => this.setState({ editId: null });
  change   = e => this.setState({ form:{ ...this.state.form, [e.target.name]: e.target.value }});

  save     = async id => {
    const up = await updateUser(id, this.state.form);
    await logTransaction(id,{ amount:this.state.form.amountPaid, mode:this.state.form.paymentMode, date:new Date() });
    this.setState(s=>({
      users: s.users.map(u=>u._id===id?up:u),
      filtered: s.filtered.map(u=>u._id===id?up:u),
      editId:null
    }));
  };

  del = async id => {
    if(!window.confirm('Delete user?')) return;
    await deleteUser(id);
    this.setState(s=>({
      users:s.users.filter(u=>u._id!==id),
      filtered:s.filtered.filter(u=>u._id!==id)
    }));
  };

  search = e => {
    const q=e.target.value.toLowerCase();
    this.setState({
      search:q,
      filtered:this.state.users.filter(u=>u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q))
    });
  };

  /* ---------- receipt ---------- */
  downloadReceipt = async id => {
  try {
    const blob = await generateReceipt(id);
    const url  = URL.createObjectURL(blob);

    // Option A – force download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lurnity_receipt_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    // Option B – open in a new tab
    // window.open(url, '_blank');

  } catch (e) {
    alert(e.message || 'Failed to generate receipt');
  }
};


  render() {
    const { filtered, editId, form, courses, search } = this.state;

    return (
      <div className="users-page">
        <h2 className="page-title">Users</h2>

        {/* toolbar */}
        <div className="tool-bar">
          <input
            type="text" placeholder="Search name / email"
            value={search} onChange={this.search}
          />
          <button onClick={()=>exportCSV(this.state.users)}>
            <FiDownloadCloud/> Export CSV
          </button>
        </div>

        {/* table card */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Course</th>
                <th>Fee</th><th>Paid</th><th>Balance</th><th>Pay Mode</th>
                <th>Status</th><th>Progress</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u=>{
                const bal  =(u.courseFee||0)-(u.amountPaid||0);
                const prog =u.courseFee?u.amountPaid/u.courseFee*100:0;
                const isEd =editId===u._id;

                return (
                  <tr key={u._id} className={isEd?'edit-row':''}>
                    {/* ——— name / email ——— */}
                    <td>{isEd
                      ?<input name="name"  value={form.name}  onChange={this.change}/>
                      :u.name}</td>

                    <td>{isEd
                      ?<input name="email" value={form.email} onChange={this.change}/>
                      :u.email}</td>

                    {/* ——— role ——— */}
                    <td>{isEd
                      ?<select name="role" value={form.role} onChange={this.change}>
                          <option value="user">User</option><option value="admin">Admin</option>
                        </select>
                      :u.role}</td>

                    {/* ——— course ——— */}
                    <td>{isEd
                      ?<select name="course" value={form.course||''} onChange={this.change}>
                          <option value="">None</option>{courses.map(c=>
                            <option key={c._id}>{c.title}</option>)}
                        </select>
                      :u.course||'—'}</td>

                    {/* ——— fee / paid ——— */}
                    <td>{isEd
                      ?<input name="courseFee" type="number" value={form.courseFee||''} onChange={this.change}/>
                      :`₹${u.courseFee||0}`}</td>

                    <td>{isEd
                      ?<input name="amountPaid" type="number" value={form.amountPaid||''} onChange={this.change}/>
                      :`₹${u.amountPaid||0}`}</td>

                    <td>₹{bal}</td>

                    {/* ——— payment mode ——— */}
                    <td>{isEd
                      ?<select name="paymentMode" value={form.paymentMode||''} onChange={this.change}>
                          <option value="">Select</option>
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                          <option value="upi">UPI</option>
                          <option value="bank">Bank Tx</option>
                        </select>
                      :u.paymentMode||'—'}</td>

                    {/* ——— status badge / dropdown ——— */}
                    <td>{isEd
                      ?<select name="status" value={form.status} onChange={this.change}>
                          <option value="active">None</option>
                          <option value="suspended">Suspend</option>
                          <option value="banned">Ban</option>
                        </select>
                      :<span className={`badge ${u.status||'active'}`}>
                          {(u.status||'active').toUpperCase()}
                        </span>}
                    </td>

                    {/* ——— progress ——— */}
                    <td>
                      <div className="progress-track">
                        <div className="progress-fill" style={{width:`${prog}%`}}/>
                      </div>
                    </td>

                    {/* ——— actions ——— */}
                    {/* ——— actions ——— */}
<td className="actions">
  {isEd ? (
    <>
      <button onClick={()=>this.save(u._id)} className="ok" title="Save"><FiSave/></button>
      <button onClick={this.cancel} title="Cancel"><FiX/></button>
    </>
  ) : (
    <>
      <button onClick={()=>this.startEdit(u)} title="Edit"><FiEdit2/></button>
      <button onClick={()=>this.del(u._id)} className="del" title="Delete"><FiTrash2/></button>
      <button onClick={()=>this.downloadReceipt(u._id)} title="Receipt"><FiFileText/></button>
      <button
  onClick={() => this.props.history.push(`/admin/certificates/${u._id}`)}
  title="View Certificates"
>
  📜
</button>
<button
  onClick={() => this.props.history.push(`/admin/resume/${u._id}`)}
  title="Download Resume"
>
  📄
</button>




    </>
  )}
</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
export default withRouter(Users);

