import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { studentAPI } from "../services/api";
import { Mic, MessageCircle } from "lucide-react";
import VoiceChatbot from "../components/VoiceChatbot";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  //chatbot
  const [chatOpen, setChatOpen] = useState(false);

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    activityType: "assignment",
    subject: "",
    description: "",
    duration: "",
  });

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    subject: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesRes, sessionsRes, activeSessionRes, exercisesRes] =
        await Promise.all([
          studentAPI.getTodayActivities(),
          studentAPI.getSessions(),
          studentAPI.getActiveSession(),
          studentAPI.getExercises(),
        ]);

      setActivities(activitiesRes.data);
      setSessions(sessionsRes.data);
      setActiveSession(activeSessionRes.data);
      setExercises(exercisesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentAPI.createActivity({
        ...activityForm,
        duration: parseInt(activityForm.duration),
      });

      // Reset form
      setActivityForm({
        activityType: "assignment",
        subject: "",
        description: "",
        duration: "",
      });

      // Reload activities
      const res = await studentAPI.getTodayActivities();
      setActivities(res.data);

      alert("Activity logged successfully!");
    } catch (error) {
      alert("Error logging activity: " + error.response?.data?.message);
    }
    setLoading(false);
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studentAPI.startSession(sessionForm);
      setActiveSession(res.data);
      setSessionForm({ subject: "", notes: "" });
      alert("Study session started!");
    } catch (error) {
      alert("Error starting session: " + error.response?.data?.message);
    }
    setLoading(false);
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      await studentAPI.endSession({ sessionId: activeSession._id });
      setActiveSession(null);

      // Reload sessions
      const res = await studentAPI.getSessions();
      setSessions(res.data);

      alert("Study session ended!");
    } catch (error) {
      alert("Error ending session: " + error.response?.data?.message);
    }
    setLoading(false);
  };

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Active Session Alert */}
        {activeSession && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-green-800 font-semibold">
                  Active Study Session
                </h3>
                <p className="text-green-700 text-sm">
                  Subject: {activeSession.subject || "Not specified"} | Started:{" "}
                  {new Date(activeSession.startTime).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={handleEndSession}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                disabled={loading}
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {/*chatbot*/}

        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg"
        >
          <Mic size={22} />
        </button>
        {chatOpen && <VoiceChatbot onClose={() => setChatOpen(false)} />}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["activity", "sessions", "exercises"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-primary-600 text-primary-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-4">
                    Log Academic Activity
                  </h3>
                  <form onSubmit={handleActivitySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Activity Type</label>
                        <select
                          className="input"
                          value={activityForm.activityType}
                          onChange={(e) =>
                            setActivityForm({
                              ...activityForm,
                              activityType: e.target.value,
                            })
                          }
                        >
                          <option value="assignment">Assignment</option>
                          <option value="reading">Reading</option>
                          <option value="practice">Practice</option>
                          <option value="project">Project</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Subject</label>
                        <input
                          type="text"
                          className="input"
                          value={activityForm.subject}
                          onChange={(e) =>
                            setActivityForm({
                              ...activityForm,
                              subject: e.target.value,
                            })
                          }
                          required
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Description</label>
                      <textarea
                        className="input"
                        rows="3"
                        value={activityForm.description}
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            description: e.target.value,
                          })
                        }
                        required
                        placeholder="Describe what you worked on..."
                      />
                    </div>

                    <div>
                      <label className="label">Duration (minutes)</label>
                      <input
                        type="number"
                        className="input"
                        value={activityForm.duration}
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            duration: e.target.value,
                          })
                        }
                        required
                        min="1"
                        placeholder="30"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Logging..." : "Log Activity"}
                    </button>
                  </form>
                </div>

                <div className="card">
                  <h3 className="text-xl font-semibold mb-4">
                    Today's Activities
                  </h3>
                  {activities.length === 0 ? (
                    <p className="text-gray-500">No activities logged today.</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {activity.subject}
                              </h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {activity.activityType}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {activity.description}
                              </p>
                            </div>
                            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                              {activity.duration} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="space-y-6">
                {!activeSession && (
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">
                      Start Study Session
                    </h3>
                    <form onSubmit={handleStartSession} className="space-y-4">
                      <div>
                        <label className="label">Subject (Optional)</label>
                        <input
                          type="text"
                          className="input"
                          value={sessionForm.subject}
                          onChange={(e) =>
                            setSessionForm({
                              ...sessionForm,
                              subject: e.target.value,
                            })
                          }
                          placeholder="e.g., Physics"
                        />
                      </div>

                      <div>
                        <label className="label">Notes (Optional)</label>
                        <textarea
                          className="input"
                          rows="2"
                          value={sessionForm.notes}
                          onChange={(e) =>
                            setSessionForm({
                              ...sessionForm,
                              notes: e.target.value,
                            })
                          }
                          placeholder="What are you studying?"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                      >
                        Start Session
                      </button>
                    </form>
                  </div>
                )}

                <div className="card">
                  <h3 className="text-xl font-semibold mb-4">
                    Recent Study Sessions
                  </h3>
                  {sessions.length === 0 ? (
                    <p className="text-gray-500">No study sessions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {session.subject || "General Study"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(session.startTime).toLocaleString()}
                              </p>
                              {session.notes && (
                                <p className="text-sm text-gray-700 mt-1">
                                  {session.notes}
                                </p>
                              )}
                            </div>
                            {session.duration && (
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {session.duration} min
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Exercises Tab */}
            {activeTab === "exercises" && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Focus Exercises</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {exercise.title}
                        </h4>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                          {exercise.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {exercise.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 capitalize">
                        Type: {exercise.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
