import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import {
  FaUsers, FaRegIdBadge, FaBookOpen, FaRupeeSign
} from 'react-icons/fa';

import {
  listUsers,
  listCourses,
  listEmployees
} from '../../services/adminApi';

import './Dashboard.css';

export default function Dashboard() {
  /* ---------------- state ---------------- */
  const [stats,   setStats]   = useState({ students:0, employees:0, courses:0, revenue:0 });
  const [pieData, setPie]     = useState([]);
  const [weekBar, setWeekBar] = useState([]);
  const [revLine, setRevLine] = useState([]);
  const [radarMx, setRadar]   = useState([]);

  /* ---------------- data fetch ---------------- */
  useEffect(() => {
    (async () => {
      const [users, courses, employees] = await Promise.all([
        listUsers(), listCourses(), listEmployees()
      ]);

      const studentsArr  = users.filter(u => u.role === 'user');
      const revenueTot   = studentsArr.reduce((sum,u)=>sum+(+u.amountPaid||0),0);

      setStats({
        students:  studentsArr.length,
        employees: employees.length,
        courses:   courses.length,
        revenue:   revenueTot
      });

      /* pie – enrollments by course */
      const cMap = {};
      studentsArr.forEach(u=>{
        const c=u.course||'Unassigned';
        cMap[c]=(cMap[c]||0)+1;
      });
      setPie(Object.entries(cMap).map(([name,value])=>({name,value})));

      /* bar – weekday sign‑ups */
      const week = {Sun:0,Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0};
      studentsArr.forEach(u=>{
        const d=new Date(u.createdAt||Date.now())
          .toLocaleDateString('en-US',{weekday:'short'});
        week[d] = (week[d]||0)+1;
      });
      setWeekBar(Object.entries(week).map(([day,users])=>({day,users})));

      /* line – cumulative revenue (toy monthly) */
      const line=[];
      let acc=0;
      'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').forEach(m=>{
        acc+=Math.floor(revenueTot/12);
        line.push({month:m,revenue:acc});
      });
      setRevLine(line);

      /* radar – mix */
      setRadar([
        {metric:'Students',count:studentsArr.length},
        {metric:'Employees',count:employees.length},
        {metric:'Courses',count:courses.length}
      ]);
    })();
  },[]);

  const COLORS=['#5b8ef6','#ff9f43','#00c29a','#ff6b6b','#845ef7'];

  return (
    <div className="dash">
      <h2 className="dash-title">Admin Dashboard</h2>

      {/* ---------- stats ---------- */}
      <div className="stats">
        <StatCard icon={<FaUsers />}      label="Students"  value={stats.students}  color="#5b8ef6"/>
        <StatCard icon={<FaRegIdBadge />} label="Employees" value={stats.employees} color="#845ef7"/>
        <StatCard icon={<FaBookOpen />}   label="Courses"   value={stats.courses}   color="#00c29a"/>
        <StatCard icon={<FaRupeeSign />}  label="Revenue"   value={`₹${stats.revenue}`} color="#ff9f43"/>
      </div>

      {/* ---------- charts ---------- */}
      <div className="charts">
        <ChartBox title="Enrollments by Course">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius="65%" label>
                {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Sign‑ups by Weekday">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekBar}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15}/>
              <XAxis dataKey="day"/>
              <YAxis allowDecimals={false}/>
              <Tooltip/>
              <Bar dataKey="users" fill="#5b8ef6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Revenue Growth (YTD)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revLine}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15}/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="revenue" stroke="#00c29a" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Platform Mix">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarMx}>
              <PolarGrid strokeOpacity={0.2}/>
              <PolarAngleAxis dataKey="metric" tick={{fontSize:12}} />
              <PolarRadiusAxis tick={false} axisLine={false}/>
              <Radar dataKey="count" fill="#ff6b6b" fillOpacity={0.55}/>
              <Tooltip/>
            </RadarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    </div>
  );
}

/* ---------- stat helper ---------- */
const StatCard=({icon,label,value,color})=>(
  <div className="stat-card">
    <div className="stat-ico" style={{background:color+'22',color}}>{icon}</div>
    <div className="stat-data">
      <h3>{value}</h3><p>{label}</p>
    </div>
  </div>
);

/* ---------- chart wrapper ---------- */
const ChartBox=({title,children})=>(
  <div className="chart-box">
    <h4>{title}</h4>
    {children}
  </div>
);
