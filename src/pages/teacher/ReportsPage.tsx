import { useState } from 'react';
import { format, subMonths, addMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Users, CalendarDays, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { BottomNav } from '@/components/teacher/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontSizeSelector } from '@/components/FontSizeSelector';
import { useReportsData } from '@/hooks/use-reports-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { data, isLoading } = useReportsData(selectedMonth);
  const today = new Date();
  const isCurrentMonth = isSameMonth(selectedMonth, today);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">📊 דוחות</h1>
            <p className="text-sm text-muted-foreground font-body">סיכום חודשי ומגמות</p>
          </div>
          <div className="flex items-center gap-1">
            <FontSizeSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="px-4 space-y-4 mt-4">
        {/* Month Navigator */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMonth((m) => addMonths(m, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-heading font-semibold text-foreground">
                  {format(selectedMonth, 'MMMM yyyy')}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMonth((m) => subMonths(m, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <motion.div className="grid grid-cols-2 gap-3" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <Card>
                <CardContent className="p-3 text-center">
                  <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-heading font-bold text-foreground">₪{data.currentMonthStats.totalIncome.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-body">הכנסה</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CalendarDays className="h-5 w-5 mx-auto text-secondary mb-1" />
                  <p className="text-lg font-heading font-bold text-foreground">{data.currentMonthStats.completed}/{data.currentMonthStats.totalLessons}</p>
                  <p className="text-xs text-muted-foreground font-body">שיעורים</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto text-success mb-1" />
                  <p className="text-lg font-heading font-bold text-foreground">₪{data.currentMonthStats.paidIncome.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-body">שולם</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" />
                  <p className="text-lg font-heading font-bold text-foreground">₪{data.currentMonthStats.debtAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-body">חוב</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lesson Type Breakdown */}
            {(data.currentMonthStats.internalTests > 0 || data.currentMonthStats.externalTests > 0) && (
              <motion.div className="grid grid-cols-3 gap-2" variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
                <Card>
                  <CardContent className="p-2.5 text-center">
                    <p className="text-sm font-heading font-bold text-foreground">{data.currentMonthStats.regularLessons}</p>
                    <p className="text-[10px] text-muted-foreground font-body">שיעורים רגילים</p>
                    <p className="text-[10px] text-primary font-body">₪{data.currentMonthStats.regularIncome.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-2.5 text-center">
                    <p className="text-sm font-heading font-bold text-foreground">{data.currentMonthStats.internalTests}</p>
                    <p className="text-[10px] text-muted-foreground font-body">טסט פנימי</p>
                    <p className="text-[10px] text-primary font-body">₪{data.currentMonthStats.internalTestIncome.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-2.5 text-center">
                    <p className="text-sm font-heading font-bold text-foreground">{data.currentMonthStats.externalTests}</p>
                    <p className="text-[10px] text-muted-foreground font-body">טסט חיצוני</p>
                    <p className="text-[10px] text-primary font-body">₪{data.currentMonthStats.externalTestIncome.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Income Trend Chart */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> מגמת הכנסות (6 חודשים)
                  </h2>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            color: 'hsl(var(--foreground))',
                            direction: 'rtl',
                          }}
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = { paid: 'שולם', debt: 'חוב' };
                            return [`₪${value.toLocaleString()}`, labels[name] ?? name];
                          }}
                        />
                        <Bar dataKey="paid" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} name="paid" />
                        <Bar dataKey="debt" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="debt" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lessons Trend */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-secondary" /> מגמת שיעורים
                  </h2>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            color: 'hsl(var(--foreground))',
                            direction: 'rtl',
                          }}
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = { lessons: 'שיעורים', cancelled: 'ביטולים' };
                            return [value, labels[name] ?? name];
                          }}
                        />
                        <Line type="monotone" dataKey="lessons" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="lessons" />
                        <Line type="monotone" dataKey="cancelled" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="cancelled" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Distribution */}
            {data.paymentDistribution.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-sm font-heading font-semibold text-foreground mb-3">התפלגות תשלומים</h2>
                    <div className="h-48 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.paymentDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {data.paymentDistribution.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px',
                              color: 'hsl(var(--foreground))',
                              direction: 'rtl',
                            }}
                            formatter={(value: number) => `₪${value.toLocaleString()}`}
                          />
                          <Legend
                            formatter={(value: string) => <span className="text-xs text-foreground font-body">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Student Breakdown */}
            {data.studentBreakdown.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-sm font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" /> פירוט לפי תלמיד
                    </h2>
                    <div className="space-y-2.5">
                      {data.studentBreakdown.map((st, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                          <div>
                            <p className="text-sm font-medium text-foreground font-body">{st.name}</p>
                            <p className="text-xs text-muted-foreground font-body">{st.lessons} שיעורים</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-heading font-bold text-foreground">₪{st.income.toLocaleString()}</p>
                            {st.debt > 0 && (
                              <p className="text-xs text-destructive font-body">חוב: ₪{st.debt.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
}
