import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { BookOpen, Award, LogOut, Play, AlertCircle, Sparkles, History, Send, Loader2, ShieldCheck, X } from 'lucide-react';
import { fetchAllCourses, fetchUserHistory, generateAISession } from '../api/courses';

interface Lesson {
    _id?: string;
    lessonId?: string;
    title: string;
    videoUrl?: string;
    duration?: string;
}

interface CourseData {
    _id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    lessons: Lesson[];
    createdAt: string;
}

interface HistoryItem {
    _id: string;
    prompt: string;
    response: string;
    categoryName?: string;
    subCategoryName?: string;
    createdAt: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Student');
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<'courses' | 'ai-generator' | 'history'>('courses');
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedLessonResult, setGeneratedLessonResult] = useState<string | null>(null);
    const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseData | null>(null);
    const [historyFilterCategory, setHistoryFilterCategory] = useState<string | null>(null);

    useEffect(() => {
        const savedId = localStorage.getItem('userId');
        const savedName = localStorage.getItem('userName');
        if (!savedId) {
            navigate('/login');
            return;
        }
        setUserId(savedId);
        if (savedName) setUserName(savedName);
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');

        loadHistoryData(savedId);

        const initDashboard = async () => {
            try {
                setLoadingCourses(true);
                const coursesData = await fetchAllCourses(savedId);
                if (Array.isArray(coursesData)) setCourses(coursesData);
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError('Note: Could not load courses, but the AI generator is available.');
            } finally {
                setLoadingCourses(false);
            }
        };

        initDashboard();
    }, [navigate]);

    const loadHistoryData = async (id?: string) => {
        const resolvedId = id || userId;
        if (!resolvedId) return;
        try {
            setLoadingHistory(true);
            const res = await fetchUserHistory(resolvedId);
            if (res && res.success) setHistory(res.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') loadHistoryData();
    }, [activeTab]);

    const handleGenerateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory.trim() || !userPrompt.trim()) {
            setAiError('Please fill in the category and prompt fields');
            return;
        }
        try {
            setGeneratingAI(true);
            setAiError(null);
            setAiSuccessMessage(null);
            setGeneratedLessonResult(null);
            const currentUserId = userId || '65f1a2b3c4d5e6f7a8b9c000';
            const finalSubCategory = selectedSubCategory.trim() || selectedCategory.trim();
            const result = await generateAISession({
                userId: currentUserId,
                categoryId: selectedCategory.trim(),
                subCategoryId: finalSubCategory,
                prompt: userPrompt
            });
            if (result && result.data) {
                setAiSuccessMessage('Lesson generated and saved to history!');
                setGeneratedLessonResult(result.data.response);
                setUserPrompt('');
                const coursesData = await fetchAllCourses(currentUserId);
                if (Array.isArray(coursesData)) setCourses(coursesData);
                await loadHistoryData(currentUserId);
            } else {
                throw new Error('No data returned');
            }
        } catch (err: any) {
            console.error('AI generation error:', err);
            setAiError('Note: OpenAI API error. Showing simulated lesson:');
            setGeneratedLessonResult(`# Simulated Lesson: ${userPrompt}\n\nThis is a fallback simulation for topic: **${selectedSubCategory || selectedCategory}**.\n\nTo receive live AI responses, ensure your OpenAI API key in \`.env\` is valid and active.`);
        } finally {
            setGeneratingAI(false);
        }
    };

    const downloadPDF = async () => {
        const textToDownload = generatedLessonResult || document.getElementById('lesson-content-area')?.innerText;
        if (!textToDownload) {
            alert('No lesson content found to download.');
            return;
        }
        try {
            const printContainer = document.createElement('div');
            printContainer.style.padding = '40px';
            printContainer.style.backgroundColor = '#ffffff';
            printContainer.style.color = '#000000';
            printContainer.style.fontFamily = 'Arial, sans-serif';
            printContainer.style.whiteSpace = 'pre-wrap';
            printContainer.style.lineHeight = '1.6';
            printContainer.style.fontSize = '16px';
            printContainer.innerText = textToDownload;
            const opt = {
                margin: [0.7, 0.7, 0.7, 0.7] as [number, number, number, number],
                filename: `lesson-${new Date().getTime()}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
            };
            await html2pdf().set(opt).from(printContainer).save();
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF file.');
        }
    };

    const handleSendEmail = async () => {
        try {
            const userEmail = localStorage.getItem('userEmail') || '';
            const textToSend = generatedLessonResult || document.getElementById('lesson-content-area')?.innerText;
            if (!textToSend) {
                alert('No lesson content found to send.');
                return;
            }
            const response = await axios.post('http://localhost:5000/api/prompts/send-email', {
                email: userEmail,
                lessonTitle: 'Custom AI Lesson',
                lessonContent: textToSend
            });
            if (response.data?.success) {
                alert(`Lesson sent successfully to: ${userEmail} ✉️`);
            } else {
                alert('Server responded but sending was not completed.');
            }
        } catch (error: any) {
            console.error('Error sending email:', error);
            alert('Error sending email. Ensure .env is configured correctly.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    const filteredHistory = history.filter(item => {
        if (!historyFilterCategory) return true;
        const catName = item.categoryName?.trim().toLowerCase();
        const filterName = historyFilterCategory.trim().toLowerCase();
        return catName === filterName;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="ltr">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">AI Learning Platform</span>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-medium">
                            Hello, <span className="text-blue-600 font-bold">{userName}</span>
                        </span>
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition cursor-pointer"
                            >
                                <ShieldCheck className="w-4 h-4" /><span>Admin</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" /><span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 justify-start">
                    {[
                        { key: 'courses', icon: <BookOpen className="w-4 h-4" />, label: 'My Courses' },
                        { key: 'ai-generator', icon: <Sparkles className="w-4 h-4 text-amber-500" />, label: 'AI Lesson Generator' },
                        { key: 'history', icon: <History className="w-4 h-4" />, label: 'Learning History' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key as any);
                                if (tab.key !== 'history') setHistoryFilterCategory(null);
                            }}
                            className={`py-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.icon}<span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Available Courses</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{courses.length} Courses</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">AI Lessons Generated</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{history.length} Lessons</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Subtopics Learned</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {new Set(history.map(h => (h.subCategoryName || h.categoryName || '').trim()).filter(Boolean)).size} Topics
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {activeTab === 'courses' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h2>
                        {loadingCourses && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-800 p-4 rounded-lg text-sm mb-4">{error}</div>
                        )}
                        {!loadingCourses && courses.length === 0 && (
                            <div className="bg-white border p-12 text-center rounded-2xl max-w-xl mx-auto shadow-sm">
                                <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">No courses available</h3>
                                <p className="text-gray-500 text-sm mt-1">Switch to the "AI Lesson Generator" tab to create a custom lesson instantly!</p>
                            </div>
                        )}
                        {courses.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => (
                                    <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                                        <div>
                                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 mx-auto rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                        <BookOpen className="w-10 h-10 text-gray-400" />
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-2">Course</div>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h4 className="font-bold text-gray-800 text-lg mb-2">{course.title}</h4>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                                            </div>
                                        </div>
                                        <div className="p-5 pt-0">
                                            <button
                                                onClick={() => setSelectedCourseForModal(course)}
                                                className="w-full bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <Play className="w-4 h-4" /><span>View subtopics</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ai-generator' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Personal AI Lesson Generator</h2>
                                    <p className="text-sm text-gray-500">Type any topic you want to learn, enter your prompt, and get a complete lesson instantly.</p>
                                </div>
                            </div>

                            <form onSubmit={handleGenerateLesson} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">1. Main category (e.g.: Math, Science, Coding):</label>
                                        <input
                                            type="text"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            placeholder="e.g.: Math"
                                            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">
                                            2. Sub-category / specific topic <span className="text-gray-400 font-normal">(optional)</span>:
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedSubCategory}
                                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                                            placeholder="e.g.: Adding numbers up to 10"
                                            className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">3. What do you want to learn today?</label>
                                    <textarea
                                        value={userPrompt}
                                        onChange={(e) => setUserPrompt(e.target.value)}
                                        rows={4}
                                        placeholder='e.g.: "Explain how to do vertical addition with examples"'
                                        className="border border-gray-300 rounded-xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition resize-none"
                                        required
                                    />
                                </div>

                                {aiError && (
                                    <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-800 p-3 rounded-lg text-xs leading-relaxed">{aiError}</div>
                                )}
                                {aiSuccessMessage && (
                                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-semibold">{aiSuccessMessage}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={generatingAI}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:bg-gray-400 cursor-pointer"
                                >
                                    {generatingAI
                                        ? <><Loader2 className="w-5 h-5 animate-spin" /><span>The AI is generating your lesson, please wait...</span></>
                                        : <><Send className="w-4 h-4" /><span>Create a custom lesson</span></>
                                    }
                                </button>
                            </form>
                        </div>

                        {generatedLessonResult && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-blue-600">
                                    <BookOpen className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">Your generated lesson:</h3>
                                </div>
                                <div id="lesson-content-area" className="bg-gray-50 p-6 rounded-2xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed font-sans border border-gray-200">
                                    {generatedLessonResult}
                                </div>
                                <div className="flex gap-3 mt-4 flex-row-reverse">
                                    <button onClick={downloadPDF} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-xl text-sm transition cursor-pointer">
                                        📥 Download as PDF
                                    </button>
                                    <button onClick={handleSendEmail} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-xl text-sm transition cursor-pointer">
                                        ✉️ Send to my email
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">My Lessons</h2>
                            {historyFilterCategory && (
                                <button
                                    onClick={() => setHistoryFilterCategory(null)}
                                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer"
                                >
                                    Show all courses ({history.length})
                                </button>
                            )}
                        </div>

                        {loadingHistory && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                            </div>
                        )}

                        {!loadingHistory && filteredHistory.length === 0 && (
                            <div className="bg-white border p-12 text-center rounded-2xl max-w-xl mx-auto">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">No history available</h3>
                                <p className="text-gray-500 mt-1">
                                    {historyFilterCategory
                                        ? `No AI lessons have been saved under the course "${historyFilterCategory}" yet.`
                                        : 'Any lesson you create will be saved and shown here automatically!'}
                                </p>
                            </div>
                        )}

                        {!loadingHistory && filteredHistory.length > 0 && (
                            <div className="space-y-6">
                                {historyFilterCategory && (
                                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-sm text-blue-800 font-medium">
                                        🔍 Showing lessons for course: <span className="font-bold">"{historyFilterCategory}"</span>
                                    </div>
                                )}
                                {filteredHistory.map((item) => (
                                    <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                            <div>
                                                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    {item.subCategoryName || item.categoryName || 'General'}
                                                </span>
                                                <h3 className="font-bold text-gray-800 text-lg mt-2">"{item.prompt}"</h3>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                                            {item.response}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>

            {selectedCourseForModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" dir="ltr">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-left">
                        <button
                            onClick={() => setSelectedCourseForModal(null)}
                            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 border-b pb-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedCourseForModal.title}</h3>
                                <p className="text-xs text-gray-500">Saved lesson topics in this course</p>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                            {selectedCourseForModal.lessons && selectedCourseForModal.lessons.length > 0
                                ? selectedCourseForModal.lessons.map((lesson, idx) => (
                                    <div
                                        key={lesson._id || idx}
                                        className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl flex items-center justify-between transition cursor-pointer"
                                        onClick={() => {
                                            setHistoryFilterCategory(selectedCourseForModal.title);
                                            setSelectedCourseForModal(null);
                                            setActiveTab('history');
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                                        </div>
                                        <Play className="w-4 h-4 text-gray-400" />
                                    </div>
                                ))
                                : (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                        No lessons have been created for this course yet.
                                    </div>
                                )
                            }
                        </div>

                        <div className="mt-5 border-t pt-3 flex justify-end">
                            <button
                                onClick={() => setSelectedCourseForModal(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
                            >
                                Close window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
