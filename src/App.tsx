import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AlertTriangle, CheckCircle, AlertCircle, Trash2, Plus, BookOpen, Calculator, User, Users } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  created_at: string;
}

interface Subject {
  id: string;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  student_id: string;
}

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchSubjects(selectedStudent.id);
    } else {
      setSubjects([]);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      setError('Failed to load students');
    } else if (data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const fetchSubjects = async (studentId: string) => {
    const { data, error } = await supabase
      .from('attendance_subjects')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
    } else if (data) {
      setSubjects(data);
    }
  };

  const calculateAttendance = (attended: number, total: number) => {
    if (total === 0) return 0;
    return (attended / total) * 100;
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'green', label: 'Excellent', icon: CheckCircle };
    if (percentage >= 75) return { color: 'yellow', label: 'Good', icon: AlertCircle };
    return { color: 'red', label: 'At Risk', icon: AlertTriangle };
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      setError('Please enter a student name');
      return;
    }

    const { data, error } = await supabase
      .from('students')
      .insert({ name: newStudentName.trim() })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      setError('Failed to add student');
    } else {
      setNewStudentName('');
      setShowStudentForm(false);
      setSuccess('Student added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchStudents();
      if (data) setSelectedStudent(data);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      setError('Failed to delete student');
    } else {
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
      setSuccess('Student deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchStudents();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudent) {
      setError('Please select a student first');
      return;
    }

    const total = parseInt(totalClasses);
    const attended = parseInt(attendedClasses);

    if (!subjectName.trim()) {
      setError('Please enter a subject name');
      return;
    }

    if (isNaN(total) || total < 0) {
      setError('Please enter a valid total classes number');
      return;
    }

    if (isNaN(attended) || attended < 0) {
      setError('Please enter a valid attended classes number');
      return;
    }

    if (attended > total) {
      setError('Attended classes cannot be more than total classes');
      return;
    }

    const { error: insertError } = await supabase.from('attendance_subjects').insert({
      subject_name: subjectName.trim(),
      total_classes: total,
      attended_classes: attended,
      student_id: selectedStudent.id,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      setError('Failed to add subject');
    } else {
      setSubjectName('');
      setTotalClasses('');
      setAttendedClasses('');
      setSuccess('Subject added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchSubjects(selectedStudent.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedStudent) return;
    const { error } = await supabase.from('attendance_subjects').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      setError('Failed to delete subject');
    } else {
      setSuccess('Subject deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchSubjects(selectedStudent.id);
    }
  };

  const colorClasses = {
    red: {
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border border-red-300',
      rowBg: 'bg-red-50/50',
    },
    yellow: {
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border border-amber-300',
      rowBg: 'bg-amber-50/50',
    },
    green: {
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      rowBg: 'bg-emerald-50/50',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Attendance Risk Predictor</h1>
          </div>
          <p className="text-slate-500 text-lg">Track attendance and stay above the 75% threshold</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-center font-medium">
            {success}
          </div>
        )}

        {/* Students Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Students</h2>
            </div>
            <button
              onClick={() => setShowStudentForm(!showStudentForm)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>

          {showStudentForm && (
            <form onSubmit={handleAddStudent} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Enter student name"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentForm(false)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No students yet. Add your first student above!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedStudent?.id === student.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedStudent?.id === student.id ? 'bg-blue-500' : 'bg-slate-200'
                    }`}>
                      <User className={`w-5 h-5 ${selectedStudent?.id === student.id ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <span className="font-semibold text-slate-800">{student.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subjects Section */}
        {selectedStudent && (
          <>
            {/* Add Subject Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Add Subject</h2>
                  <p className="text-sm text-slate-500">for {selectedStudent.name}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Name</label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="e.g., Mathematics"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Classes</label>
                    <input
                      type="number"
                      value={totalClasses}
                      onChange={(e) => setTotalClasses(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Classes Attended</label>
                    <input
                      type="number"
                      value={attendedClasses}
                      onChange={(e) => setAttendedClasses(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Add Subject
                  </button>
                </div>
              </form>
            </div>

            {/* Subjects Table */}
            {subjects.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-lg">
                <div className="inline-block p-4 bg-slate-100 rounded-2xl mb-4">
                  <BookOpen className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-lg">No subjects for {selectedStudent.name}</p>
                <p className="text-slate-400 mt-1">Add subjects above to start tracking attendance</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
                        <th className="text-left px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">Subject</th>
                        <th className="text-center px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">Total</th>
                        <th className="text-center px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">Attended</th>
                        <th className="text-center px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">Attendance</th>
                        <th className="text-center px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">Status</th>
                        <th className="text-center px-6 py-5 text-sm font-bold text-white uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((subject) => {
                        const percentage = calculateAttendance(subject.attended_classes, subject.total_classes);
                        const status = getAttendanceStatus(percentage);
                        const Icon = status.icon;
                        const colors = colorClasses[status.color];

                        return (
                          <tr key={subject.id} className={`${colors.rowBg} transition-all hover:brightness-95`}>
                            <td className="px-6 py-5">
                              <span className="font-semibold text-slate-800 text-lg">{subject.subject_name}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-block w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto">
                                {subject.total_classes}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-block w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto">
                                {subject.attended_classes}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-extrabold text-2xl ${colors.text}`}>{percentage.toFixed(1)}%</span>
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      status.color === 'green' ? 'bg-emerald-500' :
                                      status.color === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                                    } rounded-full transition-all`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${colors.badge} shadow-sm`}>
                                <Icon className="w-4 h-4" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <button
                                onClick={() => handleDelete(subject.id)}
                                className="p-3 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all hover:shadow-md"
                                title="Delete subject"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border-2 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800">Safe Zone</p>
                  <p className="text-sm text-emerald-600">90% and above</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-amber-800">Caution Zone</p>
                  <p className="text-sm text-amber-600">75% - 89%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border-2 border-red-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-red-800">Danger Zone</p>
                  <p className="text-sm text-red-600">Below 75%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
