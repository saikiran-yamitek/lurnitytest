import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import {
  FaUsers, FaRegIdBadge, FaBookOpen, FaRupeeSign,
  FaChevronUp, FaChevronDown, FaCrown
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { listUsers, listCourses, listEmployees } from '../../services/adminApi';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, employees: 0, courses: 0, revenue: 0 });
  const [pieData, setPie] = useState([]);
  const [weekBar, setWeekBar] = useState([]);
  const [revLine, setRevLine] = useState([]);
  const [radarMx, setRadar] = useState([]);
  const [trends, setTrends] = useState({ students: 'up', employees: 'up', courses: 'up', revenue: 'up' });

  useEffect(() => {
    const loadDashboardData = async () => {
      console.log('🚀 Loading dashboard data...');

      let users = [];
      let courses = [];
      let employees = [];

      try {
        const usersResponse = await listUsers("admin");
        console.log('👥 Users response:', usersResponse);
        users = Array.isArray(usersResponse?.items) ? usersResponse.items : [];
      } catch (error) {
        console.error('❌ Failed to load users:', error);
        users = [];
      }

      try {
        const coursesResponse = await listCourses("admin");
        console.log('📚 Courses response:', coursesResponse);
        courses = Array.isArray(coursesResponse?.items) ? coursesResponse.items : [];
      } catch (error) {
        console.error('❌ Failed to load courses:', error);
        courses = [];
      }

      try {
        const employeesResponse = await listEmployees("admin");
        console.log('👨‍💼 Employees response:', employeesResponse);
        employees = Array.isArray(employeesResponse?.items)
          ? employeesResponse.items
          : Array.isArray(employeesResponse)
            ? employeesResponse
            : [];
      } catch (error) {
        console.error('❌ Failed to load employees:', error);
        employees = [];
      }

      const studentsArr = users.filter(u => u.role === 'user');
      const revenueTot = studentsArr.reduce((sum, u) => sum + (+u.amountPaid || 0), 0);

      setStats({
        students: studentsArr.length,
        employees: employees.length,
        courses: courses.length,
        revenue: revenueTot
      });

      setTrends({
        students: Math.random() > 0.5 ? 'up' : 'down',
        employees: Math.random() > 0.5 ? 'up' : 'down',
        courses: Math.random() > 0.5 ? 'up' : 'down',
        revenue: Math.random() > 0.5 ? 'up' : 'down'
      });

      /* pie – enrollments by course */
      const cMap = {};
      studentsArr.forEach(u => {
        const c = u.course || 'Unassigned';
        cMap[c] = (cMap[c] || 0) + 1;
      });
      setPie(Object.entries(cMap).map(([name, value]) => ({ name, value })));

      /* bar – weekday sign-ups */
      const week = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
      studentsArr.forEach(u => {
        const d = new Date(u.createdAt || Date.now())
          .toLocaleDateString('en-US', { weekday: 'short' });
        week[d] = (week[d] || 0) + 1;
      });
      setWeekBar(Object.entries(week).map(([day, users]) => ({ day, users })));

      /* line – cumulative revenue (toy monthly) */
      const line = [];
      let acc = 0;
      'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').forEach(m => {
        acc += Math.floor(revenueTot / 12);
        line.push({ month: m, revenue: acc });
      });
      setRevLine(line);

      /* radar – mix */
      setRadar([
        { metric: 'Students', count: studentsArr.length },
        { metric: 'Employees', count: employees.length },
        { metric: 'Courses', count: courses.length }
      ]);

      console.log('✅ Dashboard data loaded successfully');
    };

    loadDashboardData();
  }, []);

  const COLORS = ['#8B5FBF', '#D4AF37', '#5F9EA0', '#CD5C5C', '#4682B4'];
  const LUXURY_COLORS = {
    primary: '#D4AF37',
    secondary: '#8B5FBF',
    dark: '#1A1A2E',
    light: '#F8F5F2',
    accent: '#CD5C5C',
    success: '#5F9EA0'
  };

  return (
    <motion.div
      className="dash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dash-header">
        <h2 className="dash-title">
          <FaCrown className="crown-icon" /> Admin Dashboard
        </h2>
        <div className="premium-badge">
          <span>Super Admin</span>
        </div>
      </div>

      {/* ---------- stats ---------- */}
      <div className="stats">
        <StatCard
          icon={<FaUsers />}
          label="Students"
          value={stats.students}
          color={LUXURY_COLORS.secondary}
          trend={trends.students}
        />
        <StatCard
          icon={<FaRegIdBadge />}
          label="Employees"
          value={stats.employees}
          color={LUXURY_COLORS.primary}
          trend={trends.employees}
        />
        <StatCard
          icon={<FaBookOpen />}
          label="Courses"
          value={stats.courses}
          color={LUXURY_COLORS.success}
          trend={trends.courses}
        />
        <StatCard
          icon={<FaRupeeSign />}
          label="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          color={LUXURY_COLORS.accent}
          trend={trends.revenue}
        />
      </div>

      {/* ---------- charts ---------- */}
      <div className="charts">
        <ChartBox title="Enrollments by Course" color={LUXURY_COLORS.secondary}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius="70%"
                innerRadius="45%"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke={LUXURY_COLORS.light}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: LUXURY_COLORS.dark,
                  borderColor: LUXURY_COLORS.primary,
                  borderRadius: '8px',
                  color: LUXURY_COLORS.light
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Sign-ups by Weekday" color={LUXURY_COLORS.primary}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekBar}>
              <CartesianGrid strokeDasharray="3 3" stroke={LUXURY_COLORS.light} strokeOpacity={0.15} />
              <XAxis
                dataKey="day"
                tick={{ fill: LUXURY_COLORS.light }}
                axisLine={{ stroke: LUXURY_COLORS.light }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: LUXURY_COLORS.light }}
                axisLine={{ stroke: LUXURY_COLORS.light }}
              />
              <Tooltip
                contentStyle={{
                  background: LUXURY_COLORS.dark,
                  borderColor: LUXURY_COLORS.primary,
                  borderRadius: '8px',
                  color: LUXURY_COLORS.light
                }}
              />
              <Bar
                dataKey="users"
                fill={LUXURY_COLORS.primary}
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
              >
                {weekBar.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Revenue Growth (YTD)" color={LUXURY_COLORS.accent}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revLine}>
              <CartesianGrid strokeDasharray="3 3" stroke={LUXURY_COLORS.light} strokeOpacity={0.15} />
              <XAxis
                dataKey="month"
                tick={{ fill: LUXURY_COLORS.light }}
                axisLine={{ stroke: LUXURY_COLORS.light }}
              />
              <YAxis
                tick={{ fill: LUXURY_COLORS.light }}
                axisLine={{ stroke: LUXURY_COLORS.light }}
              />
              <Tooltip
                contentStyle={{
                  background: LUXURY_COLORS.dark,
                  borderColor: LUXURY_COLORS.primary,
                  borderRadius: '8px',
                  color: LUXURY_COLORS.light
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={LUXURY_COLORS.accent}
                strokeWidth={3}
                dot={{ fill: LUXURY_COLORS.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ fill: LUXURY_COLORS.light, stroke: LUXURY_COLORS.accent, strokeWidth: 2, r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Platform Mix" color={LUXURY_COLORS.success}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarMx}>
              <PolarGrid stroke={LUXURY_COLORS.light} strokeOpacity={0.2} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: LUXURY_COLORS.light,
                  fontSize: 12
                }}
              />
              <PolarRadiusAxis
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="count"
                fill={LUXURY_COLORS.success}
                fillOpacity={0.55}
                stroke={LUXURY_COLORS.light}
                strokeWidth={1.5}
                animationDuration={1500}
              />
              <Tooltip
                contentStyle={{
                  background: LUXURY_COLORS.dark,
                  borderColor: LUXURY_COLORS.primary,
                  borderRadius: '8px',
                  color: LUXURY_COLORS.light
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    </motion.div>
  );
}

const StatCard = ({ icon, label, value, color, trend }) => (
  <motion.div
    className="stat-card"
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="stat-ico" style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}33 100%)`,
      color: 'white'
    }}>
      {icon}
    </div>
    <div className="stat-data">
      <h3>{value}</h3>
      <p>{label}</p>
      <div className={`trend ${trend}`}>
        {trend === 'up' ? <FaChevronUp /> : <FaChevronDown />}
      </div>
    </div>
  </motion.div>
);

const ChartBox = ({ title, children, color }) => (
  <motion.div
    className="chart-box"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <h4 style={{ color }}>
      <span className="chart-title-decoration"></span>
      {title}
    </h4>
    {children}
  </motion.div>
);
