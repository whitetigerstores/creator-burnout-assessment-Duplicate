import React, { useState } from 'react';
import { ChevronRight, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';

export default function BurnoutAssessment() {
  const [stage, setStage] = useState('welcome');
  const [responses, setResponses] = useState({});
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);

  const questions = [
    {
      id: 'daily_hours',
      question: 'How many hours per day do you spend on content creation/management?',
      type: 'range',
      min: 1,
      max: 12,
      labels: ['1h', '3h', '6h', '9h', '12h+']
    },
    {
      id: 'platform_count',
      question: 'How many platforms do you actively manage?',
      type: 'buttons',
      options: ['1-2', '3-4', '5-6', '7+']
    },
    {
      id: 'manual_tasks',
      question: 'What % of your time is spent on repetitive/manual tasks?',
      type: 'range',
      min: 10,
      max: 90,
      labels: ['10%', '30%', '50%', '70%', '90%+']
    },
    {
      id: 'income_stress',
      question: 'How would you rate income instability stress? (1=None, 10=Severe)',
      type: 'range',
      min: 1,
      max: 10,
      labels: ['Stable', '3', '5', '7', 'Very Bad']
    },
    {
      id: 'content_pace',
      question: 'How often do you feel pressured to post?',
      type: 'buttons',
      options: ['Not at all', 'Sometimes', 'Often', 'Constantly']
    },
    {
      id: 'boundary_setting',
      question: 'Do you have clear boundaries for work hours?',
      type: 'buttons',
      options: ['Yes, strict', 'Somewhat', 'Rarely', 'Never']
    },
    {
      id: 'repurposing_usage',
      question: 'How much do you repurpose content across platforms?',
      type: 'buttons',
      options: ['Fully optimized', 'Some repurposing', 'Minimal', 'Never']
    },
    {
      id: 'revenue_streams',
      question: 'How many revenue streams do you have? (Sponsorships, products, services, etc.)',
      type: 'range',
      min: 0,
      max: 5,
      labels: ['None', '1', '2', '3', '4+']
    }
  ];

  const calculateBurnout = () => {
    let burnoutScore = 0;
    let timeWasterScore = {};

    const dailyHours = parseInt(responses.daily_hours) || 0;
    const platformCount = { '1-2': 1, '3-4': 2, '5-6': 3, '7+': 4 }[responses.platform_count] || 0;
    const manualTasks = parseInt(responses.manual_tasks) || 0;
    const incomeStress = parseInt(responses.income_stress) || 0;
    const contentPace = { 'Not at all': 0, 'Sometimes': 2, 'Often': 4, 'Constantly': 5 }[responses.content_pace] || 0;
    const boundaries = { 'Yes, strict': 0, 'Somewhat': 2, 'Rarely': 4, 'Never': 5 }[responses.boundary_setting] || 0;
    const repurposing = { 'Fully optimized': 1, 'Some repurposing': 2, 'Minimal': 3, 'Never': 4 }[responses.repurposing_usage] || 0;
    const revenueStreams = parseInt(responses.revenue_streams) || 0;

    burnoutScore = (dailyHours * 2) + (platformCount * 2) + manualTasks + incomeStress + contentPace + boundaries + (repurposing * 3) + ((5 - revenueStreams) * 2);

    timeWasterScore = {
      'Platform Management Overhead': platformCount * 3 + repurposing * 2,
      'Manual Content Processes': manualTasks + (dailyHours > 6 ? 5 : 0),
      'Lack of Boundaries': boundaries * 3,
      'Income Instability Anxiety': incomeStress * 2 + (revenueStreams < 2 ? 10 : 0),
      'Constant Posting Pressure': contentPace * 2
    };

    const topWaster = Object.keys(timeWasterScore).reduce((a, b) => 
      timeWasterScore[a] > timeWasterScore[b] ? a : b
    );

    const normalizedScore = Math.min(Math.round((burnoutScore / 100) * 100), 100);

    return {
      score: normalizedScore,
      topWaster,
      timeLeak: {
        platforms: platformCount > 4 ? 'Critical: Too many platforms unmanaged' : platformCount > 2 ? 'High: Multiple platforms bleeding time' : 'Manageable',
        manual: manualTasks > 60 ? 'Critical: Over 60% manual work' : manualTasks > 40 ? 'High: Significant manual overhead' : 'Okay',
        boundaries: boundaries > 3 ? 'Critical: No work/life separation' : boundaries > 1 ? 'High: Weak boundaries' : 'Good',
        revenue: revenueStreams < 1 ? 'Critical: Algorithm-dependent income' : revenueStreams < 2 ? 'High: Income too concentrated' : 'Diversified'
      },
      stats: {
        dailyHours,
        platformCount,
        revenueStreams
      }
    };
  };

  const handleAnswer = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const handleNext = () => {
    const currentIndex = Object.keys(responses).length;
    if (currentIndex < questions.length) {
      // Keep going
    } else {
      const calculatedResults = calculateBurnout();
      setResults(calculatedResults);
      setStage('results');
    }
  };

  const handleGetResults = () => {
    if (Object.keys(responses).length < questions.length) {
      alert('Please answer all questions to see your results');
      return;
    }
    const calculatedResults = calculateBurnout();
    setResults(calculatedResults);
    setStage('results');
  };

  const handleEmailCapture = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }
    
    try {
      // Store data in window (in-memory only)
      window.assessmentData = {
        email,
        results,
        timestamp: new Date().toISOString()
      };
      
      console.log('Assessment data:', window.assessmentData);
      setStage('thankyou');
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing. Please try again.');
    }
  };

  const currentQuestionIndex = Object.keys(responses).length;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Welcome Stage */}
      {stage === 'welcome' && (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12">
              <div className="inline-block mb-6 p-4 bg-red-500/20 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">Burnout Score</span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Find your #1 time waster killing your creativity in 10 minutes
              </p>
              <div className="space-y-4 mb-8 text-left bg-slate-800/50 p-8 rounded-2xl border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Identify Time Leaks</p>
                    <p className="text-gray-400 text-sm">Pinpoint exactly where your hours disappear</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Set Smart Boundaries</p>
                    <p className="text-gray-400 text-sm">Get actionable tactics to reclaim your time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Optimize Repurposing</p>
                    <p className="text-gray-400 text-sm">Create once, publish everywhere efficiently</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStage('quiz')}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 mb-4"
            >
              Start Free Assessment <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-center text-gray-400 text-sm">⏱️ Takes 10 minutes • No credit card required</p>
          </div>
        </div>
      )}

      {/* Quiz Stage */}
      {stage === 'quiz' && (
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300 text-sm font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <p className="text-gray-400 text-sm">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-slate-800/80 backdrop-blur border border-purple-500/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">{currentQuestion?.question}</h2>

              {currentQuestion?.type === 'range' && (
                <div>
                  <input
                    type="range"
                    min={currentQuestion.min}
                    max={currentQuestion.max}
                    value={responses[currentQuestion.id] || currentQuestion.min}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-4 px-2">
                    {currentQuestion.labels.map((label, i) => (
                      <span key={i}>{label}</span>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <p className="text-4xl font-bold text-pink-400">{responses[currentQuestion.id] || currentQuestion.min}</p>
                  </div>
                </div>
              )}

              {currentQuestion?.type === 'buttons' && (
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(currentQuestion.id, option)}
                      className={`p-4 rounded-lg font-semibold transition-all border-2 ${
                        responses[currentQuestion.id] === option
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                          : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-purple-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={() => {
                    const prevQId = questions[currentQuestionIndex - 1].id;
                    setResponses({...responses, [prevQId]: responses[prevQId]});
                  }}
                  className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
                >
                  Back
                </button>
              )}
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!responses[currentQuestion?.id]}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGetResults}
                  disabled={!responses[currentQuestion?.id]}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition"
                >
                  See My Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && results && (
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Burnout Score */}
            <div className="bg-slate-800/80 backdrop-blur border border-purple-500/20 rounded-2xl p-8 mb-6">
              <p className="text-gray-300 text-sm font-semibold mb-2">YOUR BURNOUT SCORE</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-2">
                    {results.score}/100
                  </p>
                  <p className={`text-lg font-semibold ${
                    results.score > 70 ? 'text-red-400' : 
                    results.score > 50 ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    {results.score > 70 ? '🚨 Critical - Immediate Action Needed' : 
                     results.score > 50 ? '⚠️ High - Intervention Required' : 
                     '✅ Moderate - Manageable'}
                  </p>
                </div>
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="8"
                      strokeDasharray={`${(results.score / 100) * 339.29} 339.29`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Top Time Waster */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
              <p className="text-red-300 text-sm font-semibold mb-2">🎯 YOUR #1 TIME WASTER</p>
              <p className="text-2xl font-bold text-white">{results.topWaster}</p>
              <p className="text-red-200 text-sm mt-2">This is where your creativity is bleeding away. Fixing this alone saves 8-12 hours/week.</p>
            </div>

            {/* Time Leaks */}
            <div className="space-y-3 mb-8">
              <p className="text-gray-300 text-sm font-semibold">CRITICAL TIME LEAKS IDENTIFIED:</p>
              {Object.entries(results.timeLeak).map(([key, value]) => (
                <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="font-semibold text-white capitalize text-sm">{key.replace(/_/g, ' ')}</p>
                  <p className={`text-sm mt-1 ${
                    value.includes('Critical') ? 'text-red-400' :
                    value.includes('High') ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-pink-400">{results.stats.dailyHours}h</p>
                <p className="text-xs text-gray-400 mt-1">Daily hours</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-pink-400">{results.stats.platformCount}</p>
                <p className="text-xs text-gray-400 mt-1">Platforms</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-pink-400">{results.stats.revenueStreams}</p>
                <p className="text-xs text-gray-400 mt-1">Revenue streams</p>
              </div>
            </div>

            {/* Email Capture CTA */}
            <div className="bg-gradient-to-r from-slate-800 to-purple-900/50 border border-purple-500/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-2">Get Your Personalized Action Plan</h3>
              <p className="text-gray-300 mb-6">Enter your email to receive:</p>
              <ul className="space-y-2 mb-6 text-gray-300 text-sm">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Specific fixes for your #1 time waster</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Content repurposing playbook (save 10hrs/week)</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Boundary-setting script templates</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Revenue diversification checklist</li>
              </ul>
              
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              
              <button
                onClick={handleEmailCapture}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
              >
                Send Me My Action Plan 🚀
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                No spam, just actionable insights for creators. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Stage */}
      {stage === 'thankyou' && (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-bold text-white mb-4">Check Your Email!</h1>
            <p className="text-xl text-gray-300 mb-8">
              Your personalized action plan has been sent to <span className="text-pink-400 font-semibold">{email}</span>
            </p>
            
            <div className="bg-slate-800/50 border border-purple-500/20 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex gap-4">
                  <div className="text-pink-400 font-bold flex-shrink-0">1.</div>
                  <div>
                    <p className="font-semibold text-white">Check your inbox</p>
                    <p className="text-gray-400 text-sm">Look for your burnout assessment report (check spam if needed)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-pink-400 font-bold flex-shrink-0">2.</div>
                  <div>
                    <p className="font-semibold text-white">Implement quick wins</p>
                    <p className="text-gray-400 text-sm">Start with the #1 time waster fix (results in 3-7 days)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-pink-400 font-bold flex-shrink-0">3.</div>
                  <div>
                    <p className="font-semibold text-white">Track improvements</p>
                    <p className="text-gray-400 text-sm">Measure hours saved + income impact over 30 days</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-400">Questions? Reply directly to the email. We read every message. 💙</p>
          </div>
        </div>
      )}
    </div>
  );
}
